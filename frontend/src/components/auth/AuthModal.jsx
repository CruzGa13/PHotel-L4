import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import "./AuthModal.css";
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Schema de validación para Login
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Debe ser un correo electrónico válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

// Schema de validación para Registro
const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    apellido: z
      .string()
      .min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
    birthDate: z
      .string({ required_error: "Ingresá tu fecha de nacimiento" })
      .min(1, { message: "Ingresá tu fecha de nacimiento" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Ingresá una fecha válida"
      })
      .refine((val) => new Date(val) >= new Date("1900-01-01"), {
        message: "Fecha demasiado antigua"
      })
      .refine(
        (val) => new Date(val) <= new Date(new Date().setFullYear(new Date().getFullYear() - 16)),
        { message: "Debes ser mayor de 16 años" }
      ),
    genero: z
      .string()
      .optional()
      .refine((val) => !val || val === "" || ["Femenino", "Masculino", "Otro"].includes(val), {
        message: "Seleccioná una opción válida"
      }),
    email: z
      .string()
      .min(1, { message: "El correo electrónico es requerido" })
      .email({ message: "Debe ser un correo electrónico válido" }),
    password: z
      .string()
      .min(8, { message: "Mínimo 8 caracteres" })
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        { message: "Debe tener mayúscula, minúscula y dígito" }
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Función para calcular fuerza de contraseña
const getPasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return { level: 0, text: "Muy débil", width: "25%", color: "#ef4444" };
  }

  let types = 0;
  if (/[a-z]/.test(password)) types++;
  if (/[A-Z]/.test(password)) types++;
  if (/\d/.test(password)) types++;
  if (/[^a-zA-Z0-9]/.test(password)) types++;

  if (password.length >= 10 && types >= 3) {
    return { level: 3, text: "Fuerte", width: "100%", color: "#059669" }; // Verde esmeralda del proyecto
  }
  if (password.length >= 8 && types >= 2) {
    return { level: 2, text: "Media", width: "66%", color: "#eab308" };
  }
  return { level: 1, text: "Débil", width: "33%", color: "#f59e0b" };
};

