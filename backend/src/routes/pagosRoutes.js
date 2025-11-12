// pagosRoutes.js - Rutas de pagos con Stripe
require('dotenv').config();
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// TODO: centralizar allowlist si se necesita en múltiples archivos
const ALLOWLIST = new Set([
  'http://localhost:5173',
  // 'https://TU-DOMINIO-PROD.vercel.app', // habilitar en producción
]);

/**
 * Determina la base URL del frontend según el origen del request
 * @param {Request} req - Request de Express
 * @returns {string} - Base URL del frontend
 */
function pickBaseUrl(req) {
  const origin = req.headers.origin;
  // Si el origin está en la allowlist, usarlo. Si no, usar fallback de .env
  if (origin && ALLOWLIST.has(origin)) {
    return origin;
  }
  return process.env.FRONT_BASE_URL || 'http://localhost:5173';
}

/**
 * POST /api/pagos/checkout-session
 * Crea una sesión de Stripe Checkout para confirmar una reserva
 * 
 * Body esperado:
 * {
 *   "reservaId": 42  // ID de la reserva ya confirmada
 * }
 */
router.post('/checkout-session', express.json(), async (req, res) => {
  try {
    const { reservaId } = req.body;

    if (!reservaId) {
      return res.status(400).json({ error: 'Se requiere reservaId' });
    }

    // Buscar la reserva con las relaciones reales del schema
    // Cadena: Reserva -> habitaciones (ReservaHabitacion[]) -> habitacion -> tipoHabitacion
    const reserva = await prisma.reserva.findUnique({
      where: { id: parseInt(reservaId) },
      include: {
        cliente: true, // Usuario que hizo la reserva
        factura: true, // Incluir factura para verificar si ya está pagada
        habitaciones: {
          take: 1, // Solo la primera habitación para obtener el nombre del tipo
          include: {
            habitacion: {
              include: {
                tipoHabitacion: true, // Aquí está el nombre que necesitamos
              },
            },
          },
        },
      },
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // 🚫 Validar que no exista una factura ya pagada (evitar cobros duplicados)
    if (reserva.factura && reserva.factura.estado === 'Pagada') {
      console.warn('[pagosRoutes] Intento de crear sesión para factura ya pagada:', {
        reservaId: reserva.id,
        facturaId: reserva.factura.id,
        numeroFactura: reserva.factura.numeroFactura
      });
      return res.status(409).json({ 
        error: 'Factura ya pagada',
        message: 'Esta reserva ya tiene una factura pagada. No se puede crear una nueva sesión de pago.',
        facturaId: reserva.factura.id
      });
    }

    // Obtener el nombre del tipo de habitación (tomando la primera habitación)
    // Si no hay habitaciones vinculadas, usar descripción genérica
    const nombreTipoHabitacion = 
      reserva.habitaciones[0]?.habitacion?.tipoHabitacion?.nombre || 'Reserva de habitación';

    console.log('[pagosRoutes] Creando checkout para reserva:', {
      id: reserva.id,
      tipoHabitacion: nombreTipoHabitacion,
      totalFinal: reserva.totalFinal,
      cliente: reserva.cliente.id,
    });

    // Determinar la base URL dinámica
    const base = pickBaseUrl(req);

    // Construir URLs con origen dinámico
    const success_url = `${base}/reserva-confirmada?reservaId=${reserva.id}&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${base}/resumen-reserva`;

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ars',
            product_data: {
              name: `Reserva: ${nombreTipoHabitacion}`,
              description: `${reserva.adultos} adulto(s), ${reserva.ninios} niño(s). Del ${new Date(reserva.fechaIngreso).toLocaleDateString('es-AR')} al ${new Date(reserva.fechaEgreso).toLocaleDateString('es-AR')}`,
            },
            unit_amount: Math.round(Number(reserva.totalFinal) * 100), // Stripe espera centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        reservaId: reserva.id.toString(),
      },
      customer_email: reserva.cliente.email,
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('[pagosRoutes] Error al crear checkout session:', error);
    return res.status(500).json({ 
      error: 'Error al crear sesión de pago',
      details: error.message 
    });
  }
});

/**
 * GET /api/pagos/confirmacion
 * Verifica el estado de pago de una sesión de Stripe y actualiza la reserva
 * 
 * Query params esperados:
 * - session_id: ID de la sesión de Stripe Checkout
 * - reservaId: ID de la reserva (requerido)
 */
router.get('/confirmacion', async (req, res) => {
  try {
    const { session_id, reservaId } = req.query;

    if (!session_id) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Se requiere session_id' 
      });
    }

    if (!reservaId) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Se requiere reservaId' 
      });
    }

    console.log('[PAGOS] Confirmando pago:', { session_id, reservaId });

    // Recuperar la sesión de Stripe con datos expandidos
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent'],
    });

    // Validar que el metadata coincida con el reservaId proporcionado
    if (session.metadata?.reservaId !== reservaId) {
      console.warn('[PAGOS] Mismatch de reservaId:', {
        expected: reservaId,
        fromMetadata: session.metadata?.reservaId
      });
    }

    // Buscar la reserva con sus relaciones
    const reserva = await prisma.reserva.findUnique({
      where: { id: parseInt(reservaId) },
      include: {
        cliente: true,
        habitaciones: {
          take: 1,
          include: {
            habitacion: {
              include: {
                tipoHabitacion: true,
              },
            },
          },
        },
      },
    });

    if (!reserva) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Reserva no encontrada' 
      });
    }

    const nombreTipoHabitacion = 
      reserva.habitaciones[0]?.habitacion?.tipoHabitacion?.nombre || 'Habitación';

    // Verificar estado de pago
    const isPaid = session.payment_status === 'paid';

    console.log('[PAGOS] Estado de pago:', {
      reservaId,
      payment_status: session.payment_status,
      isPaid,
      currentEstado: reserva.estado,
      amount: session.amount_total,
    });

    // Validar que el pago esté completado
    if (!isPaid) {
      console.warn('[PAGOS] Intento de confirmación con pago no completado');
      return res.status(409).json({ 
        ok: false, 
        error: 'El pago no ha sido completado',
        payment_status: session.payment_status
      });
    }

    // Si está pagado y la reserva no está confirmada, actualizarla
    if (reserva.estado !== 'Confirmada') {
      await prisma.reserva.update({
        where: { id: parseInt(reservaId) },
        data: {
          estado: 'Confirmada',
          contactoEmail: session.customer_details?.email || session.customer_email || reserva.contactoEmail,
        },
      });

      console.log(`[PAGOS] Reserva ${reservaId} confirmada y actualizada a Confirmada`);
    } else {
      console.log(`[PAGOS] Reserva ${reservaId} ya estaba confirmada`);
    }

    // CREAR FACTURA si no existe (fallback si webhook no se ejecutó)
    let factura = await prisma.factura.findFirst({
      where: { reservaId: parseInt(reservaId) }
    });

    if (!factura) {
      console.log('[PAGOS] No existe factura, creando...');
      
      // Buscar o crear método de pago "Tarjeta"
      let metodoPago = await prisma.metodoPago.findFirst({
        where: { 
          OR: [
            { nombre: 'Tarjeta de Crédito' },
            { nombre: 'Tarjeta de Débito' },
            { nombre: 'Tarjeta' },
          ]
        }
      });

      if (!metodoPago) {
        metodoPago = await prisma.metodoPago.create({
          data: {
            nombre: 'Tarjeta',
            notas: 'Pago con tarjeta vía Stripe',
          },
        });
        console.log('[PAGOS] Método de pago "Tarjeta" creado con ID:', metodoPago.id);
      }

      // Generar número de factura único
      const timestamp = Date.now();
      const numeroFactura = `FAC-${reservaId}-${timestamp}`;

      // Convertir amount_total de centavos a pesos
      const totalEnPesos = session.amount_total / 100;

      // Crear factura
      factura = await prisma.factura.create({
        data: {
          reservaId: parseInt(reservaId),
          metodoPagoId: metodoPago.id,
          numeroFactura: numeroFactura,
          subtotal: totalEnPesos,
          impuestos: 0,
          total: totalEnPesos,
          estado: 'Pagada',
        },
      });

      console.log('[PAGOS] ✅ Factura creada:', {
        facturaId: factura.id,
        numeroFactura: factura.numeroFactura,
        total: factura.total,
      });
    } else {
      console.log('[PAGOS] Factura ya existe:', factura.numeroFactura);
    }

    // Calcular noches
    const fechaInicio = new Date(reserva.fechaIngreso);
    const fechaFin = new Date(reserva.fechaEgreso);
    const noches = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

    // Preparar respuesta con resumen completo
    const respuesta = {
      ok: true,
      reserva: {
        id: reserva.id,
        codigoReserva: `#${reserva.id}`,
        estado: 'Confirmada',
        ingreso: reserva.fechaIngreso.toISOString().split('T')[0],
        egreso: reserva.fechaEgreso.toISOString().split('T')[0],
        noches: noches,
        huespedes: {
          adultos: reserva.adultos,
          ninios: reserva.ninios,
        },
        habitacion: {
          id: reserva.habitaciones[0]?.habitacion?.id || null,
          nombre: nombreTipoHabitacion,
        },
        total: Number(reserva.totalFinal),
        moneda: 'ARS',
        payment: {
          status: 'paid',
          sessionId: session.id,
          paymentIntentId: session.payment_intent?.id || null,
        },
      },
    };

    return res.status(200).json(respuesta);

  } catch (error) {
    console.error('[PAGOS] Error al confirmar pago:', error);
    
    // Error específico de Stripe
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        ok: false, 
        error: 'Sesión de pago inválida o expirada',
        details: error.message 
      });
    }

    return res.status(500).json({ 
      ok: false, 
      error: 'Error al confirmar el pago',
      details: error.message 
    });
  }
});

/**
 * POST /api/pagos/webhook
 * Webhook de Stripe para confirmar pagos en segundo plano y generar facturas
 * 
 * Eventos manejados:
 * - checkout.session.completed: Confirma reserva y crea factura
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET no configurado');
    return res.status(500).json({ error: 'Webhook secret no configurado' });
  }

  let event;

  try {
    // Verificar firma del webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('[WEBHOOK] Evento recibido:', event.type, 'ID:', event.id);
  } catch (err) {
    console.error('[WEBHOOK] Error verificando firma:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Manejar eventos
  switch (event.type) {
    case 'checkout.session.completed':
      try {
        const sessionData = event.data.object;
        
        // Recuperar sesión completa con payment_intent expandido
        const session = await stripe.checkout.sessions.retrieve(sessionData.id, {
          expand: ['payment_intent'],
        });

        const reservaId = session.metadata?.reservaId;
        
        if (!reservaId) {
          console.error('[WEBHOOK] checkout.session.completed sin reservaId en metadata');
          return res.status(400).json({ error: 'No se encontró reservaId en metadata' });
        }

        // Capturar email del cliente desde Stripe
        const customerEmail =
          session.customer_details?.email ||
          session.customer_email ||
          null;

        console.log('[WEBHOOK] Procesando pago para reserva:', reservaId);
        console.log('[WEBHOOK] Payment status:', session.payment_status);
        console.log('[WEBHOOK] Amount:', session.amount_total / 100, 'ARS');
        console.log('[WEBHOOK] Customer email:', customerEmail || 'No disponible');

        // Verificar que el pago esté completado
        if (session.payment_status !== 'paid') {
          console.warn('[WEBHOOK] Sesión no pagada, payment_status:', session.payment_status);
          return res.status(200).json({ received: true, skipped: 'not_paid' });
        }

        // Buscar la reserva
        const reserva = await prisma.reserva.findUnique({
          where: { id: parseInt(reservaId) },
          include: { factura: true },
        });

        if (!reserva) {
          console.error('[WEBHOOK] Reserva no encontrada:', reservaId);
          return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        // Verificar si ya existe factura (idempotencia)
        if (reserva.factura) {
          console.log('[WEBHOOK] Factura ya existe para reserva:', reservaId, '- Ignorando');
          return res.status(200).json({ received: true, skipped: 'already_processed' });
        }

        // Buscar o crear método de pago "Tarjeta de Crédito"
        let metodoPago = await prisma.metodoPago.findFirst({
          where: { 
            OR: [
              { nombre: 'Tarjeta de Crédito' },
              { nombre: 'Tarjeta de Débito' },
              { nombre: 'Tarjeta' },
            ]
          }
        });

        // Si no existe, crear uno genérico "Tarjeta"
        if (!metodoPago) {
          metodoPago = await prisma.metodoPago.create({
            data: {
              nombre: 'Tarjeta',
              notas: 'Pago con tarjeta vía Stripe',
            },
          });
          console.log('[WEBHOOK] Método de pago "Tarjeta" creado con ID:', metodoPago.id);
        }

        // Usar transacción para garantizar atomicidad
        const result = await prisma.$transaction(async (tx) => {
          // 1) Actualizar estado de la reserva a Confirmada y guardar email
          const reservaActualizada = await tx.reserva.update({
            where: { id: parseInt(reservaId) },
            data: {
              estado: 'Confirmada',
              contactoEmail: customerEmail,
            },
          });

          // 2) Generar número de factura único
          const timestamp = Date.now();
          const numeroFactura = `FAC-${reservaId}-${timestamp}`;

          // 3) Convertir amount_total de centavos a pesos
          const totalEnPesos = session.amount_total / 100;

          // 4) Crear factura
          const factura = await tx.factura.create({
            data: {
              reservaId: parseInt(reservaId),
              metodoPagoId: metodoPago.id,
              numeroFactura: numeroFactura,
              subtotal: totalEnPesos, // Puede ajustarse si tienes lógica de impuestos
              impuestos: 0,           // Por ahora 0, puede ajustarse
              total: totalEnPesos,
              estado: 'Pagada',
            },
          });

          console.log('[WEBHOOK] ✓ Reserva confirmada y factura creada:', {
            reservaId: reserva.id,
            numeroFactura: factura.numeroFactura,
            total: factura.total,
            metodoPago: metodoPago.nombre,
          });

          return { reserva: reservaActualizada, factura };
        });

        console.log('[WEBHOOK] ✓ Transacción completada exitosamente');

        // Responder siempre 200 para que Stripe no reintente
        return res.status(200).json({ 
          received: true, 
          processed: true,
          reservaId: result.reserva.id,
          facturaId: result.factura.id,
        });

      } catch (error) {
        console.error('[WEBHOOK] Error procesando checkout.session.completed:', error);
        
        // Responder 200 para evitar reintentos infinitos si es un error de lógica
        // Responder 500 si es un error temporal (DB, etc.)
        if (error.code === 'P2002') {
          // Prisma unique constraint violation (factura duplicada)
          console.log('[WEBHOOK] Factura duplicada detectada (race condition), ignorando');
          return res.status(200).json({ received: true, skipped: 'duplicate' });
        }

        return res.status(500).json({ 
          error: 'Error procesando webhook',
          details: error.message 
        });
      }
      break;

    case 'payment_intent.payment_failed':
      console.log('[WEBHOOK] Pago fallido:', event.data.object.id);
      // Opcional: marcar reserva como fallida o enviar notificación
      break;

    default:
      console.log('[WEBHOOK] Evento no manejado:', event.type);
  }

  // Responder siempre 200 OK para eventos no críticos
  return res.status(200).json({ received: true });
});

module.exports = router;
