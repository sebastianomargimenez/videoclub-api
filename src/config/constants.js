// Roles de usuario
const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Límites de negocio
const MAX_ACTIVE_RENTALS = 3;

// Estados de alquiler
const RENTAL_STATUS = {
  ACTIVE: 'activo',
  RETURNED: 'devuelto',
  OVERDUE: 'vencido'
};

// Reglas de negocio
const RENTAL_PERIOD_DAYS = 7; // Días de alquiler por defecto

// Mensajes de error comunes
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'No tienes permisos para esta acción',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Error de validación',
  SERVER_ERROR: 'Error interno del servidor',
  MAX_RENTALS_REACHED: `Has alcanzado el límite de ${MAX_ACTIVE_RENTALS} películas activas`,
  NO_STOCK_AVAILABLE: 'No hay copias disponibles',
  ALREADY_RENTED: 'Ya tienes esta película alquilada',
  RENTAL_NOT_FOUND: 'Alquiler no encontrado o ya devuelto'
};

module.exports = {
  ROLES,
  MAX_ACTIVE_RENTALS,
  RENTAL_STATUS,
  RENTAL_PERIOD_DAYS,
  ERROR_MESSAGES
};
