# Implementation Plan: TikTok Creator Insight Assistant MVP

**Branch**: `001-tiktok-creator-insight` | **Date**: 2025-01-27 | **Updated**: 2025-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-tiktok-creator-insight/spec.md`

## Summary

构建一个TikTok Creator Insight Assistant MVP，帮助短视频创作者将创意意图转化为结构化脚本大纲与趋势洞察。**核心设计：三阶段协作式创作流程**，通过阶段1（金句选择）、阶段2（内容创作）、阶段3（脚本转换）逐步收敛用户意图，提升生成质量和用户参与度。系统采用React + TypeScript前端和Node.js + Express后端架构，集成阿里云百炼API，支持会话状态持久化和阶段回退。数据库采用可选模式，开发环境使用SQLite记录API日志和会话状态，生产环境可禁用。

## Technical Context

**Language/Version**: 
- Frontend: TypeScript 5.x, React 18+
- Backend: Node.js 18+, TypeScript 5.x

**Primary Dependencies**: 
- Frontend: React, React DOM, Vite, Tailwind CSS, Axios, Zustand (recommended for session state)
- Backend: Express, TypeScript, Axios, dotenv, sqlite3 (required for session persistence), uuid (for session IDs)

**Storage**: 
- SQLite (required for session persistence in MVP)
- Session state: creation_sessions table
- API logs: api_logs table (optional, development only)
- No persistent storage for product features beyond session state (MVP)

**Testing**: 
- Frontend: Vitest or Jest (optional for MVP)
- Backend: Jest or Mocha (optional for MVP)
- Manual testing for MVP phase

**Target Platform**: 
- Web browsers (desktop and mobile responsive)
- Node.js server environment

**Project Type**: Web application (frontend + backend)

**Performance Goals**: 
- API response time: <15 seconds (per SC-002)
- User input flow completion: <30 seconds (per SC-001)
- API success rate: 90% (per SC-003)
- Copy operation: <5 seconds (per SC-006)

**Constraints**: 
- Session state must be persisted (required for three-stage flow)
- API key must be stored in environment variables
- Must handle API failures gracefully
- Must support Chinese and English input
- Responsive design for mobile and desktop
- Must support stage navigation (forward and backward)
- Must support session recovery after page refresh

**Scale/Scope**: 
- MVP scope: Single user, anonymous usage
- No user authentication required
- Session state persistence required (for three-stage flow)
- Development debugging: SQLite logs (optional)
- Session data: Stored in SQLite, can be cleaned up periodically

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

✅ **I. Spec-Driven Development**: 
- Complete spec.md exists with user stories, requirements, and success criteria
- All requirements are technology-agnostic
- Edge cases identified

✅ **II. AI-Native Development Tooling**: 
- Will use Cursor for code generation
- All implementation will be AI-assisted

✅ **III. API Integration Standards**: 
- Alibaba Cloud Bailian API specified
- DeepSeek-V3/R1 or Qwen-Max models specified
- Environment variable management for API keys

✅ **IV. MVP-First Approach**: 
- User stories prioritized (P1, P2)
- Independent testability ensured
- YAGNI principles followed

✅ **V. Code Quality & Testing**: 
- Error handling requirements specified
- Loading states required
- Timeout and retry logic required

**GATE STATUS**: ✅ PASS - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-tiktok-creator-insight/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Main specification document
├── data-model.md        # Data model definitions (updated for three-stage)
├── contracts/           # API contract specifications
│   ├── api-spec.json    # OpenAPI specification (legacy, one-shot generation)
│   ├── frontend-api.md  # Frontend API contract (legacy)
│   └── three-stage-api.md # Three-stage API contract (current, 14 endpoints)
├── 5_SPEC更新说明-三阶段交互方案.md  # Design change documentation
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── Input.tsx        # User input component (stage 0)
│   │   ├── StageIndicator.tsx # Stage progress indicator
│   │   ├── Stage1/          # Stage 1 components
│   │   │   ├── HookCard.tsx # Hook display card
│   │   │   └── HookSelector.tsx # Hook selection interface
│   │   ├── Stage2/           # Stage 2 components
│   │   │   ├── ContentPointCard.tsx # Content point card
│   │   │   └── ContentEditor.tsx # Content editing interface
│   │   ├── Stage3/           # Stage 3 components
│   │   │   └── ScriptCard.tsx # Script display card (enhanced)
│   │   ├── HashtagCard.tsx   # Hashtag display card
│   │   ├── MusicCard.tsx     # Music style card
│   │   ├── Loading.tsx       # Loading indicator
│   │   └── ErrorMessage.tsx  # Error display
│   ├── services/             # API services
│   │   ├── api.ts           # API client (three-stage endpoints)
│   │   └── session.ts       # Session management service
│   ├── stores/              # State management
│   │   └── useSessionStore.ts # Zustand store for session state
│   ├── types/               # TypeScript types
│   │   └── session.ts      # Session-related types
│   ├── App.tsx              # Main app component (three-stage flow)
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js

backend/
├── src/
│   ├── routes/              # Express routes
│   │   ├── api.ts          # Legacy API routes (deprecated)
│   │   └── session.ts      # Three-stage session routes
│   ├── services/            # Business logic
│   │   ├── bailian.ts      # Alibaba Cloud Bailian API service
│   │   ├── generator.ts    # Legacy generator (deprecated)
│   │   ├── stage1-hooks.ts # Stage 1: Hook generation
│   │   ├── stage2-content.ts # Stage 2: Content generation
│   │   └── stage3-scripts.ts # Stage 3: Script generation
│   ├── models/              # Data models
│   │   └── session.ts      # Session model and database operations
│   ├── utils/               # Utility functions
│   │   ├── dev-db.ts       # SQLite database (required for sessions)
│   │   └── logger.ts       # Logging utility
│   ├── middleware/          # Express middleware
│   │   ├── error-handler.ts
│   │   └── api-logger.ts   # API logging (optional)
│   └── server.ts           # Express server
├── package.json
├── tsconfig.json
├── .env.example
└── .env                     # Not in version control

.gitignore
README.md
```

