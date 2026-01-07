const AppError = require('../utils/AppError');

/**
 * Middleware global para manejo de errores
 * Captura todos los errores de la aplicación y responde apropiadamente
 */
const errorHandler = (err, req, res, next) => {
  // Asignar valores por defecto si no están presentes
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // En desarrollo, mostrar detalles completos del error
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // En producción, solo mostrar errores operacionales
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Error de programación: no exponer detalles al cliente
      console.error('❌ ERROR:', err);
      res.status(500).json({
        status: 'error',
        message: 'Algo salió mal en el servidor'
      });
    }
  }
};

module.exports = errorHandler;
