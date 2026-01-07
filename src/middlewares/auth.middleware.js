const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../config/constants');

/**
 * Middleware para verificar autenticación JWT
 * Extrae el token del header Authorization y verifica con Supabase
 * Adjunta el usuario a req.user para uso en controllers
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extraer token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token no proporcionado. Usa: Authorization: Bearer <token>', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Token mal formado', 401);
    }

    // 2. Verificar token con Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Token inválido o expirado', 401);
    }

    // 3. Adjuntar usuario a req para usar en controllers
    // Por defecto todos los usuarios son 'user', el admin se debe configurar manualmente en Supabase
    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user' // El rol viene del metadata del usuario
    };

    next();
  } catch (error) {
    // Si es un AppError, lo pasamos tal cual
    if (error instanceof AppError) {
      return next(error);
    }
    // Si es otro error, lo convertimos en AppError
    next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401));
  }
};

module.exports = { authenticate };
