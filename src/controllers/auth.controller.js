const authService = require('../services/auth.service');

/**
 * Controladores de autenticación
 * Manejan las requests HTTP y delegan la lógica al servicio
 */

/**
 * Registrar nuevo usuario
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, nombre } = req.body;

    const result = await authService.register(email, password, nombre);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Iniciar sesión
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cerrar sesión
 * POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    const result = await authService.logout(token);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener usuario actual (requiere autenticación)
 * GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    // El usuario ya está en req.user gracias al middleware authenticate
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
