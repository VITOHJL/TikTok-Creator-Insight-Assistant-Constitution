# Three-Stage Collaboration API Specification

**Date**: 2025-01-05  
**Feature**: 001-tiktok-creator-insight  
**Version**: 2.0 (Three-Stage Design)

## Overview

This API specification defines the endpoints for the three-stage collaborative creation process:
1. **Stage 1**: Hook Selection (金句选择)
2. **Stage 2**: Content Development (内容创作)
3. **Stage 3**: Script Conversion (脚本转换)

## Base URL

```
http://localhost:3000/api
```

## Authentication

No authentication required for MVP.

## API Endpoints

### 1. Create Session

Create a new creation session.

**Endpoint**: `POST /api/session/create`

**Request Body**:
```json
{
  "userInput": "新年美食探店",
  "model": "deepseek-v3"  // optional, default: "deepseek-v3"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-string",
    "userInput": "新年美食探店",
    "currentStage": 1,
    "hooks": null,
    "createdAt": "2025-01-05T10:00:00Z"
  }
}
```

---

### 2. Stage 1: Generate Hooks

Generate 3-5 hook options for the user to choose from.

**Endpoint**: `POST /api/session/{sessionId}/stage1/generate-hooks`

**Request Body**:
```json
{
  "model": "deepseek-v3"  // optional
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "hooks": [
      {
        "id": "hook-1",
        "text": "这家藏在巷子里的店，让我找到了小时候的味道",
        "isSelected": false
      },
      {
        "id": "hook-2",
        "text": "花30块吃出300块的仪式感，这家店凭什么？",
        "isSelected": false
      },
      {
        "id": "hook-3",
        "text": "新年第一餐，我找到了最治愈的味道",
        "isSelected": false
      }
    ],
    "sessionId": "uuid-string",
    "currentStage": 1
  }
}
```

**Note**: The hooks are automatically saved to the session for recovery when going back to stage 1.

---

### 3. Stage 1: Replace Hooks

Replace current hooks with new ones.

**Endpoint**: `POST /api/session/{sessionId}/stage1/replace-hooks`

**Request Body**:
```json
{
  "model": "deepseek-v3"  // optional
}
```

**Response**: Same as generate-hooks

---

### 4. Stage 1: Refine Hook

Refine/optimize a specific hook.

**Endpoint**: `POST /api/session/{sessionId}/stage1/refine-hook`

**Request Body**:
```json
{
  "hookId": "hook-1",
  "userEdit": "这家藏在巷子里的店，让我找到了小时候的味道（可选，用户手动编辑后的文本）",
  "model": "deepseek-v3"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "hook": {
      "id": "hook-1",
      "text": "优化后的金句文本",
      "isSelected": false
    }
  }
}
```

**Note**: The hook ID is preserved from the original hook. The hooks list in the session is automatically updated.

---

### 5. Stage 1: Select Hook

Select a hook and proceed to stage 2.

**Endpoint**: `POST /api/session/{sessionId}/stage1/select-hook`

**Request Body**:
```json
{
  "hookId": "hook-2"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-string",
    "selectedHook": {
      "id": "hook-2",
      "text": "花30块吃出300块的仪式感，这家店凭什么？"
    },
    "currentStage": 2
  }
}
```

---

### 6. Stage 2: Generate Content

Generate 3 detailed content points based on selected hook.

**Endpoint**: `POST /api/session/{sessionId}/stage2/generate-content`

**Request Body**:
```json
{
  "model": "deepseek-v3"  // optional
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "contentOutline": [
      {
        "id": "content-1",
        "title": "引入场景",
        "content": "详细描述为什么选择这家店，包括发现过程、第一印象、期待感等。包含具体场景：走进巷子、闻到香味、看到招牌等细节。",
        "order": 1
      },
      {
        "id": "content-2",
        "title": "探店过程",
        "content": "详细描述探店过程，包括环境氛围、服务体验、菜品特色等。包含情感描述：惊喜、满足、感动等。",
        "order": 2
      },
      {
        "id": "content-3",
        "title": "价值总结",
        "content": "总结这家店的价值和推荐理由，升华主题，留下回味空间。",
        "order": 3
      }
    ],
    "selectedHook": {
      "id": "hook-2",
      "text": "花30块吃出300块的仪式感，这家店凭什么？"
    },
    "currentStage": 2
  }
}
```

---

### 7. Stage 2: Update Content Point

Update a specific content point.

**Endpoint**: `PUT /api/session/{sessionId}/stage2/content-point/{pointId}`

**Request Body**:
```json
{
  "title": "引入场景（用户编辑）",
  "content": "用户编辑后的详细内容..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "contentPoint": {
      "id": "content-1",
      "title": "引入场景（用户编辑）",
      "content": "用户编辑后的详细内容...",
      "order": 1
    }
  }
}
```

---

### 8. Stage 2: Optimize Content

Re-generate content outline with optimizations.

**Endpoint**: `POST /api/session/{sessionId}/stage2/optimize-content`

**Request Body**:
```json
{
  "model": "deepseek-v3"
}
```

**Response**: Same as generate-content

