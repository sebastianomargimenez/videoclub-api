const moviesService = require('../services/movies.service');

/**
 * Controladores de películas
 * Manejan las requests HTTP y delegan la lógica al servicio
 */

/**
 * Obtener todas las películas
 * GET /api/v1/movies
 * Query params: page, limit, genero
 * Público (no requiere autenticación)
 */
const getAllMovies = async (req, res, next) => {
  try {
    const { page, limit, genero } = req.query;

    const result = await moviesService.getAllMovies({ page, limit, genero });

    res.status(200).json({
      success: true,
      data: result.movies,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener una película por ID
 * GET /api/v1/movies/:id
 * Público (no requiere autenticación)
 */
const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = await moviesService.getMovieById(id);

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear una nueva película
 * POST /api/v1/movies
 * Requiere autenticación y rol admin
 */
const createMovie = async (req, res, next) => {
  try {
    const movieData = req.body;

    const movie = await moviesService.createMovie(movieData);

    res.status(201).json({
      success: true,
      message: 'Película creada exitosamente',
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar una película
 * PUT /api/v1/movies/:id
 * Requiere autenticación y rol admin
 */
const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movieData = req.body;

    const movie = await moviesService.updateMovie(id, movieData);

    res.status(200).json({
      success: true,
      message: 'Película actualizada exitosamente',
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar una película
 * DELETE /api/v1/movies/:id
 * Requiere autenticación y rol admin
 */
const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await moviesService.deleteMovie(id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};
