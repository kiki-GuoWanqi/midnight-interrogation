const API_BASE = 'https://midnight-api.443351609.workers.dev/api'

async function request(path, body, timeoutMs = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  } finally {
    clearTimeout(timer)
  }
}

// Mock fallback for when backend is not available (local dev)
const MOCK_RESPONSES = [
  '这件事……我不太想谈。',
  '你问这个干什么？和我有关系吗？',
  '好吧，我承认那天晚上我确实在场。但我什么都没做。',
  '[紧张] 你……你怎么知道的？谁告诉你的？',
  '我不明白你在暗示什么。我很配合你们调查了。',
  '[慌乱] 等等，你搞错了，不是我！我虽然和他有过节，但不至于……',
  '你想让我说什么？我已经把知道的都说了。',
  '那天晚上我见到了一个人。但我不能说那是谁。',
]

function mockChat() {
  const text = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]
  const trimText = text.trimStart()
  const emotionMark = trimText.startsWith('[') ? trimText.match(/^\[(.*?)\]/)?.[1] : null
  return { text, emotionMark: emotionMark || null }
}

function mockJudge(accusation, state) {
  const correct = accusation.targetId === state.culpritId
  return {
    correct,
    score: correct ? 85 : 40,
    comment: correct
      ? '你的推理基本正确，抓住了核心矛盾。但在时间线的细节上还有可以深挖的地方。'
      : '你的指控方向有一些道理，但关键证据链并不成立。重新审视时间线。',
    truth: `真凶是${state.currentCase.suspects.find(s => s.id === state.culpritId).name}。案件真相将在完整版中揭晓。`,
  }
}

// Generates both publicClues (5) and forensicClues (3) based on actual culprit
export async function generateClues(caseTemplate, culpritId, culpritSystemPrompt) {
  const culprit = caseTemplate.suspects.find(s => s.id === culpritId)
  const innocents = caseTemplate.suspects.filter(s => s.id !== culpritId)

  const systemPrompt = `你是一个推理游戏的线索生成器。根据以下案件信息，生成警方调查线索。

【案件基础信息】
案名：${caseTemplate.name}
受害者：${caseTemplate.victim.name}，${caseTemplate.victim.age}岁，${caseTemplate.victim.role}
死因：${caseTemplate.victim.deathCause}
案发：${caseTemplate.victim.time}，${caseTemplate.victim.location}

【真凶信息（绝对保密，仅供你参考）】
真凶：${culprit.name}（${culprit.role}）
真凶详情：
${culpritSystemPrompt}

【无辜者的隐藏秘密（用于生成红鲱鱼线索）】
${innocents.map(s => `• ${s.name}（${s.role}）：${s.secret}`).join('\n')}

【生成要求】
生成两类线索，写入同一个JSON对象：

1. publicClues（5条）：警方初步调查已公开的线索
   - 客观简洁，每条20-45字，涵盖物证/监控/目击/法医初步结论
   - 其中2条隐约指向真凶（不直接点名）
   - 其中2条涉及无辜者可疑之处，制造合理怀疑
   - 1条中性背景线索

2. forensicClues（3条）：刑侦支援可获取的深度线索（更专业、更隐蔽）
   - 法医补充报告、通话记录分析、监控盲区还原、痕迹鉴定等
   - 其中1条能为真凶的作案方式提供关键佐证（但仍不直接点名）
   - 其余为有价值的背景线索或红鲱鱼
   - 每条30-60字，比publicClues更具技术性

绝不在任何线索中直接说出"真凶是某某"。

只返回如下JSON对象，不含任何其他文字：
{"publicClues":["...","...","...","...","..."],"forensicClues":["...","...","..."]}`

  const messages = [{ role: 'user', content: '请生成线索。' }]

  try {
    const result = await request('/chat', { systemPrompt, messages }, 20000)
    const match = result.text.trim().match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      if (
        Array.isArray(parsed.publicClues) && parsed.publicClues.length >= 3 &&
        Array.isArray(parsed.forensicClues) && parsed.forensicClues.length >= 1
      ) {
        return { publicClues: parsed.publicClues, forensicClues: parsed.forensicClues, aiGenerated: true }
      }
    }
  } catch {}

  return {
    publicClues: caseTemplate.publicClues,
    forensicClues: caseTemplate.forensicClues,
    aiGenerated: false,
  }
}

// Throws on real failure (no mock fallback) so caller can handle retry/refund
// Long-form request for narrative/clue analysis (high token limit)
async function revealRequest(systemPrompt, messages, timeoutMs = 30000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}/reveal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, messages }),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function chat(systemPrompt, messages) {
  try {
    return await request('/chat', { systemPrompt, messages })
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('timeout')
    // Fall back to mock only in dev (no real backend)
    if (import.meta.env.DEV) return mockChat()
    throw err
  }
}

