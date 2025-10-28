const { prisma } = require('../lib/prisma');

/**
 * Verificar disponibilidad de habitación y calcular precio
 * 
 * @route POST /api/reservas/verificar
 * @access Public
 * 
 * @description
 * Verifica si hay al menos una habitación física disponible de un tipo específico
 * en el rango de fechas solicitado y calcula el precio total de la estancia.
 * 
 * @body {number} tipoHabitacionId - ID del tipo de habitación
 * @body {string} fechaLlegada - Fecha de llegada (ISO 8601)
 * @body {string} fechaSalida - Fecha de salida (ISO 8601)
 * 
 * @returns {Object} 200 - { disponible: true/false, precioFinal?, noches?, mensaje? }
 * @returns {Object} 400 - Datos inválidos
 * @returns {Object} 404 - Tipo de habitación no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const verificarDisponibilidadPrecio = async (req, res) => {
  try {
    // ========================================
    // 1. EXTRAER Y VALIDAR DATOS DE ENTRADA
    // ========================================
    const { tipoHabitacionId, fechaLlegada, fechaSalida } = req.body;

    console.log('🔍 [Verificar Disponibilidad] Datos recibidos:', {
      tipoHabitacionId,
      fechaLlegada,
      fechaSalida
    });

    // Validar que todos los campos existan
    if (!tipoHabitacionId || !fechaLlegada || !fechaSalida) {
      console.warn('⚠️ [Verificar Disponibilidad] Faltan campos requeridos');
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        detalles: {
          tipoHabitacionId: !!tipoHabitacionId,
          fechaLlegada: !!fechaLlegada,
          fechaSalida: !!fechaSalida
        }
      });
    }

    // Validar que tipoHabitacionId sea un número
    const tipoHabId = parseInt(tipoHabitacionId);
    if (isNaN(tipoHabId)) {
      console.warn('⚠️ [Verificar Disponibilidad] tipoHabitacionId inválido:', tipoHabitacionId);
      return res.status(400).json({
        error: 'El tipoHabitacionId debe ser un número válido'
      });
    }

    // Convertir strings a objetos Date
    const llegada = new Date(fechaLlegada);
    const salida = new Date(fechaSalida);

    // Validar que las fechas sean válidas
    if (isNaN(llegada.getTime()) || isNaN(salida.getTime())) {
      console.warn('⚠️ [Verificar Disponibilidad] Fechas inválidas:', { fechaLlegada, fechaSalida });
      return res.status(400).json({
        error: 'Las fechas proporcionadas no son válidas',
        detalles: {
          fechaLlegada: isNaN(llegada.getTime()) ? 'inválida' : 'válida',
          fechaSalida: isNaN(salida.getTime()) ? 'inválida' : 'válida'
        }
      });
    }

    // Validar que fechaSalida sea posterior a fechaLlegada
    if (salida <= llegada) {
      console.warn('⚠️ [Verificar Disponibilidad] La fecha de salida debe ser posterior a la de llegada');
      return res.status(400).json({
        error: 'La fecha de salida debe ser posterior a la fecha de llegada',
        fechaLlegada: llegada.toISOString(),
        fechaSalida: salida.toISOString()
      });
    }

    console.log('✅ [Verificar Disponibilidad] Validación exitosa. Fechas parseadas:', {
      llegada: llegada.toISOString(),
      salida: salida.toISOString()
    });

    // ========================================
    // 2. OBTENER DATOS DEL TIPO DE HABITACIÓN
    // ========================================
    console.log('📊 [Verificar Disponibilidad] Buscando tipo de habitación con ID:', tipoHabId);

    let tipoHabitacion;
    try {
      tipoHabitacion = await prisma.tipoHabitacion.findUniqueOrThrow({
        where: { id: tipoHabId },
        select: {
          id: true,
          nombre: true,
          tarifaBase: true,
          categoria: {
            select: { nombre: true }
          },
          ocupacion: {
            select: { nombre: true, capacidad: true }
          }
        }
      });

      console.log('✅ [Verificar Disponibilidad] Tipo de habitación encontrado:', {
        id: tipoHabitacion.id,
        nombre: tipoHabitacion.nombre,
        tarifaBase: tipoHabitacion.tarifaBase.toString()
      });
    } catch (error) {
      if (error.code === 'P2025') {
        console.warn('⚠️ [Verificar Disponibilidad] Tipo de habitación no encontrado:', tipoHabId);
        return res.status(404).json({
          error: 'Tipo de habitación no encontrado',
          tipoHabitacionId: tipoHabId
        });
      }
      throw error; // Re-lanzar otros errores de Prisma
    }

    // ========================================
    // 3. CALCULAR NÚMERO DE NOCHES
    // ========================================
    const milisegundosPorDia = 1000 * 60 * 60 * 24;
    const diferenciaMs = salida.getTime() - llegada.getTime();
    const noches = Math.ceil(diferenciaMs / milisegundosPorDia);

    console.log('📅 [Verificar Disponibilidad] Cálculo de noches:', {
      fechaLlegada: llegada.toISOString().split('T')[0],
      fechaSalida: salida.toISOString().split('T')[0],
      noches
    });

    // Validar que haya al menos 1 noche
    if (noches < 1) {
      console.warn('⚠️ [Verificar Disponibilidad] Menos de 1 noche calculada');
      return res.status(400).json({
        error: 'La estancia debe ser de al menos 1 noche',
        noches
      });
    }

    // ========================================
    // 4. VERIFICAR DISPONIBILIDAD
    // ========================================
    console.log('🔍 [Verificar Disponibilidad] Buscando habitaciones disponibles...');
    console.log('   Condiciones de búsqueda:');
    console.log('   - Tipo de habitación:', tipoHabId);
    console.log('   - Sin reservas que se superpongan con:', {
      desde: llegada.toISOString(),
      hasta: salida.toISOString()
    });

    // Buscar habitaciones del tipo solicitado que NO tengan reservas superpuestas
    const habitacionDisponible = await prisma.habitacion.findFirst({
      where: {
        tipoHabitacionId: tipoHabId,
        // NO debe tener NINGUNA reserva que cumpla estas condiciones:
        reservas: {
          none: {
            reserva: {
              AND: [
                // La reserva existente empieza antes de que termine nuestra búsqueda
                { fechaIngreso: { lt: salida } },
                // La reserva existente termina después de que empiece nuestra búsqueda
                { fechaEgreso: { gt: llegada } },
                // La reserva NO está cancelada (solo consideramos reservas activas)
                { estado: { notIn: ['Cancelada'] } }
              ]
            }
          }
        }
      },
      select: {
        id: true,
        numero: true,
        piso: true
      }
    });

    const disponible = !!habitacionDisponible;

    console.log('✅ [Verificar Disponibilidad] Resultado de búsqueda:', {
      disponible,
      habitacionEncontrada: habitacionDisponible ? {
        numero: habitacionDisponible.numero,
        piso: habitacionDisponible.piso
      } : null
    });

    // ========================================
    // 5. CALCULAR PRECIO FINAL (si hay disponibilidad)
    // ========================================
    if (disponible) {
      // Convertir Decimal a number para el cálculo
      const tarifaBaseNum = parseFloat(tipoHabitacion.tarifaBase.toString());
      const precioFinal = tarifaBaseNum * noches;

      console.log('💰 [Verificar Disponibilidad] Cálculo de precio:', {
        tarifaBase: tarifaBaseNum,
        noches,
        precioFinal: precioFinal.toFixed(2)
      });

      // Respuesta exitosa con disponibilidad
      return res.status(200).json({
        disponible: true,
        precioFinal: parseFloat(precioFinal.toFixed(2)),
        noches,
        tipoHabitacion: {
          id: tipoHabitacion.id,
          nombre: tipoHabitacion.nombre,
          categoria: tipoHabitacion.categoria.nombre,
          ocupacion: tipoHabitacion.ocupacion.nombre,
          capacidad: tipoHabitacion.ocupacion.capacidad
        },
        tarifaPorNoche: tarifaBaseNum,
        fechas: {
          llegada: llegada.toISOString().split('T')[0],
          salida: salida.toISOString().split('T')[0]
        }
      });
    } else {
      // No hay disponibilidad
      console.log('❌ [Verificar Disponibilidad] No hay habitaciones disponibles');

      return res.status(200).json({
        disponible: false,
        mensaje: 'No hay habitaciones disponibles para las fechas seleccionadas',
        tipoHabitacion: {
          id: tipoHabitacion.id,
          nombre: tipoHabitacion.nombre
        },
        fechas: {
          llegada: llegada.toISOString().split('T')[0],
          salida: salida.toISOString().split('T')[0]
        }
      });
    }

  } catch (error) {
    // ========================================
    // 6. MANEJO DE ERRORES
    // ========================================
    console.error('❌ [Verificar Disponibilidad] Error:', error);
    console.error('   Stack:', error.stack);

    return res.status(500).json({
      error: 'Error al verificar disponibilidad',
      mensaje: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

module.exports = {
  verificarDisponibilidadPrecio
};
