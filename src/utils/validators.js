const Joi = require('joi');

// Schema para películas
const movieSchema = Joi.object({
  titulo: Joi.string().min(1).max(200).required()
    .messages({
      'string.empty': 'El título es requerido',
      'string.max': 'El título no puede exceder 200 caracteres'
    }),
  genero: Joi.string().min(1).max(50).required()
    .messages({
      'string.empty': 'El género es requerido'
    }),
  stock_total: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'El stock total debe ser un número',
      'number.min': 'El stock total no puede ser negativo'
    }),
  stock_disponible: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'El stock disponible debe ser un número',
      'number.min': 'El stock disponible no puede ser negativo'
    }),
  precio_alquiler: Joi.number().positive().required()
    .messages({
      'number.base': 'El precio debe ser un número',
      'number.positive': 'El precio debe ser mayor a 0'
    }),
  // Campos opcionales nuevos
  poster_url: Joi.string().uri().allow(null, '')
    .messages({
      'string.uri': 'La URL del poster debe ser válida'
    }),
  director: Joi.string().max(100).allow(null, '')
    .messages({
      'string.max': 'El nombre del director no puede exceder 100 caracteres'
    }),
  anio: Joi.number().integer().min(1888).max(new Date().getFullYear() + 5).allow(null)
    .messages({
      'number.min': 'El año debe ser 1888 o posterior',
      'number.max': 'El año no puede ser mayor al actual + 5'
    }),
  duracion: Joi.number().integer().min(1).allow(null)
    .messages({
      'number.min': 'La duración debe ser al menos 1 minuto'
    }),
  descripcion: Joi.string().max(1000).allow(null, '')
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    })
});

// Schema para alquileres
const rentalSchema = Joi.object({
  pelicula_id: Joi.string().uuid().required()
    .messages({
      'string.empty': 'El ID de la película es requerido',
      'string.guid': 'El ID de la película debe ser un UUID válido'
    })
});

// Schema para login
const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.empty': 'El email es requerido',
      'string.email': 'El email debe ser válido'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.empty': 'La contraseña es requerida',
      'string.min': 'La contraseña debe tener al menos 6 caracteres'
    })
});

// Schema para registro
const registerSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.empty': 'El email es requerido',
      'string.email': 'El email debe ser válido'
    }),
  password: Joi.string().min(8).required()
    .messages({
      'string.empty': 'La contraseña es requerida',
      'string.min': 'La contraseña debe tener al menos 8 caracteres'
    }),
  nombre: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres'
    })
});

module.exports = {
  movieSchema,
  rentalSchema,
  loginSchema,
  registerSchema
};
