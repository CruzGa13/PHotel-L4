const { prisma } = require('../lib/prisma');
const { supabaseAdmin } = require('../lib/supabase');

/**
 * Crear un nuevo operador
 * 
 * @route POST /api/operadores
 * @access Private (solo administradores)
 * 
 * @description
 * Crea un nuevo usuario con rol de operador (rolId: 2) o administrador (rolId: 3)
 * 1. Valida los datos del perfil
 * 2. Crea el usuario en Supabase Auth
 * 3. Crea el perfil en la BD de Neon
 * 
 * @param {Object} req.body - Datos del operador
 * @param {string} req.body.email - Email del operador (requerido)
 * @param {string} req.body.password - Contraseña (requerido)
 * @param {string} req.body.nombre - Nombre (requerido)
 * @param {string} req.body.apellido - Apellido (requerido)
 * @param {string} [req.body.telefono] - Teléfono
 * @param {string} [req.body.rol] - Rol: "Operador" o "Administrador" (default: "Operador")
 * @param {boolean} [req.body.estado] - Estado activo/inactivo (default: true)
 * @param {string} [req.body.genero] - Género
 * @param {string} [req.body.fechaNacimiento] - Fecha de nacimiento (ISO 8601)
 * @param {string} [req.body.direccion] - Dirección
 * @param {string} [req.body.provincia] - Provincia
 * 
 * @returns {Object} 201 - { operador: Object }
 * @returns {Object} 400 - { error: string }
 * @returns {Object} 500 - { error: string }
 */
