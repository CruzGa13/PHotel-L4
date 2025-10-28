const { prisma } = require('../lib/prisma');

/**
 * Sincronizar usuario de Supabase Auth con la base de datos de Neon
 * 
 * @route POST /api/users/sincronizar
 * @access Private (requiere middleware de autenticación)
 * 
 * @description
 * Esta función verifica si el usuario autenticado de Supabase ya existe en la BD de Neon.
 * Si existe, devuelve el perfil existente.
 * Si no existe, crea un nuevo registro con rolId=1 (Cliente).
 * 
 * @param {Object} req.user - Usuario de Supabase (adjuntado por middleware de auth)
 * @param {string} req.user.id - UUID del usuario de Supabase
 * @param {Object} req.body - Datos del perfil
 * @param {string} req.body.nombre - Nombre del usuario (requerido)
 * @param {string} [req.body.apellido] - Apellido del usuario
 * @param {string} [req.body.fechaNacimiento] - Fecha de nacimiento (ISO 8601)
 * @param {string} [req.body.genero] - Género (Masculino|Femenino|Otro|PrefieroNoDecir)
 * @param {string} [req.body.telefono] - Teléfono
 * @param {string} [req.body.direccion] - Dirección
 * @param {string} [req.body.provincia] - Provincia
 * 
 * @returns {Object} 200/201 - { usuario: Object, isNew: boolean }
 * @returns {Object} 400 - { error: string }
 * @returns {Object} 500 - { error: string }
 */
const sincronizarUsuario = async (req, res) => {
  try {
    // 1. Extraer ID de Supabase (ya verificado por middleware)
    const supabaseUserId = req.user.id;

    // 2. Extraer datos del perfil desde el body
    const {
      nombre,
      apellido,
      fechaNacimiento,
      genero,
      telefono,
      direccion,
      provincia,
    } = req.body;

    // 3. Validar campos requeridos
    if (!nombre) {
      return res.status(400).json({ 
        error: 'El campo "nombre" es requerido' 
      });
    }

    // 4. Verificar si el usuario ya existe en la BD de Neon
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: supabaseUserId },
      include: {
        rol: true, // Incluir información del rol
      },
    });

    // 5. Si el usuario YA existe, devolver perfil con isNew: false
    if (usuarioExistente) {
      return res.status(200).json({
        usuario: usuarioExistente,
        isNew: false,
      });
    }

    // 6. Si el usuario NO existe, crear nuevo registro
    // Preparar datos para la creación
    const datosUsuario = {
      id: supabaseUserId, // Usar el UUID de Supabase como PK
      nombre,
      apellido: apellido || null,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      genero: genero || null, // Debe ser uno de los valores del enum Genero
      telefono: telefono || null,
      direccion: direccion || null,
      provincia: provincia || null,
      rolId: 1, // Asignar rol de Cliente por defecto
      estado: true, // Usuario activo por defecto
    };

    // Crear usuario en la BD de Neon
    const nuevoUsuario = await prisma.usuario.create({
      data: datosUsuario,
      include: {
        rol: true, // Incluir información del rol
      },
    });

    // 7. Devolver nuevo perfil con isNew: true
    return res.status(201).json({
      usuario: nuevoUsuario,
      isNew: true,
    });

  } catch (error) {
    // 8. Manejo de errores
    console.error('Error en sincronizarUsuario:', error);

    // Errores específicos de Prisma
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Ya existe un usuario con ese identificador' 
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'El rol especificado no existe. Verifica que rolId=1 exista en la tabla roles' 
      });
    }

    // Error genérico
    return res.status(500).json({ 
      error: 'Error al sincronizar el usuario',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  sincronizarUsuario,
};
