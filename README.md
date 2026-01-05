# TikTok Creator Insight Assistant MVP

帮助短视频创作者将创意意图转化为结构化脚本大纲与趋势洞察的MVP应用。

## 技术栈

- **前端**: React 18+ + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js 18+ + Express + TypeScript
- **AI集成**: 阿里云百炼API (DeepSeek-V3/Qwen-Max)
- **数据库**: SQLite (可选，仅开发环境)

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- 阿里云百炼API密钥

### 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 配置环境变量

**后端** (`backend/.env`):
```env
BAILIAN_API_KEY=your_api_key_here
NODE_ENV=development
PORT=3000
ENABLE_DATABASE=true
PROMPT_VERSION=v1.0
```

**环境变量说明**:
- `BAILIAN_API_KEY`: 阿里云百炼API密钥（必需）
- `NODE_ENV`: 运行环境（development/production）
- `PORT`: 服务器端口（默认3000）
- `ENABLE_DATABASE`: 是否启用数据库日志（true/false，开发环境默认true）
- `PROMPT_VERSION`: Prompt版本号（用于跟踪prompt改进效果，默认v1.0）

**前端** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 运行项目

**终端1 - 启动后端**:
```bash
cd backend
npm run dev
```

后端将在 `http://localhost:3000` 运行

**终端2 - 启动前端**:
```bash
cd frontend
npm run dev
```

前端将在 `http://localhost:5173` 运行

### 访问应用

打开浏览器访问: `http://localhost:5173`

## 项目结构

```
ByteDanceMvp/
├── frontend/          # React前端应用
│   ├── src/
│   │   ├── components/  # React组件
│   │   ├── services/    # API服务
│   │   └── App.tsx
│   └── package.json
├── backend/           # Express后端API
│   ├── src/
│   │   ├── routes/     # API路由
│   │   ├── services/   # 业务逻辑
│   │   ├── middleware/ # 中间件
│   │   └── server.ts
│   └── package.json
└── specs/             # 规范文档
    └── 001-tiktok-creator-insight/
        ├── spec.md    # 功能规范
        ├── plan.md    # 实现计划
        └── tasks.md   # 任务清单
```

## 开发进度

- ✅ Phase 1: Setup - 项目初始化
- ✅ Phase 2: Foundational - 核心基础设施
- ✅ Phase 3: User Story 1 - 输入功能
- ✅ Phase 4: User Story 2 - AI脚本生成
- ✅ Phase 5: User Story 3 - Hashtag和音乐
- ✅ Phase 6: Optional Database - 开发调试数据库

## 功能特性

### 已完成
- ✅ 用户输入界面（支持中英文）
- ✅ 输入验证（空值检查、长度限制）
- ✅ 错误处理和显示
- ✅ 基础API架构

### 已完成
- ✅ AI脚本生成（3种不同风格）
- ✅ 卡片式展示
- ✅ Hashtag和音乐建议
- ✅ 数据库日志记录（可选，开发调试用）
- ✅ 一键复制功能

## 数据库功能（可选）

系统支持可选的SQLite数据库，用于开发调试阶段记录API请求和响应。

### 启用数据库

在 `backend/.env` 中设置：
```env
ENABLE_DATABASE=true
PROMPT_VERSION=v1.0
```

### 查看日志

访问开发端点查看API日志：
```bash
GET http://localhost:3000/api/dev/logs?limit=50
GET http://localhost:3000/api/dev/logs?version=v1.0&limit=50
```

### Prompt版本管理

当修改prompt来提升效果时，更新 `PROMPT_VERSION` 环境变量（如 `v1.1`, `v2.0`），系统会自动记录版本号，方便对比不同版本的效果。

### 数据库文件

数据库文件保存在 `backend/dev-debug.db`，已添加到 `.gitignore`。

## 规范文档

详细的功能规范、实现计划和任务清单请查看 `specs/001-tiktok-creator-insight/` 目录。

## License

MIT

