export async function onRequestPost({ request, env }) {
  try {
    const { systemPrompt, messages } = await request.json()
    if (!systemPrompt || !messages) {
      return new Response(JSON.stringify({ error: 'Missing systemPrompt or messages' }), { status: 400 })
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.8,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'AI service error' }), { status: 502 })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || '（沉默）'
    const emotionMatch = text.trimStart().match(/^\[(紧张|慌乱)\]/)

    return new Response(JSON.stringify({
      text,
      emotionMark: emotionMatch ? emotionMatch[1] : null,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Chat error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
}
