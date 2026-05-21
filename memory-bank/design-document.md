# 《午夜审讯》设计文档

## 范围与不做什么

### 做什么
- 3套固定案件模板，每局随机指定凶手
- 玩家与3个AI嫌疑人自由对话审讯
- 共享25次提问池，不限单人提问次数上限
- 刑侦支援系统：消耗1次提问换取背景线索（法医报告/通话记录等）
- 打字机效果 + 语音播报
- 黑色电影Noir视觉风格
- 玩家手动标记对话内容保存到线索板
- AI裁判评分 + 真相揭晓
- 后端代理（Vercel Serverless），API Key不暴露
- 移动端响应式

### 不做什么
- 不增加第4套案件（MVP范围锁定3套）
- 不做多人模式
- 不做存档/读档
- 不做排行榜
- 不接入除了DeepSeek之外的其他模型

---

## 用户旅程

### 主流程

```
开始游戏 → 案情简报 → 审讯阶段 → 最终指控 → AI裁判 → 揭晓结局
```

### 详细步骤

**1. 开始游戏**
- 系统从3套案件中随机抽取1套
- 从该案的3个嫌疑人中随机指定1人为凶手
- 根据凶手身份动态生成各嫌疑人System Prompt

**2. 案情简报（phase: briefing）**
- 展示案件名称、受害者信息、案发时间地点
- 展示3个嫌疑人卡片（头像、姓名、身份、与受害者关系）
- 展示已知公开线索（警方初步调查结果）
- "开始审讯"按钮进入审讯阶段

**3. 审讯阶段（phase: interrogation）**
- 左侧：案情板（可折叠）— 案件摘要、受害者信息
- 中间：审讯室（主区域）— 当前嫌疑人的对话历史 + 输入框
- 右侧：线索板 — 玩家手动标记的线索列表
- 顶部栏：剩余提问次数、当前嫌疑人、静音按钮
- 底部：3个嫌疑人切换标签，显示各自情绪状态

**审讯交互**：
- 玩家输入问题，按回车或点击发送
- 扣除1次共享提问次数
- 调用后端API获取嫌疑人回复
- 回复以打字机效果逐字显示 + 语音同步播报
- 每条消息旁有"保存到线索"按钮，点击将该条回复的关键信息存入线索板
- 切换嫌疑人时，当前语音立即中断
- 玩家可随时点击"刑侦支援"申请额外线索

**4. 线索板交互**：
- 显示所有已保存的线索
- 每条线索可手动编辑或删除
- "最终指控"按钮（红色醒目，常驻右下角）

**5. 最终指控（phase: accusation）**
- 选择指控对象（3选1）
- 填写指控理由（1-3句话，必填）
- 确认提交

**6. AI裁判（phase: judging）**
- 显示"裁判中..."加载状态
- 调用后端API，将指控理由 + 案件真相交给DeepSeek评判
- 返回：是否正确、分数（1-100）、评语、完整真相

**7. 揭晓结局（phase: reveal）**
- 公布真凶身份（带红框高亮）
- 展示完整案件经过
- 展示AI裁判评语和分数
- "再来一局"按钮

---

## 功能行为规格

### 案件系统

**案件模板结构**：
```typescript
interface CaseTemplate {
  id: string
  name: string          // e.g. "顶楼的红酒"
  victim: {
    name: string
    age: number
    role: string        // e.g. "科技公司CEO"
    deathCause: string  // e.g. "氰化物中毒，溶于红酒"
    location: string    // e.g. "顶层公寓书房"
    time: string        // e.g. "2026年3月15日 22:00-23:00"
  }
  publicClues: string[]    // 警方已公开的线索
  forensicClues: string[]  // 刑侦支援可获取的线索（2-3条）
  suspects: SuspectTemplate[]
}

interface SuspectTemplate {
  id: string           // 'A' | 'B' | 'C'
  name: string
  age: number
  role: string         // e.g. "妻子"
  relationToVictim: string
  personality: string  // 性格描述
  secret: string       // 每个人都有的秘密（与案件相关但不一定是凶手）
  voice: VoiceConfig
}

interface VoiceConfig {
  pitch: number
  rate: number
  gender: 'male' | 'female'
  age: 'young' | 'middle' | 'old'
}
```

**凶手随机化**：
- 开局时对当前案件的3个嫌疑人随机抽取凶手
- 根据凶手身份构造3份不同的System Prompt：
  - 凶手：包含完整作案动机、手法、时间线漏洞、被追问敏感词时触发[慌乱]
  - 无辜者A：隐藏自己的秘密，但不在场证明有模糊处
  - 无辜者B：部分信息可与A相互印证，部分与A矛盾

### 审讯系统

**提问规则**：
- 总次数25次，3嫌疑人共享，不限单人次数
- 输入不能为空，不能纯空格
- 每次发送消耗1次（无论是否得到有用信息）
- 剩余0次时自动提示进入指控阶段

**嫌疑人回复规则（System Prompt约束）**：
- 不主动暴露关键信息，需被追问
- 被问到敏感词时在回复开头加标记：[紧张] 或 [慌乱]
- 无辜者也有秘密要隐瞒
- 角色人设始终保持一致
- 回复长度：2-5句话，口语化

**情绪状态**：
- `calm`（平静）：默认状态，语音正常
- `nervous`（紧张）：被问到边缘敏感话题，语音 rate +0.1
- `agitated`（慌乱）：被直击要害，语音 rate +0.2，pitch 微升

