const express = require('express');
const router = express.Router();
const { verifyAuth, checkRole } = require('../middlewares/auth');

router.get('/publica', (_req, res) => {
  res.json({ page: 'publica', mensaje: 'Hola, esta página es pública 👋' });
});

router.get('/cliente', verifyAuth, checkRole(['usuario','operador']), (req, res) => {
  res.json({ page: 'cliente', mensaje: `Hola ${req.user.email}, zona de cliente` });
});

router.get('/operador', verifyAuth, checkRole(['operador']), (req, res) => {
  res.json({ page: 'operador', mensaje: `Hola ${req.user.email}, zona de operador` });
});

module.exports = router;
