// pdf.js - Helper para generar PDFs de facturas
const PDFDocument = require('pdfkit');

// Paleta de colores del proyecto
const COLORS = {
  primary: '#059669',      // Verde esmeralda (emerald-600)
  primaryDark: '#047857',  // Verde oscuro (emerald-700)
  accent: '#10b981',       // Verde claro (emerald-500)
  text: '#111827',         // Gris oscuro (gray-900)
  textLight: '#6B7280',    // Gris medio (gray-500)
  border: '#D1D5DB',       // Gris claro (gray-300)
  background: '#F3F4F6',   // Gris muy claro (gray-100)
  white: '#FFFFFF',
};

/**
 * Formatea un número como moneda ARS
 * @param {number} amount - Monto a formatear
 * @returns {string} - Monto formateado (ej: "$ 300.000,00")
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea una fecha en formato es-AR
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada (ej: "02/11/2025")
 */
function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Calcula el número de noches entre dos fechas
 * @param {Date|string} start - Fecha de inicio
 * @param {Date|string} end - Fecha de fin
 * @returns {number} - Número de noches
 */
function calculateNights(start, end) {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  const diff = endDate - startDate;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Dibuja una línea horizontal
 * @param {PDFDocument} doc - Documento PDF
 * @param {number} y - Posición Y
 */
function drawHorizontalLine(doc, y) {
  doc
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(48, y)
    .lineTo(doc.page.width - 48, y)
    .stroke();
}

/**
 * Genera un PDF de factura como stream
 * @param {Object} params - Parámetros
 * @param {Object} params.factura - Datos de la factura
 * @param {Object} params.reserva - Datos de la reserva
 * @param {Object} params.cliente - Datos del cliente
 * @param {Object} params.tipoHabitacion - Datos del tipo de habitación
 * @returns {PDFDocument} - Instancia de PDFDocument para pipear
 */
function buildInvoicePdfStream({ factura, reserva, cliente, tipoHabitacion }) {
  console.log('[PDF] Generando factura:', factura.numeroFactura);

  // Crear documento PDF
  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    info: {
      Title: `Factura ${factura.numeroFactura}`,
      Author: 'Hotel Rios Agua Viva',
      Subject: `Factura de Reserva #${reserva.id}`,
      Keywords: 'factura, hotel, reserva',
    },
  });

  let yPosition = 40;

  // ========================================
  // ENCABEZADO CON FONDO DE COLOR
  // ========================================
  const headerHeight = 80;
  doc
    .rect(0, 0, doc.page.width, headerHeight)
    .fill(COLORS.primary);

  // Logo/Nombre del Hotel
  doc
    .fontSize(24)
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .text('HOTEL RIOS AGUA VIVA', 48, 25, { align: 'left' });

  doc
    .fontSize(10)
    .fillColor(COLORS.white)
    .font('Helvetica')
    .text('Confort y Elegancia', 48, 52, { align: 'left' });

  yPosition = headerHeight + 25;

  // ========================================
  // INFORMACIÓN DE FACTURA (2 COLUMNAS)
  // ========================================
  // Columna izquierda: Título
  doc
    .fontSize(18)
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .text('FACTURA', 48, yPosition);

  // Columna derecha: Número y fecha (formato vertical para números largos)
  const rightColumnX = doc.page.width - 220;
  
  doc
    .fontSize(10)
    .fillColor(COLORS.textLight)
    .font('Helvetica')
    .text('Nº Factura:', rightColumnX, yPosition);
  
  doc
    .fontSize(10)
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .text(factura.numeroFactura, rightColumnX + 65, yPosition, { width: 130, align: 'left' });

  doc
    .fontSize(10)
    .fillColor(COLORS.textLight)
    .font('Helvetica')
    .text('Fecha:', rightColumnX, yPosition + 20);
  
  doc
    .fontSize(10)
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .text(formatDate(factura.fechaEmision), rightColumnX + 65, yPosition + 20);

  yPosition += 40;

  // Línea separadora
  drawHorizontalLine(doc, yPosition);
  yPosition += 20;

  // ========================================
  // SECCIÓN DE INFORMACIÓN (2 COLUMNAS)
  // ========================================
  // Caja con borde para datos del cliente
  const boxHeight = 50;
  doc
    .roundedRect(48, yPosition, 230, boxHeight, 5)
    .fillAndStroke(COLORS.background, COLORS.border);

  const clienteNombre = cliente
    ? `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || 'Invitado'
    : 'Invitado';

  doc
    .fontSize(11)
    .fillColor(COLORS.primary)
    .font('Helvetica-Bold')
    .text('FACTURADO A', 58, yPosition + 10);

  doc
    .fontSize(10)
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .text(clienteNombre, 58, yPosition + 25);

  if (cliente?.email) {
    doc
      .fontSize(9)
      .fillColor(COLORS.textLight)
      .font('Helvetica')
      .text(cliente.email, 58, yPosition + 38);
  }

  yPosition += boxHeight + 15;

  // Línea separadora
  drawHorizontalLine(doc, yPosition);
  yPosition += 15;

  // ========================================
  // DETALLES DE LA RESERVA (TABLA)
  // ========================================
  doc
    .fontSize(12)
    .fillColor(COLORS.primary)
    .font('Helvetica-Bold')
    .text('DETALLES DE LA RESERVA', 48, yPosition);

  yPosition += 18;

  // Tabla de detalles
  const tableTop = yPosition;
  const col1 = 48;
  const col2 = 180;
  const col3 = 320;
  const col4 = 450;
  const rowHeight = 20;

  // Header de tabla
  doc
    .rect(col1, tableTop, doc.page.width - 96, 25)
    .fill(COLORS.background);

  doc
    .fontSize(9)
    .fillColor(COLORS.textLight)
    .font('Helvetica-Bold')
    .text('DESCRIPCIÓN', col1 + 5, tableTop + 8)
    .text('CHECK-IN', col2 + 5, tableTop + 8)
    .text('CHECK-OUT', col3 + 5, tableTop + 8)
    .text('HUÉSPEDES', col4 + 5, tableTop + 8);

  yPosition += 30;

  // Datos de la reserva
  const nombreHabitacion = tipoHabitacion?.nombre || 'Habitación estándar';
  const noches = calculateNights(reserva.fechaIngreso, reserva.fechaEgreso);
  const huespedes = `${reserva.adultos} adulto(s)${reserva.ninios > 0 ? `, ${reserva.ninios} niño(s)` : ''}`;

  doc
    .fontSize(10)
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .text(nombreHabitacion, col1 + 5, yPosition);

  doc
    .fontSize(9)
    .fillColor(COLORS.textLight)
    .font('Helvetica')
    .text(`Reserva #${reserva.id}`, col1 + 5, yPosition + 12)
    .text(`${noches} noche(s)`, col1 + 5, yPosition + 24);

  doc
    .fontSize(9)
    .fillColor(COLORS.text)
    .font('Helvetica')
    .text(formatDate(reserva.fechaIngreso), col2 + 5, yPosition + 5);

  doc
    .fontSize(9)
    .fillColor(COLORS.text)
    .font('Helvetica')
    .text(formatDate(reserva.fechaEgreso), col3 + 5, yPosition + 5);

  doc
    .fontSize(9)
    .fillColor(COLORS.text)
    .font('Helvetica')
    .text(huespedes, col4 + 5, yPosition + 5, { width: 90 });

  yPosition += 45;

  // Línea separadora
  drawHorizontalLine(doc, yPosition);
  yPosition += 15;

  // ========================================
  // RESUMEN FINANCIERO
  // ========================================
  drawHorizontalLine(doc, yPosition);
  yPosition += 18;

  // Subtotal (sin impuestos)
  const financialX = doc.page.width - 250;
  
  doc
    .fontSize(10)
    .fillColor(COLORS.textLight)
    .font('Helvetica')
    .text('Subtotal:', financialX, yPosition)
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .text(formatCurrency(Number(factura.subtotal)), 0, yPosition, {
      width: doc.page.width - 58,
      align: 'right',
    });

  yPosition += 22;

  // Caja destacada para el total
  const totalBoxHeight = 35;
  doc
    .roundedRect(doc.page.width - 250, yPosition - 5, 200, totalBoxHeight, 5)
    .fillAndStroke(COLORS.primary, COLORS.primaryDark);

  doc
    .fontSize(12)
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .text('TOTAL A PAGAR', doc.page.width - 245, yPosition + 5)
    .fontSize(16)
    .text(formatCurrency(Number(factura.total)), 0, yPosition + 5, {
      width: doc.page.width - 58,
      align: 'right',
    });

  yPosition += totalBoxHeight + 15;

  // Línea separadora
  drawHorizontalLine(doc, yPosition);
  yPosition += 12;

  // ========================================
  // POLÍTICAS DEL HOTEL (FORMATO SIMPLE)
  // ========================================

  doc
    .fontSize(10)
    .fillColor(COLORS.primary)
    .font('Helvetica-Bold')
    .text('POLÍTICAS DEL HOTEL', 48, yPosition);

  yPosition += 12;

  doc
    .fontSize(8)
    .fillColor(COLORS.textLight)
    .font('Helvetica')
    .text('• Check-in: 15:00 hrs | Check-out: 11:00 hrs', 48, yPosition)
    .text('• Cancelación gratuita hasta 48 horas antes', 48, yPosition + 10)
    .text('• Se requiere documento de identidad al momento del check-in', 48, yPosition + 20);

  yPosition += 35;

  // ========================================
  // PIE DE PÁGINA MEJORADO
  // ========================================
  // Calcular footerY dinámicamente basado en yPosition
  const footerY = Math.max(yPosition, doc.page.height - 110);

  // Barra de color en el footer
  doc
    .rect(0, footerY - 5, doc.page.width, 3)
    .fill(COLORS.primary);

  doc
    .fontSize(11)
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .text('¡Gracias por elegirnos!', 0, footerY + 10, { 
      width: doc.page.width, 
      align: 'center' 
    });

  doc
    .fontSize(10)
    .fillColor(COLORS.primary)
    .font('Helvetica-Bold')
    .text('HOTEL RIOS AGUA VIVA', 0, footerY + 28, {
      width: doc.page.width,
      align: 'center',
    });

  doc
    .fontSize(8)
    .fillColor(COLORS.textLight)
    .font('Helvetica')
    .text('Confort • Elegancia • Hospitalidad', 0, footerY + 43, {
      width: doc.page.width,
      align: 'center',
    });

  console.log('[PDF] ✓ Factura generada exitosamente');

  // NO llamar doc.end() aquí, eso lo hace el caller
  return doc;
}

module.exports = { buildInvoicePdfStream };
