import { supabase } from '../lib/supabase';

/**
 * Servicio para manejar la subida y eliminación de imágenes en Supabase Storage
 */

const BUCKET_NAME = 'imagenes-habitaciones';

/**
 * Mapeo de categorías a carpetas en Supabase
 */
const CATEGORIA_FOLDERS = {
  1: 'estandar',      // Estándar
  2: 'ejecutivo',     // Ejecutivo
  3: 'deluxe',        // Deluxe
  4: 'suite'          // Suite
};

/**
 * Obtener el nombre de la carpeta según la categoría
 */
const getFolderByCategoria = (categoriaId) => {
  return CATEGORIA_FOLDERS[categoriaId] || 'estandar';
};

/**
 * Generar nombre único para la imagen
 */
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
};

/**
 * Subir una imagen a Supabase Storage
 * 
 * @param {File} file - Archivo de imagen
 * @param {number} categoriaId - ID de la categoría del tipo de habitación
 * @returns {Promise<{url: string, path: string}>} URL pública y path de la imagen
 */
export const uploadImage = async (file, categoriaId) => {
  console.log('📤 Iniciando subida de imagen:', {
    nombre: file.name,
    tamaño: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    tipo: file.type,
    categoriaId
  });

  try {
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error(`Tipo de archivo no válido: ${file.type}`);
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`Archivo muy grande: ${(file.size / 1024 / 1024).toFixed(2)} MB (máximo 5MB)`);
    }

    // Obtener carpeta según categoría
    const folder = getFolderByCategoria(categoriaId);
    const fileName = generateUniqueFileName(file.name);
    const filePath = `${folder}/${fileName}`;

    console.log('📁 Carpeta destino:', folder);
    console.log('📝 Nombre del archivo:', fileName);
    console.log('🔗 Path completo:', filePath);

    // Subir archivo a Supabase
    console.log('⬆️ Subiendo a Supabase Storage...');
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Error al subir imagen:', error);
      throw error;
    }

    console.log('✅ Imagen subida exitosamente:', data);

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;
    console.log('🔗 URL pública generada:', publicUrl);

    return {
      url: publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('❌ Error en uploadImage:', error);
    throw error;
  }
};

/**
 * Eliminar una imagen de Supabase Storage
 * 
 * @param {string} imageUrl - URL completa de la imagen
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export const deleteImage = async (imageUrl) => {
  console.log('🗑️ Iniciando eliminación de imagen:', imageUrl);

  try {
    // Extraer el path de la URL
    // URL formato: https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/imagen.jpg
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.indexOf(BUCKET_NAME);
    
    if (bucketIndex === -1) {
      console.error('❌ URL no válida, no contiene el bucket:', BUCKET_NAME);
      return false;
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    console.log('📁 Path extraído:', filePath);

    // Eliminar archivo de Supabase
    console.log('🗑️ Eliminando de Supabase Storage...');
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('❌ Error al eliminar imagen:', error);
      throw error;
    }

    console.log('✅ Imagen eliminada exitosamente:', data);
    return true;

  } catch (error) {
    console.error('❌ Error en deleteImage:', error);
    // No lanzar error, solo retornar false para no bloquear el guardado
    return false;
  }
};

/**
 * Subir múltiples imágenes
 * 
 * @param {File[]} files - Array de archivos
 * @param {number} categoriaId - ID de la categoría
 * @returns {Promise<Array<{url: string, path: string}>>} Array de URLs y paths
 */
export const uploadMultipleImages = async (files, categoriaId) => {
  console.log(`📤 Subiendo ${files.length} imágenes...`);
  
  const uploadPromises = files.map(file => uploadImage(file, categoriaId));
  const results = await Promise.all(uploadPromises);
  
  console.log(`✅ ${results.length} imágenes subidas exitosamente`);
  return results;
};