**Structure Decision**: 
- Web application structure (frontend + backend)
- Frontend: React + Vite + Tailwind CSS + Zustand (for session state)
- Backend: Express + TypeScript
- SQLite database required for session persistence (MVP requirement)
- Optional SQLite logging for development debugging
- Three-stage component organization (Stage1/, Stage2/, Stage3/)
- Session-based API design (14 new endpoints)

## Three-Stage Implementation Strategy

### Architecture Overview

**Three-Stage Flow**:
1. **Stage 1: Hook Selection** - Generate 3-5 hooks, user selects/refines
2. **Stage 2: Content Development** - Generate 3 detailed content points, user edits/optimizes
3. **Stage 3: Script Conversion** - Generate 3 script styles with professional elements

**Key Technical Decisions**:

1. **Session Management**
   - Use UUID for session IDs
   - Store session state in SQLite `creation_sessions` table
   - Support session recovery via `GET /api/session/{id}`
   - Auto-save after each operation

2. **State Management**
   - Frontend: Zustand store for session state
   - Backend: Session model with database persistence
   - State includes: currentStage, selectedHook, contentOutline, generatedScripts

3. **API Design**
   - 14 new endpoints for three-stage flow
   - RESTful design with clear stage separation
   - Each stage has: generate, refine, confirm operations
   - Support for going back to previous stages

4. **Prompt Engineering**
   - Stage 1: Focus on emotional hooks and attention-grabbing
   - Stage 2: Detailed content with scenes, emotions, details
   - Stage 3: Professional script elements (emotional anchors, memory points, conflict design)

5. **Component Organization**
   - Frontend: Separate folders for each stage (Stage1/, Stage2/, Stage3/)
   - Backend: Separate services for each stage (stage1-hooks.ts, stage2-content.ts, stage3-scripts.ts)
   - Shared components: StageIndicator, Loading, ErrorMessage

### Implementation Phases

**Phase 1: Foundation**
- Session model and database schema
- Basic session API (create, get)
- Frontend session store setup

**Phase 2: Stage 1 Implementation**
- Hook generation service
- Hook selection UI
- Hook refinement logic
- Stage 1 API endpoints

