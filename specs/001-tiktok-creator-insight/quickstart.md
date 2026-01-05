# Quickstart Guide: TikTok Creator Insight Assistant MVP

**Date**: 2025-01-27  
**Feature**: 001-tiktok-creator-insight

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Alibaba Cloud Bailian API key
- Git (for version control)

## Setup Instructions

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd ByteDanceMvp/ByteDanceMvp
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Required
BAILIAN_API_KEY=your_api_key_here
NODE_ENV=development
PORT=3000

# Optional - Database
ENABLE_DATABASE=true
```

Start backend:
```bash
npm run dev
```

Backend should run on `http://localhost:3000`

### 3. Frontend Setup

Open new terminal:
```bash
cd frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start frontend:
```bash
npm run dev
```

Frontend should run on `http://localhost:5173` (Vite default)

## Testing Scenarios

### Scenario 1: Basic Input and Generation

**Steps**:
1. Open frontend in browser
2. Enter "美食探店" in input field
3. Click submit button
4. Wait for loading to complete
5. Verify 3 script cards are displayed
6. Verify 5-10 hashtags are displayed
7. Verify music style suggestion is displayed

**Expected Result**:
- All content generated successfully
- Cards are properly formatted
- Copy buttons work

### Scenario 2: English Input

**Steps**:
1. Enter "food review" in input field
2. Submit
3. Verify content is generated in English context

**Expected Result**:
- System handles English input correctly
- Generated content is relevant to English context

### Scenario 3: Error Handling - Empty Input

**Steps**:
1. Leave input field empty
2. Click submit
3. Verify error message is displayed

**Expected Result**:
- Error message: "输入不能为空"
- User-friendly error display
- Can retry after fixing input

### Scenario 4: Error Handling - API Failure

**Steps**:
1. Set invalid API key in backend `.env`
2. Submit valid input
3. Verify error handling

**Expected Result**:
- Error message displayed: "AI服务暂时不可用，请稍后重试"
- Retry button available
- No technical details exposed

### Scenario 5: Copy Functionality

**Steps**:
1. Generate content successfully
2. Click "一键复制" on a script card
3. Verify clipboard contains script content
4. Verify success message is displayed

**Expected Result**:
- Content copied to clipboard
- Success message appears
- Can paste content elsewhere

### Scenario 6: Database Logging (Development)

**Steps**:
1. Ensure `ENABLE_DATABASE=true` in backend `.env`
2. Generate content
3. Check `dev-debug.db` file exists
4. Query database for log entry

**Expected Result**:
- Database file created
- API call logged with all details
- Can query historical logs

### Scenario 7: Database Disabled

**Steps**:
1. Set `ENABLE_DATABASE=false` in backend `.env`
2. Restart backend
3. Generate content
4. Verify system works normally

**Expected Result**:
- System works without database
- No database file created
- All features functional

## Development Workflow

### Running Tests

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

### Code Generation

Use Cursor AI to generate code based on:
- `spec.md` - Feature requirements
- `plan.md` - Technical architecture
- `data-model.md` - Data structures
- `contracts/` - API specifications

### Debugging

1. **Backend Debugging**:
   - Check console logs
   - Use database logs if enabled
   - Check API responses

2. **Frontend Debugging**:
   - Use browser DevTools
   - Check Network tab for API calls
   - Check Console for errors

3. **API Debugging**:
   - Verify API key is correct
   - Check API response format
   - Verify timeout settings

## Common Issues

### Issue: API Key Not Working

**Solution**:
- Verify API key in `.env` file
- Check API key has proper permissions
- Verify API endpoint URL is correct

### Issue: Database Not Logging

**Solution**:
- Check `ENABLE_DATABASE=true` in `.env`
- Verify `sqlite3` package is installed
- Check file permissions for database directory

### Issue: Frontend Can't Connect to Backend

**Solution**:
- Verify backend is running on port 3000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Verify CORS is configured correctly

### Issue: Timeout Errors

**Solution**:
- Check network connection
- Verify API service is available
- Increase timeout if needed (max 30s per spec)

## Next Steps

After setup:
1. Review `spec.md` for requirements
2. Review `plan.md` for architecture
3. Generate tasks with `/speckit.tasks`
4. Start implementation with `/speckit.implement`

