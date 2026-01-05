import axios from 'axios';
import type { CreateSessionRequest, CreateSessionResponse, GetSessionResponse, CreationSession } from '../types/session.js';

// Use relative path to leverage Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Validate response structure
 */
function validateResponse<T extends { success: boolean; data?: any; error?: any }>(
  response: T,
  expectedDataFields?: string[]
): void {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response: response is not an object');
  }

  if (response.success === false) {
    const errorMessage = response.error?.message || 'Request failed';
    throw new Error(errorMessage);
  }

  if (!response.data) {
    throw new Error('Invalid response: missing data field');
  }

  // Validate expected data fields if provided
  if (expectedDataFields && expectedDataFields.length > 0) {
    const missingFields: string[] = [];
    const availableFields = Object.keys(response.data);
    
    for (const field of expectedDataFields) {
      if (!(field in response.data)) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      // Provide helpful error message with available fields
      throw new Error(
        `Invalid response: missing required field(s) '${missingFields.join(', ')}' in data. ` +
        `Available fields: ${availableFields.length > 0 ? availableFields.join(', ') : 'none'}`
      );
    }
  }
}

// Create a new session
export async function createSession(request: CreateSessionRequest): Promise<CreationSession> {
  const url = `${API_BASE_URL}/api/session/create`;
  console.log('[session.ts] Creating session with URL:', url, 'API_BASE_URL:', API_BASE_URL);
  const response = await axios.post<CreateSessionResponse>(url, request);

  // Validate response - axios wraps the API response in response.data
  validateResponse(response.data, ['sessionId', 'userInput', 'currentStage']);

  // Return full session object (we'll need to fetch it to get full data)
  return {
    id: response.data.data!.sessionId,
    userInput: response.data.data!.userInput,
    currentStage: response.data.data!.currentStage,
    createdAt: response.data.data!.createdAt,
    updatedAt: response.data.data!.createdAt,
  };
}

// Get session by ID
export async function getSession(sessionId: string): Promise<CreationSession> {
  const response = await axios.get<GetSessionResponse>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}`
  );

  // Validate response - axios wraps the API response in response.data
  validateResponse(response.data, ['id', 'userInput', 'currentStage']);

  return response.data.data!;
}

// Go back to previous stage
export async function goBackStage(sessionId: string): Promise<CreationSession> {
  try {
    const response = await axios.post<GetSessionResponse>(
      `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/go-back`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to go back stage');
    }

    return response.data.data;
  } catch (error: any) {
    // Handle 400: Invalid stage operation
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.error?.message || '无法返回上一阶段：当前已在第一阶段');
    }
    // Handle 404: Session not found
    if (error.response?.status === 404) {
      throw new Error('会话未找到，请创建新会话');
    }
    throw error;
  }
}

// Stage 1: Hook operations
export interface GenerateHooksResponse {
  success: boolean;
  data?: {
    hooks: Array<{ id: string; text: string; isSelected: boolean }>;
  };
  error?: {
    message: string;
    code: string;
  };
}

export async function generateHooks(sessionId: string, model?: string): Promise<Array<{ id: string; text: string; isSelected: boolean }>> {
  const response = await axios.post<GenerateHooksResponse>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/stage1/generate-hooks`,
    { model: model || 'deepseek-v3' }
  );

  // Validate response - axios wraps the API response in response.data
  validateResponse(response.data, ['hooks']);

  // Validate hooks array structure
  const hooks = response.data.data!.hooks || [];
  if (!Array.isArray(hooks)) {
    throw new Error('Invalid response: hooks is not an array');
  }

  // Validate each hook structure
  for (const hook of hooks) {
    if (!hook || typeof hook !== 'object' || !hook.id || !hook.text) {
      throw new Error('Invalid response: hook missing required fields (id, text)');
    }
  }

  return hooks;
}

export async function replaceHooks(sessionId: string, model?: string): Promise<Array<{ id: string; text: string; isSelected: boolean }>> {
  const response = await axios.post<GenerateHooksResponse>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/stage1/replace-hooks`,
    { model: model || 'deepseek-v3' }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to replace hooks');
  }

  return response.data.data.hooks || [];
}

export interface RefineHookResponse {
  success: boolean;
  data?: {
    hook: { id: string; text: string; isSelected: boolean };
  };
  error?: {
    message: string;
    code: string;
  };
}

export async function refineHook(sessionId: string, hookId: string, userEdit?: string, model?: string): Promise<{ id: string; text: string; isSelected: boolean }> {
  const response = await axios.post<RefineHookResponse>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/stage1/refine-hook`,
    {
      hookId,
      userEdit,
      model: model || 'deepseek-v3',
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to refine hook');
  }

  return response.data.data.hook;
}

