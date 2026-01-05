# Tasks: TikTok Creator Insight Assistant MVP

**Input**: Design documents from `/specs/001-tiktok-creator-insight/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Manual testing for MVP phase (no automated tests required per plan.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project root structure (frontend/ and backend/ directories)
- [x] T002 [P] Initialize frontend project with Vite + React + TypeScript in frontend/
- [x] T002 [P] Initialize backend project with Express + TypeScript in backend/
- [x] T003 [P] Configure Tailwind CSS in frontend/tailwind.config.js
- [x] T004 [P] Configure TypeScript in frontend/tsconfig.json
- [x] T005 [P] Configure TypeScript in backend/tsconfig.json
- [x] T006 [P] Setup .gitignore with patterns for Node.js, frontend, and backend
- [x] T007 [P] Create frontend/.env.example with VITE_API_BASE_URL
- [x] T008 [P] Create backend/.env.example with BAILIAN_API_KEY, NODE_ENV, PORT, ENABLE_DATABASE

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Setup Express server structure in backend/src/server.ts
- [x] T010 [P] Create backend/src/middleware/error-handler.ts for error handling
- [x] T011 [P] Create backend/src/utils/logger.ts for logging utility
- [x] T012 [P] Configure environment variable loading with dotenv in backend/src/server.ts
- [x] T013 [P] Create backend/src/routes/api.ts with Express router setup
- [x] T014 [P] Create frontend/src/services/api.ts with Axios client setup
- [x] T015 [P] Create frontend/src/App.tsx with basic React app structure
- [x] T016 [P] Create frontend/src/main.tsx as entry point
- [x] T017 Setup CORS middleware in backend for frontend-backend communication

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 创意意图输入与识别 (Priority: P1) 🎯 MVP

**Goal**: Users can input their creative theme or target niche in Chinese or English, and the system recognizes and understands the creative intent.

**Independent Test**: User can input text, see it displayed, and submit it. System validates input and prepares for processing. Works independently without AI generation.

### Implementation for User Story 1

- [x] T018 [P] [US1] Create Input component in frontend/src/components/Input.tsx with text input field
- [x] T019 [P] [US1] Create ErrorMessage component in frontend/src/components/ErrorMessage.tsx for error display
- [x] T020 [US1] Implement input validation in frontend/src/components/Input.tsx (empty check, length 1-500 chars per FR-012)
- [x] T021 [US1] Add language detection/display in frontend/src/components/Input.tsx (support Chinese and English per FR-002)
- [x] T022 [US1] Implement submit button and form handling in frontend/src/components/Input.tsx
- [x] T023 [US1] Create API endpoint POST /api/generate in backend/src/routes/api.ts (accept prompt, validate input)
- [x] T024 [US1] Add input validation middleware in backend/src/routes/api.ts (empty check, length validation per FR-012)
- [x] T025 [US1] Integrate Input component into frontend/src/App.tsx
- [x] T026 [US1] Add error handling for empty input in frontend/src/components/Input.tsx (per Edge Case: 空输入处理)
- [x] T027 [US1] Add error handling for input too long (>500 chars) in frontend/src/components/Input.tsx (per Edge Case: 输入内容过长)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can input text, see validation, and submit. System is ready to process input.

---

## Phase 4: User Story 2 - 三阶段协作式创作流程 (Priority: P1) 🎯 MVP [新设计]

**Goal**: Users complete a three-stage collaborative creation process: Stage 1 (Hook Selection), Stage 2 (Content Development), Stage 3 (Script Conversion). Each stage supports iteration, refinement, and rollback.

**Independent Test**: User submits input, system creates session, guides user through three stages. Each stage can be tested independently. Session state persists across page refreshes.

### Phase 4.1: Session Management Foundation

- [ ] T028 [P] [US2] Install uuid package in backend/package.json for session IDs
- [ ] T029 [P] [US2] Update backend/src/utils/dev-db.ts to add creation_sessions table schema (per FR-047, FR-048)
- [ ] T030 [P] [US2] Create backend/src/models/session.ts for session data model and database operations
- [ ] T031 [US2] Implement createSession function in backend/src/models/session.ts (per FR-047)
- [ ] T032 [US2] Implement getSession function in backend/src/models/session.ts (per FR-048)
- [ ] T033 [US2] Implement updateSession function in backend/src/models/session.ts (per FR-048)
- [ ] T034 [US2] Create POST /api/session/create endpoint in backend/src/routes/session.ts (per contracts/three-stage-api.md)
- [ ] T035 [US2] Create GET /api/session/{id} endpoint in backend/src/routes/session.ts (per FR-048)
- [ ] T036 [P] [US2] Install zustand package in frontend/package.json for state management
- [ ] T037 [P] [US2] Create frontend/src/types/session.ts with TypeScript types (CreationSession, Hook, ContentPoint, etc.)
- [ ] T038 [P] [US2] Create frontend/src/stores/useSessionStore.ts with Zustand store (per plan.md)
- [ ] T039 [US2] Implement session creation in frontend/src/stores/useSessionStore.ts (createSession action)
- [ ] T040 [US2] Implement session loading in frontend/src/stores/useSessionStore.ts (loadSession action)
- [ ] T041 [US2] Create frontend/src/services/session.ts for session API calls
- [ ] T042 [US2] Create StageIndicator component in frontend/src/components/StageIndicator.tsx (show current stage progress)

**Checkpoint**: Session management foundation ready - sessions can be created, stored, and retrieved. Frontend state management ready.

### Phase 4.2: Stage 1 - Hook Selection (金句选择)

- [x] T043 [P] [US2] Create backend/src/services/stage1-hooks.ts for hook generation logic
- [x] T044 [US2] Implement generateHooks function in backend/src/services/stage1-hooks.ts (generate 3-5 hooks per FR-028)
- [x] T045 [US2] Implement refineHook function in backend/src/services/stage1-hooks.ts (per FR-030, FR-031)
- [x] T046 [US2] Create POST /api/session/{id}/stage1/generate-hooks endpoint in backend/src/routes/session.ts
- [x] T047 [US2] Create POST /api/session/{id}/stage1/replace-hooks endpoint in backend/src/routes/session.ts (per FR-029)
- [x] T048 [US2] Create POST /api/session/{id}/stage1/refine-hook endpoint in backend/src/routes/session.ts (per FR-030)
- [x] T049 [US2] Create POST /api/session/{id}/stage1/select-hook endpoint in backend/src/routes/session.ts (per FR-032)
- [x] T050 [P] [US2] Create frontend/src/components/Stage1/HookCard.tsx for displaying individual hooks
- [x] T051 [P] [US2] Create frontend/src/components/Stage1/HookSelector.tsx for hook selection interface
- [x] T052 [US2] Implement hook generation UI in frontend/src/components/Stage1/HookSelector.tsx (call API, display 3-5 hooks)
- [x] T053 [US2] Implement "替换" button in frontend/src/components/Stage1/HookSelector.tsx (per FR-029)
- [x] T054 [US2] Implement "微调" button in frontend/src/components/Stage1/HookSelector.tsx (per FR-030)
- [x] T055 [US2] Implement manual edit and "优化此句" in frontend/src/components/Stage1/HookSelector.tsx (per FR-031)
- [x] T056 [US2] Implement "继续创作内容" button in frontend/src/components/Stage1/HookSelector.tsx (per FR-032)
- [x] T057 [US2] Integrate Stage1 components into frontend/src/App.tsx (show when currentStage === 1)
- [x] T058 [US2] Add loading states for hook generation in frontend/src/components/Stage1/HookSelector.tsx

**Checkpoint**: Stage 1 fully functional - users can generate, replace, refine, and select hooks. Session state updated.

### Phase 4.3: Stage 2 - Content Development (内容创作)

- [x] T059 [P] [US2] Create backend/src/services/stage2-content.ts for content generation logic
- [x] T060 [US2] Implement generateContent function in backend/src/services/stage2-content.ts (generate 3 detailed points per FR-034, FR-040)
- [x] T061 [US2] Implement optimizeContent function in backend/src/services/stage2-content.ts (per FR-037) - Note: Removed batch optimize, users can optimize individual points
- [x] T062 [US2] Implement expandPoint function in backend/src/services/stage2-content.ts (per FR-038) - Enhanced: supports user instruction for direction
- [x] T063 [US2] Create POST /api/session/{id}/stage2/generate-content endpoint in backend/src/routes/session.ts
- [x] T064 [US2] Create PUT /api/session/{id}/stage2/content-point/{pointId} endpoint in backend/src/routes/session.ts (per FR-036)
- [x] T065 [US2] Create POST /api/session/{id}/stage2/optimize-content endpoint in backend/src/routes/session.ts (per FR-037) - Note: Endpoint exists but UI removed
- [x] T066 [US2] Create POST /api/session/{id}/stage2/expand-point endpoint in backend/src/routes/session.ts (per FR-038) - Enhanced: supports userInstruction parameter
- [x] T067 [US2] Create POST /api/session/{id}/stage2/confirm-content endpoint in backend/src/routes/session.ts (per FR-039)
- [x] T068 [P] [US2] Create frontend/src/components/Stage2/ContentPointCard.tsx for displaying content points
- [x] T069 [P] [US2] Create frontend/src/components/Stage2/ContentEditor.tsx for content editing interface
- [x] T070 [US2] Implement content generation UI in frontend/src/components/Stage2/ContentEditor.tsx (display selected hook, generate 3 points)
- [x] T071 [US2] Implement editable content points in frontend/src/components/Stage2/ContentEditor.tsx (per FR-036)
- [x] T072 [US2] Implement "优化内容" button in frontend/src/components/Stage2/ContentEditor.tsx (per FR-037) - Note: Removed batch optimize button, users can optimize individual points
- [x] T073 [US2] Implement "基于此要点展开" button in frontend/src/components/Stage2/ContentEditor.tsx (per FR-038) - Enhanced: "优化此要点" with optional user instruction, "进一步拓展" for default expansion
- [x] T074 [US2] Implement "内容满意，生成脚本" button in frontend/src/components/Stage2/ContentEditor.tsx (per FR-039)
- [x] T075 [US2] Integrate Stage2 components into frontend/src/App.tsx (show when currentStage === 2)
- [x] T076 [US2] Ensure selected hook is always visible in Stage2 UI (per FR-035)

**Checkpoint**: Stage 2 fully functional - users can generate, edit, optimize, and expand content points. Session state updated.

### Phase 4.4: Stage 3 - Script Conversion (脚本转换)

- [x] T077 [P] [US2] Create backend/src/services/stage3-scripts.ts for script generation logic
- [x] T078 [US2] Implement generateScripts function in backend/src/services/stage3-scripts.ts (generate 3 styles per FR-041, FR-042)
- [x] T079 [US2] Implement refineScript function in backend/src/services/stage3-scripts.ts (per FR-044)
- [x] T080 [US2] Ensure scripts include professional elements: emotional anchors, memory points, conflict design, info density (per FR-043)
- [x] T081 [US2] Create POST /api/session/{id}/stage3/generate-scripts endpoint in backend/src/routes/session.ts
- [x] T082 [US2] Create POST /api/session/{id}/stage3/refine-script endpoint in backend/src/routes/session.ts (per FR-044)
- [x] T083 [US2] Update frontend/src/components/ScriptCard.tsx to display professional elements (per FR-043, FR-045)
- [x] T084 [US2] Implement "优化此脚本" button in frontend/src/components/ScriptCard.tsx (per FR-044)
- [x] T085 [US2] Ensure "一键复制" works in enhanced ScriptCard (per FR-010)
- [x] T086 [US2] Integrate Stage3 components into frontend/src/App.tsx (show when currentStage === 3)
- [x] T087 [US2] Ensure hook and content outline are visible in Stage3 UI (per FR-046)
- [x] T088 [US2] Display 3 script cards in Stage3 (per FR-042)

**Checkpoint**: Stage 3 fully functional - users can generate 3 script styles with professional elements, refine, and copy.

### Phase 4.5: Stage Navigation & Session Recovery

- [x] T089 [US2] Create POST /api/session/{id}/go-back endpoint in backend/src/routes/session.ts (per FR-049)
- [x] T090 [US2] Implement "返回上一阶段" button in frontend (add to Stage2 and Stage3 components)
- [x] T091 [US2] Implement session recovery on page load in frontend/src/App.tsx (check localStorage for sessionId, load session per FR-048)
- [x] T092 [US2] Store sessionId in localStorage in frontend/src/stores/useSessionStore.ts
- [x] T093 [US2] Implement stage navigation logic in frontend/src/stores/useSessionStore.ts (goToStage, goBack actions)
- [x] T094 [US2] Add error handling for session not found (404) in frontend (prompt user to create new session)
- [x] T095 [US2] Add error handling for invalid stage operations (400) in frontend (show friendly error message)

**Checkpoint**: Complete three-stage flow with navigation and session recovery. Users can go back, refresh, and resume sessions.

**Note**: Legacy one-shot generation (old T028-T046) is deprecated but kept for reference. New three-stage flow replaces it.

---

## Phase 5: User Story 3 - Hashtag与音乐风格建议生成 (Priority: P2)

**Goal**: System generates 5-10 high-potential Hashtag tags and background music style description suggestions based on user input.

**Independent Test**: User submits input, system generates Hashtag and music suggestions, displays as separate cards. Works independently even if script generation fails.

### Implementation for User Story 3

- [x] T047 [P] [US3] Create HashtagCard component in frontend/src/components/HashtagCard.tsx for displaying hashtags
- [x] T048 [P] [US3] Create MusicCard component in frontend/src/components/MusicCard.tsx for displaying music style
- [x] T049 [US3] Extend prompt construction in backend/src/services/generator.ts to include hashtag generation (5-10 hashtags per FR-005)
- [x] T050 [US3] Extend prompt construction in backend/src/services/generator.ts to include music style generation (per FR-006)
- [x] T051 [US3] Extend response parsing in backend/src/services/generator.ts to extract hashtags (5-10 items per SC-005)
- [x] T052 [US3] Extend response parsing in backend/src/services/generator.ts to extract music style (text description only per FR-006)
- [x] T053 [US3] Update POST /api/generate response in backend/src/routes/api.ts to include hashtags and musicStyle
- [x] T054 [US3] Display HashtagCard in frontend/src/App.tsx after API response (5-10 hashtags per FR-005)
- [x] T055 [US3] Display MusicCard in frontend/src/App.tsx after API response (per FR-006)
- [x] T056 [US3] Implement "一键复制" button in frontend/src/components/HashtagCard.tsx (per FR-010)
- [x] T057 [US3] Add copy success notification in frontend/src/components/HashtagCard.tsx (per FR-011)
- [x] T058 [US3] Handle partial failure case in frontend/src/App.tsx (show successful parts if hashtag/music fails per Edge Case: 部分内容生成失败)

**Checkpoint**: At this point, User Story 3 should be fully functional - users get hashtags and music suggestions along with scripts. Complete feature set delivered.

---

## Phase 6: Database - Session Persistence (Required for MVP)

**Purpose**: SQLite database for session persistence (required per FR-047, FR-048). Also supports optional API logging for development.

**⚠️ IMPORTANT**: Session persistence is REQUIRED for the three-stage flow. Database is no longer optional for MVP.

- [x] T096 [P] Install sqlite3 package in backend/package.json
- [x] T097 [P] Create backend/src/utils/dev-db.ts for SQLite database utility
- [x] T098 [P] Implement database initialization in backend/src/utils/dev-db.ts (create tables if not exists)
- [ ] T099 [P] Add creation_sessions table schema to backend/src/utils/dev-db.ts (per plan.md Database Schema)
- [ ] T100 [P] Ensure creation_sessions table includes: id, user_input, current_stage, selected_hook, content_outline, generated_scripts, created_at, updated_at, interaction_history
- [x] T101 [P] Implement logRequest function in backend/src/utils/dev-db.ts (per FR-018, optional for API logging)
- [x] T102 [P] Implement getRecentLogs function in backend/src/utils/dev-db.ts for querying logs (optional)
- [x] T103 [P] Create backend/src/middleware/api-logger.ts for API logging middleware (optional)
- [x] T104 [P] Add environment variable check (ENABLE_DATABASE) in backend/src/utils/dev-db.ts (per FR-017)
- [x] T105 [P] Add try-catch wrapper in backend/src/middleware/api-logger.ts (per FR-021)
- [x] T106 [P] Make database logging async in backend/src/middleware/api-logger.ts (per FR-022)
- [x] T107 [P] Add database availability check on startup in backend/src/server.ts (per FR-023)
- [x] T108 [P] Integrate api-logger middleware into backend/src/routes/api.ts (only if ENABLE_DATABASE=true, optional)
- [x] T109 [P] Add .gitignore entry for dev-debug.db and *.db files
- [x] T110 [P] Create GET /api/dev/logs endpoint in backend/src/routes/api.ts (development only, optional)

**Note**: 
- Session persistence (creation_sessions table) is REQUIRED for MVP
- API logging (api_logs table) is optional for development debugging
- Database initialization must happen before Phase 4.1 (Session Management Foundation)

---

## Phase 7: User Story 3 - Hashtag与音乐风格建议生成 (Priority: P2) [调整]

**Goal**: System generates 5-10 high-potential Hashtag tags and background music style description suggestions. Can be generated after Stage 3 completion.

**Independent Test**: After Stage 3 completion, system generates Hashtag and music suggestions, displays as separate cards. Works independently even if script generation fails.

### Implementation for User Story 3 (Updated for Three-Stage Flow)

- [x] T111 [P] [US3] Create HashtagCard component in frontend/src/components/HashtagCard.tsx for displaying hashtags
- [x] T112 [P] [US3] Create MusicCard component in frontend/src/components/MusicCard.tsx for displaying music style
- [x] T113 [US3] Create POST /api/session/{id}/generate-suggestions endpoint in backend/src/routes/session.ts (generate hashtags and music after Stage 3)
- [x] T114 [US3] Implement generateHashtags function in backend/src/services/stage3-scripts.ts or separate service (5-10 hashtags per FR-005)
- [x] T115 [US3] Implement generateMusicStyle function in backend/src/services/stage3-scripts.ts or separate service (per FR-006)
- [x] T116 [US3] Display HashtagCard in frontend/src/components/Stage3/ScriptGenerator.tsx after Stage 3 completion (5-10 hashtags per FR-005)
- [x] T117 [US3] Display MusicCard in frontend/src/components/Stage3/ScriptGenerator.tsx after Stage 3 completion (per FR-006)
- [x] T118 [US3] Implement "一键复制" button in frontend/src/components/HashtagCard.tsx (per FR-010)
- [x] T119 [US3] Add copy success notification in frontend/src/components/HashtagCard.tsx (per FR-011)
- [x] T120 [US3] Handle partial failure case in backend and frontend (show successful parts if hashtag/music fails per Edge Case: 部分内容生成失败)

**Checkpoint**: At this point, User Story 3 should be fully functional - users get hashtags and music suggestions after completing three-stage flow. Complete feature set delivered.

---

## Phase 7.5: Prompt Engineering Refactoring (优先级：高)

**Goal**: 重构三个阶段的Prompt，生成更贴合场景、更专业的内容。

**Purpose**: 提升AI生成内容的质量和专业度，使生成的内容更符合短视频创作的最佳实践。

### Implementation for Prompt Refactoring

- [x] T133 [P] [Prompt] 创建 prompts.md 规范文档，记录三个阶段的Prompt重构需求
- [x] T134 [Prompt] 重构 Stage 1 Hook Selection Prompt (backend/src/services/stage1-hooks.ts)
  - [x] 明确角色定位（金句创作专家/大师）
  - [x] 添加场景化要求（不同赛道/主题的差异化）
  - [x] 明确专业标准（3秒法则、情绪触发、记忆点）
  - [x] 优化输出格式要求
- [x] T135 [Prompt] 重构 Stage 2 Content Development Prompt (backend/src/services/stage2-content.ts)
  - [x] 明确结构化框架（引入→展开→升华）
  - [x] 添加场景化描述要求（具体场景、画面、动作）
  - [x] 明确情感层次设计
  - [x] 添加可拍摄性要求
- [x] T136 [Prompt] 重构 Stage 3 Script Conversion Prompt (backend/src/services/stage3-scripts.ts)
  - [x] 细化专业元素定义（情绪锚点、记忆点、冲突设计、信息密度）
  - [x] 明确三种脚本风格的差异化要求
  - [x] 添加可执行性要求（时间分配、镜头语言、动作指导）
  - [x] 参考行业最佳实践
- [ ] T137 [P] [Prompt] 收集不同赛道的优秀案例和最佳实践
- [ ] T138 [P] [Prompt] 测试和对比新旧Prompt的效果
- [ ] T139 [P] [Prompt] 更新 prompts.md 文档，记录最终Prompt版本

**Checkpoint**: Prompt重构完成，生成的内容质量显著提升，更贴合场景、更专业。

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T121 [P] Add responsive design to all card components (mobile and desktop per SC-009)
- [x] T122 [P] Add special character handling in backend/src/services/stage1-hooks.ts, stage2-content.ts, stage3-scripts.ts (per Edge Case: 特殊字符处理)
- [x] T123 [P] Add multi-language mixed input support in all stage services (per Edge Case: 多语言混合输入)
- [x] T124 [P] Add input sanitization in backend/src/routes/session.ts before API calls (per Constitution Security)
- [x] T125 [P] Add response validation in frontend/src/services/session.ts before rendering (per Constitution Security)
- [ ] T126 [P] Optimize API response time (target <15 seconds per SC-002)
- [x] T127 [P] Add GET /api/health endpoint in backend/src/routes/api.ts
- [x] T128 [P] Update README.md with setup instructions for three-stage flow
- [ ] T129 [P] Run quickstart.md validation scenarios (update for three-stage flow)
- [ ] T130 [P] Code cleanup and refactoring
- [x] T131 [P] Add error message improvements (ensure no technical details exposed per Constitution Security)
- [ ] T132 [P] Add session cleanup mechanism (optional: clean up old sessions after X days)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 - Three-Stage Flow (Phase 4)**: 
  - Depends on User Story 1 (needs input component)
  - Depends on Phase 6.1 (Session table must exist)
  - Phase 4.1 (Session Foundation) must complete before Phase 4.2-4.5
  - Phase 4.2 (Stage 1) must complete before Phase 4.3 (Stage 2)
  - Phase 4.3 (Stage 2) must complete before Phase 4.4 (Stage 3)
  - Phase 4.5 (Navigation) can be done in parallel with Phase 4.2-4.4
- **Database - Session Persistence (Phase 6)**: 
  - Session table (T099-T100) MUST complete before Phase 4.1
  - API logging tasks can be done in parallel or after
- **User Story 3 (Phase 7)**: Depends on Phase 4.4 (Stage 3) completion
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 - Three-Stage (P1)**: 
  - Depends on User Story 1 (uses Input component)
  - Depends on Phase 6 session table (T099-T100)
  - Internal dependencies: 4.1 → 4.2 → 4.3 → 4.4, 4.5 can be parallel
- **User Story 3 (P2)**: Depends on User Story 2 Stage 3 completion (generates suggestions after scripts)

### Within Each User Story

- Components before integration
- Services before endpoints
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Components within a story marked [P] can be created in parallel
- Optional Database tasks (Phase 6) can all run in parallel
- Polish tasks (Phase 7) can all run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all components for User Story 2 together:
Task: "Create Loading component in frontend/src/components/Loading.tsx"
Task: "Create ScriptCard component in frontend/src/components/ScriptCard.tsx"
Task: "Create backend/src/services/bailian.ts for Alibaba Cloud Bailian API integration"

# These can run in parallel as they touch different files
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Input functionality)
4. Complete Phase 4: User Story 2 (AI Script Generation)
5. **STOP and VALIDATE**: Test User Stories 1 & 2 independently
6. Deploy/demo if ready (Core MVP delivered)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Input works
3. Add User Story 2 → Test independently → Script generation works (MVP!)
4. Add User Story 3 → Test independently → Complete feature set
5. Add Optional Database → Development debugging enabled
6. Add Polish → Production ready

### Task Summary

- **Total Tasks**: 132 tasks (updated for three-stage flow)
- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 9 tasks
- **Phase 3 (User Story 1)**: 10 tasks
- **Phase 4 (User Story 2 - Three-Stage)**: 68 tasks
  - Phase 4.1 (Session Foundation): 15 tasks
  - Phase 4.2 (Stage 1 - Hooks): 16 tasks
  - Phase 4.3 (Stage 2 - Content): 18 tasks
  - Phase 4.4 (Stage 3 - Scripts): 12 tasks
  - Phase 4.5 (Navigation & Recovery): 7 tasks
- **Phase 6 (Database - Session Persistence)**: 15 tasks (T096-T110, session table required)
- **Phase 7 (User Story 3)**: 10 tasks (updated)
- **Phase 8 (Polish)**: 12 tasks

### MVP Scope Recommendation

**Minimum MVP**: Phases 1, 2, 3, 4, 6 (User Stories 1 & 2 with three-stage flow)
- Total: 110 tasks (including session persistence)
- Delivers: Input + Three-Stage Collaborative Creation (Hooks → Content → Scripts)
- Core value proposition achieved with improved quality and user engagement

**Complete MVP**: Phases 1-4, 6-7 (All User Stories)
- Total: 120 tasks
- Delivers: Input + Three-Stage Flow + Hashtags + Music
- Full feature set with enhanced collaborative creation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Optional Database (Phase 6) can be skipped for MVP if not needed
- All tasks include exact file paths for clarity

