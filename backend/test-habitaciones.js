// Script de verificación para habitaciones
// Ejecutar: node test-habitaciones.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando habitaciones en la BD...\n');

  try {
    // 1. Contar habitaciones
    const count = await prisma.habitacion.count();
    console.log(`📊 Total de habitaciones: ${count}`);

    if (count === 0) {
      console.log('⚠️  No hay habitaciones en la BD\n');
      
      // Verificar tipos de habitación disponibles
      const tipos = await prisma.tipoHabitacion.findMany({
        include: {
          categoria: true,
          ocupacion: true,
        },
        take: 5,
      });
      
      if (tipos.length > 0) {
        console.log('✅ Tipos de habitación disponibles:');
        tipos.forEach(t => {
          console.log(`   - ID: ${t.id} | ${t.nombre} (${t.categoria.nombre} - ${t.ocupacion.nombre})`);
        });
        console.log('\n💡 Puedes crear habitaciones con estos comandos SQL:');
        console.log(`INSERT INTO habitaciones (numero, piso, estado, "tipoHabitacionId")`);
        console.log(`VALUES ('101', 1, 'Disponible', ${tipos[0].id});`);
      } else {
        console.log('❌ No hay tipos de habitación. Ejecuta el seed primero.');
      }
      return;
    }

    // 2. Obtener habitaciones con relaciones
    const habitaciones = await prisma.habitacion.findMany({
      select: {
        id: true,
        numero: true,
        piso: true,
        estado: true,
        tipoHabitacion: {
          select: {
            id: true,
            nombre: true,
            categoria: {
              select: {
                id: true,
                nombre: true,
              },
            },
            ocupacion: {
              select: {
                id: true,
                nombre: true,
                capacidad: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    console.log(`\n✅ Primeras ${habitaciones.length} habitaciones:\n`);
    
    habitaciones.forEach(h => {
      console.log(`#${h.numero} - Piso ${h.piso} - ${h.estado}`);
      console.log(`   Tipo: ${h.tipoHabitacion.nombre}`);
      console.log(`   Categoría: ${h.tipoHabitacion.categoria.nombre}`);
      console.log(`   Ocupación: ${h.tipoHabitacion.ocupacion.nombre} (${h.tipoHabitacion.ocupacion.capacidad} pers.)`);
      console.log('');
    });

    console.log('✅ La BD tiene datos correctos!');
    console.log('\n📡 Ahora prueba el endpoint:');
    console.log('   curl http://localhost:3000/api/habitaciones');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Asegúrate de:');
    console.error('   1. Tener el archivo .env configurado');
    console.error('   2. La BD esté corriendo');
    console.error('   3. Haber ejecutado las migraciones: npx prisma migrate dev');
  } finally {
    await prisma.$disconnect();
  }
}

main();
