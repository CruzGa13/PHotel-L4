const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { prisma } = require('../lib/prisma');

class ImapService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    this.client = new ImapFlow({
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT) || 993,
      secure: process.env.IMAP_SECURE === 'true',
      auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASS
      },
      logger: false
    });

    await this.client.connect();
    this.isConnected = true;
    console.log('✅ Conectado a IMAP');
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.logout();
      this.isConnected = false;
      console.log('👋 Desconectado de IMAP');
    }
  }

  async syncInbox() {
    try {
      await this.connect();

      const lock = await this.client.getMailboxLock('INBOX');
      
      try {
        // Obtener emails recientes (últimos 50)
        const messages = [];
        for await (let msg of this.client.fetch('1:*', {
          envelope: true,
          source: true,
          flags: true,
          uid: true
        })) {
          messages.push(msg);
        }

        // Procesar solo los no sincronizados
        let newEmailsCount = 0;
        for (const msg of messages.reverse().slice(0, 50)) {
          const messageId = msg.envelope.messageId;
          
          // Verificar si ya existe
          const existente = await prisma.email.findUnique({
            where: { messageId }
          });

          if (!existente) {
            const emailGuardado = await this.saveEmailToDB(msg);
            if (emailGuardado) {
              newEmailsCount++;
            }
          }
        }

        console.log(`📬 Sincronizados ${newEmailsCount} emails nuevos`);
        return { success: true, newEmails: newEmailsCount };

      } finally {
        lock.release();
      }
    } catch (error) {
      console.error('❌ Error en syncInbox:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async saveEmailToDB(msg) {
    try {
      // Parsear el email completo
      const parsed = await simpleParser(msg.source);

      // Extraer información
      const messageId = msg.envelope.messageId;
      const deEmail = parsed.from.value[0].address;
      const deNombre = parsed.from.value[0].name || null;
      const asunto = parsed.subject || '(Sin asunto)';
      const cuerpoHtml = parsed.html || null;
      const cuerpoTexto = parsed.text || this.extractPlainText(cuerpoHtml) || '(Sin contenido)';

      // 🚫 FILTRO: Ignorar emails automáticos y notificaciones
      const dominiosIgnorados = [
        '@accounts.google.com',
        '@mail.google.com',
        '@googlemail.com',
        '@notifications.microsoft.com',
        '@facebookmail.com'
      ];
      
      const esEmailIgnorado = dominiosIgnorados.some(dominio => deEmail && deEmail.includes(dominio));
      
      if (esEmailIgnorado) {
        console.log(`⏭️  Email ignorado (automático): ${deEmail} - ${asunto.substring(0, 50)}`);
        return null; // No guardar este email
      }

      // Detectar prioridad automáticamente
      const prioridad = this.detectPriority(asunto, cuerpoTexto);

      // Destinatarios (puede ser múltiple)
      const paraEmails = parsed.to 
        ? parsed.to.value.map(t => t.address).join(', ')
        : process.env.IMAP_USER;

      // Verificar adjuntos
      const tieneAdjuntos = parsed.attachments && parsed.attachments.length > 0;

      // Detectar si es un mensaje del formulario de contacto y extraer el email del usuario
      let emailFinal = deEmail;
      let nombreFinal = deNombre;
      let cuerpoFinal = cuerpoTexto;
      
      if (asunto && asunto.includes('Nuevo Mensaje de Contacto')) {
        console.log('📧 [FORMULARIO] Detectado email del formulario de contacto');
        console.log('📧 [FORMULARIO] Contenido original:', cuerpoTexto.substring(0, 200));
        
        // Extraer email del usuario del contenido
        const emailMatch = cuerpoTexto.match(/Email:\s*([^\s\n]+@[^\s\n]+)/i);
        if (emailMatch && emailMatch[1]) {
          emailFinal = emailMatch[1].trim();
          console.log('📧 [FORMULARIO] Email extraído:', emailFinal);
        }
        
        // Extraer nombre del usuario del contenido
        const nombreMatch = cuerpoTexto.match(/Nombre:\s*([^\n]+)/i);
        if (nombreMatch && nombreMatch[1]) {
          nombreFinal = nombreMatch[1].trim();
          console.log('📧 [FORMULARIO] Nombre extraído:', nombreFinal);
        }
        
        // Limpiar el contenido del mensaje (quitar metadatos y footer EmailJS)
        // Buscar todo lo que viene después de "Mensaje:" (última ocurrencia)
        const mensajeIndex = cuerpoTexto.lastIndexOf('Mensaje:');
        
        if (mensajeIndex !== -1) {
          // Extraer desde "Mensaje:" hasta el final
          let mensajeLimpio = cuerpoTexto.substring(mensajeIndex);
          
          // Eliminar la palabra "Mensaje:" y los saltos de línea que le siguen
          mensajeLimpio = mensajeLimpio.replace(/^Mensaje:\s*\n*/i, '');
          
          // Eliminar el footer de EmailJS
          mensajeLimpio = mensajeLimpio.replace(/Email sent via EmailJS\.com.*$/is, '');
          
          // Eliminar líneas de separación y espacios extra
          mensajeLimpio = mensajeLimpio.replace(/\n{3,}/g, '\n\n'); // Max 2 saltos de línea
          mensajeLimpio = mensajeLimpio.trim();
          
          cuerpoFinal = mensajeLimpio;
          console.log('📧 [FORMULARIO] Mensaje limpio:', cuerpoFinal.substring(0, 100));
        } else {
          console.log('❌ [FORMULARIO] No se encontró "Mensaje:" en el contenido');
        }
      }

      // Guardar email principal
      const email = await prisma.email.create({
        data: {
          messageId,
          deEmail: emailFinal,
          deNombre: nombreFinal,
          paraEmails,
          asunto,
          cuerpoTexto: cuerpoFinal,
          cuerpoHtml,
          prioridad,
          tieneAdjuntos,
          fechaRecibido: parsed.date || new Date(),
          estado: 'NoLeido',
          canal: 'Email'
        }
      });

      // Guardar adjuntos si existen
      if (tieneAdjuntos) {
        for (const attachment of parsed.attachments) {
          // Generar nombre de archivo si no existe
          let nombreArchivo = attachment.filename;
          if (!nombreArchivo || nombreArchivo.trim() === '') {
            // Generar nombre basado en el tipo MIME
            const extension = attachment.contentType?.split('/')[1] || 'bin';
            nombreArchivo = `adjunto_${Date.now()}.${extension}`;
          }
          
          await prisma.emailAdjunto.create({
            data: {
              emailId: email.id,
              nombreArchivo: nombreArchivo,
              mimeType: attachment.contentType || 'application/octet-stream',
              tamano: attachment.size || 0,
              dataBase64: attachment.content.toString('base64')
            }
          });
        }
      }

      console.log(`✅ Email guardado: ${asunto.substring(0, 50)}...`);
      return email;

    } catch (error) {
      console.error('❌ Error guardando email:', error);
      console.error('📧 Email que causó el error:', {
        messageId,
        asunto: asunto?.substring(0, 50),
        deEmail
      });
      // No hacer throw, solo retornar null para que continúe con otros emails
      return null;
    }
  }

  detectPriority(asunto, contenido) {
    const texto = `${asunto} ${contenido}`.toLowerCase();

    const urgentKeywords = [
      'urgente', 'inmediato', 'emergencia', 'problema',
      'error', 'no funciona', 'cancelar', 'ayuda'
    ];

    const lowKeywords = [
      'felicitaciones', 'gracias', 'agradecimiento',
      'consulta general', 'información'
    ];

    if (urgentKeywords.some(kw => texto.includes(kw))) {
      return 'Alta';
    }
    
    if (lowKeywords.some(kw => texto.includes(kw))) {
      return 'Baja';
    }

    return 'Media';
  }

  extractPlainText(html) {
    if (!html) return null;
    // Remover tags HTML básicamente
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

module.exports = new ImapService();
