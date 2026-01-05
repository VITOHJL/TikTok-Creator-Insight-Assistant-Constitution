import { Router, Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { generateContent } from '../services/generator.js';
import { getRecentLogs, getLogsByVersion, getPromptVersion, isDatabaseEnabled } from '../utils/dev-db.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Input validation middleware
function validateInput(req: Request, res: Response, next: NextFunction) {
  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: '输入不能为空',
        code: 'EMPTY_INPUT',
      },
    });
  }
  
  const trimmed = prompt.trim();
  
  if (trimmed.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: '输入不能为空',
        code: 'EMPTY_INPUT',
      },
    });
  }
  
  if (trimmed.length > 500) {
    return res.status(400).json({
      success: false,
      error: {
        message: '输入过长，请控制在500字符以内',
        code: 'INPUT_TOO_LONG',
      },
    });
  }
  
  // Add validated prompt to request
  req.body.prompt = trimmed;
  next();
}

// Generate endpoint
router.post('/generate', validateInput, async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { prompt, model } = req.body;
    const selectedModel = model || 'deepseek-v3';
    
    logger.info('Generate request received', { 
      prompt: prompt.substring(0, 50) + '...',
      model: selectedModel,
    });
    
    // Generate content
    const result = await generateContent(prompt, selectedModel);
    const responseTime = Date.now() - startTime;
    
    logger.info('Generation successful', {
      scriptsCount: result.scripts.length,
      hashtagsCount: result.hashtags.length,
      responseTime,
    });
    
    res.json({
      success: true,
      data: result,
      responseTime,
    });
  } catch (error: any) {
    logger.error('Generation failed', { error: error.message });
    
    // Handle specific error types
    if (error.message.includes('超时')) {
      return res.status(504).json({
        success: false,
        error: {
          message: error.message,
          code: 'TIMEOUT',
        },
      });
    }
    
    if (error.message.includes('API密钥')) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message,
          code: 'API_KEY_ERROR',
        },
      });
    }
    
    next(error);
  }
});

// Development endpoint: Get API logs (only in development)
router.get('/dev/logs', async (req, res) => {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEV_LOGS !== 'true') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'This endpoint is only available in development mode',
        code: 'DEV_ONLY',
      },
    });
  }

  if (!isDatabaseEnabled()) {
    return res.json({
      success: true,
      data: {
        enabled: false,
        message: 'Database logging is disabled',
        logs: [],
      },
    });
  }

  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const version = req.query.version as string;

    let logs;
    if (version) {
      logs = await getLogsByVersion(version, limit);
    } else {
      logs = await getRecentLogs(limit);
    }

    res.json({
      success: true,
      data: {
        enabled: true,
        promptVersion: getPromptVersion(),
        count: logs.length,
        logs: logs.map((log: any) => ({
          id: log.id,
          timestamp: log.timestamp,
          prompt: log.prompt,
          model: log.model,
          promptVersion: log.prompt_version,
          responseTime: log.response_time,
          status: log.status,
          errorMessage: log.error_message,
          // Parse JSON fields
          scriptsCount: JSON.parse(log.scripts || '[]').length,
          hashtagsCount: JSON.parse(log.hashtags || '[]').length,
        })),
      },
    });
  } catch (error: any) {
    logger.error('Failed to fetch logs', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch logs',
        code: 'LOG_FETCH_ERROR',
      },
    });
  }
});

export default router;
