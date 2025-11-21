const express = require('express');
const router = express.Router();
const operadoresController = require('../controllers/operadoresController');

// Rutas de operadores
router.get('/', operadoresController.getOperadores);
router.get('/stats', operadoresController.getEstadisticas);
router.get('/:id', operadoresController.getOperadorById);

module.exports = router;
