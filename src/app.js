const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler.middleware');
const AppError = require('./utils/AppError');
const routes = require('./routes');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'Videoclub API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// Rutas de la API
app.use('/api/v1', routes);

// 404 handler - Debe ir después de todas las rutas
app.use((req, res, next) => {
  next(new AppError(`Ruta ${req.originalUrl} no encontrada`, 404));
});

// Error handler global - Debe ir al final de todos los middlewares
app.use(errorHandler);

module.exports = app;
