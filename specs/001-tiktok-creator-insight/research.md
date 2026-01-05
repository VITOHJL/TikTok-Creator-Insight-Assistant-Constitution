# Research: TikTok Creator Insight Assistant MVP

**Date**: 2025-01-27  
**Feature**: 001-tiktok-creator-insight

## Technology Decisions

### Frontend Framework: React + TypeScript

**Decision**: Use React 18+ with TypeScript 5.x

**Rationale**:
- Developer familiarity with React
- TypeScript provides type safety for AI-generated code
- Large ecosystem and community support
- Excellent AI code generation support in Cursor

**Alternatives Considered**:
- Vue 3: Also good option, but developer less familiar
- Plain JavaScript: Lacks type safety, harder for AI to generate accurate code

### Build Tool: Vite

**Decision**: Use Vite for frontend build and development

**Rationale**:
- Fast development server
- Modern build tool with excellent TypeScript support
- Simple configuration
- Better than Create React App (deprecated)

**Alternatives Considered**:
- Create React App: Deprecated, not recommended
- Webpack: More complex, slower

### Styling: Tailwind CSS

**Decision**: Use Tailwind CSS for styling

**Rationale**:
- Perfect for card-based layouts (per spec requirement)
- Utility-first approach, fast development
- Responsive design built-in
- Developer familiarity

**Alternatives Considered**:
- CSS Modules: More verbose, slower development
- Styled Components: Adds runtime overhead

### State Management: React Context (Optional Zustand)

**Decision**: Start with React Context, optionally use Zustand if needed

**Rationale**:
- MVP scope is simple, Context is sufficient
- Zustand can be added later if state becomes complex
- Follows YAGNI principle

**Alternatives Considered**:
- Redux: Overkill for MVP
- Zustand from start: Unnecessary complexity for MVP

### Backend Framework: Express + TypeScript

**Decision**: Use Express with TypeScript

**Rationale**:
- Lightweight, perfect for MVP
- Unified JavaScript/TypeScript stack
- Excellent middleware ecosystem
- Easy to deploy

**Alternatives Considered**:
- FastAPI (Python): Would require Python stack, violates tech stack decision
- NestJS: More complex, overkill for MVP

### API Client: Axios

**Decision**: Use Axios for HTTP requests

**Rationale**:
- Works in both frontend and backend
- Better error handling than fetch
- Interceptor support for logging
- Widely used, well-documented

**Alternatives Considered**:
- Fetch API: Native but less features
- node-fetch: Backend only, less consistent

### Database: SQLite (Optional)

**Decision**: Use SQLite for development debugging, optional in production

**Rationale**:
- Lightweight, no server required
- Perfect for development logging
- Can be easily disabled
- Follows optional database pattern from spec

**Alternatives Considered**:
- PostgreSQL: Overkill for MVP, requires server
- No database: Would make debugging harder

### Alibaba Cloud Bailian API Integration

**Decision**: Use Alibaba Cloud Bailian API with DeepSeek-V3 or Qwen-Max

**Rationale**:
- Required by spec (FR-013)
- DeepSeek-V3 and Qwen-Max are recommended models
- RESTful API, easy to integrate with Node.js

**API Endpoint Research**:
- Base URL: `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`
- Authentication: Bearer token in Authorization header
- Request format: JSON with model name and input prompt
- Response format: JSON with generated text

**Key Considerations**:
- API key must be stored in environment variables
- Need to handle rate limits and timeouts
- Error responses must be handled gracefully
- Response parsing for structured output (scripts, hashtags, music)

**Alternatives Considered**:
- OpenAI API: Not specified in requirements
- Local LLM: Would require significant infrastructure

## Integration Patterns

### API Call Pattern

**Decision**: Backend acts as proxy to protect API keys

**Rationale**:
- API keys should never be exposed to frontend
- Backend can add logging, retry logic, error handling
- Centralized API management

**Flow**:
1. Frontend → Backend API endpoint
2. Backend → Alibaba Cloud Bailian API
3. Backend → Process and structure response
4. Backend → Return to frontend

### Error Handling Pattern

**Decision**: Graceful degradation with user-friendly messages

**Rationale**:
- Per spec FR-009: friendly error messages
- Per constitution: error handling required
- User experience is critical

**Implementation**:
- Try-catch around API calls
- Timeout handling (30 seconds per spec)
- Retry logic for transient failures
- User-friendly error messages (no technical details)

### Optional Database Pattern

**Decision**: Database is completely optional, system works without it

**Rationale**:
- Per spec FR-016: system must work without database
- Per spec: "插入即用，拔开也能正常运作"
- Development debugging benefit without production dependency

**Implementation**:
- Environment variable: `ENABLE_DATABASE=true/false`
- Default: development=true, production=false
- All database operations wrapped in try-catch
- Failures don't affect main flow

## Performance Considerations

### API Response Time

**Target**: <15 seconds (per SC-002)

**Strategies**:
- Set appropriate timeout (30 seconds max)
- Show loading state immediately
- Optimize prompt structure for faster responses
- Consider streaming if API supports it (future enhancement)

### Frontend Performance

**Target**: Fast initial load, smooth interactions

**Strategies**:
- Code splitting with Vite
- Lazy loading for components
- Optimize bundle size
- Use Tailwind's purge for production

## Security Considerations

### API Key Management

**Decision**: Environment variables only, never in code

**Rationale**:
- Per spec FR-014: secure storage required
- Per constitution: security requirements
- Industry best practice

**Implementation**:
- `.env` file for local development
- `.env.example` template (no keys)
- `.env` in `.gitignore`
- Production: environment variables in deployment platform

### Input Sanitization

**Decision**: Sanitize user input before API calls

**Rationale**:
- Per constitution: user inputs must be sanitized
- Prevent injection attacks
- Validate input length (1-500 chars per FR-012)

## Deployment Considerations

### Frontend Deployment

**Options**:
- Vercel (recommended): Easy, free tier, automatic deployments
- Netlify: Similar to Vercel
- Static hosting: Any CDN

### Backend Deployment

**Options**:
- Railway: Easy Node.js deployment
- Render: Free tier available
- Heroku: Traditional option
- VPS: More control, more setup

**Recommendation**: Start with Railway or Render for simplicity

## Open Questions Resolved

### Q: Do we need a database for MVP?
**A**: No, database is optional for development debugging only. Product features don't require persistence.

### Q: Should we use TypeScript?
**A**: Yes, provides type safety and better AI code generation support.

### Q: How to handle API failures?
**A**: Graceful degradation with user-friendly error messages, retry logic, timeout handling.

### Q: Can we use Python for API calls?
**A**: No, Node.js can directly call HTTP APIs. No need for Python stack.

## Next Steps

1. Create data model based on entities in spec
2. Design API contracts (frontend-backend)
3. Create quickstart guide for development
4. Generate task breakdown

