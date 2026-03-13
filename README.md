# AI Chat

基于 Ollama 的现代化 AI 聊天应用，采用清新简洁的设计风格，支持流式响应和多种自定义选项。

![Screenshot](/image.png)

## 功能特性

- 🤖 **多模型支持** - 支持选择和管理多个 Ollama 模型
- 💬 **流式聊天** - 实时流式输出，逐字显示 AI 响应
- 📝 **Markdown 渲染** - 支持代码高亮、表格、链接等 Markdown 格式
- 🎨 **清新设计** - 采用 Element Plus 组件库，界面简洁美观
- 🔤 **字号调节** - 支持小、中、大三档字号切换
- 💾 **本地存储** - 自动保存聊天记录和用户设置
- 📋 **一键复制** - 快速复制 AI 响应内容

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **构建工具**: Vite
- **HTTP 客户端**: Axios / Fetch
- **Markdown 解析**: Marked + Highlight.js
- **HTML 净化**: DOMPurify

## 快速开始

### 环境要求

- Node.js >= 18
- Ollama 服务运行中（默认端口 11434）

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 配置

### Ollama 服务配置

默认情况下，应用会连接到 `http://localhost:11434` 的 Ollama 服务。

如需修改 Ollama 地址，可以通过环境变量配置：

```bash
# 设置 Ollama 主机
export OLLAMA_HOST=your-host

# 设置 Ollama 端口
export OLLAMA_PORT=11434
```

或在 `.env` 文件中配置：

```env
OLLAMA_HOST=localhost
OLLAMA_PORT=11434
```

### Vite 代理配置

开发环境下，Vite 会自动代理 `/api` 请求到 Ollama 服务，避免跨域问题。

## 项目结构

```
src/
├── api/              # API 客户端
│   └── ollama.ts    # Ollama API 封装
├── components/        # Vue 组件
│   ├── ChatInterface.vue      # 主聊天界面
│   ├── MessageBubble.vue      # 消息气泡
│   ├── ModelSelector.vue      # 模型选择器
│   ├── FontSizeSelector.vue  # 字号选择器
│   ├── MarkdownRenderer.vue  # Markdown 渲染器
│   └── TypingIndicator.vue  # 输入指示器
├── stores/           # Pinia 状态管理
│   ├── chat.ts        # 聊天状态
│   └── settings.ts    # 设置状态
├── types/            # TypeScript 类型定义
│   └── ollama.ts      # Ollama API 类型
├── utils/            # 工具函数
│   └── markdown.ts    # Markdown 处理
├── App.vue           # 根组件
├── main.ts           # 应用入口
└── style.css         # 全局样式
```

## 使用说明

### 开始聊天

1. 启动应用后，从左侧边栏选择一个 AI 模型
2. 在底部输入框中输入消息
3. 按 `Enter` 发送消息，或 `Shift+Enter` 换行
4. AI 响应将以流式方式逐字显示

### 调整字号

在左侧边栏的 "Font Size" 卡片中选择：

- **Small** - 14px
- **Medium** - 16px（默认）
- **Large** - 18px

设置会自动保存，下次打开时保持选择。

### 清空聊天

点击左侧边栏的 "Clear Chat" 按钮可以清空当前对话记录。

### 复制消息

将鼠标悬停在 AI 消息上，点击 "Copy" 按钮即可复制消息内容。

## 开发说明

### 可用脚本

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 最佳实践
- 使用 Pinia 进行状态管理

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关链接

- [Ollama 官方文档](https://github.com/ollama/ollama)
- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vite 文档](https://vitejs.dev/)

