# TikTok Creator Insight Assistant MVP

帮助短视频创作者将创意意图转化为结构化脚本大纲与趋势洞察的MVP应用。

## 技术栈

- **前端**: React 18+ + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js 18+ + Express + TypeScript
- **AI集成**: 阿里云百炼API (DeepSeek-V3/Qwen-Max)
- **数据库**: SQLite (可选，仅开发环境)

## 快速开始

### 前置要求

**必需软件**:
- Node.js 18.0.0 或更高版本 (推荐 18.x 或 20.x LTS)
- npm 9.0.0 或更高版本 (通常随 Node.js 一起安装)
- 阿里云百炼API密钥

**验证安装**:
```bash
node --version  # 应显示 v18.x.x 或更高
npm --version   # 应显示 9.x.x 或更高
```

**依赖列表**: 查看 [requirements.txt](./requirements.txt) 获取所有依赖包的详细列表（参考用，实际安装使用 `npm install`）。

### 安装步骤

#### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

**注意**: 
- 安装过程可能需要 5-10 分钟，取决于网络速度
- Windows 用户如果遇到 `sqlite3` 安装问题，可能需要安装 Visual Studio Build Tools

#### 2. 配置环境变量

**后端配置** (`backend/.env`):

项目已包含 `backend/.env.example` 示例文件。复制并编辑:

**Windows (PowerShell)**:
```powershell
cd backend
Copy-Item .env.example .env
# 然后编辑 .env 文件，将 your_api_key_here 替换为你的实际 API 密钥
```

**macOS/Linux**:
```bash
cd backend
cp .env.example .env
# 然后编辑 .env 文件，将 your_api_key_here 替换为你的实际 API 密钥
```

**必须修改**: 编辑 `backend/.env` 文件，将 `BAILIAN_API_KEY=your_api_key_here` 中的 `your_api_key_here` 替换为你的实际阿里云百炼 API 密钥。

**环境变量说明**:
- `BAILIAN_API_KEY`: 阿里云百炼API密钥（**必需**）- 从 https://dashscope.console.aliyun.com/ 获取
- `NODE_ENV`: 运行环境（可选，默认: development）
- `PORT`: 服务器端口（可选，默认: 3000）
- `ENABLE_DATABASE`: 是否启用数据库日志（可选，默认: true）
- `PROMPT_VERSION`: Prompt版本号（可选，默认: v1.0）


#### 3. 运行项目

**终端1 - 启动后端**:
```bash
cd backend
npm run dev
```

后端将在 `http://localhost:3000` 运行

**验证后端启动成功**: 看到类似以下输出表示成功:
```
Server running on http://localhost:3000
```

**终端2 - 启动前端**:
```bash
cd frontend
npm run dev
```

前端将在 `http://localhost:5173` 运行

**验证前端启动成功**: 看到类似以下输出表示成功:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### 4. 访问应用

打开浏览器访问: `http://localhost:5173`

### 常见问题排查

#### 端口被占用

如果遇到 `Error: listen EADDRINUSE`，说明端口被占用:

**Windows**:
```powershell
# 查找占用 3000 端口的进程
netstat -ano | findstr :3000
# 结束进程 (替换 PID 为实际进程ID)
taskkill /PID <PID> /F
```

**macOS/Linux**:
```bash
# 查找占用 3000 端口的进程
lsof -i :3000
# 结束进程
kill -9 <PID>
```

或者修改端口配置:
- 后端: 在 `backend/.env` 中修改 `PORT=3001`
- 前端: 在 `frontend/vite.config.ts` 中修改 `server.port`

#### API 密钥错误

如果遇到 `401 Unauthorized` 或 `Invalid API key`:
1. 检查 `backend/.env` 中的 `BAILIAN_API_KEY` 是否正确
2. 确认 API 密钥未过期
3. 确认已开通百炼服务并具有相应权限

#### 依赖安装失败

**Windows 用户 - sqlite3 安装失败**:
- 安装 Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
- 选择 "Desktop development with C++" 工作负载
- 或使用预编译版本: `npm install sqlite3 --build-from-source=false`

**网络问题**:
- 检查网络连接
- 如果使用代理，配置 npm 代理: `npm config set proxy http://proxy-server:port`
- 使用国内镜像: `npm config set registry https://registry.npmmirror.com`

#### 前端无法连接后端

如果前端显示连接错误:
1. 确认后端已启动并运行在 `http://localhost:3000`
2. 检查 `frontend/.env` 中的 `VITE_API_BASE_URL` 是否正确
3. 检查浏览器控制台是否有 CORS 错误
4. 重启前端开发服务器 (修改 `.env` 后需要重启)

**更多问题**: 如果遇到其他问题，请检查：
1. Node.js 和 npm 版本是否符合要求（Node.js >= 18.0.0, npm >= 9.0.0）
2. 网络连接是否正常，能否访问阿里云百炼API
3. 端口 3000 和 5173 是否被占用
4. 查看 [requirements.txt](./requirements.txt) 确认所有依赖是否正确安装

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
- ✅ Phase 4: User Story 2 - 三阶段协作式创作流程
- ✅ Phase 5: User Story 3 - Hashtag和音乐建议
- ✅ Phase 6: Database - 会话持久化（必需）
- ✅ Phase 7: Prompt Engineering - Prompt优化重构
- ✅ Phase 8: Polish - 响应式设计、安全加固等

## 核心功能：三阶段协作式创作流程

### 阶段1：金句选择（Hook Selection）
- 生成3-5个吸引人的金句选项
- 支持替换、微调、手动编辑和优化
- 选择金句后进入下一阶段

### 阶段2：内容创作（Content Development）
- 围绕选择的金句生成3个详细的内容要点
- 每个要点包含具体场景、画面构图、情绪锚点、动作设计
- 支持编辑、优化单个要点、基于要点展开
- 确认内容后进入脚本转换阶段

### 阶段3：脚本转换（Script Conversion）
- 生成3种不同风格的短视频脚本（故事叙述型、教程教学型、对比评测型）
- 每个脚本包含专业元素：情绪锚点、记忆点、冲突设计、信息密度
- 支持优化单个脚本、一键复制
- 自动生成Hashtag建议和音乐风格建议

### 会话管理
- 会话状态持久化（支持刷新后恢复）
- 支持返回上一阶段修改
- 每个阶段的数据都会缓存，避免重复生成

## 功能特性

### 已完成
- ✅ 用户输入界面（支持中英文混合输入）
- ✅ 输入验证和清理（空值检查、长度限制、特殊字符处理）
- ✅ 三阶段协作式创作流程
- ✅ 会话状态持久化（SQLite数据库）
- ✅ 响应式设计（移动端和桌面端适配）
- ✅ 错误处理和用户友好的错误消息
- ✅ 安全加固（输入清理、响应验证）
- ✅ 多语言混合输入支持
- ✅ 特殊字符处理
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

## 文档

- **[requirements.txt](./requirements.txt)**: 所有依赖包的详细列表（参考用，实际安装使用 `npm install`）
- **[specs/001-tiktok-creator-insight/](./specs/001-tiktok-creator-insight/)**: 功能规范、实现计划和任务清单

## License

MIT

