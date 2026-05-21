export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { accusation, caseInfo } = req.body || {}
  if (!accusation || !caseInfo) {
    return res.status(400).json({ error: 'Missing accusation or caseInfo' })
  }

  // Build case truth context for judge
  const systemPrompt = `你是一个公正的AI裁判，负责评判玩家在侦探游戏中的表现。

你需要根据案件真实信息，判断玩家的指控是否正确，并给出1-100的评分和评语。

评分标准：
- 90-100：指控正确，且推理逻辑严密，抓住了关键证据链
- 70-89：指控正确，但推理有一定偏差或遗漏
- 50-69：指控错误，但推理部分合理，接近真相的边缘
- 30-49：指控错误，推理方向有误
- 0-29：完全错误，逻辑不成立

请使用中文回复。只输出JSON格式，不要有其他内容。

输出格式：
{
  "correct": true/false,
  "score": 85,
  "comment": "评语，说明玩家的推理哪里对哪里错",
  "truth": "完整的案件真相，用2-3句话说明真凶是谁、动机、作案手法"
}`

  const userPrompt = `
案件ID：${caseInfo.caseId}
真凶ID：${caseInfo.culpritId}

玩家指控对象：${accusation.targetId}
玩家指控理由：${accusation.reason}

请根据以上信息，给出裁判结果。
`

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('DeepSeek API error:', err)
      return res.status(502).json({ error: 'AI service error' })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = content.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }

    const verdict = JSON.parse(jsonStr)
    return res.status(200).json(verdict)
  } catch (err) {
    console.error('Judge API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
