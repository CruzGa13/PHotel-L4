import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO FASE 2: CARGA DE RESERVAS DE PRUEBA CORREGIDA ---');

  // ⚠️ LIMPIEZA SOLO DE RESERVAS (Necesario antes de insertar nuevas)
  await prisma.reservaHabitacion.deleteMany({});
  await prisma.reserva.deleteMany({});
  console.log('Tablas: Reservas y ReservaHabitacion limpiadas.');
    

  // --- IDs OBTENIDOS DE TU TABLA ---
  const clientePedroId = '1e246f75-938a-4813-be0d-15134dfcb406'; 
  const clienteLalaId = '42cdd4fa-994c-4e52-931e-cebb93339817'; 
  const operadorGastonId = '0b540695-216e-4e55-871a-66267c7272de';
  
  // IDs de Habitaciones Físicas REALES
  const habitacionTipo1Id = 13; // ID real de la Habitación '101' (Tipo 1)
  const habitacionTipo2Id = 16; // ID real de la Habitación '201' (Tipo 2)

  // CASO A: OCUPACIÓN FUTURA (Bloquea stock de Tipo 1 - Cliente Pedro)
  const reservaPedro = await prisma.reserva.create({
      data: {
          clienteId: clientePedroId,
          administradorId: operadorGastonId, 
          fechaIngreso: new Date('2026-04-10T14:00:00.000Z'),
          fechaEgreso: new Date('2026-04-15T11:00:00.000Z'),
          adultos: 1, estado: 'Confirmada', 
          totalAlojamiento: 500.00, totalFinal: 500.00, totalServicios: 0,
      },
  });

  await prisma.reservaHabitacion.create({
      data: {
          reservaId: reservaPedro.id,
          habitacionId: habitacionTipo1Id, // ID 13
          precioUnitario: 100.00, subtotal: 500.00,
      },
  });


  // CASO B: OCUPACIÓN SUPERPUESTA (Bloquea stock de Tipo 2 - Cliente Lala)
  const reservaLala = await prisma.reserva.create({
      data: {
          clienteId: clienteLalaId,
          administradorId: operadorGastonId, 
          fechaIngreso: new Date('2026-04-13T14:00:00.000Z'), 
          fechaEgreso: new Date('2026-04-17T11:00:00.000Z'),
          adultos: 2, estado: 'Pendiente', 
          totalAlojamiento: 600.00, totalFinal: 600.00, totalServicios: 0,
      },
  });

  await prisma.reservaHabitacion.create({
      data: {
          reservaId: reservaLala.id,
          habitacionId: habitacionTipo2Id, // ID 16
          precioUnitario: 150.00, subtotal: 600.00,
      },
  });
    
    console.log('--- CARGA DE RESERVAS DE PRUEBA FINALIZADA CON ÉXITO ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });