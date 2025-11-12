// facturasRoutes.js - Rutas para gestión de facturas y PDFs
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { buildInvoicePdfStream } = require('../lib/pdf');

const prisma = new PrismaClient();

/**
 * GET /api/facturas/:reservaId
 * Genera y devuelve el PDF de la factura asociada a una reserva
 * 
 * Params:
 * - reservaId: ID de la reserva
 * 
 * Response:
 * - 200: PDF stream (application/pdf)
 * - 404: Factura no encontrada
 * - 500: Error interno
 */
router.get('/:reservaId', async (req, res) => {
  try {
    const { reservaId } = req.params;

    console.log('[FACTURAS] Solicitando PDF para reserva:', reservaId);

    // Buscar factura con todas las relaciones necesarias
    const factura = await prisma.factura.findFirst({
      where: { reservaId: parseInt(reservaId) },
      include: {
        metodoPago: true,
        reserva: {
          include: {
            cliente: true,
            habitaciones: {
              take: 1, // Solo necesitamos la primera habitación
              include: {
                habitacion: {
                  include: {
                    tipoHabitacion: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Validar que exista la factura
    if (!factura) {
      console.warn('[FACTURAS] Factura no encontrada para reserva:', reservaId);
      return res.status(404).json({
        error: 'Factura no encontrada',
        reservaId: parseInt(reservaId),
      });
    }

    console.log('[FACTURAS] Factura encontrada:', factura.numeroFactura);

    // Extraer datos necesarios
    const reserva = factura.reserva;
    const tipoHabitacion = reserva.habitaciones[0]?.habitacion?.tipoHabitacion || null;

    // Preparar datos del cliente para el PDF
    const cliente = {
      nombre: reserva.cliente?.nombre ?? undefined,
      apellido: reserva.cliente?.apellido ?? undefined,
      email: reserva?.contactoEmail ?? undefined,
    };

    // Configurar headers para el PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Factura-FAC-${reservaId}.pdf"`
    );

    // Generar PDF y pipearlo a la respuesta
    console.log('[FACTURAS] Generando PDF...');
    const doc = buildInvoicePdfStream({
      factura,
      reserva,
      cliente,
      tipoHabitacion,
    });

    // Manejar eventos del stream
    doc.on('error', (error) => {
      console.error('[FACTURAS] Error en stream de PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Error generando PDF',
          details: error.message,
        });
      }
    });

    // Pipear el PDF a la respuesta
    doc.pipe(res);

    // Finalizar el documento
    doc.end();

    console.log('[FACTURAS] ✓ PDF enviado exitosamente');

  } catch (error) {
    console.error('[FACTURAS] Error al generar factura PDF:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Error al generar factura PDF',
        details: error.message,
      });
    }
  }
});

module.exports = router;
