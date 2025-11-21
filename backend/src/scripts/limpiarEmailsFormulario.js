import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para limpiar emails antiguos del formulario de contacto
 * Elimina los metadatos (Nombre:, Email:, Mensaje:) y el footer de EmailJS
 */
async function limpiarEmailsFormulario() {
  console.log('🧹 Iniciando limpieza de emails del formulario de contacto...\n');

  try {
    // Buscar todos los emails del formulario (asunto contiene "Nuevo Mensaje de Contacto")
    const emailsFormulario = await prisma.email.findMany({
      where: {
        asunto: {
          contains: 'Nuevo Mensaje de Contacto',
          mode: 'insensitive'
        }
      }
    });

    console.log(`📧 Encontrados ${emailsFormulario.length} emails del formulario\n`);

    if (emailsFormulario.length === 0) {
      console.log('✅ No hay emails del formulario para limpiar');
      return;
    }

    let actualizados = 0;
    let sinCambios = 0;

    for (const email of emailsFormulario) {
      const cuerpoOriginal = email.cuerpoTexto;

      // Intentar extraer solo el mensaje
      const mensajeMatch = cuerpoOriginal.match(/Mensaje:\s*([\s\S]+)/i);
      
      if (mensajeMatch && mensajeMatch[1]) {
        let mensajeLimpio = mensajeMatch[1];

        // Eliminar el footer de EmailJS
        mensajeLimpio = mensajeLimpio.replace(/Email sent via EmailJS\.com.*$/is, '');

        // Eliminar líneas de separación y espacios extra
        mensajeLimpio = mensajeLimpio.replace(/\n{3,}/g, '\n\n'); // Max 2 saltos de línea
        mensajeLimpio = mensajeLimpio.trim();

        // Solo actualizar si el contenido cambió
        if (mensajeLimpio !== cuerpoOriginal) {
          await prisma.email.update({
            where: { id: email.id },
            data: { cuerpoTexto: mensajeLimpio }
          });

          console.log(`✅ Email ${email.id} limpiado:`);
          console.log(`   Antes: ${cuerpoOriginal.substring(0, 80)}...`);
          console.log(`   Ahora: ${mensajeLimpio.substring(0, 80)}...\n`);
          actualizados++;
        } else {
          sinCambios++;
        }
      } else {
        console.log(`⚠️  Email ${email.id} no tiene el formato esperado, se omite\n`);
        sinCambios++;
      }
    }

    console.log('\n📊 Resumen de limpieza:');
    console.log(`   ✅ Emails actualizados: ${actualizados}`);
    console.log(`   ⏭️  Sin cambios: ${sinCambios}`);
    console.log(`   📧 Total procesados: ${emailsFormulario.length}`);

  } catch (error) {
    console.error('❌ Error al limpiar emails:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
limpiarEmailsFormulario()
  .then(() => {
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
