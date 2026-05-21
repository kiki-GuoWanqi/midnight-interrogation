# 《午夜审讯》技术栈

## 选型原则
- 简单 > 强大
- 浏览器原生能力优先
- 零运行时依赖外部服务（除AI API外）
- Vercel 免费额度内运行

---

## 前端

| 层级 | 选型 | 理由 |
|------|------|------|
| 框架 | React 18 | 用户指定，生态成熟 |
| 构建 | Vite | 快、零配置、产物可直接部署到 Vercel |
| 状态管理 | useReducer + Context | 游戏状态结构清晰，无需引入Redux/Zustand |
| 样式 | CSS Custom Properties | Noir主题只需一套颜色变量，组件内联或单CSS文件 |
| 字体 | Google Fonts (Playfair Display + Crimson Text + Courier Prime) | 设计文档指定，免费CDN加载 |
| JSX | 标准React JSX，Vite编译 | 不需要Babel Standalone |

## 后端

| 层级 | 选型 | 理由 |
|------|------|------|
| 平台 | Vercel Serverless Functions | 免费额度充足，与前端同项目部署 |
| 运行时 | Node.js (Vercel默认) | 无需额外配置 |
| API协议 | REST (fetch) | 简单直接，前端fetch直接调 |
| AI模型 | DeepSeek Chat API (`deepseek-chat`) | 用户已有Key，中文能力强，便宜 |

### API端点设计

```
POST /api/chat
  请求: { systemPrompt, messages, suspectId }
  响应: { text, emotionMark }
  职责: 调用DeepSeek，返回嫌疑人回复

POST /api/judge
  请求: { accusationTarget, accusationReason, caseInfo }
  响应: { correct, score, comment, truth }
  职责: 调用DeepSeek裁判评分
```

## 部署

| 层级 | 选型 | 理由 |
|------|------|------|
| 前端托管 | Vercel Static（同项目） | 与API同域名，无CORS问题 |
| 后端托管 | Vercel Functions（同项目） | 免费，零运维 |
| 域名 | `xxx.vercel.app`（Vercel赠送） | 直接发给用户打开 |

## 项目结构

```
game-demo/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json              # Vercel配置（路由+函数）
├── api/
│   ├── chat.js              # /api/chat 审讯对话
│   └── judge.js             # /api/judge 最终裁判
├── src/
│   ├── main.jsx             # 入口
│   ├── App.jsx              # 根组件
│   ├── reducer.js           # useReducer状态管理
│   ├── constants.js         # 案件模板数据
│   ├── api.js               # 前端API调用封装
│   ├── utils.js             # 工具函数（打字机、语音）
│   ├── components/
│   │   ├── StartScreen.jsx  # 开始画面
│   │   ├── Briefing.jsx     # 案情简报
│   │   ├── CaseBoard.jsx    # 案情板（左侧）
│   │   ├── Interrogation.jsx # 审讯室（中间主区域）
│   │   ├── ClueBoard.jsx    # 线索板（右侧）
│   │   ├── Accusation.jsx   # 最终指控
│   │   ├── Verdict.jsx      # 裁判结果
│   │   ├── SuspectCard.jsx  # 嫌疑人卡片
│   │   ├── ChatBubble.jsx   # 对话气泡
│   │   └── Header.jsx       # 顶部状态栏
│   └── styles/
│       └── index.css        # 全局样式 + CSS变量
└── dist/                    # vite build 产物（部署到Vercel）
```

## 不引入的依赖

- 不用UI组件库（Ant Design/MUI等）— Noir风格需要精细控制，手写CSS更快
- 不用路由库 — 单页游戏，phase状态驱动视图切换
- 不用状态管理库 — useReducer足够
- 不用axios — fetch原生支持，少一个依赖

## 关键npm依赖

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4",
    "vite": "^5"
  }
}
```

仅4个包，保持极简。
