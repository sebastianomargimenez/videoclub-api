const express = require('express');
const authRoutes = require('./auth.routes');
const moviesRoutes = require('./movies.routes');
const rentalsRoutes = require('./rentals.routes');

const router = express.Router();

/**
 * Agregador de todas las rutas de la API
 * Base: /api/v1
 */

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de películas
router.use('/movies', moviesRoutes);

// Rutas de alquileres
router.use('/rentals', rentalsRoutes);

module.exports = router;
