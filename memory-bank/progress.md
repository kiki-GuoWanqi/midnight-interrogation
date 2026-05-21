# 进度日志

## 2026-05-21

### 已完成
- [x] 设计文档、技术栈、实施计划全部完成
- [x] 步骤1-2：项目骨架（Vite+React+目录结构+Noir CSS主题）
- [x] 步骤3：3套案件模板（顶楼的红酒/画廊深夜/别墅除夕）
- [x] 步骤4：全局状态管理（useReducer，覆盖全部16种action）
- [x] 步骤5：API封装（真实API + mock fallback双模式）
- [x] 步骤6-13：全部UI组件（StartScreen/Briefing/Interrogation/CaseBoard/ChatBubble/ClueBoard/Header/SuspectCard/Accusation/Verdict）
- [x] 步骤14-15：Vercel Serverless Functions（/api/chat, /api/judge）
- [x] 步骤16：前后端对接（真实API优先，本地mock不中断开发）
- [x] 步骤17：打字机逐字效果
- [x] 步骤18：Web Speech API语音播报（含情绪状态影响语速/pitch）
- [x] 步骤19：动态System Prompt生成（18套独立角色Prompt）
- [x] 步骤20：刑侦支援系统（消耗提问换背景线索，自动加入线索板）
- [x] 项目Build通过，零错误

### 待完成
- [ ] Vercel部署（需用户安装CLI并登录）
- [ ] 全流程测试 + 真实API验证
- [ ] DeepSeek API Key配置到Vercel环境变量

### 下一步
1. 用户安装Vercel CLI → `npm i -g vercel`
2. `vercel login` 登录
3. 设置环境变量 `DEEPSEEK_API_KEY`
4. `vercel deploy` 部署
5. 线上全流程测试
