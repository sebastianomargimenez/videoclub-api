const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../config/constants');

/**
 * Middleware para verificar que el usuario tiene uno de los roles permitidos
 * Debe usarse DESPUÉS del middleware authenticate
 * @param {...string} allowedRoles - Roles permitidos (ej: 'admin', 'user')
 * @returns {Function} Middleware de Express
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401));
    }

    // Verificar que el usuario tenga uno de los roles permitidos
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, 403));
    }

    next();
  };
};

module.exports = { requireRole };
