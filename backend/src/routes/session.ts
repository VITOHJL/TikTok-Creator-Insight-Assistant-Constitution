import { Router } from 'express';
import { createSession, getSession, updateSession } from '../models/session.js';
import { generateHooks, refineHook } from '../services/stage1-hooks.js';
import { generateContent, optimizeContent, expandPoint } from '../services/stage2-content.js';
import { generateScripts, refineScript, generateHashtags, generateMusicStyle } from '../services/stage3-scripts.js';
import { logger } from '../utils/logger.js';
import { randomUUID } from 'crypto';
import { sanitizeUserInput } from '../utils/text-sanitizer.js';

const router = Router();

// Create a new session
router.post('/create', async (req, res) => {
  try {
    const { userInput, model } = req.body;

    // Validate input
    if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'userInput is required and must be a non-empty string',
          code: 'INVALID_INPUT'
        }
      });
    }

    if (userInput.length > 500) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'userInput must be 500 characters or less',
          code: 'INPUT_TOO_LONG'
        }
      });
    }

    // Sanitize user input before processing (security)
    const sanitizedInput = sanitizeUserInput(userInput.trim());
    
    if (sanitizedInput.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'userInput is required and must be a non-empty string',
          code: 'INVALID_INPUT'
        }
      });
    }

    const session = await createSession(sanitizedInput);

    logger.info('Session created', { sessionId: session.id, userInput: session.userInput });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        userInput: session.userInput,
        currentStage: session.currentStage,
        createdAt: session.createdAt
      }
    });
  } catch (error: any) {
    logger.error('Failed to create session', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create session',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Get session by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    const session = await getSession(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error: any) {
    logger.error('Failed to get session', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get session',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Go back to previous stage
router.post('/:id/go-back', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    const session = await getSession(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    // Calculate previous stage
    const previousStage = session.currentStage > 1 ? (session.currentStage - 1) as 1 | 2 | 3 : 1;

    const updatedSession = await updateSession(id, {
      currentStage: previousStage
    });

    logger.info('Session stage rolled back', { sessionId: id, from: session.currentStage, to: previousStage });

    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error: any) {
    logger.error('Failed to go back stage', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to go back stage',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// ==================== Stage 1: Hook Selection ====================

// Generate hooks
router.post('/:id/stage1/generate-hooks', async (req, res) => {
  try {
    const { id } = req.params;
    const { model } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    const hooks = await generateHooks(id, model || 'deepseek-v3');

    // Save hooks to session for recovery
    await updateSession(id, {
      hooks
    });

    res.json({
      success: true,
      data: {
        hooks,
        sessionId: id,
        currentStage: 1
      }
    });
  } catch (error: any) {
    logger.error('Failed to generate hooks', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to generate hooks',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Replace hooks (same as generate, but semantically different)
router.post('/:id/stage1/replace-hooks', async (req, res) => {
  try {
    const { id } = req.params;
    const { model } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    const hooks = await generateHooks(id, model || 'deepseek-v3');

    // Save hooks to session for recovery
    await updateSession(id, {
      hooks
    });

    res.json({
      success: true,
      data: {
        hooks,
        sessionId: id,
        currentStage: 1
      }
    });
  } catch (error: any) {
    logger.error('Failed to replace hooks', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to replace hooks',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Refine hook
router.post('/:id/stage1/refine-hook', async (req, res) => {
  try {
    const { id } = req.params;
    const { hookId, userEdit, model } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    if (!userEdit || typeof userEdit !== 'string' || userEdit.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'userEdit is required and must be a non-empty string',
          code: 'INVALID_INPUT'
        }
      });
    }

    // Sanitize user input before processing (security)
    const sanitizedUserEdit = sanitizeUserInput(userEdit.trim());
    
    if (sanitizedUserEdit.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'userEdit is required and must be a non-empty string',
          code: 'INVALID_INPUT'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    // Find the original hook to preserve its ID
    const originalHook = session.hooks?.find(h => h.id === hookId);
    const refinedHook = await refineHook(id, sanitizedUserEdit, model || 'deepseek-v3');

    // Preserve original hook ID
    const refinedHookWithId = {
      ...refinedHook,
      id: originalHook?.id || hookId, // Preserve original ID
    };

    // Update hooks list in session if it exists
    if (session.hooks && session.hooks.length > 0) {
      const updatedHooks = session.hooks.map(h => 
        h.id === hookId ? refinedHookWithId : h
      );
      await updateSession(id, {
        hooks: updatedHooks
      });
    }

    res.json({
      success: true,
      data: {
        hook: refinedHookWithId
      }
    });
  } catch (error: any) {
    logger.error('Failed to refine hook', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to refine hook',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Select hook and proceed to stage 2
router.post('/:id/stage1/select-hook', async (req, res) => {
  try {
    const { id } = req.params;
    const { hookId } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    if (!hookId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'hookId is required',
          code: 'INVALID_INPUT'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    // Find the hook (in a real implementation, we might store hooks in session)
    // For now, we'll accept the hookId and expect the frontend to send the full hook object
    const { hook } = req.body;
    
    if (!hook || !hook.text) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'hook object with text is required',
          code: 'INVALID_INPUT'
        }
      });
    }

    const selectedHook = {
      id: hook.id || hookId,
      text: hook.text,
      isSelected: true,
    };

    // Update session: save selected hook, move to stage 2, and clear contentOutline
    // This ensures that when advancing from Stage 1 to Stage 2, content will be regenerated
    // (not using cached content from a previous visit to Stage 2)
    const updatedSession = await updateSession(id, {
      selectedHook,
      currentStage: 2,
      contentOutline: null // Clear content outline to force regeneration when advancing
    });

    logger.info('Hook selected, moving to stage 2', { sessionId: id, hookId, hookText: hook.text });

    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error: any) {
    logger.error('Failed to select hook', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to select hook',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// ==================== Stage 2: Content Development ====================

// Generate content points
router.post('/:id/stage2/generate-content', async (req, res) => {
  try {
    const { id } = req.params;
    const { model } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    if (session.currentStage !== 2) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session is not in stage 2',
          code: 'INVALID_STAGE'
        }
      });
    }

    if (!session.selectedHook) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No hook selected. Please select a hook first.',
          code: 'NO_HOOK_SELECTED'
        }
      });
    }

    const contentPoints = await generateContent(id, model || 'deepseek-v3');

    // Update session with content outline
    await updateSession(id, {
      contentOutline: contentPoints
    });

    res.json({
      success: true,
      data: {
        contentOutline: contentPoints,
        selectedHook: session.selectedHook,
        currentStage: 2
      }
    });
  } catch (error: any) {
    logger.error('Failed to generate content', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to generate content',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Update a specific content point
router.put('/:id/stage2/content-point/:pointId', async (req, res) => {
  try {
    const { id, pointId } = req.params;
    const { title, content } = req.body;

    if (!id || !pointId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID and point ID are required',
          code: 'INVALID_INPUT'
        }
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Content is required and must be a non-empty string',
          code: 'INVALID_INPUT'
        }
      });
    }

    // Sanitize user input before processing (security)
    const sanitizedTitle = title ? sanitizeUserInput(title.trim()) : undefined;
    const sanitizedContent = sanitizeUserInput(content.trim());
    
    if (sanitizedContent.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Content is required and must be a non-empty string',
          code: 'INVALID_INPUT'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    if (!session.contentOutline || session.contentOutline.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No content outline found',
          code: 'NO_CONTENT_OUTLINE'
        }
      });
    }

    // Find and update the content point
    const updatedOutline = session.contentOutline.map(point => {
      if (point.id === pointId) {
        return {
          ...point,
          title: sanitizedTitle || point.title,
          content: sanitizedContent,
        };
      }
      return point;
    });

    // Check if point was found
    const pointExists = updatedOutline.some(p => p.id === pointId);
    if (!pointExists) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Content point not found',
          code: 'POINT_NOT_FOUND'
        }
      });
    }

    // Update session
    await updateSession(id, {
      contentOutline: updatedOutline
    });

    const updatedPoint = updatedOutline.find(p => p.id === pointId)!;

    res.json({
      success: true,
      data: {
        contentPoint: updatedPoint
      }
    });
  } catch (error: any) {
    logger.error('Failed to update content point', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to update content point',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Optimize content
router.post('/:id/stage2/optimize-content', async (req, res) => {
  try {
    const { id } = req.params;
    const { model } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    if (!session.selectedHook) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No hook selected. Please select a hook first.',
          code: 'NO_HOOK_SELECTED'
        }
      });
    }

    const optimizedPoints = await optimizeContent(id, model || 'deepseek-v3');

    // Update session with optimized content outline
    await updateSession(id, {
      contentOutline: optimizedPoints
    });

    res.json({
      success: true,
      data: {
        contentOutline: optimizedPoints,
        selectedHook: session.selectedHook,
        currentStage: 2
      }
    });
  } catch (error: any) {
    logger.error('Failed to optimize content', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to optimize content',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Expand or optimize a specific content point
router.post('/:id/stage2/expand-point', async (req, res) => {
  try {
    const { id } = req.params;
    const { pointId, model, userInstruction } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    if (!pointId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Point ID is required',
          code: 'INVALID_INPUT'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    if (!session.contentOutline || session.contentOutline.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No content outline found. Please generate content first.',
          code: 'NO_CONTENT_OUTLINE'
        }
      });
    }

    // Sanitize user instruction if provided (security)
    const sanitizedUserInstruction = userInstruction 
      ? sanitizeUserInput(userInstruction.trim()) 
      : undefined;

    const expandedPoint = await expandPoint(
      id, 
      pointId, 
      model || 'deepseek-v3',
      sanitizedUserInstruction // Optional user instruction for direction
    );

    // Update the specific point in session
    const updatedOutline = session.contentOutline.map(point => {
      if (point.id === pointId) {
        return expandedPoint;
      }
      return point;
    });

    await updateSession(id, {
      contentOutline: updatedOutline
    });

    res.json({
      success: true,
      data: {
        expandedContent: expandedPoint
      }
    });
  } catch (error: any) {
    logger.error('Failed to expand content point', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to expand content point',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Confirm content and proceed to stage 3
router.post('/:id/stage2/confirm-content', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    if (!session.contentOutline || session.contentOutline.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No content outline found. Please generate content first.',
          code: 'NO_CONTENT_OUTLINE'
        }
      });
    }

    // Update session to stage 3 and clear generatedScripts
    // This ensures that when advancing from Stage 2 to Stage 3, scripts will be regenerated
    // (not using cached scripts from a previous visit to Stage 3)
    const updatedSession = await updateSession(id, {
      currentStage: 3,
      generatedScripts: null // Clear generated scripts to force regeneration when advancing
    });

    logger.info('Content confirmed, proceeding to stage 3', { sessionId: id });

    res.json({
      success: true,
      data: {
        sessionId: id,
        contentOutline: updatedSession.contentOutline,
        currentStage: 3
      }
    });
  } catch (error: any) {
    logger.error('Failed to confirm content', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to confirm content',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// ==================== Stage 3: Script Conversion ====================

// Generate scripts
router.post('/:id/stage3/generate-scripts', async (req, res) => {
  try {
    const { id } = req.params;
    const { model } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    if (session.currentStage !== 3) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session is not in stage 3',
          code: 'INVALID_STAGE'
        }
      });
    }

    if (!session.selectedHook) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No hook selected. Please complete stage 1 first.',
          code: 'NO_HOOK_SELECTED'
        }
      });
    }

    if (!session.contentOutline || session.contentOutline.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No content outline found. Please complete stage 2 first.',
          code: 'NO_CONTENT_OUTLINE'
        }
      });
    }

    const scripts = await generateScripts(id, model || 'deepseek-v3');

    // Update session with generated scripts
    await updateSession(id, {
      generatedScripts: scripts
    });

    res.json({
      success: true,
      data: {
        scripts,
        selectedHook: session.selectedHook,
        contentOutline: session.contentOutline,
        currentStage: 3
      }
    });
  } catch (error: any) {
    logger.error('Failed to generate scripts', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to generate scripts',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Refine a specific script
router.post('/:id/stage3/refine-script', async (req, res) => {
  try {
    const { id } = req.params;
    const { scriptStyle, model } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    if (!scriptStyle || !['story', 'tutorial', 'comparison'].includes(scriptStyle)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'scriptStyle is required and must be one of: story, tutorial, comparison',
          code: 'INVALID_INPUT'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    if (!session.generatedScripts || session.generatedScripts.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No scripts found. Please generate scripts first.',
          code: 'NO_SCRIPTS_FOUND'
        }
      });
    }

    const refinedScript = await refineScript(id, scriptStyle, model || 'deepseek-v3');

    // Update the specific script in session
    const updatedScripts = session.generatedScripts.map(script => {
      if (script.style === scriptStyle) {
        return refinedScript;
      }
      return script;
    });

    await updateSession(id, {
      generatedScripts: updatedScripts
    });

    res.json({
      success: true,
      data: {
        script: refinedScript
      }
    });
  } catch (error: any) {
    logger.error('Failed to refine script', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to refine script',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Generate hashtags and music suggestions
router.post('/:id/generate-suggestions', async (req, res) => {
  try {
    const { id } = req.params;
    const { model } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session ID is required',
          code: 'INVALID_SESSION_ID'
        }
      });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    if (!session.selectedHook) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No hook selected. Please complete stage 1 first.',
          code: 'NO_HOOK_SELECTED'
        }
      });
    }

    // Generate hashtags and music in parallel for better performance
    // Handle partial failures: if one fails, still return the other
    let hashtags: any[] = [];
    let musicStyle: any = null;
    let hashtagsError: string | null = null;
    let musicError: string | null = null;

    try {
      hashtags = await generateHashtags(id, model || 'deepseek-v3');
    } catch (error: any) {
      logger.warn('Failed to generate hashtags, continuing with music', { 
        error: error.message, 
        sessionId: id 
      });
      hashtagsError = error.message;
      // Use fallback hashtags
      hashtags = [
        { text: session.userInput.substring(0, 20) || '短视频' },
        { text: '创作' },
        { text: '内容' },
        { text: '分享' },
        { text: '推荐' },
      ];
    }

    try {
      musicStyle = await generateMusicStyle(id, model || 'deepseek-v3');
    } catch (error: any) {
      logger.warn('Failed to generate music style, continuing with hashtags', { 
        error: error.message, 
        sessionId: id 
      });
      musicError = error.message;
      // Use fallback music style
      musicStyle = {
        style: '轻快节奏',
        mood: '适合内容展示',
      };
    }

    // Return results even if one failed (partial success)
    res.json({
      success: true,
      data: {
        hashtags,
        musicStyle,
        errors: {
          hashtags: hashtagsError || null,
          music: musicError || null,
        }
      }
    });
  } catch (error: any) {
    logger.error('Failed to generate suggestions', { error: error.message, sessionId: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to generate suggestions',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

export default router;