---

### 9. Stage 2: Expand Content Point

Expand a specific content point in detail.

**Endpoint**: `POST /api/session/{sessionId}/stage2/expand-point`

**Request Body**:
```json
{
  "pointId": "content-1",
  "model": "deepseek-v3"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "expandedContent": {
      "id": "content-1",
      "title": "引入场景",
      "content": "展开后的更详细内容，包含更多细节、情感、场景描述..."
    }
  }
}
```

---

### 10. Stage 2: Confirm Content

Confirm content and proceed to stage 3.

**Endpoint**: `POST /api/session/{sessionId}/stage2/confirm-content`

**Request Body**: (empty)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-string",
    "contentOutline": [...],  // 3 content points
    "currentStage": 3
  }
}
```

---

### 11. Stage 3: Generate Scripts

Generate 3 different style scripts from content.

**Endpoint**: `POST /api/session/{sessionId}/stage3/generate-scripts`

**Request Body**:
```json
{
  "model": "deepseek-v3"  // optional
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "scripts": [
      {
        "style": "story",
        "title": "寻味之旅：小巷深处的秘密美食",
        "points": [
          "开场吸引：用悬念手法引出神秘美食线索",
          "故事展开：通过探店过程展现人物互动与美食细节",
          "高潮部分：揭示美食背后的温情故事",
          "结尾总结：升华主题并留下回味空间"
        ],
        "description": "这个脚本通过美食博主意外发现神秘美食线索的冒险故事...",
        "emotionalAnchors": [
          "开场3秒：悬念钩子（神秘美食线索）",
          "中段：情感共鸣（找到小时候的味道）"
        ],
        "memoryPoints": [
          "30块吃出300块仪式感的反差",
          "藏在巷子里的宝藏店铺"
        ],
        "conflictDesign": "通过价格与体验的反差制造冲突",
        "informationDensity": "前3秒高密度信息（悬念+场景），中段展开细节，结尾升华"
      },
      {
        "style": "tutorial",
        "title": "教程教学型脚本",
        "points": [...],
        "description": "...",
        "emotionalAnchors": [...],
        "memoryPoints": [...],
        "conflictDesign": "...",
        "informationDensity": "..."
      },
      {
        "style": "comparison",
        "title": "对比评测型脚本",
        "points": [...],
        "description": "...",
        "emotionalAnchors": [...],
        "memoryPoints": [...],
        "conflictDesign": "...",
        "informationDensity": "..."
      }
    ],
    "selectedHook": {...},
    "contentOutline": [...],
    "currentStage": 3
  }
}
```

---

### 12. Stage 3: Refine Script

Refine/optimize a specific script.

**Endpoint**: `POST /api/session/{sessionId}/stage3/refine-script`

**Request Body**:
```json
{
  "scriptStyle": "story",  // "story" | "tutorial" | "comparison"
  "model": "deepseek-v3"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "script": {
      "style": "story",
      "title": "优化后的脚本标题",
      "points": [...],
      "description": "优化后的描述...",
      "emotionalAnchors": [...],
      "memoryPoints": [...],
      "conflictDesign": "优化后的冲突设计...",
      "informationDensity": "优化后的信息密度控制..."
    }
  }
}
```

---

### 13. Get Session

Get current session state (for recovery after page refresh).

**Endpoint**: `GET /api/session/{sessionId}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-string",
    "userInput": "新年美食探店",
    "currentStage": 2,
    "selectedHook": {
      "id": "hook-2",
      "text": "花30块吃出300块的仪式感，这家店凭什么？"
    },
    "contentOutline": [
      {
        "id": "content-1",
        "title": "引入场景",
        "content": "详细内容...",
        "order": 1
      }
    ],
    "generatedScripts": null,  // null if not in stage 3
    "createdAt": "2025-01-05T10:00:00Z",
    "updatedAt": "2025-01-05T10:05:00Z"
  }
}
```

---

### 14. Go Back to Previous Stage

Go back to previous stage for modification.

**Endpoint**: `POST /api/session/{sessionId}/go-back`

**Request Body**:
```json
{
  "targetStage": 1  // 1 | 2
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-string",
    "currentStage": 1,
    "message": "已返回阶段1，可以重新选择金句"
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "message": "错误描述",
    "code": "ERROR_CODE"
  }
}
```

**Common Error Codes**:
- `SESSION_NOT_FOUND`: Session ID not found
- `INVALID_STAGE`: Invalid stage number or operation not allowed in current stage
- `HOOK_NOT_FOUND`: Hook ID not found
- `CONTENT_POINT_NOT_FOUND`: Content point ID not found
- `API_ERROR`: AI API call failed
- `TIMEOUT`: API request timeout
- `VALIDATION_ERROR`: Request validation failed

## Notes

1. All session data is persisted in database (SQLite for dev, can be upgraded for production)
2. Session state is automatically saved after each operation
3. Users can refresh the page and recover session state via GET /api/session/{sessionId}
4. Users can go back to previous stages to modify selections
5. Each stage maintains context from previous stages (hook visible in stage 2, hook + content visible in stage 3)

