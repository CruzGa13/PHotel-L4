#!/usr/bin/env node

/**
 * Script de prueba del sistema de emails
 * Verifica SMTP, IMAP y conexión a BD
 * 
 * Uso: node test-email-system.js
 */

require('dotenv').config();

async function testEmailSystem() {
  console.log('\n📧 =================================');
  console.log('   TEST DEL SISTEMA DE EMAILS');
  console.log('=================================\n');

  let hasErrors = false;

  // ========================================
  // 1. Verificar variables de entorno
  // ========================================
  console.log('1️⃣  Verificando variables de entorno...');
  
  const requiredEnvVars = [
    'IMAP_USER',
    'IMAP_PASS',
    'SMTP_USER',
    'SMTP_PASS',
    'DATABASE_URL'
  ];

  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.log('   ❌ Faltan variables de entorno:');
    missingVars.forEach(v => console.log(`      - ${v}`));
    hasErrors = true;
  } else {
    console.log('   ✅ Todas las variables están configuradas');
    console.log(`   📧 Gmail: ${process.env.IMAP_USER}`);
  }
  console.log('');

  // ========================================
  // 2. Verificar conexión SMTP
  // ========================================
  console.log('2️⃣  Probando conexión SMTP (envío)...');
  
  try {
    const smtpService = require('./src/services/smtpService');
    const isConnected = await smtpService.testConnection();
    
    if (isConnected) {
      console.log('   ✅ SMTP funcionando correctamente');
    } else {
      console.log('   ❌ SMTP no pudo conectarse');
      hasErrors = true;
    }
  } catch (error) {
    console.log('   ❌ Error en SMTP:', error.message);
    hasErrors = true;
  }
  console.log('');

  // ========================================
  // 3. Verificar conexión IMAP
  // ========================================
  console.log('3️⃣  Probando conexión IMAP (recepción)...');
  
  try {
    const imapService = require('./src/services/imapService');
    await imapService.connect();
    await imapService.disconnect();
    console.log('   ✅ IMAP funcionando correctamente');
  } catch (error) {
    console.log('   ❌ Error en IMAP:', error.message);
    console.log('   💡 Verifica que GMAIL_APP_PASSWORD sea correcto');
    hasErrors = true;
  }
  console.log('');

  // ========================================
  // 4. Verificar tablas de BD
  // ========================================
  console.log('4️⃣  Verificando tablas en base de datos...');
  
  try {
    const { prisma } = require('./src/lib/prisma');
    
    // Verificar que existan las tablas
    const emailCount = await prisma.email.count();
    const adjuntoCount = await prisma.emailAdjunto.count();
    const respuestaCount = await prisma.emailRespuesta.count();
    
    console.log('   ✅ Tabla "emails" existe');
    console.log(`      📊 ${emailCount} emails en BD`);
    console.log('   ✅ Tabla "emails_adjuntos" existe');
    console.log(`      📊 ${adjuntoCount} adjuntos en BD`);
    console.log('   ✅ Tabla "emails_respuestas" existe');
    console.log(`      📊 ${respuestaCount} respuestas en BD`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.log('   ❌ Error en BD:', error.message);
    console.log('   💡 Ejecuta: npx prisma migrate dev');
    hasErrors = true;
  }
  console.log('');

  // ========================================
  // 5. Intentar sincronizar emails (opcional)
  // ========================================
  console.log('5️⃣  Intentando sincronizar bandeja de entrada...');
  
  try {
    const imapService = require('./src/services/imapService');
    const resultado = await imapService.syncInbox();
    
    if (resultado.success) {
      console.log(`   ✅ Sincronización exitosa: ${resultado.newEmails} emails nuevos`);
    } else {
      console.log('   ⚠️  Sincronización completada sin nuevos emails');
    }
  } catch (error) {
    console.log('   ⚠️  No se pudo sincronizar:', error.message);
    console.log('   (Esto es normal si no hay emails en la bandeja)');
  }
  console.log('');

  // ========================================
  // RESUMEN
  // ========================================
  console.log('=================================');
  if (hasErrors) {
    console.log('❌ HAY ERRORES - Revisa los pasos anteriores');
    console.log('\n💡 Ayuda:');
    console.log('   1. Verifica tu .env tenga IMAP_USER, IMAP_PASS, SMTP_USER, SMTP_PASS');
    console.log('   2. Genera un App Password en: https://myaccount.google.com/apppasswords');
    console.log('   3. Ejecuta: npx prisma migrate dev');
    process.exit(1);
  } else {
    console.log('✅ SISTEMA DE EMAILS FUNCIONANDO');
    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Inicia el servidor: npm run dev');
    console.log('   2. Prueba las APIs en: http://localhost:3000/api/emails');
    console.log('   3. Sincroniza manualmente: POST /api/emails/sync');
  }
  console.log('=================================\n');
  
  process.exit(0);
}

// Ejecutar tests
testEmailSystem().catch((error) => {
  console.error('\n❌ Error fatal:', error);
  process.exit(1);
});
