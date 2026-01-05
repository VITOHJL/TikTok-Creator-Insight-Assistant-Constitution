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

## Phase 4: User Story 2 - AI生成短视频脚本大纲 (Priority: P1) 🎯 MVP

**Goal**: System calls AI model to generate 3 different styles of video script outlines and displays them as cards to users.

**Independent Test**: User submits input, system calls AI API, returns 3 script outlines, displays as cards. Works independently even without Hashtag and music suggestions.

### Implementation for User Story 2

- [x] T028 [P] [US2] Create Loading component in frontend/src/components/Loading.tsx with loading indicator
- [x] T029 [P] [US2] Create ScriptCard component in frontend/src/components/ScriptCard.tsx for displaying script outlines
- [x] T030 [P] [US2] Create backend/src/services/bailian.ts for Alibaba Cloud Bailian API integration
- [x] T031 [US2] Implement API key loading from environment variables in backend/src/services/bailian.ts (per FR-014)
- [x] T032 [US2] Implement callBailianAPI function in backend/src/services/bailian.ts with axios (per FR-013)
- [x] T033 [US2] Create backend/src/services/generator.ts for content generation logic
- [x] T034 [US2] Implement prompt construction for script generation in backend/src/services/generator.ts (generate 3 different styles per FR-004)
- [x] T035 [US2] Implement response parsing in backend/src/services/generator.ts (extract 3 scripts with ≥3 points each per SC-004)
- [x] T036 [US2] Add timeout handling (30 seconds) in backend/src/services/bailian.ts (per Edge Case: API响应超时)
- [x] T037 [US2] Add retry logic for transient failures in backend/src/services/bailian.ts (per Constitution V)
- [x] T038 [US2] Integrate generator service into POST /api/generate endpoint in backend/src/routes/api.ts
- [x] T039 [US2] Add error handling for API failures in backend/src/routes/api.ts (per FR-009, Edge Case: API调用失败)
- [x] T040 [US2] Create frontend/src/services/api.ts function generate() to call backend API
- [x] T041 [US2] Add loading state management in frontend/src/App.tsx (show Loading component during API call per FR-008)
- [x] T042 [US2] Display script cards in frontend/src/App.tsx after API response (3 cards per FR-004)
- [x] T043 [US2] Implement "一键复制" button in frontend/src/components/ScriptCard.tsx (per FR-010)
- [x] T044 [US2] Add copy success notification in frontend/src/components/ScriptCard.tsx (per FR-011)
- [x] T045 [US2] Add error display in frontend/src/App.tsx when API fails (use ErrorMessage component per FR-009)
- [x] T046 [US2] Add retry button in ErrorMessage component for failed requests (per Edge Case: API调用失败)

**Checkpoint**: At this point, User Story 2 should be fully functional - users can submit input, see loading, get 3 script outlines as cards, and copy them. Core MVP value delivered.

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

## Phase 6: Optional Database (Development Tooling)

**Purpose**: Optional SQLite database for development debugging (per FR-015-FR-023)

- [x] T059 [P] Install sqlite3 package in backend/package.json
- [x] T060 [P] Create backend/src/utils/dev-db.ts for SQLite database utility
- [x] T061 [P] Implement database initialization in backend/src/utils/dev-db.ts (create table if not exists)
- [x] T062 [P] Implement logRequest function in backend/src/utils/dev-db.ts (per FR-018)
- [x] T063 [P] Implement getRecentLogs function in backend/src/utils/dev-db.ts for querying logs
- [x] T064 [P] Create backend/src/middleware/api-logger.ts for API logging middleware
- [x] T065 [P] Add environment variable check (ENABLE_DATABASE) in backend/src/utils/dev-db.ts (per FR-017)
- [x] T066 [P] Add try-catch wrapper in backend/src/middleware/api-logger.ts (per FR-021)
- [x] T067 [P] Make database logging async in backend/src/middleware/api-logger.ts (per FR-022)
- [x] T068 [P] Add database availability check on startup in backend/src/server.ts (per FR-023)
- [x] T069 [P] Integrate api-logger middleware into backend/src/routes/api.ts (only if ENABLE_DATABASE=true)
- [x] T070 [P] Add .gitignore entry for dev-debug.db and *.db files
- [x] T071 [P] Create GET /api/dev/logs endpoint in backend/src/routes/api.ts (development only, for viewing logs)

**Note**: All database tasks completed. Added prompt_version field for tracking prompt improvements.

**Note**: All database tasks are optional and marked [P] - can be implemented in parallel or skipped if not needed for MVP.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T072 [P] Add responsive design to all card components (mobile and desktop per SC-009)
- [ ] T073 [P] Add special character handling in backend/src/services/generator.ts (per Edge Case: 特殊字符处理)
- [ ] T074 [P] Add multi-language mixed input support in backend/src/services/generator.ts (per Edge Case: 多语言混合输入)
- [ ] T075 [P] Add input sanitization in backend/src/routes/api.ts before API calls (per Constitution Security)
- [ ] T076 [P] Add response validation in frontend/src/services/api.ts before rendering (per Constitution Security)
- [ ] T077 [P] Optimize API response time (target <15 seconds per SC-002)
- [ ] T078 [P] Add GET /api/health endpoint in backend/src/routes/api.ts
- [ ] T079 [P] Update README.md with setup instructions
- [ ] T080 [P] Run quickstart.md validation scenarios
- [ ] T081 [P] Code cleanup and refactoring
- [ ] T082 [P] Add error message improvements (ensure no technical details exposed per Constitution Security)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start immediately after Foundational
  - User Story 2 (P1): Depends on User Story 1 (needs input component)
  - User Story 3 (P2): Depends on User Story 2 (extends same API endpoint)
- **Optional Database (Phase 6)**: Can be done in parallel with user stories or after
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on User Story 1 (uses Input component and API endpoint)
- **User Story 3 (P2)**: Depends on User Story 2 (extends same API endpoint and response structure)

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

- **Total Tasks**: 82 tasks
- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 9 tasks
- **Phase 3 (User Story 1)**: 10 tasks
- **Phase 4 (User Story 2)**: 19 tasks
- **Phase 5 (User Story 3)**: 12 tasks
- **Phase 6 (Optional Database)**: 13 tasks
- **Phase 7 (Polish)**: 11 tasks

### MVP Scope Recommendation

**Minimum MVP**: Phases 1, 2, 3, 4 (User Stories 1 & 2)
- Total: 46 tasks
- Delivers: Input + AI Script Generation
- Core value proposition achieved

**Complete MVP**: Phases 1-5 (All User Stories)
- Total: 58 tasks
- Delivers: Input + Scripts + Hashtags + Music
- Full feature set

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Optional Database (Phase 6) can be skipped for MVP if not needed
- All tasks include exact file paths for clarity

