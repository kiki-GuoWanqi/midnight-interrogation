export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { systemPrompt, messages } = req.body || {}
  if (!systemPrompt || !messages) {
    return res.status(400).json({ error: 'Missing systemPrompt or messages' })
  }

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
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('DeepSeek API error:', err)
      return res.status(502).json({ error: 'AI service error' })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || '（沉默）'

    // Extract emotion mark if present at the beginning
    const emotionMatch = text.trimStart().match(/^\[(紧张|慌乱)\]/)
    const emotionMark = emotionMatch ? emotionMatch[1] : null

    return res.status(200).json({ text, emotionMark })
  } catch (err) {
    console.error('Chat API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
