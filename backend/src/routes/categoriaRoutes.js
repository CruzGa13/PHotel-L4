const { Router } = require('express');
const { getAllCategorias } = require('../controllers/categoriaController');

const router = Router();

/**
 * GET / - Obtener todas las categorías (solo nombres)
 * 
 * Endpoint: /api/categorias
 * 
 * Retorna:
 * - Array simple de strings con nombres de categorías
 * - Ejemplo: ['Estándar', 'Deluxe', 'Ejecutiva', 'Suite']
 */
router.get('/', getAllCategorias);

module.exports = router;
