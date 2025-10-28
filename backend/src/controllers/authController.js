const { prisma } = require('../lib/prisma');
const { supabaseAdmin } = require('../lib/supabase');

/**
 * Registro atómico de usuario
 * 
 * @route POST /api/auth/register
 * @access Public
 * 
 * @description
 * Esta función implementa un registro "atómico" donde:
 * 1. Primero valida que los datos del perfil sean correctos
 * 2. Luego crea el usuario en Supabase Auth
 * 3. Finalmente crea el perfil en la BD de Neon
 * 
 * Si algún paso falla, se hace rollback completo.
 * 
 * @param {Object} req.body - Datos de registro
 * @param {string} req.body.email - Email del usuario (requerido)
 * @param {string} req.body.password - Contraseña (requerido)
 * @param {string} req.body.nombre - Nombre del usuario (requerido)
 * @param {string} [req.body.apellido] - Apellido del usuario
 * @param {string} [req.body.fechaNacimiento] - Fecha de nacimiento (ISO 8601)
 * @param {string} [req.body.genero] - Género (Femenino|Masculino|NoBinario|PrefieroNoDecir|Otro)
 * 
 * @returns {Object} 201 - { usuario: Object, session: Object }
 * @returns {Object} 400 - { error: string }
 * @returns {Object} 500 - { error: string }
 */
const registroAtomico = async (req, res) => {
  let supabaseUserId = null;

  try {
    // ========================================
    // 1. VALIDAR DATOS DEL PERFIL
    // ========================================
    const {
      email,
      password,
      nombre,
      apellido,
      fechaNacimiento,
      genero,
    } = req.body;

    // Validar campos requeridos
    if (!email || !password || !nombre) {
      return res.status(400).json({ 
        error: 'Los campos email, password y nombre son requeridos' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'El formato del email no es válido' 
      });
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }

    // Validar género (si se proporciona)
    const generosValidos = ['Femenino', 'Masculino', 'NoBinario', 'PrefieroNoDecir', 'Otro'];
    if (genero && !generosValidos.includes(genero)) {
      return res.status(400).json({ 
        error: `El género debe ser uno de: ${generosValidos.join(', ')}` 
      });
    }

    // Validar fecha de nacimiento (si se proporciona)
    if (fechaNacimiento) {
      const fecha = new Date(fechaNacimiento);
      if (isNaN(fecha.getTime())) {
        return res.status(400).json({ 
          error: 'La fecha de nacimiento no es válida' 
        });
      }

      // Validar que el usuario tenga al menos 16 años
      const hoy = new Date();
      const edad = hoy.getFullYear() - fecha.getFullYear();
      const mesActual = hoy.getMonth();
      const mesNacimiento = fecha.getMonth();
      const diaActual = hoy.getDate();
      const diaNacimiento = fecha.getDate();

      let edadReal = edad;
      if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
        edadReal--;
      }

      if (edadReal < 16) {
        return res.status(400).json({ 
          error: 'Debes tener al menos 16 años para registrarte' 
        });
      }
    }

    // ========================================
    // 2. CREAR USUARIO EN SUPABASE AUTH
    // ========================================
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email (desarrollo)
      user_metadata: {
        nombre,
        apellido: apellido || null,
      },
    });

    if (authError) {
      // Errores comunes de Supabase
      if (authError.message.includes('already registered')) {
        return res.status(409).json({ 
          error: 'Este email ya está registrado' 
        });
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario en Supabase');
    }

    supabaseUserId = authData.user.id;

    // ========================================
    // 3. CREAR PERFIL EN LA BD DE NEON
    // ========================================
    const datosUsuario = {
      id: supabaseUserId,
      nombre,
      apellido: apellido || null,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      genero: genero || null,
      rolId: 1, // Cliente por defecto
      estado: true,
    };

    const nuevoUsuario = await prisma.usuario.create({
      data: datosUsuario,
      include: {
        rol: true,
      },
    });

    // ========================================
    // 4. CREAR SESIÓN Y DEVOLVER RESPUESTA
    // ========================================
    // Crear sesión para el usuario recién registrado
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    // Devolver usuario y tokens de sesión
    return res.status(201).json({
      usuario: nuevoUsuario,
      message: 'Usuario registrado exitosamente',
      // Nota: El frontend debe hacer signInWithPassword para obtener la sesión
      requiresSignIn: true,
    });

  } catch (error) {
    console.error('Error en registroAtomico:', error);

    // ========================================
    // ROLLBACK: Si falló la creación del perfil, eliminar de Supabase
    // ========================================
    if (supabaseUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);
        console.log(`Rollback: Usuario ${supabaseUserId} eliminado de Supabase`);
      } catch (rollbackError) {
        console.error('Error en rollback:', rollbackError);
        // Log crítico: el usuario quedó huérfano en Supabase
        console.error(`⚠️ CRÍTICO: Usuario ${supabaseUserId} quedó en Supabase sin perfil en BD`);
      }
    }

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
      error: 'Error al registrar el usuario',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registroAtomico,
};
