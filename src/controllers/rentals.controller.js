const rentalsService = require('../services/rentals.service');

/**
 * Controladores de alquileres
 * Manejan las requests HTTP y delegan la lógica al servicio
 */

/**
 * Crear un nuevo alquiler
 * POST /api/v1/rentals
 * Body: { pelicula_id: uuid }
 * Requiere autenticación
 */
const createRental = async (req, res, next) => {
  try {
    const { pelicula_id } = req.body;
    const userId = req.user.id; // Del middleware authenticate

    const result = await rentalsService.createRental(userId, pelicula_id);

    res.status(201).json({
      success: true,
      message: 'Película alquilada exitosamente',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Devolver una película alquilada
 * POST /api/v1/rentals/:id/return
 * Requiere autenticación
 */
const returnRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await rentalsService.returnRental(id, userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener alquileres activos del usuario actual
 * GET /api/v1/rentals/active
 * Requiere autenticación
 */
const getActiveRentals = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const rentals = await rentalsService.getUserActiveRentals(userId);

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial de alquileres del usuario actual
 * GET /api/v1/rentals/history
 * Requiere autenticación
 */
const getRentalHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const history = await rentalsService.getUserRentalHistory(userId);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los alquileres (solo admin)
 * GET /api/v1/rentals
 * Requiere autenticación y rol admin
 */
const getAllRentals = async (req, res, next) => {
  try {
    const rentals = await rentalsService.getAllRentals();

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRental,
  returnRental,
  getActiveRentals,
  getRentalHistory,
  getAllRentals
};
