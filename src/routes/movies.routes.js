const express = require('express');
const moviesController = require('../controllers/movies.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { movieSchema } = require('../utils/validators');
const { ROLES } = require('../config/constants');

const router = express.Router();

/**
 * Rutas de películas
 * Base: /api/v1/movies
 */

// Rutas públicas (no requieren autenticación)
router.get('/', moviesController.getAllMovies);
router.get('/:id', moviesController.getMovieById);

// Rutas protegidas (solo admin)
router.post(
  '/',
  authenticate,
  requireRole(ROLES.ADMIN),
  validate(movieSchema),
  moviesController.createMovie
);

router.put(
  '/:id',
  authenticate,
  requireRole(ROLES.ADMIN),
  validate(movieSchema),
  moviesController.updateMovie
);

router.delete(
  '/:id',
  authenticate,
  requireRole(ROLES.ADMIN),
  moviesController.deleteMovie
);

module.exports = router;
