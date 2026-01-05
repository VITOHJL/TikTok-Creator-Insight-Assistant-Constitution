# Data Model: TikTok Creator Insight Assistant MVP

**Date**: 2025-01-27  
**Feature**: 001-tiktok-creator-insight

## Entities

### CreationRequest (创作请求)

Represents a user's creative intent input.

**Attributes**:
- `text` (string, required): User input text (1-500 characters)
- `language` (string, optional): Detected or specified language ("zh" | "en")
- `timestamp` (Date, optional): Request submission time
- `userAgent` (string, optional): Browser user agent (for analytics)

**Validation Rules**:
- Text must not be empty (per FR-012)
- Text length: 1-500 characters (per FR-012)
- Language detection: Support Chinese and English (per FR-002)

**State Transitions**:
- `pending` → `processing` → `completed` | `failed`

### ScriptOutline (脚本大纲)

Represents one AI-generated script outline.

**Attributes**:
- `style` (string, required): Script style type (e.g., "story", "tutorial", "comparison")
- `title` (string, optional): Script title
- `points` (string[], required): Structured outline points (minimum 3 per SC-004)
- `description` (string, optional): Brief description of the script approach

**Validation Rules**:
- Must have at least 3 points (per SC-004)
- Style must be distinct from other scripts (per FR-004)
- Points must be non-empty strings

**Relationships**:
- Belongs to: GenerationResult

### HashtagSuggestion (Hashtag建议)

Represents one hashtag tag suggestion.

**Attributes**:
- `text` (string, required): Hashtag text (without #)
- `relevance` (number, optional): Relevance score (0-100)
- `category` (string, optional): Category (e.g., "trending", "niche")

**Validation Rules**:
- Text must not be empty
- Text should not contain # symbol
- Text length: reasonable hashtag length

**Relationships**:
- Belongs to: GenerationResult

### MusicStyleSuggestion (音乐风格建议)

Represents background music style description.

**Attributes**:
- `style` (string, required): Music style description (e.g., "轻快节奏", "舒缓背景音")
- `mood` (string, optional): Mood description
- `tempo` (string, optional): Tempo description (e.g., "fast", "slow")
- `scene` (string, optional): Applicable scene description

**Validation Rules**:
- Style description must not be empty
- Text description only, no audio files (per FR-006)

**Relationships**:
- Belongs to: GenerationResult

### GenerationResult (生成结果)

Represents a complete AI generation result.

**Attributes**:
- `scripts` (ScriptOutline[], required): Array of 3 script outlines (per FR-004)
- `hashtags` (HashtagSuggestion[], required): Array of 5-10 hashtags (per FR-005)
- `musicStyle` (MusicStyleSuggestion, required): Music style suggestion (per FR-006)
- `status` (string, required): Generation status ("success" | "partial" | "failed")
- `timestamp` (Date, optional): Generation completion time
- `responseTime` (number, optional): API response time in milliseconds

**Validation Rules**:
- Must have exactly 3 scripts (per FR-004)
- Must have 5-10 hashtags (per FR-005)
- Must have 1 music style suggestion (per FR-006)
- Status must be one of: "success", "partial", "failed"

**State Transitions**:
- `processing` → `success` | `partial` | `failed`

**Relationships**:
- Created from: CreationRequest
- Contains: ScriptOutline[], HashtagSuggestion[], MusicStyleSuggestion

### APILog (API日志) - Optional

Represents an API call log entry (only when database is enabled).

**Attributes**:
- `id` (number, auto-increment): Primary key
- `timestamp` (Date, required): Request timestamp
- `prompt` (string, required): User input text
- `model` (string, required): AI model used (e.g., "deepseek-v3", "qwen-max")
- `prompt_version` (string, required): Prompt version identifier (e.g., "v1.0", "v1.1") - for tracking prompt improvements
- `scripts` (string, required): JSON string of scripts array
- `hashtags` (string, required): JSON string of hashtags array
- `musicStyle` (string, required): JSON string of music style
- `responseTime` (number, required): API response time in milliseconds
- `status` (string, required): Call status ("success" | "failed")
- `errorMessage` (string, optional): Error message if failed

**Validation Rules**:
- All fields required except errorMessage
- JSON strings must be valid JSON
- Timestamp must be valid date

**Relationships**:
- Logs: GenerationResult (when database enabled)

## Data Flow

```
User Input (CreationRequest)
    ↓
Backend API
    ↓
Alibaba Cloud Bailian API
    ↓
Response Processing
    ↓
GenerationResult
    ├── ScriptOutline[] (3 items)
    ├── HashtagSuggestion[] (5-10 items)
    └── MusicStyleSuggestion (1 item)
    ↓
Frontend Display (Cards)
    ↓
[Optional] Database Log (APILog)
```

## API Request/Response Models

### Request Model (Frontend → Backend)

```typescript
interface GenerateRequest {
  prompt: string;  // User input (1-500 chars)
  model?: string; // Optional: "deepseek-v3" | "qwen-max" | "deepseek-r1"
}
```

### Response Model (Backend → Frontend)

```typescript
interface GenerateResponse {
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
```

## Database Schema (Optional - SQLite)

**Table: api_logs**

```sql
CREATE TABLE IF NOT EXISTS api_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  scripts TEXT NOT NULL,
  hashtags TEXT NOT NULL,
  music_style TEXT NOT NULL,
  response_time INTEGER NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT
);

CREATE INDEX idx_timestamp ON api_logs(timestamp);
CREATE INDEX idx_status ON api_logs(status);
CREATE INDEX idx_prompt_version ON api_logs(prompt_version);
```

## Validation Summary

### Input Validation
- Text: 1-500 characters (FR-012)
- Language: Chinese or English (FR-002)
- Empty input: Rejected with friendly error (Edge Case)

### Output Validation
- Scripts: Exactly 3, each with ≥3 points (FR-004, SC-004)
- Hashtags: 5-10 items (FR-005, SC-005)
- Music Style: 1 item, text description only (FR-006)
- Response Time: <15 seconds target (SC-002)

### Error Handling
- API failures: Graceful degradation (FR-009)
- Partial failures: Show successful parts (Edge Case)
- Timeout: 30 seconds max (Edge Case)

