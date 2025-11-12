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
            await this.saveEmailToDB(msg);
            newEmailsCount++;
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

      // Detectar prioridad automáticamente
      const prioridad = this.detectPriority(asunto, cuerpoTexto);

      // Destinatarios (puede ser múltiple)
      const paraEmails = parsed.to 
        ? parsed.to.value.map(t => t.address).join(', ')
        : process.env.IMAP_USER;

      // Verificar adjuntos
      const tieneAdjuntos = parsed.attachments && parsed.attachments.length > 0;

      // Guardar email principal
      const email = await prisma.email.create({
        data: {
          messageId,
          deEmail,
          deNombre,
          paraEmails,
          asunto,
          cuerpoTexto,
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
          await prisma.emailAdjunto.create({
            data: {
              emailId: email.id,
              nombreArchivo: attachment.filename,
              mimeType: attachment.contentType,
              tamano: attachment.size,
              dataBase64: attachment.content.toString('base64')
            }
          });
        }
      }

      console.log(`✅ Email guardado: ${asunto.substring(0, 50)}...`);
      return email;

    } catch (error) {
      console.error('❌ Error guardando email:', error);
      throw error;
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
