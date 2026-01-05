import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../utils/dev-db.js';
import { GenerationResult } from '../types/index.js';

/**
 * Middleware to log API requests/responses to database (optional, dev only)
 * This middleware does NOT block the request/response flow
 */
export function apiLogger(req: Request, res: Response, next: NextFunction) {
  // Only log POST /api/generate requests
  if (req.method !== 'POST' || req.path !== '/api/generate') {
    return next();
  }

  const startTime = Date.now();
  const originalSend = res.send.bind(res);

  // Override res.send to capture response
  res.send = function (body: any) {
    const responseTime = Date.now() - startTime;

    // Try to parse response body
    let result: GenerationResult | null = null;
    let status: 'success' | 'failed' = 'failed';
    let errorMessage: string | undefined;

    try {
      const parsed = typeof body === 'string' ? JSON.parse(body) : body;
      if (parsed.success && parsed.data) {
        result = parsed.data;
        status = 'success';
      } else if (parsed.error) {
        errorMessage = parsed.error.message || 'Unknown error';
      }
    } catch (e) {
      // Response might not be JSON, ignore
    }

    // Log asynchronously (don't block response)
    const prompt = req.body?.prompt || '';
    const model = req.body?.model || 'deepseek-v3';

    logRequest(prompt, model, result, responseTime, status, errorMessage).catch(() => {
      // Silently fail - don't affect main flow
    });

    // Call original send
    return originalSend(body);
  };

  next();
}

