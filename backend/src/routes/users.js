const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const { verifyAuth } = require('../middlewares/auth');
const { supabasePublic } = require('../lib/supabase');
const { sincronizarUsuario } = require('../controllers/userController');

const router = Router();

/**
 * POST /api/users/upsert - Crear o actualizar perfil del usuario autenticado
 * Requiere: Authorization Bearer token de Supabase
 */
router.post('/upsert', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nombre,
      apellido,
      email,
      fechaNacimiento,
      genero,
      generoOtro,
      pronombres,
      telefono,
      direccion,
      provincia,
      dni,
      avatarUrl,
    } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: 'nombre y email son requeridos' });
    }

    // Preparar datos para upsert
    const data = {
      email,
      nombre,
      apellido: apellido || null,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      genero: genero || null,
      generoOtro: generoOtro || null,
      pronombres: pronombres || null,
      telefono: telefono || null,
      direccion: direccion || null,
      provincia: provincia || null,
      dni: dni || null,
      avatarUrl: avatarUrl || null,
    };

    // Upsert: actualiza si existe, crea si no
    const perfil = await prisma.usuario.upsert({
      where: { id: userId },
      update: data,
      create: {
        id: userId,
        ...data,
        rolId: 1, // Cliente por defecto
      },
      include: {
        rol: true,
      },
    });

    res.json(perfil);
  } catch (e) {
    console.error('Error en upsert:', e);
    res.status(500).json({ error: 'Error al guardar perfil' });
  }
});

/**
 * GET /api/users/me - Obtener perfil del usuario autenticado
 * Requiere: Authorization Bearer token de Supabase
 */
router.get('/me', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const perfil = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        rol: true,
      },
    });

    if (!perfil) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    res.json(perfil);
  } catch (e) {
    console.error('Error en /me:', e);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

/**
 * POST /api/users/sincronizar - Sincronizar usuario de Supabase con BD de Neon
 * Requiere: Authorization Bearer token de Supabase
 * 
 * Esta ruta verifica si el usuario existe en la BD local.
 * Si existe: retorna el perfil con isNew: false
 * Si no existe: crea el perfil con rolId=1 y retorna isNew: true
 */
router.post('/sincronizar', verifyAuth, sincronizarUsuario);

// TODO: Rutas administrativas (crear usuarios con otros roles)
// router.post('/admin/create', verifyAuth, checkRole(['administrador', 'operador']), async (req, res) => {
//   // Crear usuarios con roles específicos usando SERVICE_ROLE_KEY
// });

module.exports = router;
