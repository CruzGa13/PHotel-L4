import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyAuth } from "../middlewares/auth.js";

const router = Router();

// ============================================
// HELPERS Y CONSTANTES
// ============================================
const ESTADOS_BLOQUEO = ["Pendiente", "Confirmada", "CheckIn"];
const PRERESERVA_TTL_MIN = 15;

const diffNights = (ingreso, egreso) => Math.ceil((egreso - ingreso) / (1000 * 60 * 60 * 24));
const newId = () => `PRE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================
// STORAGE TEMPORAL PARA PRE-RESERVAS (EN MEMORIA)
// ============================================
const preReservasStore = new Map();
const HOLD_DURATION_MS = PRERESERVA_TTL_MIN * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [holdId, data] of preReservasStore.entries()) {
    if (now > data.expiresAt) {
      preReservasStore.delete(holdId);
      console.log(`[CLEANUP] Hold expirado: ${holdId}`);
    }
  }
}, 5 * 60 * 1000);

// ============================================
// ENDPOINT 1: GET /disponibilidad
// ============================================
router.get("/disponibilidad", async (req, res) => {
  const t0 = Date.now();
  try {
    const { tipoHabitacionId, ingreso, egreso, adultos, ninios } = req.query;
    console.log(`[GET /disponibilidad] START - tipo=${tipoHabitacionId}, ingreso=${ingreso}, egreso=${egreso}`);

    // Validaciones
    if (!tipoHabitacionId || !ingreso || !egreso) {
      return res.status(400).json({ error: "Parámetros requeridos: tipoHabitacionId, ingreso, egreso" });
    }

    const tipoId = parseInt(tipoHabitacionId, 10);
    const numAdultos = parseInt(adultos || "0", 10);
    const numNinios = parseInt(ninios || "0", 10);
    const fechaIngreso = new Date(ingreso);
    const fechaEgreso = new Date(egreso);

    if (isNaN(tipoId) || isNaN(fechaIngreso.getTime()) || isNaN(fechaEgreso.getTime())) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    const nights = diffNights(fechaIngreso, fechaEgreso);
    if (nights <= 0) {
      return res.status(400).json({ error: "Rango de fechas inválido" });
    }

    // Obtener tipo de habitación
    const tipoHabitacion = await prisma.tipoHabitacion.findUnique({
      where: { id: tipoId },
      select: {
        tarifaBase: true,
        ocupacion: { select: { capacidad: true } },
        habitaciones: {
          where: { estado: { not: "Mantenimiento" } },
          select: { id: true }
        }
      }
    });

    if (!tipoHabitacion) {
      return res.status(404).json({ error: "Tipo de habitación no encontrado" });
    }

    const totalPersonas = numAdultos + numNinios;
    const capacityOK = totalPersonas <= tipoHabitacion.ocupacion.capacidad;
    const messages = [];

    if (!capacityOK) {
      messages.push(`Capacidad excedida. Máximo: ${tipoHabitacion.ocupacion.capacidad} personas`);
    }

    // Calcular habitaciones ocupadas (solape correcto)
    const reservasConflicto = await prisma.reservaHabitacion.findMany({
      where: {
        habitacionId: { in: tipoHabitacion.habitaciones.map(h => h.id) },
        reserva: {
          estado: { in: ESTADOS_BLOQUEO },
          AND: [
            { fechaIngreso: { lt: fechaEgreso } },
            { fechaEgreso: { gt: fechaIngreso } }
          ]
        }
      },
      select: { habitacionId: true }
    });

    const ocupadas = [...new Set(reservasConflicto.map(r => r.habitacionId))];
    const availableCount = tipoHabitacion.habitaciones.length - ocupadas.length;
    const nightlyRate = Number(tipoHabitacion.tarifaBase);
    const total = nightlyRate * nights;

    console.log(`[GET /disponibilidad] OK - available=${availableCount}, nights=${nights}, total=${total} (${Date.now() - t0}ms)`);

    return res.status(200).json({
      availableCount,
      nights,
      nightlyRate,
      total,
      currency: "ARS",
      capacityOK,
      messages
    });

  } catch (error) {
    console.error(`[GET /disponibilidad] ERROR (${Date.now() - t0}ms):`, error.message);
    return res.status(500).json({ error: "Error al verificar disponibilidad" });
  }
});

// ============================================
// ENDPOINT 2: POST /pre-reservas
// ============================================
router.post("/pre-reservas", async (req, res) => {
  const t0 = Date.now();
  try {
    const { tipoHabitacionId, ingreso, egreso, adultos, ninios } = req.body;
    console.log(`[POST /pre-reservas] START - tipo=${tipoHabitacionId}`);

    if (!tipoHabitacionId || !ingreso || !egreso || adultos === undefined) {
      return res.status(400).json({ error: "Campos requeridos: tipoHabitacionId, ingreso, egreso, adultos" });
    }

    const tipoId = parseInt(tipoHabitacionId, 10);
    const numAdultos = parseInt(adultos, 10);
    const numNinios = parseInt(ninios || 0, 10);
    const fechaIngreso = new Date(ingreso);
    const fechaEgreso = new Date(egreso);

    if (isNaN(tipoId) || isNaN(fechaIngreso.getTime()) || isNaN(fechaEgreso.getTime())) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    const nights = diffNights(fechaIngreso, fechaEgreso);
    if (nights <= 0) {
      return res.status(400).json({ error: "Rango de fechas inválido" });
    }

    // Obtener tipo de habitación
    const tipoHabitacion = await prisma.tipoHabitacion.findUnique({
      where: { id: tipoId },
      select: {
        nombre: true,
        tarifaBase: true,
        politicas: true,
        ocupacion: { select: { capacidad: true } },
        habitaciones: {
          where: { estado: { not: "Mantenimiento" } },
          select: { id: true }
        }
      }
    });

    if (!tipoHabitacion) {
      return res.status(404).json({ error: "Tipo de habitación no encontrado" });
    }

    const totalPersonas = numAdultos + numNinios;
    if (totalPersonas > tipoHabitacion.ocupacion.capacidad) {
      return res.status(409).json({ error: "Capacidad excedida" });
    }

    // Calcular disponibilidad (misma lógica de solape)
    const reservasConflicto = await prisma.reservaHabitacion.findMany({
      where: {
        habitacionId: { in: tipoHabitacion.habitaciones.map(h => h.id) },
        reserva: {
          estado: { in: ESTADOS_BLOQUEO },
          AND: [
            { fechaIngreso: { lt: fechaEgreso } },
            { fechaEgreso: { gt: fechaIngreso } }
          ]
        }
      },
      select: { habitacionId: true }
    });

    const ocupadas = [...new Set(reservasConflicto.map(r => r.habitacionId))];
    const availableCount = tipoHabitacion.habitaciones.length - ocupadas.length;

    if (availableCount <= 0) {
      return res.status(409).json({ error: "Sin disponibilidad para las fechas seleccionadas" });
    }

    // Calcular precio
    const nightlyRate = Number(tipoHabitacion.tarifaBase);
    const total = nightlyRate * nights;

    // Crear hold (SIN asignar habitación)
    const holdId = newId();
    const expiresAt = Date.now() + HOLD_DURATION_MS;
    const expiresAtISO = new Date(expiresAt).toISOString();

    preReservasStore.set(holdId, {
      tipoHabitacionId: tipoId,
      ingreso,
      egreso,
      adultos: numAdultos,
      ninios: numNinios,
      nights,
      nightlyRate,
      total,
      expiresAt,
      used: false
    });

    console.log(`[POST /pre-reservas] OK - holdId=${holdId}, expires=${expiresAtISO} (${Date.now() - t0}ms)`);

    return res.status(200).json({
      holdId,
      expiresAt: expiresAtISO,
      snapshot: {
        tipoHabitacionId: tipoId,
        nombre: tipoHabitacion.nombre,
        nights,
        nightlyRate,
        total,
        currency: "ARS",
        politicas: tipoHabitacion.politicas
      }
    });

  } catch (error) {
    console.error(`[POST /pre-reservas] ERROR (${Date.now() - t0}ms):`, error.message);
    return res.status(500).json({ error: "Error al crear pre-reserva" });
  }
});

// ============================================
// ENDPOINT 3: POST /reservas
// ============================================
router.post("/reservas", verifyAuth, async (req, res) => {
  const t0 = Date.now();
  try {
    const { holdId } = req.body;
    const clienteId = req.user?.id;

    console.log(`[POST /reservas] START - holdId=${holdId}, user=${clienteId}`);

    if (!clienteId) {
      console.log(`[POST /reservas] ❌ Usuario no autenticado`);
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    console.log(`[POST /reservas] ✅ Usuario autenticado: ${clienteId}`);

    if (!holdId) {
      console.log(`[POST /reservas] ❌ holdId faltante`);
      return res.status(400).json({ error: "Campo requerido: holdId" });
    }
    console.log(`[POST /reservas] ✅ holdId presente: ${holdId}`);

    // Verificar hold
    console.log(`[POST /reservas] 🔍 Buscando hold en memoria...`);
    const hold = preReservasStore.get(holdId);
    console.log(`[POST /reservas] 📦 Hold encontrado:`, hold ? 'SI' : 'NO');
    if (!hold) {
      console.log(`[POST /reservas] ❌ Hold no encontrado en memoria`);
      return res.status(404).json({ error: "Hold no encontrado" });
    }
    console.log(`[POST /reservas] ✅ Hold encontrado, verificando validez...`);

    if (Date.now() > hold.expiresAt) {
      console.log(`[POST /reservas] ❌ Hold expirado`);
      preReservasStore.delete(holdId);
      return res.status(409).json({ error: "Hold expirado" });
    }
    console.log(`[POST /reservas] ✅ Hold no expirado`);

    if (hold.used) {
      console.log(`[POST /reservas] ❌ Hold ya utilizado`);
      return res.status(409).json({ error: "Hold ya utilizado" });
    }
    console.log(`[POST /reservas] ✅ Hold válido y no usado`);

    const fechaIngreso = new Date(hold.ingreso);
    const fechaEgreso = new Date(hold.egreso);
    console.log(`[POST /reservas] 📅 Fechas: ${fechaIngreso.toISOString()} - ${fechaEgreso.toISOString()}`);

    // Revalidar disponibilidad y seleccionar habitación
    console.log(`[POST /reservas] 🔍 Buscando tipo de habitación ${hold.tipoHabitacionId}...`);
    const tipoHabitacion = await prisma.tipoHabitacion.findUnique({
      where: { id: hold.tipoHabitacionId },
      select: {
        habitaciones: {
          where: { estado: { not: "Mantenimiento" } },
          select: { id: true }
        }
      }
    });

    console.log(`[POST /reservas] 📊 Tipo habitación:`, tipoHabitacion ? `encontrado con ${tipoHabitacion.habitaciones.length} habitaciones` : 'NO ENCONTRADO');
    
    if (!tipoHabitacion || tipoHabitacion.habitaciones.length === 0) {
      console.log(`[POST /reservas] ❌ Sin inventario`);
      preReservasStore.delete(holdId);
      return res.status(409).json({ error: "Tipo de habitación sin inventario" });
    }
    console.log(`[POST /reservas] ✅ Inventario disponible`);

    // Obtener habitaciones ocupadas
    console.log(`[POST /reservas] 🔍 Buscando conflictos de reservas...`);
    const reservasConflicto = await prisma.reservaHabitacion.findMany({
      where: {
        habitacionId: { in: tipoHabitacion.habitaciones.map(h => h.id) },
        reserva: {
          estado: { in: ESTADOS_BLOQUEO },
          AND: [
            { fechaIngreso: { lt: fechaEgreso } },
            { fechaEgreso: { gt: fechaIngreso } }
          ]
        }
      },
      select: { habitacionId: true }
    });

    const ocupadas = new Set(reservasConflicto.map(r => r.habitacionId));
    const libres = tipoHabitacion.habitaciones.filter(h => !ocupadas.has(h.id));
    console.log(`[POST /reservas] 📊 Habitaciones: ${tipoHabitacion.habitaciones.length} total, ${ocupadas.size} ocupadas, ${libres.length} libres`);

    if (libres.length === 0) {
      preReservasStore.delete(holdId);
      return res.status(409).json({ error: "Sin disponibilidad al confirmar" });
    }

    // Seleccionar 1 habitación
    const habitacionId = libres[0].id;
    console.log(`[POST /reservas] ✅ Habitación seleccionada: ${habitacionId}`);

    // Transacción Prisma
    console.log(`[POST /reservas] 💾 Iniciando transacción de BD...`);
    const reserva = await prisma.$transaction(async (tx) => {
      const nuevaReserva = await tx.reserva.create({
        data: {
          clienteId,
          fechaIngreso,
          fechaEgreso,
          adultos: hold.adultos,
          ninios: hold.ninios,
          estado: "Pendiente",
          totalAlojamiento: hold.total,
          totalServicios: 0,
          totalFinal: hold.total
        }
      });

      await tx.reservaHabitacion.create({
        data: {
          reservaId: nuevaReserva.id,
          habitacionId,
          precioUnitario: hold.nightlyRate,
          subtotal: hold.total
        }
      });

      return nuevaReserva;
    });
    console.log(`[POST /reservas] ✅ Transacción completada, reserva ID: ${reserva.id}`);

    // Marcar hold como usado
    hold.used = true;
    preReservasStore.set(holdId, hold);

    console.log(`[POST /reservas] OK - reservaId=${reserva.id}, habitacion=${habitacionId} (${Date.now() - t0}ms)`);

    return res.status(200).json({
      reservaId: reserva.id,
      estado: reserva.estado,
      total: Number(reserva.totalFinal)
    });

  } catch (error) {
    console.error(`[POST /reservas] ❌ ERROR (${Date.now() - t0}ms):`, error.message);
    console.error(`[POST /reservas] ❌ Error stack:`, error.stack);
    console.error(`[POST /reservas] ❌ Error completo:`, error);
    return res.status(500).json({ error: "Error al confirmar reserva" });
  }
});

export default router;

// ============================================
// INSTRUCCIONES DE MONTAJE
// ============================================
// En src/index.js (ESM):
// import reservasFlowRouter from "./routes/reservasFlow.js"
// app.use("/api", reservasFlowRouter)
//
// Tests:
// 1) GET  http://localhost:3000/api/disponibilidad?tipoHabitacionId=1&ingreso=2025-11-10&egreso=2025-11-12&adultos=2&ninios=0
// 2) POST http://localhost:3000/api/pre-reservas { tipoHabitacionId, ingreso, egreso, adultos, ninios }
// 3) POST http://localhost:3000/api/reservas { holdId }  (con Authorization: Bearer <JWT Supabase>)
