import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface GenerateRequest {
  prompt: string;
  model?: string;
}

export interface ScriptOutline {
  style: string;
  title?: string;
  points: string[];
  description?: string;
}

export interface HashtagSuggestion {
  text: string;
  relevance?: number;
  category?: string;
}

export interface MusicStyleSuggestion {
  style: string;
  mood?: string;
  tempo?: string;
  scene?: string;
}

export interface GenerateResponse {
  success: boolean;
  data?: {
    scripts: ScriptOutline[];
    hashtags: HashtagSuggestion[];
    musicStyle: MusicStyleSuggestion;
  };
  error?: {
    message: string;
    code: string;
  };
  responseTime?: number;
}

export interface HealthResponse {
  status: string;
  database?: string;
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000, // 35 seconds (30s API + 5s buffer)
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  async generate(prompt: string, model?: string): Promise<GenerateResponse> {
    const response = await apiClient.post<GenerateResponse>('/generate', {
      prompt,
      model: model || 'deepseek-v3',
    });
    return response.data;
  },

  async healthCheck(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },
};

