const express = require('express');
const rentalsController = require('../controllers/rentals.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { rentalSchema } = require('../utils/validators');
const { ROLES } = require('../config/constants');

const router = express.Router();

/**
 * Rutas de alquileres
 * Base: /api/v1/rentals
 * Todas las rutas requieren autenticación
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

// Crear nuevo alquiler
router.post(
  '/',
  validate(rentalSchema),
  rentalsController.createRental
);

// Obtener alquileres activos del usuario
router.get(
  '/active',
  rentalsController.getActiveRentals
);

// Obtener historial de alquileres del usuario
router.get(
  '/history',
  rentalsController.getRentalHistory
);

// Devolver película alquilada
router.post(
  '/:id/return',
  rentalsController.returnRental
);

// Obtener todos los alquileres (solo admin)
router.get(
  '/',
  requireRole(ROLES.ADMIN),
  rentalsController.getAllRentals
);

module.exports = router;