**Phase 3: Stage 2 Implementation**
- Content generation service
- Content editing UI
- Content optimization logic
- Stage 2 API endpoints

**Phase 4: Stage 3 Implementation**
- Script generation service (enhanced with professional elements)
- Script display UI (enhanced ScriptCard)
- Script refinement logic
- Stage 3 API endpoints

**Phase 5: Integration & Polish**
- Stage navigation (forward/backward)
- Session recovery
- Error handling
- UI/UX polish

### Database Schema

**creation_sessions table**:
```sql
CREATE TABLE creation_sessions (
  id TEXT PRIMARY KEY,
  user_input TEXT NOT NULL,
  current_stage INTEGER NOT NULL,
  hooks TEXT,  -- JSON array of Hook (for stage 1 recovery)
  selected_hook TEXT,  -- JSON
  content_outline TEXT,  -- JSON
  generated_scripts TEXT,  -- JSON
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  interaction_history TEXT  -- JSON
);
```

### API Endpoint Summary

> **详细 API 规范请参考**: [`contracts/three-stage-api.md`](./contracts/three-stage-api.md)

**Session Management**:
- `POST /api/session/create` - Create new session
- `GET /api/session/{id}` - Get session state
- `POST /api/session/{id}/go-back` - Go back to previous stage

**Stage 1 (Hooks)**:
- `POST /api/session/{id}/stage1/generate-hooks` - Generate hooks
- `POST /api/session/{id}/stage1/replace-hooks` - Replace hooks
- `POST /api/session/{id}/stage1/refine-hook` - Refine hook
- `POST /api/session/{id}/stage1/select-hook` - Select hook

**Stage 2 (Content)**:
- `POST /api/session/{id}/stage2/generate-content` - Generate content
- `PUT /api/session/{id}/stage2/content-point/{pointId}` - Update point
- `POST /api/session/{id}/stage2/optimize-content` - Optimize content
- `POST /api/session/{id}/stage2/expand-point` - Expand point
- `POST /api/session/{id}/stage2/confirm-content` - Confirm content

**Stage 3 (Scripts)**:
- `POST /api/session/{id}/stage3/generate-scripts` - Generate scripts
- `POST /api/session/{id}/stage3/refine-script` - Refine script

### Frontend State Management

**Zustand Store Structure**:
```typescript
interface SessionStore {
  sessionId: string | null;
  currentStage: 1 | 2 | 3;
  userInput: string;
  selectedHook: Hook | null;
  contentOutline: ContentPoint[];
  generatedScripts: ScriptOutline[];
  
  // Actions
  createSession: (userInput: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  goToStage: (stage: 1 | 2 | 3) => void;
  goBack: () => void;
  // ... stage-specific actions
}
```

### Error Handling Strategy

1. **Session Not Found**: Return 404, prompt user to create new session
2. **Invalid Stage Operation**: Return 400, show friendly error message
3. **API Failures**: Show retry option, maintain session state
4. **Network Errors**: Show offline message, allow session recovery

### Performance Considerations

1. **Session Loading**: Cache session state in Zustand store
2. **API Calls**: Debounce refinement requests
3. **Database Queries**: Index session ID and timestamps
4. **State Updates**: Optimistic UI updates where possible

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Complexity Justification**:

1. **Session Persistence Required**: 
   - **Justification**: Three-stage flow requires state persistence for user experience (refresh recovery, stage navigation)
   - **Impact**: SQLite database becomes required (not optional) for MVP
   - **Mitigation**: Use simple SQLite schema, can be upgraded to PostgreSQL later

2. **Increased API Complexity**:
   - **Justification**: 14 endpoints needed for three-stage flow (vs 1 endpoint in original design)
   - **Impact**: More code to maintain, more testing needed
   - **Mitigation**: Clear separation of concerns, well-documented API

3. **Frontend State Management**:
   - **Justification**: Complex session state with multiple stages and navigation
   - **Impact**: Need Zustand or similar state management library
   - **Mitigation**: Use lightweight Zustand, clear state structure

**All complexity is justified by the three-stage collaborative design, which significantly improves script generation quality and user engagement.**
