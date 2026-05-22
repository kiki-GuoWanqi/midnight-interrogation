export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    try {
      if (path === '/api/chat') {
        const { systemPrompt, messages } = await request.json()
        if (!systemPrompt || !messages) {
          return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const resp = await fetch('https://api.deepseek.com/chat/completions', {
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

        if (!resp.ok) {
          const errText = await resp.text()
          return new Response(JSON.stringify({ error: `DeepSeek error ${resp.status}: ${errText.slice(0, 200)}` }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        const data = await resp.json()
        const text = data.choices?.[0]?.message?.content || '（沉默）'
        const emotionMatch = text.trimStart().match(/^\[(紧张|慌乱)\]/)

        return new Response(JSON.stringify({
          text,
          emotionMark: emotionMatch ? emotionMatch[1] : null,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      // Dedicated endpoint for long-form content (narrative + clue analysis)
      if (path === '/api/reveal') {
        const { systemPrompt, messages } = await request.json()
        if (!systemPrompt || !messages) {
          return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const resp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        })

        if (!resp.ok) {
          const errText = await resp.text()
          return new Response(JSON.stringify({ error: `DeepSeek error ${resp.status}: ${errText.slice(0, 200)}` }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        const data = await resp.json()
        const text = data.choices?.[0]?.message?.content || ''

        return new Response(JSON.stringify({ text }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (path === '/api/judge') {
        const { accusation, caseInfo } = await request.json()

        const resp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: '你是公正的AI裁判。评分标准：90-100指控正确逻辑严密，70-89指控正确但有偏差，50-69指控错误但部分合理，30-49方向有误，0-29完全错误。只输出JSON：{"correct":true/false,"score":85,"comment":"评语","truth":"案件真相2-3句话"}' },
              { role: 'user', content: `案件ID：${caseInfo.caseId}\n真凶ID：${caseInfo.culpritId}\n玩家指控：${accusation.targetId}\n理由：${accusation.reason}` },
            ],
            temperature: 0.5,
            max_tokens: 500,
          }),
        })

        if (!resp.ok) {
          const errText = await resp.text()
          return new Response(JSON.stringify({ error: `DeepSeek error ${resp.status}: ${errText.slice(0, 200)}` }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        const data = await resp.json()
        let content = data.choices?.[0]?.message?.content || ''
        content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')

        return new Response(JSON.stringify(JSON.parse(content)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  },
}
