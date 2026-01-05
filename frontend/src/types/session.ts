// Session-related types for three-stage collaborative creation

export interface Hook {
  id: string;
  text: string;
  isSelected: boolean;
}

export interface ContentPoint {
  id: string;
  title?: string;
  content: string;
  order: number;
  isExpanded?: boolean;
}

export interface ScriptOutline {
  style: string;
  title?: string;
  points: string[];
  description?: string;
  emotionalAnchors?: string[];
  memoryPoints?: string[];
  conflictDesign?: string;
  informationDensity?: string;
}

export interface CreationSession {
  id: string;
  userInput: string;
  currentStage: 1 | 2 | 3;
  hooks?: Hook[];  // Store generated hooks for stage 1 recovery
  selectedHook?: Hook | null;
  contentOutline?: ContentPoint[];
  generatedScripts?: ScriptOutline[];
  createdAt: string;
  updatedAt: string;
  interactionHistory?: any[];
}

export interface CreateSessionRequest {
  userInput: string;
  model?: string;
}

export interface CreateSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    userInput: string;
    currentStage: 1 | 2 | 3;
    createdAt: string;
  };
  error?: {
    message: string;
    code: string;
  };
}

export interface GetSessionResponse {
  success: boolean;
  data: CreationSession;
  error?: {
    message: string;
    code: string;
  };
}

