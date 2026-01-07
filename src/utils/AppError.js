/**
 * Clase custom para errores operacionales de la aplicación
 * Permite distinguir entre errores esperados (operacionales) y errores de programación
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Marca que es un error esperado, no un bug

    // Captura el stack trace para debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