**刑侦支援**：
- 消耗1次提问机会
- 从案件的 `forensicClues` 池中随机抽取1条（不重复）
- 线索内容示例："法医报告显示胃内容物有安眠药成分"或"监控显示22:15有一辆黑色轿车停在门口"
- 总共2-3条，拿完即止

### 线索板系统

- 玩家点击对话气泡旁的"保存"按钮 → 该条AI回复原文存入线索板
- 线索板中每条线索可双击编辑（简化为自己的笔记），可删除
- 线索板为空时，最终指控按钮仍可用（不强制收集线索）
- 线索数量无上限

### 语音系统

- 使用 `window.speechSynthesis`（Web Speech API）
- 嫌疑人回复文字逐字打出时，语音同步播放
- 切换嫌疑人 → `speechSynthesis.cancel()` 立即中断
- 玩家开始输入新问题 → 中断当前语音
- 静音按钮常驻顶部栏，点击切换全局静音状态
- 首次进入审讯阶段时做静默预热调用（规避浏览器自动播放限制）
- 语音配置按嫌疑人角色区分：

| 角色类型 | pitch | rate | 
|----------|-------|------|
| 中年男性 | 0.85 | 0.9 |
| 中年女性 | 1.1 | 0.95 |
| 年轻女性 | 1.3 | 1.0 |
| 老年男性 | 0.75 | 0.85 |

- 情绪影响：[紧张] → rate +0.1；[慌乱] → rate +0.2，pitch +0.05

### 打字机效果

- 收到API回复后，按字符逐字渲染
- 速度约50ms/字（可配置）
- 打字期间语音同步播放
- 打字完成前不显示"保存到线索"按钮
- 打字期间输入框禁用发送

### AI裁判系统

- 输入：玩家指控对象ID + 指控理由文本 + 案件真相（凶手身份、完整案件经过、关键证据链）
- 输出（JSON格式）：
```json
{
  "correct": true/false,
  "score": 85,
  "comment": "你的推理逻辑严密，抓住了时间线矛盾...",
  "truth": "真凶是XX，当晚TA..."
}
```
- 裁判结果展示在揭晓画面

---

## 数据/状态模型

```typescript
interface GameState {
  currentCase: CaseTemplate
  culpritId: string              // 'A' | 'B' | 'C'
  phase: 'start' | 'briefing' | 'interrogation' | 'accusation' | 'judging' | 'reveal'
  questionsRemaining: number    // 初始25
  forensicCluesRemaining: string[]  // 未获取的刑侦线索
  suspects: Record<string, SuspectState>
  activeSuspect: string | null  // 'A' | 'B' | 'C'
  clues: ClueItem[]
  accusation: {
    targetId: string | null
    reason: string
  }
  mute: boolean
  verdict: Verdict | null
}

interface SuspectState {
  chatHistory: ChatMessage[]
  emotionState: 'calm' | 'nervous' | 'agitated'
  systemPrompt: string   // 动态生成的完整System Prompt
}

interface ChatMessage {
  id: string
  role: 'player' | 'suspect'
  text: string
  timestamp: number
  emotionMark?: string   // 回复开头的 [紧张] 或 [慌乱] 标记
}

interface ClueItem {
  id: string
  text: string           // 玩家可编辑
  sourceQuote: string    // 原始AI回复原文
  suspectId: string      // 来自哪个嫌疑人
  timestamp: number
}

interface Verdict {
  correct: boolean
  score: number          // 1-100
  comment: string
  truth: string
}
```

---

## 边缘情况

| 场景 | 处理方式 |
|------|----------|
| 输入为空或纯空格 | 禁用发送按钮，不扣次数 |
| 提问次数归零 | 自动弹出提示"次数用尽，请做出指控"，进入指控阶段 |
| 刑侦支援次数归零 | "刑侦支援"按钮置灰，显示"线索已全部获取" |
| 所有刑侦线索已获取 | 同上 |
| API调用超时（>8秒） | 显示"嫌疑人沉默不语..."+ 重试按钮，不扣次数 |
| API调用失败 | 显示网络错误提示+重试按钮，不扣次数 |
| 未选择指控对象就提交 | 弹出提示"请先选择指控对象" |
| 指控理由为空 | 弹出提示"请填写指控理由" |
| 浏览器不支持 Web Speech API | 隐藏语音相关UI，只保留打字机效果 |
| 移动端窄屏（<768px） | 折叠为单栏，底部Tab切换案情/审讯/线索 |
| 语音在移动端不触发 | 首次点击时做静默预热 |
| 玩家快速切换嫌疑人 | 中断当前语音+打字机，切换后刷新为新嫌疑人的对话 |
| 连续快速发送多条消息 | 发送后禁用输入框直到回复完成 |

---

## 验收标准

1. 玩家打开链接 → 看到游戏标题画面 → 点击开始 → 生成随机案件
2. 案情简报展示正确信息 → 点击"开始审讯" → 进入审讯界面
3. 输入问题 → 发送 → 扣除次数 → 收到AI回复 → 打字机+语音播放
4. 切换嫌疑人 → 对话历史切换 → 语音中断
5. 点击"保存到线索" → 线索存入线索板 → 可编辑、可删除
6. 点击"刑侦支援" → 扣除1次 → 显示一条新线索
7. 25次用尽 → 自动提示指控
8. 选择凶手+填写理由 → 提交 → 显示裁判结果
9. 裁判结果页 → 显示真相 → 点击"再来一局" → 重新开始
10. 移动端打开 → 布局自适应 → 功能完整可用
