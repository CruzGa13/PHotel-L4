/**
 * Extrae el cuerpo reciente de un email, removiendo citas y firmas
 * @param {Object} options - { html?: string, text?: string }
 * @returns {string} - Solo el mensaje nuevo del remitente
 */
export const extraerCuerpoReciente = ({ html, text }) => {
  let contenido = text || '';

  // Si viene HTML, convertir a texto plano básico
  if (html && !text) {
    contenido = htmlToText(html);
  }

  // 1. Remover firmas (líneas después de "--" en línea sola)
  contenido = removerFirmas(contenido);

  // 2. Remover encabezados de respuesta ("El ... escribió:", "On ... wrote:")
  contenido = removerEncabezadosRespuesta(contenido);

  // 3. Remover líneas citadas (que empiezan con >)
  contenido = removerLineasCitadas(contenido);

  // 4. Remover bloques de "Original Message"
  contenido = removerMensajesOriginales(contenido);

  // 5. Limpiar espacios extras y saltos de línea múltiples
  contenido = limpiarEspacios(contenido);

  return contenido.trim();
};

/**
 * Convierte HTML a texto plano básico
 */
const htmlToText = (html) => {
  // Reemplazar <br>, <p>, <div> por saltos de línea
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n');

  // Remover todos los tags HTML
  text = text.replace(/<[^>]*>/g, '');

  // Decodificar entidades HTML comunes
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return text;
};

/**
 * Remueve firmas después de "--" en línea sola
 */
const removerFirmas = (texto) => {
  const lineas = texto.split('\n');
  const resultado = [];

  for (const linea of lineas) {
    const lineaTrim = linea.trim();
    
    // Detectar separador de firma
    if (lineaTrim === '--' || lineaTrim === '---' || lineaTrim === '-- ') {
      break; // Todo después es firma
    }

    // Detectar firmas comunes
    if (
      lineaTrim.startsWith('Enviado desde') ||
      lineaTrim.startsWith('Sent from') ||
      lineaTrim.match(/^Best regards?$/i) ||
      lineaTrim.match(/^Saludos?$/i) ||
      lineaTrim.match(/^Cordialmente$/i) ||
      lineaTrim.match(/^Atentamente$/i)
    ) {
      break;
    }

    resultado.push(linea);
  }

  return resultado.join('\n');
};

/**
 * Remueve encabezados de respuesta típicos
 */
const removerEncabezadosRespuesta = (texto) => {
  const patronesEncabezado = [
    // Español
    /El .+? escribió:/gi,
    /En .+? escribió:/gi,
    /De: .+?\n/gi,
    
    // Inglés
    /On .+? wrote:/gi,
    /From: .+?\n/gi,
    /.+? <.+?@.+?>\s*escribió:/gi,
    /.+? <.+?@.+?>\s*wrote:/gi,
    
    // Gmail style
    /El .+?, .+? <.+?@.+?>\s*escribió:/gi,
    /On .+?, .+? <.+?@.+?>\s*wrote:/gi,
    
    // Outlook
    /-----Original Message-----/gi,
    /________________________________/g,
    /From: .+?Sent: .+?To: .+?Subject:/gis,
  ];

  let resultado = texto;

  for (const patron of patronesEncabezado) {
    resultado = resultado.replace(patron, '');
  }

  return resultado;
};

/**
 * Remueve líneas citadas (que empiezan con >)
 */
const removerLineasCitadas = (texto) => {
  const lineas = texto.split('\n');
  const resultado = [];
  let dentroDeBloqueCitado = false;

  for (const linea of lineas) {
    const lineaTrim = linea.trim();

    // Detectar inicio de bloque citado
    if (lineaTrim.startsWith('>')) {
      dentroDeBloqueCitado = true;
      continue; // Saltar esta línea
    }

    // Si la línea está vacía, podría ser fin de bloque citado
    if (lineaTrim === '' && dentroDeBloqueCitado) {
      dentroDeBloqueCitado = false;
      continue;
    }

    // Si no estamos en bloque citado, agregar línea
    if (!dentroDeBloqueCitado) {
      resultado.push(linea);
    }
  }

  return resultado.join('\n');
};

/**
 * Remueve bloques de "Original Message"
 */
const removerMensajesOriginales = (texto) => {
  // Buscar y cortar desde patrones comunes
  const patronesCorte = [
    /-----Original Message-----/i,
    /________________________________/,
    /^From: .+?$/m,
    /^De: .+?$/m,
  ];

  let posicionCorte = -1;

  for (const patron of patronesCorte) {
    const match = texto.match(patron);
    if (match && match.index !== undefined) {
      if (posicionCorte === -1 || match.index < posicionCorte) {
        posicionCorte = match.index;
      }
    }
  }

  if (posicionCorte > -1) {
    return texto.substring(0, posicionCorte);
  }

  return texto;
};

/**
 * Limpia espacios extras y saltos de línea múltiples
 */
const limpiarEspacios = (texto) => {
  return texto
    // Remover espacios al inicio y fin de cada línea
    .split('\n')
    .map(linea => linea.trimEnd())
    .join('\n')
    // Reemplazar múltiples saltos de línea por máximo 2
    .replace(/\n{3,}/g, '\n\n')
    // Remover espacios múltiples
    .replace(/ {2,}/g, ' ');
};
