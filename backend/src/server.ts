import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/error-handler.js';
import { logger } from './utils/logger.js';
import { initializeDatabase, isDatabaseEnabled } from './utils/dev-db.js';
import { apiLogger } from './middleware/api-logger.js';

// Load environment variables
// When running npm run dev from backend/, process.cwd() is backend/
// So .env file should be in current directory
dotenv.config();

// Also try loading from backend/.env if running from project root
if (!process.env.BAILIAN_API_KEY) {
  const backendEnvPath = join(process.cwd(), 'backend', '.env');
  if (existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
  }
}

// Log environment loading status
if (process.env.BAILIAN_API_KEY) {
  logger.info('Environment variables loaded successfully');
} else {
  logger.warn('BAILIAN_API_KEY not found. Please check backend/.env file');
  logger.warn(`Current working directory: ${process.cwd()}`);
  logger.warn(`Looking for .env in: ${join(process.cwd(), '.env')}`);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Optional database logging middleware (only if enabled)
if (isDatabaseEnabled()) {
  app.use(apiLogger);
  logger.info('API logging middleware enabled');
}

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: process.env.ENABLE_DATABASE === 'true' ? 'enabled' : 'disabled'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  // Check database availability
  if (isDatabaseEnabled()) {
    const dbAvailable = await initializeDatabase();
    if (!dbAvailable) {
      logger.warn('Database initialization failed, continuing without database');
    }
  }

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Database: ${isDatabaseEnabled() ? 'enabled' : 'disabled'}`);
    logger.info(`API Key configured: ${process.env.BAILIAN_API_KEY ? 'Yes' : 'No'}`);
  });
}

startServer();

export default app;

