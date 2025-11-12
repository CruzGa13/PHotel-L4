const { supabasePublic } = require('../lib/supabase');
const { prisma } = require('../lib/prisma');

// Valida token de Supabase y trae el rol desde tu BD
async function verifyAuth(req, res, next) {
  try {
    console.log(`[verifyAuth] 🔐 Verificando autenticación...`);
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    
    if (!token) {
      console.log(`[verifyAuth] ❌ Token faltante`);
      return res.status(401).json({ error: 'Falta token' });
    }
    console.log(`[verifyAuth] ✅ Token presente, verificando con Supabase...`);

    const { data, error } = await supabasePublic.auth.getUser(token);
    
    if (error) {
      console.log(`[verifyAuth] ❌ Error de Supabase:`, error.message);
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    if (!data?.user) {
      console.log(`[verifyAuth] ❌ No hay usuario en respuesta de Supabase`);
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    console.log(`[verifyAuth] ✅ Usuario en Supabase: ${data.user.email} (${data.user.id})`);
    console.log(`[verifyAuth] 🔍 Buscando perfil en BD...`);

    const perfil = await prisma.usuario.findUnique({
      where: { id: data.user.id },
      include: { rol: true },
    });
    
    if (!perfil) {
      console.log(`[verifyAuth] ❌ Perfil no encontrado en BD para usuario ${data.user.id}`);
      return res.status(403).json({ error: 'Perfil no encontrado' });
    }
    
    console.log(`[verifyAuth] ✅ Perfil encontrado: ${perfil.nombre} ${perfil.apellido}, rol: ${perfil.rol?.nombre}`);

    req.user = { id: perfil.id, email: data.user.email, rol: perfil.rol?.nombre };
    console.log(`[verifyAuth] ✅ Autenticación exitosa, continuando...`);
    next();
  } catch (e) {
    console.error(`[verifyAuth] ❌ Error de excepción:`, e.message);
    console.error(`[verifyAuth] ❌ Stack:`, e.stack);
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