const AuthModal = ({ open, onOpenChange }) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calcular fecha máxima (hoy - 16 años)
  const maxDate = useMemo(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 16);
    return today.toISOString().split("T")[0];
  }, []);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
  });

  const currentForm = mode === "login" ? loginForm : registerForm;
  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmitLogin = async (data) => {
    try {
      setLoading(true);
      setError("");

      // 1. Iniciar sesión con Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      // 2. Obtener perfil del backend
      const response = await fetch(`${API}/users/me`, {
        headers: {
          'Authorization': `Bearer ${authData.session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener perfil');
      }

      const profile = await response.json();

      // 3. Guardar en contexto y cerrar modal
      setUser(profile);
      onOpenChange(false);

      // 4. Redirigir según el rol del usuario
      const rolNombre = profile?.rol?.nombre?.toLowerCase();
      
      if (rolNombre === 'operador') {
        // Redirigir a gestión de habitaciones para operadores
        setTimeout(() => {
          navigate('/habitaciones-op');
        }, 500);
      } else if (rolNombre === 'administrador') {
        // Redirigir a consultas y gráficos para administradores
        setTimeout(() => {
          navigate('/admin/consultas-graficos');
        }, 500);
      }
      // Si es cliente, no redirigir (dejar en la página actual)
      
    } catch (err) {
      console.error('Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

const onSubmitRegister = async (data) => {
    try {
      setLoading(true);
      setError("");

      // Preparar datos para el registro atómico
      const registroData = {
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        apellido: data.apellido,
        fechaNacimiento: data.birthDate ? new Date(data.birthDate).toISOString() : null,
        genero: data.genero || null,
      };

      // Llamar a la nueva ruta de registro atómico del backend
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registroData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrarse');
      }

      const { usuario } = await response.json();

      // Ahora hacer login para obtener la sesión
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw new Error('Usuario creado pero error al iniciar sesión. Intenta hacer login.');
      }

      // Guardar usuario en contexto y cerrar modal
      setUser(usuario);
      onOpenChange(false);

      // Mostrar mensaje de bienvenida
      toast.success('¡Bienvenido al Hotel Ríos de Agua Viva! Tu cuenta ha sido creada.', {
        duration: 4000,
        position: 'top-center',
      });

      // Redirigir según el rol del usuario
      const rolNombre = usuario?.rol?.nombre?.toLowerCase();
      
      if (rolNombre === 'operador') {
        // Redirigir a gestión de habitaciones para operadores
        setTimeout(() => {
          navigate('/habitaciones-op');
        }, 500);
      } else if (rolNombre === 'administrador') {
        // Redirigir a consultas y gráficos para administradores
        setTimeout(() => {
          navigate('/admin/consultas-graficos');
        }, 500);
      }
      // Si es cliente, no redirigir (dejar en la página actual para continuar con la reserva)

    } catch (err) {
      console.error('Error en registro:', err);
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setPasswordValue("");
    setShowLoginPass(false);
    setShowPass(false);
    setShowConfirm(false);
    setError("");
    loginForm.reset();
    registerForm.reset();
  };

  const handleDialogChange = (isOpen) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      // Reset al cerrar
      setMode("login");
      setPasswordValue("");
      setShowLoginPass(false);
      setShowPass(false);
      setShowConfirm(false);
      setError("");
      loginForm.reset();
      registerForm.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className={`p-0 gap-0 ${mode === "register" ? "max-w-xl" : "max-w-md"}`}>
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === "login" ? "INICIAR SESION" : "CREAR CUENTA"}
          </DialogTitle>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </DialogHeader>

        {mode === "login" ? (
          // ===== LOGIN FORM =====
          <>
            <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="px-6 pb-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Correo electrónico</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    {...loginForm.register("email")}
                    className={`input-brand ${loginForm.formState.errors.email ? "border-red-500" : ""}`}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500" aria-live="polite">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <div className="password-input-wrapper">
                    <Input
                      id="login-password"
                      type={showLoginPass ? "text" : "password"}
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                      className={`input-brand pr-10 ${loginForm.formState.errors.password ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="eye-btn"
                      aria-label={showLoginPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showLoginPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500" aria-live="polite">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm underline link-brand"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <Button type="submit" className="w-full btn-brand" size="lg" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "INGRESAR"}
                </Button>
              </div>
            </form>

            <div className="auth-footer">
              <p className="auth-footer-text">
                ¿Aún no estás registrado?
              </p>
              <Button
                type="button"
                onClick={() => handleModeSwitch("register")}
                variant="outline"
                className="register-btn"
                size="lg"
              >
                REGÍSTRATE
              </Button>
            </div>
          </>
        ) : (
          // ===== REGISTER FORM =====
          <form onSubmit={registerForm.handleSubmit(onSubmitRegister)} className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Juan"
                  {...registerForm.register("nombre")}
                  className={`input-brand ${registerForm.formState.errors.nombre ? "border-red-500" : ""}`}
                />
                {registerForm.formState.errors.nombre && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {registerForm.formState.errors.nombre.message}
                  </p>
                )}
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  type="text"
                  placeholder="Pérez"
                  {...registerForm.register("apellido")}
                  className={`input-brand ${registerForm.formState.errors.apellido ? "border-red-500" : ""}`}
                />
                {registerForm.formState.errors.apellido && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {registerForm.formState.errors.apellido.message}
                  </p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de nacimiento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  min="1900-01-01"
                  max={maxDate}
                  {...registerForm.register("birthDate")}
                  className={`input-brand ${registerForm.formState.errors.birthDate ? "border-red-500" : ""}`}
                />
                {registerForm.formState.errors.birthDate && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {registerForm.formState.errors.birthDate.message}
                  </p>
                )}
              </div>

              {/* Género */}
              <div className="space-y-2">
                <Label htmlFor="genero">Género (opcional)</Label>
                <select
                  id="genero"
                  {...registerForm.register("genero")}
                  className={`input-brand flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background ${registerForm.formState.errors.genero ? "border-red-500" : ""}`}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
                {registerForm.formState.errors.genero && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {registerForm.formState.errors.genero.message}
                  </p>
                )}
              </div>

              {/* Email (col-span-2) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="register-email">Correo electrónico *</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...registerForm.register("email")}
                  className={`input-brand ${registerForm.formState.errors.email ? "border-red-500" : ""}`}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="register-password">Contraseña *</Label>
                <div className="password-input-wrapper">
                  <Input
                    id="register-password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerForm.register("password")}
                    onChange={(e) => {
                      registerForm.register("password").onChange(e);
                      setPasswordValue(e.target.value);
                    }}
                    className={`input-brand pr-10 ${registerForm.formState.errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="eye-btn"
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                <div className="password-input-wrapper">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerForm.register("confirmPassword")}
                    className={`input-brand pr-10 ${registerForm.formState.errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="eye-btn"
                    aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Indicador de Fuerza (col-span-2) */}
              {passwordValue && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Fuerza de la contraseña</Label>
                  <div className="password-strength-bar">
                    <div
                      className="password-strength-fill"
                      style={{
                        width: passwordStrength.width,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                  <p 
                    className={`password-strength-text ${
                      passwordStrength.level === 3 ? 'password-strength-strong' : 
                      passwordStrength.level === 2 ? 'password-strength-medium' : 
                      'password-strength-weak'
                    }`}
                  >
                    {passwordStrength.text}
                  </p>
                </div>
              )}

              {/* Botón CREAR CUENTA (col-span-2) */}
              <div className="md:col-span-2">
                <Button type="submit" className="w-full btn-brand" size="lg" disabled={loading}>
                  {loading ? "Creando cuenta..." : "CREAR CUENTA"}
                </Button>
              </div>

              {/* Link a Login (col-span-2) */}
              <div className="text-center md:col-span-2">
                <button
                  type="button"
                  onClick={() => handleModeSwitch("login")}
                  className="text-sm underline link-brand"
                >
                  ¿Ya tenés cuenta? Iniciar sesión
                </button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
