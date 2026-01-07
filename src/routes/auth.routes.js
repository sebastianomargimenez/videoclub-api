const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../utils/validators');

const router = express.Router();

/**
 * Rutas de autenticación
 * Base: /api/v1/auth
 */

// Registro de usuario - Público
router.post(
  '/register',
  validate(registerSchema),
  authController.register
);

// Login - Público
router.post(
  '/login',
  validate(loginSchema),
  authController.login
);

// Logout - Requiere autenticación
router.post(
  '/logout',
  authenticate,
  authController.logout
);

// Obtener usuario actual - Requiere autenticación
router.get(
  '/me',
  authenticate,
  authController.getMe
);

module.exports = router;
