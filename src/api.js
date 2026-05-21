const API_BASE = '/api'

async function request(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

// Mock fallback for when backend is not available
function mockChat(suspectName) {
  const responses = [
    '这件事……我不太想谈。',
    '你问这个干什么？和我有关系吗？',
    '好吧，我承认那天晚上我确实在场。但我什么都没做。',
    '[紧张] 你……你怎么知道的？谁告诉你的？',
    '我不明白你在暗示什么。我很配合你们调查了。',
    '[慌乱] 等等，你搞错了，不是我！我虽然和他有过节，但不至于……',
    '你想让我说什么？我已经把知道的都说了。',
    '那天晚上我见到了一个人。但我不能说那是谁。',
  ]
  const text = responses[Math.floor(Math.random() * responses.length)]
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

// --- Public API ---
export async function chat(systemPrompt, messages, state) {
  try {
    return await request('/chat', { systemPrompt, messages })
  } catch {
    const suspect = state.currentCase.suspects.find(s => s.id === state.activeSuspect)
    return mockChat(suspect?.name || '嫌疑人')
  }
}

export async function judge(accusation, state) {
  try {
    return await request('/judge', { accusation, caseInfo: { caseId: state.currentCase.id, culpritId: state.culpritId } })
  } catch {
    return mockJudge(accusation, state)
  }
}
