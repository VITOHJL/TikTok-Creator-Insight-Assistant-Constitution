import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Don't expose internal error details in production
  // Also sanitize error messages to avoid exposing technical details
  let message: string;
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = '服务器内部错误，请稍后重试';
  } else {
    // In development, show error but sanitize technical details
    message = err.message;
    
    // Remove potential sensitive information
    // Don't expose stack traces, file paths, or internal implementation details
    if (message.includes('ENOENT') || message.includes('EACCES') || message.includes('ECONNREFUSED')) {
      message = '服务暂时不可用，请稍后重试';
    } else if (message.includes('Cannot read property') || message.includes('undefined')) {
      message = '数据处理错误，请重试';
    } else if (message.includes('JSON') && message.includes('parse')) {
      message = '数据格式错误，请重试';
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
    },
  });
}

