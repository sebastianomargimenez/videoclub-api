const AppError = require('../utils/AppError');

/**
 * Middleware para validar el body de las requests usando schemas de Joi
 * @param {Object} schema - Schema de Joi para validar
 * @returns {Function} Middleware de Express
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Muestra todos los errores, no solo el primero
      stripUnknown: true // Remueve campos no definidos en el schema (seguridad)
    });

    if (error) {
      // Formatear mensajes de error para que sean más legibles
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      return next(new AppError(errorMessage, 400));
    }

    // Reemplazar req.body con el valor validado y sanitizado
    req.body = value;
    next();
  };
};

module.exports = { validate };
