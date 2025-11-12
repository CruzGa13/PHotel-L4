const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');
const imapService = require('../services/imapService');
const smtpService = require('../services/smtpService');

// GET /api/emails - Listar con filtros y paginación
router.get('/', async (req, res) => {
  try {
    const {
      estado,
      prioridad,
      canal,
      texto,
      fechaDesde,
      fechaHasta,
      page = 1,
      limit = 10
    } = req.query;

    // Construir filtros
    const where = {};
    
    if (estado) where.estado = estado;
    if (prioridad) where.prioridad = prioridad;
    if (canal) where.canal = canal;
    
    if (texto) {
      where.OR = [
        { asunto: { contains: texto, mode: 'insensitive' } },
        { deNombre: { contains: texto, mode: 'insensitive' } },
        { deEmail: { contains: texto, mode: 'insensitive' } },
        { cuerpoTexto: { contains: texto, mode: 'insensitive' } }
      ];
    }

    if (fechaDesde || fechaHasta) {
      where.fechaRecibido = {};
      if (fechaDesde) where.fechaRecibido.gte = new Date(fechaDesde);
      if (fechaHasta) where.fechaRecibido.lte = new Date(fechaHasta);
    }

    // Ejecutar queries
    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where,
        include: {
          operador: {
            select: { id: true, nombre: true, apellido: true }
          },
          _count: {
            select: { adjuntos: true, respuestas: true }
          }
        },
        orderBy: { fechaRecibido: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.email.count({ where })
    ]);

    // Calcular estadísticas
    const estadisticas = await prisma.email.groupBy({
      by: ['estado'],
      _count: true
    });

    res.json({
      success: true,
      data: emails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      estadisticas: estadisticas.reduce((acc, item) => {
        acc[item.estado] = item._count;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Error listando emails:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener emails' 
    });
  }
});

// GET /api/emails/:id - Detalle completo
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const email = await prisma.email.findUnique({
      where: { id: parseInt(id) },
      include: {
        adjuntos: true,
        respuestas: {
          include: {
            operador: {
              select: { id: true, nombre: true, apellido: true }
            }
          },
          orderBy: { fechaEnviado: 'desc' }
        },
        operador: {
          select: { id: true, nombre: true, apellido: true }
        }
      }
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email no encontrado'
      });
    }

    // Marcar como leído si no lo estaba
    if (email.estado === 'NoLeido') {
      await prisma.email.update({
        where: { id: parseInt(id) },
        data: {
          estado: 'Leido',
          fechaLeido: new Date()
        }
      });
    }

    res.json({
      success: true,
      data: email
    });

  } catch (error) {
    console.error('Error obteniendo email:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener email'
    });
  }
});

// PATCH /api/emails/:id - Actualizar estado/prioridad/operador
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, prioridad, operadorId } = req.body;

    const data = {};
    if (estado) data.estado = estado;
    if (prioridad) data.prioridad = prioridad;
    if (operadorId) data.operadorId = operadorId;

    const email = await prisma.email.update({
      where: { id: parseInt(id) },
      data
    });

    res.json({
      success: true,
      data: email
    });

  } catch (error) {
    console.error('Error actualizando email:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar email'
    });
  }
});

// POST /api/emails/:id/responder - Enviar respuesta
router.post('/:id/responder', async (req, res) => {
  try {
    const { id } = req.params;
    const { asunto, cuerpoTexto, cuerpoHtml, operadorId } = req.body;

    // TODO: Obtener operadorId del token de autenticación
    // Si no hay operadorId, simplemente no se envía (opcional en BD)

    const resultado = await smtpService.sendReply({
      emailId: parseInt(id),
      operadorId: operadorId || null, // null si no existe
      asunto,
      cuerpoTexto,
      cuerpoHtml
    });

    res.json({
      success: true,
      message: 'Respuesta enviada correctamente',
      data: resultado
    });

  } catch (error) {
    console.error('Error enviando respuesta:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al enviar respuesta'
    });
  }
});

// POST /api/emails/sync - Forzar sincronización IMAP
router.post('/sync', async (req, res) => {
  try {
    const resultado = await imapService.syncInbox();

    res.json({
      success: true,
      message: 'Sincronización completada',
      data: resultado
    });

  } catch (error) {
    console.error('Error en sincronización:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al sincronizar emails'
    });
  }
});

module.exports = router;
