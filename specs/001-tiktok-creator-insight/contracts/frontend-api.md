# Frontend API Contract

**Date**: 2025-01-27  
**Feature**: 001-tiktok-creator-insight

## API Base URL

- Development: `http://localhost:3000/api`
- Production: `[TBD]`

## Endpoints

### POST /api/generate

Generate script outlines, hashtags, and music style suggestions.

**Request**:
```typescript
interface GenerateRequest {
  prompt: string;      // User input (1-500 characters)
  model?: string;      // Optional: "deepseek-v3" | "qwen-max" | "deepseek-r1"
}
```

**Response (Success - 200)**:
```typescript
interface GenerateResponse {
  success: true;
  data: {
    scripts: ScriptOutline[];        // Exactly 3 scripts
    hashtags: HashtagSuggestion[];   // 5-10 hashtags
    musicStyle: MusicStyleSuggestion; // 1 music style
  };
  responseTime?: number;              // Milliseconds
}
```

**Response (Error - 400/500/504)**:
```typescript
interface ErrorResponse {
  success: false;
  error: {
    message: string;  // User-friendly error message
    code: string;    // Error code
  };
}
```

**Error Codes**:
- `EMPTY_INPUT`: Input is empty or only whitespace
- `INPUT_TOO_LONG`: Input exceeds 500 characters
- `API_ERROR`: AI API call failed
- `TIMEOUT`: API call exceeded 30 seconds
- `NETWORK_ERROR`: Network connection error

### GET /api/health

Health check endpoint.

**Response**:
```typescript
interface HealthResponse {
  status: "ok";
  database?: "enabled" | "disabled";
}
```

## Frontend Implementation

### API Client Example

```typescript
// services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = {
  async generate(prompt: string, model?: string) {
    const response = await axios.post<GenerateResponse>(
      `${API_BASE_URL}/generate`,
      { prompt, model },
      { timeout: 35000 } // 35 seconds (30s API + 5s buffer)
    );
    return response.data;
  },
  
  async healthCheck() {
    const response = await axios.get<HealthResponse>(`${API_BASE_URL}/health`);
    return response.data;
  }
};
```

### Error Handling

```typescript
try {
  const result = await api.generate(userInput);
  if (result.success) {
    // Display results
  }
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      const errorData = error.response.data as ErrorResponse;
      showError(errorData.error.message);
    } else if (error.request) {
      // Request made but no response
      showError('网络连接失败，请检查网络');
    } else {
      // Request setup error
      showError('请求失败，请稍后重试');
    }
  } else {
    showError('未知错误，请稍后重试');
  }
}
```

## Loading States

Frontend MUST show loading state during API call:
- Show loading indicator immediately when user submits
- Display "正在生成脚本..." message
- Hide loading when response received or error occurs

## Error Display

Frontend MUST display user-friendly error messages:
- Use error.message from API response
- Provide retry button for failed requests
- Don't expose technical details to users

## Response Validation

Frontend SHOULD validate response structure:
- Check that scripts array has exactly 3 items
- Check that hashtags array has 5-10 items
- Check that musicStyle exists
- Handle partial failures gracefully