export async function selectHook(sessionId: string, hook: { id: string; text: string }): Promise<CreationSession> {
  const response = await axios.post<GetSessionResponse>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/stage1/select-hook`,
    { hookId: hook.id, hook }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to select hook');
  }

  return response.data.data;
}

// Stage 2: Content operations
export interface GenerateContentResponse {
  success: boolean;
  data?: {
    contentOutline: Array<{ id: string; title?: string; content: string; order: number }>;
    selectedHook?: { id: string; text: string };
    currentStage: number;
  };
  error?: {
    message: string;
    code: string;
  };
}

export async function generateContent(sessionId: string, model?: string): Promise<Array<{ id: string; title?: string; content: string; order: number }>> {
  const response = await axios.post<GenerateContentResponse>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/stage2/generate-content`,
    { model: model || 'deepseek-v3' }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to generate content');
  }

  return response.data.data.contentOutline || [];
}

export async function updateContentPoint(
  sessionId: string,
  pointId: string,
  title: string | undefined,
  content: string
): Promise<{ id: string; title?: string; content: string; order: number }> {
  const response = await axios.put<{
    success: boolean;
    data?: {
      contentPoint: { id: string; title?: string; content: string; order: number };
    };
    error?: { message: string; code: string };
  }>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/stage2/content-point/${encodeURIComponent(pointId)}`,
    { title, content }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to update content point');
  }

  return response.data.data.contentPoint;
}

export async function optimizeContent(sessionId: string, model?: string): Promise<Array<{ id: string; title?: string; content: string; order: number }>> {
  const response = await axios.post<GenerateContentResponse>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/stage2/optimize-content`,
    { model: model || 'deepseek-v3' }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to optimize content');
  }

  return response.data.data.contentOutline || [];
}

export async function expandPoint(
  sessionId: string, 
  pointId: string, 
  model?: string,
  userInstruction?: string
): Promise<{ id: string; title?: string; content: string; order: number }> {
  const response = await axios.post<{
    success: boolean;
    data?: {
      expandedContent: { id: string; title?: string; content: string; order: number };
    };
    error?: { message: string; code: string };
  }>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/stage2/expand-point`,
    { 
      pointId, 
      model: model || 'deepseek-v3',
      userInstruction: userInstruction?.trim() || undefined
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to expand content point');
  }

  return response.data.data.expandedContent;
}

export async function confirmContent(sessionId: string): Promise<CreationSession> {
  const response = await axios.post<GetSessionResponse>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/stage2/confirm-content`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to confirm content');
  }

  return response.data.data;
}

// Stage 3: Script operations
export interface GenerateScriptsResponse {
  success: boolean;
  data?: {
    scripts: Array<{
      style: string;
      title?: string;
      points: string[];
      description?: string;
      emotionalAnchors?: string[];
      memoryPoints?: string[];
      conflictDesign?: string;
      informationDensity?: string;
    }>;
    selectedHook?: { id: string; text: string };
    contentOutline?: Array<{ id: string; title?: string; content: string; order: number }>;
    currentStage: number;
  };
  error?: {
    message: string;
    code: string;
  };
}

export async function generateScripts(sessionId: string, model?: string): Promise<Array<{
  style: string;
  title?: string;
  points: string[];
  description?: string;
  emotionalAnchors?: string[];
  memoryPoints?: string[];
  conflictDesign?: string;
  informationDensity?: string;
}>> {
  const response = await axios.post<GenerateScriptsResponse>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/stage3/generate-scripts`,
    { model: model || 'deepseek-v3' }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to generate scripts');
  }

  return response.data.data.scripts || [];
}

export async function refineScript(
  sessionId: string,
  scriptStyle: 'story' | 'tutorial' | 'comparison',
  model?: string
): Promise<{
  style: string;
  title?: string;
  points: string[];
  description?: string;
  emotionalAnchors?: string[];
  memoryPoints?: string[];
  conflictDesign?: string;
  informationDensity?: string;
}> {
  const response = await axios.post<{
    success: boolean;
    data?: {
      script: {
        style: string;
        title?: string;
        points: string[];
        description?: string;
        emotionalAnchors?: string[];
        memoryPoints?: string[];
        conflictDesign?: string;
        informationDensity?: string;
      };
    };
    error?: { message: string; code: string };
  }>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/stage3/refine-script`,
    { scriptStyle, model: model || 'deepseek-v3' }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to refine script');
  }

  return response.data.data.script;
}

// Generate hashtags and music suggestions
export interface GenerateSuggestionsResponse {
  success: boolean;
  data?: {
    hashtags: Array<{ text: string; relevance?: number; category?: string }>;
    musicStyle: { style: string; mood?: string; tempo?: string; scene?: string };
    errors?: {
      hashtags: string | null;
      music: string | null;
    };
  };
  error?: {
    message: string;
    code: string;
  };
}

export async function generateSuggestions(
  sessionId: string,
  model?: string
): Promise<{
  hashtags: Array<{ text: string; relevance?: number; category?: string }>;
  musicStyle: { style: string; mood?: string; tempo?: string; scene?: string };
  errors?: {
    hashtags: string | null;
    music: string | null;
  };
}> {
  const response = await axios.post<GenerateSuggestionsResponse>(
    `${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}/generate-suggestions`,
    { model: model || 'deepseek-v3' }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to generate suggestions');
  }

  return response.data.data;
}

