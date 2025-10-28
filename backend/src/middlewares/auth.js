const { supabasePublic } = require('../lib/supabase');
const { prisma } = require('../lib/prisma');

// Valida token de Supabase y trae el rol desde tu BD
async function verifyAuth(req, res, next) {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Falta token' });

    const { data, error } = await supabasePublic.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Token inválido' });

    const perfil = await prisma.usuario.findUnique({
      where: { id: data.user.id },
      include: { rol: true },
    });
    if (!perfil) return res.status(403).json({ error: 'Perfil no encontrado' });

    req.user = { id: perfil.id, email: data.user.email, rol: perfil.rol?.nombre };
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error autenticando' });
  }
}

function checkRole(roles = []) {
  return (req, res, next) => {
    if (!req.user?.rol || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

module.exports = { verifyAuth, checkRole };