const crearOperador = async (req, res) => {
  let supabaseUserId = null;

  try {
    // ========================================
    // 1. VALIDAR DATOS
    // ========================================
    const {
      email,
      password,
      nombre,
      apellido,
      telefono,
      rol,
      estado,
      genero,
      fechaNacimiento,
      direccion,
      provincia,
    } = req.body;

    // Validar campos requeridos
    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({ 
        error: 'Los campos email, password, nombre y apellido son requeridos' 
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

    // Validar complejidad de contraseña
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ 
        error: 'La contraseña debe contener al menos una mayúscula, una minúscula y un dígito' 
      });
    }

    // Determinar rolId basado en el rol especificado
    let rolId = 2; // Operador por defecto
    if (rol === 'Administrador' || rol === 'administrador') {
      rolId = 3;
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
    }

    // ========================================
    // 2. CREAR USUARIO EN SUPABASE AUTH
    // ========================================
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        nombre,
        apellido,
        rol: rolId === 2 ? 'operador' : 'administrador',
      },
    });

    if (authError) {
      // Errores comunes de Supabase
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
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
    const datosOperador = {
      id: supabaseUserId,
      nombre,
      apellido,
      telefono: telefono || null,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      genero: genero || null,
      direccion: direccion || null,
      provincia: provincia || null,
      rolId,
      estado: estado !== undefined ? estado : true,
    };

    const nuevoOperador = await prisma.usuario.create({
      data: datosOperador,
      include: {
        rol: true,
      },
    });

    // ========================================
    // 4. DEVOLVER RESPUESTA
    // ========================================
    return res.status(201).json({
      operador: nuevoOperador,
      message: `${rolId === 2 ? 'Operador' : 'Administrador'} creado exitosamente`,
    });

  } catch (error) {
    console.error('Error en crearOperador:', error);

    // ========================================
    // ROLLBACK: Si falló la creación del perfil, eliminar de Supabase
    // ========================================
    if (supabaseUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);
        console.log(`Rollback: Usuario ${supabaseUserId} eliminado de Supabase`);
      } catch (rollbackError) {
        console.error('Error en rollback:', rollbackError);
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
        error: 'El rol especificado no existe en la base de datos' 
      });
    }

    // Error genérico
    return res.status(500).json({ 
      error: 'Error al crear el operador',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener todos los operadores
 * 
 * @route GET /api/operadores
 * @access Private (solo administradores)
 * 
 * @returns {Object} 200 - { operadores: Array }
 */
const obtenerOperadores = async (req, res) => {
  try {
    const operadores = await prisma.usuario.findMany({
      where: {
        rolId: 2, // Solo Operadores
      },
      include: {
        rol: true,
      },
      orderBy: {
        fechaAlta: 'desc',
      },
    });

    // Obtener emails de Supabase para cada operador
    const operadoresConEmail = await Promise.all(
      operadores.map(async (operador) => {
        try {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(operador.id);
          return {
            ...operador,
            email: userData?.user?.email || 'Sin email',
          };
        } catch (error) {
          console.error(`Error al obtener email para usuario ${operador.id}:`, error);
          return {
            ...operador,
            email: 'Sin email',
          };
        }
      })
    );

    res.json({ operadores: operadoresConEmail });
  } catch (error) {
    console.error('Error en obtenerOperadores:', error);
    res.status(500).json({ 
      error: 'Error al obtener operadores',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener un operador por ID
 * 
 * @route GET /api/operadores/:id
 * @access Private (solo administradores)
 * 
 * @returns {Object} 200 - { operador: Object }
 * @returns {Object} 404 - { error: string }
 */
const obtenerOperadorPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const operador = await prisma.usuario.findUnique({
      where: { id },
      include: {
        rol: true,
      },
    });

    if (!operador) {
      return res.status(404).json({ error: 'Operador no encontrado' });
    }

    // Verificar que sea operador o administrador
    if (operador.rolId !== 2 && operador.rolId !== 3) {
      return res.status(404).json({ error: 'Usuario no es operador ni administrador' });
    }

    res.json({ operador });
  } catch (error) {
    console.error('Error en obtenerOperadorPorId:', error);
    res.status(500).json({ 
      error: 'Error al obtener operador',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar un operador
 * 
 * @route PUT /api/operadores/:id
 * @access Private (solo administradores)
 * 
 * @returns {Object} 200 - { operador: Object }
 * @returns {Object} 404 - { error: string }
 */
const actualizarOperador = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      telefono,
      rol,
      estado,
      genero,
      fechaNacimiento,
      direccion,
      provincia,
    } = req.body;

    // Verificar que el operador existe
    const operadorExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!operadorExistente) {
      return res.status(404).json({ error: 'Operador no encontrado' });
    }

    // Verificar que sea operador o administrador
    if (operadorExistente.rolId !== 2 && operadorExistente.rolId !== 3) {
      return res.status(400).json({ error: 'Usuario no es operador ni administrador' });
    }

    // Determinar rolId si se cambió el rol
    let rolId = operadorExistente.rolId;
    if (rol) {
      if (rol === 'Administrador' || rol === 'administrador') {
        rolId = 3;
      } else if (rol === 'Operador' || rol === 'operador') {
        rolId = 2;
      }
    }

    // Preparar datos para actualizar
    const datosActualizacion = {
      nombre: nombre || operadorExistente.nombre,
      apellido: apellido || operadorExistente.apellido,
      telefono: telefono !== undefined ? telefono : operadorExistente.telefono,
      genero: genero !== undefined ? genero : operadorExistente.genero,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : operadorExistente.fechaNacimiento,
      direccion: direccion !== undefined ? direccion : operadorExistente.direccion,
      provincia: provincia !== undefined ? provincia : operadorExistente.provincia,
      rolId,
      estado: estado !== undefined ? estado : operadorExistente.estado,
    };

    const operadorActualizado = await prisma.usuario.update({
      where: { id },
      data: datosActualizacion,
      include: {
        rol: true,
      },
    });

    res.json({ 
      operador: operadorActualizado,
      message: 'Operador actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error en actualizarOperador:', error);
    res.status(500).json({ 
      error: 'Error al actualizar operador',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Eliminar un operador (hard delete)
 * 
 * @route DELETE /api/operadores/:id
 * @access Private (solo administradores)
 * 
 * @returns {Object} 200 - { message: string }
 * @returns {Object} 404 - { error: string }
 */
const eliminarOperador = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el operador existe
    const operador = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!operador) {
      return res.status(404).json({ error: 'Operador no encontrado' });
    }

    // Verificar que sea operador (no administrador)
    if (operador.rolId !== 2) {
      return res.status(400).json({ error: 'Solo se pueden eliminar operadores' });
    }

    // Primero eliminar el usuario de Supabase Auth
    try {
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch (supabaseError) {
      console.error('Error al eliminar usuario en Supabase:', supabaseError);
      // Si falla en Supabase, no continuar
      return res.status(500).json({ 
        error: 'Error al eliminar usuario de autenticación',
        details: process.env.NODE_ENV === 'development' ? supabaseError.message : undefined
      });
    }

    // Luego eliminar el registro de la base de datos (hard delete)
    await prisma.usuario.delete({
      where: { id },
    });

    res.json({ message: 'Operador eliminado exitosamente' });
  } catch (error) {
    console.error('Error en eliminarOperador:', error);
    res.status(500).json({ 
      error: 'Error al eliminar operador',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cambiar estado de un operador (activar/desactivar)
 * 
 * @route PATCH /api/operadores/:id/estado
 * @access Private (solo administradores)
 * 
 * @returns {Object} 200 - { operador: Object }
 * @returns {Object} 404 - { error: string }
 */
const cambiarEstadoOperador = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (estado === undefined) {
      return res.status(400).json({ error: 'El campo estado es requerido' });
    }

    // Verificar que el operador existe
    const operador = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!operador) {
      return res.status(404).json({ error: 'Operador no encontrado' });
    }

    // Verificar que sea operador o administrador
    if (operador.rolId !== 2 && operador.rolId !== 3) {
      return res.status(400).json({ error: 'Usuario no es operador ni administrador' });
    }

    // Actualizar estado
    const operadorActualizado = await prisma.usuario.update({
      where: { id },
      data: { estado },
      include: {
        rol: true,
      },
    });

    res.json({ 
      operador: operadorActualizado,
      message: `Operador ${estado ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    console.error('Error en cambiarEstadoOperador:', error);
    res.status(500).json({ 
      error: 'Error al cambiar estado del operador',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  crearOperador,
  obtenerOperadores,
  obtenerOperadorPorId,
  actualizarOperador,
  eliminarOperador,
  cambiarEstadoOperador,
};
