# 架构说明

## 项目结构

```
游戏demo/
├── index.html                    # 入口HTML，引入Google Fonts
├── package.json                  # 项目配置，仅4个npm包
├── vite.config.js                # Vite配置
├── vercel.json                   # Vercel部署配置（路由+函数运行时）
├── CLAUDE.md                     # Agent工作流规则
├── api/
│   ├── chat.js                   # Vercel Function: /api/chat — 审讯对话代理
│   └── judge.js                  # Vercel Function: /api/judge — AI裁判代理
├── src/
│   ├── main.jsx                  # React入口
│   ├── App.jsx                   # 根组件，根据phase切换视图
│   ├── reducer.js                # 全局状态管理（useReducer）
│   ├── constants.js              # 3套案件模板数据
│   ├── prompts.js                # 动态System Prompt生成（每案每嫌疑人×有罪/无辜）
│   ├── api.js                    # 前端API封装（优先调真实API，fallback到mock）
│   ├── utils.js                  # 工具函数：打字机效果
│   ├── bgm.js                    # 背景音乐控制（播放public/bgm.mp4，循环）
│   ├── components/
│   │   ├── StartScreen.jsx       # 开始画面
│   │   ├── Briefing.jsx          # 案情简报
│   │   ├── Interrogation.jsx     # 审讯室主组件（整合三栏布局+打字机+语音）
│   │   ├── CaseBoard.jsx         # 左侧案情板（案件摘要+嫌疑人切换）
│   │   ├── ChatBubble.jsx        # 对话气泡
│   │   ├── ClueBoard.jsx         # 右侧线索板（保存/编辑/删除线索）
│   │   ├── Header.jsx            # 顶部栏（次数、刑侦支援、静音）
│   │   ├── SuspectCard.jsx       # 嫌疑人卡片
│   │   ├── Accusation.jsx        # 最终指控
│   │   └── Verdict.jsx           # 裁判结果+真相揭晓
│   └── styles/
│       └── index.css             # 全局样式 + Noir CSS变量
├── memory-bank/
│   ├── design-document.md        # 完整设计文档
│   ├── tech-stack.md             # 技术栈选型
│   ├── implementation-plan.md    # 实施计划（21步）
│   ├── progress.md               # 进度日志
│   └── architecture.md           # 本文件
└── dist/                         # Vite构建产物（部署用）
```

## 核心设计决策

### 状态管理
- 使用 `useReducer` 单store管理全部游戏状态
- Phase驱动视图切换：`start → briefing → interrogation → accusation → judging → reveal`

### API架构
- 前端 `api.js` 采用"真实API优先 + mock fallback"模式
- 本地 `npm run dev` 时Vite不提供/api端点，自动使用mock数据
- 部署到Vercel后，`vercel.json` 将 `/api/*` 路由到Serverless Functions
- DeepSeek API Key通过环境变量注入，不暴露给前端

### 审讯系统
- 每次对话 = SEND_MESSAGE（前端乐观更新）→ API调用 → RECEIVE_MESSAGE（异步更新）
- 打字机效果在前端本地管理，不在reducer中
- 语音与打字机同步启动，切换嫌疑人/发送新消息时中断
- 语音功能已移除
- BGM：Web Audio API程序化生成，低音drone + 滤波噪声纹理 + LFO调制，营造noir氛围

### 动态Prompt
- `prompts.js` 包含3案×3嫌疑人×2身份（有罪/无辜）= 18套独立System Prompt
- 每局开始时根据随机凶手ID自动选择对应Prompt
