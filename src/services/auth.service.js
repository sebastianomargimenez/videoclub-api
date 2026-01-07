const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

/**
 * Servicio de autenticación
 * Maneja la lógica de negocio para registro, login y gestión de sesiones
 */
class AuthService {
  /**
   * Registrar un nuevo usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @param {string} nombre - Nombre completo
   * @returns {Object} Datos del usuario y sesión
   */
  async register(email, password, nombre) {
    try {
      // Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            role: 'user' // Por defecto todos son 'user'
          }
        }
      });

      if (error) {
        throw new AppError(error.message, 400);
      }

      if (!data.user) {
        throw new AppError('Error al crear usuario', 500);
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.user_metadata.nombre,
          role: data.user.user_metadata.role
        },
        session: data.session
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error al registrar usuario', 500);
    }
  }

  /**
   * Iniciar sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Object} Datos del usuario y token de sesión
   */
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new AppError('Credenciales inválidas', 401);
      }

      if (!data.user || !data.session) {
        throw new AppError('Error al iniciar sesión', 500);
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.user_metadata?.nombre,
          role: data.user.user_metadata?.role || 'user'
        },
        token: data.session.access_token,
        refreshToken: data.session.refresh_token
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error al iniciar sesión', 500);
    }
  }

  /**
   * Cerrar sesión
   * @param {string} token - Token JWT del usuario
   */
  async logout(token) {
    try {
      const { error } = await supabase.auth.signOut(token);

      if (error) {
        throw new AppError('Error al cerrar sesión', 500);
      }

      return { message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error al cerrar sesión', 500);
    }
  }
}

module.exports = new AuthService();
