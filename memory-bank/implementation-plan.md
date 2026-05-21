# 实施计划

> 每步独立可验证，完成后打勾 `[x]`

---

## 阶段一：项目骨架

### 步骤1：初始化Vite+React项目
- 用Vite创建React项目，安装依赖（react、react-dom、vite、@vitejs/plugin-react）
- 确认 `npm run dev` 能启动开发服务器
- **验证**：浏览器打开看到Vite默认页面

### 步骤2：搭建文件结构和基础布局
- 创建 `src/components/`、`src/styles/`、`api/` 目录
- 写全局CSS变量（Noir颜色体系）和基础reset样式
- 导入Google Fonts（Playfair Display、Crimson Text、Courier Prime）
- App.jsx 根据 `phase` 状态切换渲染不同阶段组件（先放占位文字）
- **验证**：页面显示黑色背景+标题，字体加载正确

---

## 阶段二：数据层

### 步骤3：编写3套案件模板（constants.js）
- 案件A《顶楼的红酒》：妻子/合伙人/秘书
- 案件B《画廊深夜》：经纪人/前助理/收藏家
- 案件C《别墅除夕》：长子/继女/家庭医生
- 每套包含受害者信息、公开线索、刑侦线索、嫌疑人模板
- **验证**：在控制台导入constants，能正确访问各字段

### 步骤4：实现状态管理（reducer.js）
- 定义 `GameState` 的 reducer
- 覆盖所有action类型：START_GAME、SEND_MESSAGE、SWITCH_SUSPECT、SAVE_CLUE、EDIT_CLUE、DELETE_CLUE、ADD_FORENSIC_CLUE、SUBMIT_ACCUSATION、SET_VERDICT、TOGGLE_MUTE、NEW_GAME
- **验证**：写一个简单的测试用例，dispatch几个action后状态正确变化

### 步骤5：实现API封装（api.js）
- `chat(systemPrompt, messages)` — 调 /api/chat
- `judge(accusation, caseInfo)` — 调 /api/judge
- 错误处理：超时、网络错误返回友好提示
- **验证**：暂时用mock返回，在控制台调用确认函数可执行

---

## 阶段三：游戏界面（暂时用mock数据）

### 步骤6：开始画面（StartScreen.jsx）
- 游戏标题《午夜审讯》
- 简短引语（一句Noir风格的文字）
- "开始游戏"按钮 → dispatch NEW_GAME
- Noir视觉：深黑背景+金色文字
- **验证**：点击"开始游戏"进入案情简报

### 步骤7：案情简报（Briefing.jsx）
- 展示案件名、受害者信息、公开线索
- 3张嫌疑人卡片（头像占位、姓名、身份、关系）
- "开始审讯"按钮 → 进入审讯阶段
- **验证**：能看到完整案件信息和3个嫌疑人

### 步骤8：审讯室主界面 — 顶部栏和嫌疑人切换
- Header组件：剩余次数、当前嫌疑人、静音按钮、刑侦支援按钮
- 底部嫌疑人切换Tab：显示A/B/C姓名+情绪状态
- 切换嫌疑人 → 对话区域内容切换
- 静音按钮切换状态
- **验证**：点击切换嫌疑人，顶部栏更新；点击静音按钮状态变化

### 步骤9：审讯室 — 对话气泡区（ChatBubble.jsx + Interrogation.jsx）
- 对话气泡：玩家靠右（暗金色）、嫌疑人靠左（灰白色）
- 嫌疑人气泡显示情绪标记（[紧张]/[慌乱]用红色高亮）
- 每条嫌疑人消息旁有"保存到线索"按钮
- 对话区域自动滚动到最新
- **验证**：硬编码几条对话，确认气泡样式和布局正确

### 步骤10：审讯室 — 输入区域
- 输入框+发送按钮
- 回车发送、按钮点击发送
- 空内容时发送按钮禁用
- 发送后输入框清空、暂时禁用
- 次数归零时输入区域替换为"请做出指控"提示
- **验证**：发送消息 → 扣除次数 → mock回复显示（先不做API）

### 步骤11：线索板（ClueBoard.jsx）
- 显示已保存的线索列表（来源嫌疑人+内容）
- 双击可编辑、点击删除按钮可删除
- 底部红色"最终指控"按钮
- **验证**：从对话保存一条线索 → 线索板显示 → 编辑 → 删除

### 步骤12：最终指控（Accusation.jsx）
- 3选1嫌疑人选择
- 理由文本框（限制3句话以内，提示玩家）
- 确认提交按钮
- 未选人/未填理由时弹出提示
- **验证**：选择嫌疑人+填写理由 → 提交

### 步骤13：裁判结果页（Verdict.jsx）
- 揭晓真凶（正确/错误结果有不同视觉反馈）
- 显示AI评语和分数
- 显示完整案件真相
- "再来一局"按钮
- **验证**：mock verdict数据展示正确

---

## 阶段四：后端API

### 步骤14：Vercel Serverless — /api/chat
- 创建 `api/chat.js`
- 接收 systemPrompt + messages → 调用DeepSeek API → 返回回复文本+情绪标记
- `api/chat.js` 中使用 `process.env.DEEPSEEK_API_KEY`
- **验证**：用Postman或curl本地测试，发送假对话能收到回复

### 步骤15：Vercel Serverless — /api/judge
- 创建 `api/judge.js`
- 接收指控信息+案件真相 → 调用DeepSeek API → 返回JSON裁判结果
- **验证**：本地测试，构造一个指控请求能返回评分JSON

---

## 阶段五：前后端对接

### 步骤16：连接真实API
- 将 mock 替换为真实 api.js 调用
- 处理loading状态、error状态
- 超时/错误时显示重试按钮（不扣次数）
- **验证**：完整走一遍游戏流程，确认API返回正常

### 步骤17：打字机效果（utils.js）
- 实现 `typewriter(text, onUpdate, onDone)` 函数
- 约50ms/字，逐字回调
- 打字期间发送按钮禁用
- 打字完成后显示"保存到线索"按钮
- **验证**：AI回复逐字出现，动画流畅

### 步骤18：语音播报
- 实现 `speak(text, voiceConfig)` 基于 Web Speech API
- 切换嫌疑人 → cancel当前语音
- 打字机开始 → 语音开始（同步）
- 静音按钮控制全局
- 浏览器不支持时隐藏语音相关UI
- **验证**：AI回复时听到语音，切换嫌疑人时语音中断，静音按钮生效

### 步骤19：动态System Prompt生成
- 在reducer或utils中实现 `generateSystemPrompts(caseTemplate, culpritId)`
- 根据凶手身份为3个嫌疑人生成不同Prompt
- 包含角色设定、时间线、敏感词列表、行为规则
- **验证**：用不同culpritId生成Prompt，确认内容不同且合理

---

## 阶段六：部署 + 收尾

### 步骤20：Vercel部署配置
- 编写 `vercel.json`（路由规则 + 环境变量）
- 前端 build → `dist/` 作为静态文件
- API函数在 `api/` 目录
- 环境变量设置 `DEEPSEEK_API_KEY`
- **验证**：`vercel dev` 本地模拟，`vercel deploy` 部署到线上

### 步骤21：全流程测试 + 收尾
- 完整3局游戏测试（每局不同案件+不同凶手）
- 边缘情况测试（空输入、次数耗尽、API超时等）
- 更新 memory-bank/architecture.md 和 progress.md
- **验证**：所有验收标准通过