// Strip internal IDs that the backend sometimes leaks into AI-generated text
function sanitizeJudgeText(text) {
  if (!text) return text
  return text
    .replace(/案件\s*[iI][dD][为是：:\s]+\S+/g, '')
    .replace(/\b(red_wine|gallery|villa_newyear)\b/g, '')
    .replace(/case[_\s]?[iI][dD][：:\s]+\S+/gi, '')
    .replace(/culprit[_\s]?[iI][dD][：:\s]+\S+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export async function judge(accusation, state) {
  try {
    const result = await request('/judge', { accusation, caseInfo: { caseId: state.currentCase.id, culpritId: state.culpritId } })
    return {
      ...result,
      comment: sanitizeJudgeText(result.comment),
      truth: sanitizeJudgeText(result.truth),
    }
  } catch {
    return mockJudge(accusation, state)
  }
}

export async function generateTruthReveal(state) {
  const {
    currentCase, culpritId, suspects, clues,
    dynamicPublicClues, dynamicForensicClues, usedForensicClues,
  } = state

  const culprit = currentCase.suspects.find(s => s.id === culpritId)
  const innocents = currentCase.suspects.filter(s => s.id !== culpritId)
  const culpritPrompt = suspects[culpritId]?.profile?.systemPrompt || ''

  const publicClues = dynamicPublicClues || currentCase.publicClues
  const allForensicClues = dynamicForensicClues || currentCase.forensicClues
  const forensicUsed = usedForensicClues.map(i => allForensicClues[i]).filter(Boolean)

  const cluesForAnalysis = [
    ...publicClues.map((c, i) => `${i + 1}. [警方线索] ${c}`),
    ...forensicUsed.map((c, i) => `${publicClues.length + i + 1}. [刑侦线索] ${c}`),
    ...clues
      .filter(c => c.suspectId !== '__forensic__')
      .slice(0, 6)
      .map((c, i) => {
        const name = suspects[c.suspectId]?.profile?.name || '嫌疑人'
        return `${publicClues.length + forensicUsed.length + i + 1}. [${name}陈述] ${c.text}`
      }),
  ]

  const caseBase = `案名：${currentCase.name}
受害者：${currentCase.victim.name}（${currentCase.victim.role}），死因：${currentCase.victim.deathCause}
案发：${currentCase.victim.time}，${currentCase.victim.location}
真凶：${culprit.name}（${culprit.role}）`

  // ── Call 1: narrative only ──
  const narrativePrompt = `你是推理小说作者。根据以下案件信息，用第三人称写一段完整的真相叙述。

${caseBase}

真凶作案详情：
${culpritPrompt}

无辜者的秘密（解释他们为何看起来可疑）：
${innocents.map(s => `• ${s.name}（${s.role}）：${s.secret}`).join('\n')}

要求：
- 完整还原真凶的动机、准备过程、案发当晚时间线、善后处理
- 点出每个无辜者的秘密如何制造了怀疑
- 结尾点明案件的悲剧内核
- 推理小说叙事口吻，直接输出正文，不要任何标题或格式标记，务必完整写到结局，不要中途截断`

  // ── Call 2: clue analysis only ──
  const cluesPrompt = `你是案件分析师。请对以下案件线索逐条解读。

案件背景：
${caseBase}
真凶作案方式：${culpritPrompt.slice(0, 400)}

需解读的线索：
${cluesForAnalysis.join('\n')}

要求：对每条线索输出如下格式（严格按格式，每条之间空一行）：
原文：[线索原文]
解读：[这条线索的真实含义，是指向真凶的证据、无辜者的秘密、还是干扰信息，20-40字。不要用"红鲱鱼"这个词]`

  const [narrativeRes, cluesRes] = await Promise.allSettled([
    revealRequest(narrativePrompt, [{ role: 'user', content: '请写真相叙述。' }], 30000),
    revealRequest(cluesPrompt, [{ role: 'user', content: '请逐条解读线索。' }], 30000),
  ])

  const narrative = narrativeRes.status === 'fulfilled'
    ? (narrativeRes.value.text || '').trim() || null
    : null

  const clueAnalysis = []
  if (cluesRes.status === 'fulfilled') {
    const raw = (cluesRes.value.text || '').trim()
    // Split on blank lines, each block is one clue
    const blocks = raw.split(/\n\s*\n/)
    for (const block of blocks) {
      const clueMatch = block.match(/原文[：:]\s*(.+?)(?=\n|$)/s)
      const analysisMatch = block.match(/解读[：:]\s*([\s\S]+?)(?=\n原文|$)/)
      if (clueMatch?.[1] && analysisMatch?.[1]) {
        clueAnalysis.push({
          clue: clueMatch[1].trim(),
          analysis: analysisMatch[1].trim(),
        })
      }
    }
  }

  return { narrative, clueAnalysis }
}
