const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./shared/utils/logger');
const { typeDefs } = require('./graphql/typeDefs');
const { resolvers } = require('./graphql/resolvers');
const { createContext } = require('./graphql/context');
const { errorHandler } = require('./shared/middleware/errorHandler');

async function startServer() {
  const app = express();
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));
  
  // CORS configuration
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
  
  // Compression middleware
  app.use(compression());
  
  // Request logging
  app.use(morgan(process.env.LOG_FORMAT || 'combined'));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/graphql', limiter);
  
  // JSON parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    try {
      const healthData = {
        status: 'healthy',
        service: 'continuo-api',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.2.5',
        environment: process.env.NODE_ENV || 'development',
        database: process.env.DATABASE_URL ? 'configured' : 'not configured',
        cors: process.env.CORS_ORIGIN || 'default',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        message: 'Continuo API is running successfully!'
      };
      
      logger.info('Health check requested:', healthData);
      res.status(200).json(healthData);
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(500).json({
        status: 'error',
        service: 'continuo-api',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Alternative health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'continuo-api',
      message: 'Continuo API is running successfully!',
      timestamp: new Date().toISOString(),
    });
  });

  // Simple test endpoint
  app.get('/test', (req, res) => {
    res.status(200).json({
      message: 'Continuo API is working!',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
    });
  });
  
  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    introspection: process.env.NODE_ENV !== 'production',
    playground: process.env.GRAPHQL_PLAYGROUND === 'true',
    persistedQueries: {
      cache: 'bounded',
    },
    formatError: (error) => {
      logger.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code,
        path: error.path,
      };
    },
  });
  
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  
  // Error handling middleware (must be last)
  app.use(errorHandler);
  
  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});