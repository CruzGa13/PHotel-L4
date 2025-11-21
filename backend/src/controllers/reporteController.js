const PDFDocument = require('pdfkit');
const adminConsultasService = require('../services/adminConsultasService');

/**
 * Genera un PDF con el reporte de reservas filtradas
 * POST /api/reportes/reservas/pdf
 * 
 * Body esperado:
 * {
 *   filtros: { from, to, tipoHabitacionId, estado, operadorId, busquedaCliente, metodoPago },
 *   graficos: { ingresosPorDia, reservasPorTipo, estadosReserva } (base64 strings) - OPCIONAL
 * }
 */
const generarPDFReservas = async (req, res) => {
  try {
    const { filtros, graficos } = req.body;

    console.log('📄 Generando PDF con filtros:', filtros);
    console.log('📊 Gráficos recibidos:', graficos ? Object.keys(graficos) : 'ninguno');

    // Obtener datos reales desde la BD
    const resumen = await adminConsultasService.obtenerResumen(filtros);
    const reservas = await adminConsultasService.obtenerTodasLasReservas(filtros);
    
    console.log('✅ Datos obtenidos:', {
      totalReservas: reservas.length,
      kpis: resumen.kpis,
    });

    const { kpis } = resumen;

    // Crear documento PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      bufferPages: true 
    });

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-reservas.pdf"');

    // Pipe del PDF a la respuesta
    doc.pipe(res);

    // ========================================
    // ENCABEZADO PROFESIONAL CON DISEÑO MODERNO
    // ========================================
    
    // Barra superior de color (header decorativo)
    doc.rect(0, 0, 595, 120)
       .fillAndStroke('#9333ea', '#7e22ce');

    // Logo/Nombre del hotel en blanco sobre fondo morado
    doc.fontSize(32)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text('HOTEL RÍOS AGUA VIVA', 50, 35, { align: 'center' })
       .moveDown(0.3);

    doc.fontSize(14)
       .fillColor('#e9d5ff')
       .font('Helvetica')
       .text('Sistema de Gestión Hotelera', { align: 'center' })
       .moveDown(2);

    // Título del reporte con fondo blanco
    doc.rect(50, 140, 495, 60)
       .fillAndStroke('#ffffff', '#e5e7eb');
    
    doc.fontSize(22)
       .fillColor('#1f2937')
       .font('Helvetica-Bold')
       .text('REPORTE DE RESERVAS', 50, 155, { align: 'center' })
       .moveDown(0.3);

    // Fecha de generación
    const fechaGeneracion = new Date().toLocaleString('es-AR', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
    doc.fontSize(10)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text(`Generado el: ${fechaGeneracion}`, { align: 'center' })
       .moveDown(2);

    // ========================================
    // FILTROS APLICADOS CON DISEÑO DE TARJETA
    // ========================================
    
    const yFiltros = doc.y;
    
    // Fondo de la sección de filtros
    doc.rect(50, yFiltros, 495, 80)
       .fillAndStroke('#f9fafb', '#e5e7eb');

    doc.fontSize(12)
       .fillColor('#9333ea')
       .font('Helvetica-Bold')
       .text('FILTROS APLICADOS', 65, yFiltros + 15)
       .moveDown(0.5);

    doc.fontSize(9)
       .fillColor('#374151')
       .font('Helvetica');

    const filtrosTexto = [
      `Período: ${filtros.from ? new Date(filtros.from).toLocaleDateString('es-AR') : 'N/A'} - ${filtros.to ? new Date(filtros.to).toLocaleDateString('es-AR') : 'N/A'}`,
      `Tipo de Habitación: ${filtros.tipoHabitacionId || 'Todos'}`,
      `Estado de Reserva: ${filtros.estado || 'Todos'}`,
    ];

    if (filtros.busquedaCliente) {
      filtrosTexto.push(`Búsqueda de Cliente: ${filtros.busquedaCliente}`);
    }
    if (filtros.metodoPago && filtros.metodoPago !== 'Todos') {
      filtrosTexto.push(`Método de Pago: ${filtros.metodoPago}`);
    }

    let yPos = yFiltros + 35;
    filtrosTexto.forEach((texto, index) => {
      if (index < 3) {
        doc.text(texto, 65, yPos + (index * 12));
      } else {
        doc.text(texto, 315, yPos + ((index - 3) * 12));
      }
    });

    doc.y = yFiltros + 95;

    // ========================================
    // KPIs CON DISEÑO MODERNO DE TARJETAS
    // ========================================

    doc.fontSize(14)
       .fillColor('#9333ea')
       .font('Helvetica-Bold')
       .text('INDICADORES CLAVE', { underline: false })
       .moveDown(0.8);

    // Crear grid de KPIs (2x2) con diseño de tarjetas
    const kpiStartY = doc.y;
    const kpiWidth = 230;
    const kpiHeight = 70;
    const kpiSpacing = 15;

    const kpisData = [
      { label: 'OCUPACIÓN PROMEDIO', value: `${kpis.ocupacionPromedio}%`, icon: '%', color: '#9333ea', bgColor: '#f3e8ff' },
      { label: 'INGRESOS DEL PERÍODO', value: `$${Number(kpis.ingresosTotales).toLocaleString('es-AR')}`, icon: '$', color: '#059669', bgColor: '#d1fae5' },
      { label: 'TOTAL DE RESERVAS', value: kpis.totalReservas, icon: '#', color: '#2563eb', bgColor: '#dbeafe' },
      { label: 'TASA DE CANCELACIÓN', value: `${kpis.tasaCancelacion}%`, icon: 'X', color: '#dc2626', bgColor: '#fee2e2' },
    ];

    kpisData.forEach((kpi, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 50 + col * (kpiWidth + kpiSpacing);
      const y = kpiStartY + row * (kpiHeight + kpiSpacing);

      // Fondo de tarjeta con sombra
      doc.rect(x, y, kpiWidth, kpiHeight)
         .fillAndStroke(kpi.bgColor, '#e5e7eb');

      // Icono
      doc.fontSize(18)
         .fillColor(kpi.color)
         .font('Helvetica-Bold')
         .text(kpi.icon, x + 12, y + 18);

      // Label
      doc.fontSize(8)
         .fillColor('#6b7280')
         .font('Helvetica-Bold')
         .text(kpi.label, x + 45, y + 15, { width: kpiWidth - 55 });

      // Value (más grande y destacado)
      doc.fontSize(22)
         .fillColor(kpi.color)
         .font('Helvetica-Bold')
         .text(String(kpi.value), x + 45, y + 32, { width: kpiWidth - 55 });
    });

    doc.y = kpiStartY + 2 * (kpiHeight + kpiSpacing) + 25;

    // ========================================
    // GRÁFICOS CON DISEÑO PROFESIONAL
    // ========================================

    doc.addPage();

    doc.fontSize(14)
       .fillColor('#9333ea')
       .font('Helvetica-Bold')
       .text('ANÁLISIS GRÁFICO', { underline: false })
       .moveDown(1.2);

    // Insertar gráficos si existen
    const graficosConfig = [
      { key: 'reservasPorTipo', titulo: 'Reservas por Tipo de Habitación' },
      { key: 'ingresosPorDia', titulo: 'Ingresos por Día' },
      { key: 'estadosReserva', titulo: 'Estados de Reservas' },
    ];

    for (const graficoConfig of graficosConfig) {
      if (graficos && graficos[graficoConfig.key]) {
        try {
          // Tarjeta de fondo para el gráfico
          const yGrafico = doc.y;
          doc.rect(50, yGrafico, 495, 220)
             .fillAndStroke('#ffffff', '#e5e7eb');

          // Título del gráfico
          doc.fontSize(12)
             .fillColor('#1f2937')
             .font('Helvetica-Bold')
             .text(graficoConfig.titulo, 65, yGrafico + 15)
             .moveDown(0.8);

          // Convertir base64 a buffer
          const imageBuffer = Buffer.from(graficos[graficoConfig.key], 'base64');
          
          // Insertar imagen centrada
          doc.image(imageBuffer, {
            fit: [450, 170],
            align: 'center',
            valign: 'center'
          });

          doc.y = yGrafico + 230;
        } catch (error) {
          console.error(`Error al insertar gráfico ${graficoConfig.key}:`, error);
          doc.fontSize(10)
             .fillColor('#dc2626')
             .text(`[Error al cargar gráfico: ${graficoConfig.titulo}]`)
             .moveDown(1);
        }
      }
    }

    // ========================================
    // TABLA DE RESERVAS CON DISEÑO PROFESIONAL
    // ========================================
    
    doc.addPage();

    doc.fontSize(14)
       .fillColor('#9333ea')
       .font('Helvetica-Bold')
       .text('DETALLE DE RESERVAS', { underline: false })
       .moveDown(1.2);

    if (!reservas || reservas.length === 0) {
      doc.fontSize(10)
         .fillColor('#6b7280')
         .text('Sin reservas para los filtros seleccionados', { align: 'center', italics: true })
         .moveDown(2);
    } else {
      // Encabezados de tabla
      doc.fontSize(8)
         .fillColor('#ffffff');

      const tableTop = doc.y;
      const colWidths = [70, 70, 130, 100, 80, 80];
      const headers = ['Ingreso', 'Egreso', 'Cliente', 'Habitación', 'Estado', 'Total'];
      
      let xPos = 50;
      
      // Dibujar fondo de encabezado
      doc.rect(50, tableTop, 495, 20)
         .fillColor('#9333ea')
         .fill();

      // Dibujar encabezados
      headers.forEach((header, i) => {
        doc.fillColor('#ffffff')
           .text(header, xPos + 5, tableTop + 6, { width: colWidths[i] - 10, align: 'left' });
        xPos += colWidths[i];
      });

      let yPos = tableTop + 25;

      // Dibujar filas
      reservas.forEach((reserva, index) => {
        // Verificar si necesitamos nueva página
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
          
          // Re-dibujar encabezados
          doc.rect(50, yPos, 495, 20)
             .fillColor('#9333ea')
             .fill();

          xPos = 50;
          headers.forEach((header, i) => {
            doc.fillColor('#ffffff')
               .text(header, xPos + 5, yPos + 6, { width: colWidths[i] - 10, align: 'left' });
            xPos += colWidths[i];
          });
          
          yPos += 25;
        }

        // Fondo alternado
        if (index % 2 === 0) {
          doc.rect(50, yPos - 2, 495, 22)
             .fillColor('#f9fafb')
             .fill();
        }

        xPos = 50;
        doc.fillColor('#374151')
           .fontSize(7);

        // Fecha ingreso
        doc.text(new Date(reserva.fechaIngreso).toLocaleDateString('es-AR'), xPos + 5, yPos, { 
          width: colWidths[0] - 10, 
          align: 'left' 
        });
        xPos += colWidths[0];

        // Fecha egreso
        doc.text(new Date(reserva.fechaEgreso).toLocaleDateString('es-AR'), xPos + 5, yPos, { 
          width: colWidths[1] - 10, 
          align: 'left' 
        });
        xPos += colWidths[1];

        // Cliente
        const clienteNombre = reserva.cliente.nombreCompleto || `${reserva.cliente.nombre || ''} ${reserva.cliente.apellido || ''}`.trim();
        doc.text(clienteNombre, xPos + 5, yPos, { 
          width: colWidths[2] - 10, 
          align: 'left',
          ellipsis: true
        });
        xPos += colWidths[2];

        // Tipo de habitación
        const tiposHab = Array.isArray(reserva.tipoHabitaciones) 
          ? reserva.tipoHabitaciones.map(th => th.nombre || th).join(', ')
          : (reserva.tipoHabitaciones?.nombre || reserva.tipoHabitaciones || 'N/A');
        doc.text(tiposHab, xPos + 5, yPos, { 
          width: colWidths[3] - 10, 
          align: 'left',
          ellipsis: true
        });
        xPos += colWidths[3];

        // Estado
        doc.text(reserva.estado, xPos + 5, yPos, { 
          width: colWidths[4] - 10, 
          align: 'left' 
        });
        xPos += colWidths[4];

        // Total
        doc.text(`$${Number(reserva.totalFinal).toLocaleString('es-AR')}`, xPos + 5, yPos, { 
          width: colWidths[5] - 10, 
          align: 'right' 
        });

        yPos += 22;
      });

      // Total general - Fondo gris para destacar
      yPos += 10;
      
      // Fondo para el total
      doc.rect(50, yPos - 5, 495, 25)
         .fillAndStroke('#f3f4f6', '#e5e7eb');
      
      doc.fontSize(10)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text(`Total de reservas: ${reservas.length}`, 60, yPos + 5, { 
           width: 240,
           align: 'left' 
         });

      const totalIngresos = reservas.reduce((sum, r) => sum + Number(r.totalFinal), 0);
      doc.fillColor('#059669')
         .text(`Ingresos totales: $${totalIngresos.toLocaleString('es-AR')}`, 300, yPos + 5, { 
           width: 235,
           align: 'right' 
         });
    }

    // ========================================
    // PIE DE PÁGINA
    // ========================================
    
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      // Número de página
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text(
           `Página ${i + 1} de ${pages.count}`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
    }

    // Finalizar documento
    console.log('✅ PDF generado exitosamente');
    doc.end();

  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    console.error('Stack:', error.stack);
    
    // Si ya se enviaron headers, no podemos enviar JSON
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Error al generar el PDF',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
};

module.exports = {
  generarPDFReservas,
};
