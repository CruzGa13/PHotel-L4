const { supabaseAdmin } = require('../lib/supabase');

const BUCKET_NAME = 'imagenes-habitaciones';

/**
 * Eliminar una imagen de Supabase Storage
 * 
 * @param {string} imageUrl - URL completa de la imagen
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
const deleteImage = async (imageUrl) => {
  console.log('🗑️ [ImageService] Iniciando eliminación de imagen:', imageUrl);

  try {
    // Extraer el path de la URL
    // URL formato: https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/imagen.jpg
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.indexOf(BUCKET_NAME);
    
    if (bucketIndex === -1) {
      console.error('❌ [ImageService] URL no válida, no contiene el bucket:', BUCKET_NAME);
      return false;
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    console.log('📁 [ImageService] Path extraído:', filePath);

    // Eliminar archivo de Supabase usando el cliente admin
    console.log('🗑️ [ImageService] Eliminando de Supabase Storage...');
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('❌ [ImageService] Error al eliminar imagen:', error);
      throw error;
    }

    console.log('✅ [ImageService] Imagen eliminada exitosamente:', data);
    return true;

  } catch (error) {
    console.error('❌ [ImageService] Error en deleteImage:', error);
    // No lanzar error, solo retornar false para no bloquear la operación
    return false;
  }
};

/**
 * Eliminar múltiples imágenes de Supabase Storage
 * 
 * @param {string[]} imageUrls - Array de URLs de imágenes
 * @returns {Promise<{success: number, failed: number}>} Resultado de la operación
 */
const deleteMultipleImages = async (imageUrls) => {
  console.log(`🗑️ [ImageService] Eliminando ${imageUrls.length} imágenes...`);
  
  let success = 0;
  let failed = 0;

  for (const url of imageUrls) {
    const result = await deleteImage(url);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log(`✅ [ImageService] Resultado: ${success} exitosas, ${failed} fallidas`);
  return { success, failed };
};

module.exports = {
  deleteImage,
  deleteMultipleImages
};
