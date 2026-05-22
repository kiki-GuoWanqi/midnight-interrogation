import { useEffect, useRef } from 'react'
import { generateClues } from '../api'

export default function GeneratingScreen({ state, dispatch }) {
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const culpritSystemPrompt = state.suspects[state.culpritId].profile.systemPrompt

    generateClues(state.currentCase, state.culpritId, culpritSystemPrompt).then(result => {
      dispatch({
        type: 'SET_DYNAMIC_CLUES',
        publicClues: result.publicClues,
        forensicClues: result.forensicClues,
        aiGenerated: result.aiGenerated,
      })
    })
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: '24px',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
        color: 'var(--text-muted)', letterSpacing: '0.2em',
      }}>
        CASE FILE LOADING
      </div>
      <Spinner />
      <p style={{
        fontFamily: 'var(--font-body)', color: 'var(--text-secondary)',
        fontSize: '1rem', fontStyle: 'italic',
      }}>
        正在调取案件档案…
      </p>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--accent)',
          animation: `pulse 1.2s ease-in-out ${i * 0.4}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
