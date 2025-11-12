const nodemailer = require('nodemailer');
const { prisma } = require('../lib/prisma');

class SmtpService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendReply({ emailId, operadorId, asunto, cuerpoTexto, cuerpoHtml }) {
    try {
      // Obtener email original
      const emailOriginal = await prisma.email.findUnique({
        where: { id: emailId }
      });

      if (!emailOriginal) {
        throw new Error('Email original no encontrado');
      }

      // Preparar respuesta
      const mailOptions = {
        from: `"PHotel Reservas" <${process.env.SMTP_USER}>`,
        to: emailOriginal.deEmail,
        subject: asunto || `Re: ${emailOriginal.asunto}`,
        text: cuerpoTexto,
        html: cuerpoHtml || this.textToHtml(cuerpoTexto),
        
        // Headers para threading en Gmail
        inReplyTo: emailOriginal.messageId,
        references: emailOriginal.messageId
      };

      // Enviar email
      const info = await this.transporter.sendMail(mailOptions);

      // Guardar respuesta en BD
      const respuesta = await prisma.emailRespuesta.create({
        data: {
          emailId,
          ...(operadorId && { operadorId }), // Solo incluir si existe
          asunto: mailOptions.subject,
          cuerpoTexto,
          cuerpoHtml: mailOptions.html,
          messageIdRespuesta: info.messageId,
          estadoEnvio: 'Enviado'
        }
      });

      // Actualizar estado del email original
      await prisma.email.update({
        where: { id: emailId },
        data: {
          estado: 'Respondido',
          ...(operadorId && { operadorId }) // Solo incluir si existe
        }
      });

      console.log(`✅ Respuesta enviada: ${info.messageId}`);
      return { success: true, respuesta, messageId: info.messageId };

    } catch (error) {
      console.error('❌ Error enviando respuesta:', error);

      // Guardar error en BD
      try {
        await prisma.emailRespuesta.create({
          data: {
            emailId,
            operadorId,
            asunto: asunto || 'Error al enviar',
            cuerpoTexto: cuerpoTexto || '',
            estadoEnvio: 'Error',
            errorEnvio: error.message
          }
        });
      } catch (dbError) {
        console.error('❌ Error guardando log de error:', dbError);
      }

      throw error;
    }
  }

  textToHtml(texto) {
    return `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <p>${texto.replace(/\n/g, '<br>')}</p>
        <br>
        <hr style="border: 1px solid #eee;">
        <p style="color: #777; font-size: 12px;">
          <strong>PHotel</strong><br>
          📧 ${process.env.SMTP_USER}<br>
          🌐 www.photel.com
        </p>
      </div>
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP configurado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error SMTP:', error);
      return false;
    }
  }
}

module.exports = new SmtpService();
