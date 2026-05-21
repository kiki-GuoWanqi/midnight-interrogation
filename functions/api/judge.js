export async function onRequestPost({ request, env }) {
  try {
    const { accusation, caseInfo } = await request.json()

    const systemPrompt = `你是一个公正的AI裁判，负责评判玩家在侦探游戏中的表现。

评分标准：
- 90-100：指控正确，且推理逻辑严密
- 70-89：指控正确，但推理有偏差或遗漏
- 50-69：指控错误，但推理部分合理
- 30-49：指控错误，推理方向有误
- 0-29：完全错误

只输出JSON：{"correct": true/false, "score": 85, "comment": "评语", "truth": "案件真相2-3句话"}`

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `案件ID：${caseInfo.caseId}\n真凶ID：${caseInfo.culpritId}\n玩家指控：${accusation.targetId}\n理由：${accusation.reason}` },
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'AI service error' }), { status: 502 })
    }

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content || ''
    content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')

    return new Response(JSON.stringify(JSON.parse(content)), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Judge error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
}
