# Data Model: TikTok Creator Insight Assistant MVP

**Date**: 2025-01-27  
**Feature**: 001-tiktok-creator-insight

## Entities

### CreationSession (创作会话) - 新增

Represents a multi-stage creative collaboration session.

**Attributes**:
- `id` (string, required): Unique session ID (UUID)
- `userInput` (string, required): Original user input (1-500 characters)
- `currentStage` (number, required): Current stage (1 | 2 | 3)
- `hooks` (Hook[], optional): Generated hooks from stage 1 (stored for recovery when going back)
- `selectedHook` (Hook, optional): Selected hook from stage 1
- `contentOutline` (ContentPoint[], optional): Content points from stage 2
- `generatedScripts` (ScriptOutline[], optional): Generated scripts from stage 3
- `createdAt` (Date, required): Session creation timestamp
- `updatedAt` (Date, required): Last update timestamp
- `interactionHistory` (Interaction[], optional): History of user interactions

**State Transitions**:
- `stage1` → `stage2` → `stage3` → `completed`
- Any stage can go back to previous stage

**Relationships**:
- Contains: Hook[], ContentPoint[], ScriptOutline[]
- Has: Interaction[] (for context tracking)

### Hook (金句) - 新增

Represents a hook/slogan option for stage 1.

**Attributes**:
- `id` (string, required): Unique hook ID
- `text` (string, required): Hook text content
- `sessionId` (string, required): Associated session ID
- `isSelected` (boolean, required): Whether this hook is selected
- `generatedAt` (Date, required): Generation timestamp

**Validation Rules**:
- Text must not be empty
- Text should be emotionally engaging and attention-grabbing
- 3-5 hooks generated per session

**Relationships**:
- Belongs to: CreationSession

### ContentPoint (内容要点) - 新增

Represents a detailed content point for stage 2.

**Attributes**:
- `id` (string, required): Unique content point ID
- `title` (string, optional): Point title/heading
- `content` (string, required): Detailed content description (not just outline, but rich content)
- `order` (number, required): Display order (1, 2, 3)
- `sessionId` (string, required): Associated session ID
- `isExpanded` (boolean, optional): Whether this point has been expanded

**Validation Rules**:
- Content must be detailed and rich, not just a simple outline
- Must have at least 3 content points
- Content should include specific scenes, emotions, details

**Relationships**:
- Belongs to: CreationSession

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

**Note**: In the new three-stage design, CreationRequest is replaced by CreationSession for better state management.

### ScriptOutline (脚本大纲)

Represents one AI-generated script outline.

**Attributes**:
- `style` (string, required): Script style type (e.g., "story", "tutorial", "comparison")
- `title` (string, optional): Script title
- `points` (string[], required): Structured outline points (minimum 3 per SC-004)
- `description` (string, optional): Brief description of the script approach
- `emotionalAnchors` (string[], optional): Emotional anchor points in the script (新增)
- `memoryPoints` (string[], optional): Memory points designed to be memorable (新增)
- `conflictDesign` (string, optional): Conflict/reversal design description (新增)
- `informationDensity` (string, optional): Information density control notes (新增)
- `sessionId` (string, optional): Associated session ID (新增)

**Validation Rules**:
- Must have at least 3 points (per SC-004)
- Style must be distinct from other scripts (per FR-004)
- Points must be non-empty strings
- Professional elements (emotional anchors, memory points, etc.) should be included (per FR-043)

**Relationships**:
- Belongs to: GenerationResult (legacy) or CreationSession (new design)

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

### 新设计：三阶段协作式流程

```
User Input (创作主题)
    ↓
Stage 1: 生成3-5个金句选项
    ↓
用户选择/微调/替换金句
    ↓
Stage 2: 基于选定金句生成3个详细内容要点
    ↓
用户编辑/优化/展开内容要点
    ↓
Stage 3: 将内容转换为3种风格的脚本
    ├── 故事叙述型（情绪锚点、冲突设计）
    ├── 教程教学型（信息密度、步骤清晰）
    └── 对比评测型（记忆点植入、反转设计）
    ↓
Frontend Display (结构化卡片)
    ↓
[Optional] Database Log (APILog)
```

### 会话状态持久化

```
CreationSession
    ├── currentStage: 1 | 2 | 3
    ├── hooks: Hook[] (存储生成的金句列表，用于退回 Stage 1 时恢复)
    ├── selectedHook: Hook
    ├── contentOutline: ContentPoint[]
    ├── generatedScripts: ScriptOutline[]
    └── interactionHistory: Interaction[]
    
支持：刷新恢复、阶段回退、上下文传递

阶段回退行为：
- Stage 2 → Stage 1: 使用缓存的 hooks（之前生成的金句列表）
- Stage 3 → Stage 2: 使用缓存的 contentOutline（之前生成的内容要点）
- Stage 1 → Stage 2: 重新生成 contentOutline（基于选定的金句）
- Stage 2 → Stage 3: 重新生成 generatedScripts（基于内容大纲）
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

**Table: creation_sessions** (新增 - 会话持久化)

```sql
CREATE TABLE IF NOT EXISTS creation_sessions (
  id TEXT PRIMARY KEY,
  user_input TEXT NOT NULL,
  current_stage INTEGER NOT NULL CHECK(current_stage IN (1, 2, 3)),
  hooks TEXT,  -- JSON array of Hook (stored for recovery when going back to stage 1)
  selected_hook TEXT,  -- JSON object of Hook
  content_outline TEXT,  -- JSON array of ContentPoint
  generated_scripts TEXT,  -- JSON array of ScriptOutline
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  interaction_history TEXT  -- JSON array of Interaction
);

CREATE INDEX idx_created_at ON creation_sessions(created_at);
CREATE INDEX idx_current_stage ON creation_sessions(current_stage);
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

