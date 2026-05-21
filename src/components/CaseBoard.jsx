export default function CaseBoard({ currentCase, activeSuspect, suspects, onSwitchSuspect }) {
  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      {/* Case summary */}
      <div className="card" style={{ marginBottom: '16px', padding: '14px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>{currentCase.name}</h3>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p><b>受害者：</b>{currentCase.victim.name}（{currentCase.victim.age}岁，{currentCase.victim.role}）</p>
          <p style={{ marginTop: '4px' }}><b>死因：</b>{currentCase.victim.deathCause}</p>
          <p style={{ marginTop: '4px' }}><b>时间：</b>{currentCase.victim.time}</p>
        </div>
      </div>

      {/* Suspect quick switch */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
        SUSPECTS
      </div>
      {currentCase.suspects.map(s => {
        const state = suspects[s.id]
        const emotionLabels = { calm: '平静', nervous: '紧张', agitated: '慌乱' }
        return (
          <div
            key={s.id}
            onClick={() => onSwitchSuspect(s.id)}
            style={{
              padding: '10px 12px',
              marginBottom: '6px',
              cursor: 'pointer',
              background: activeSuspect === s.id ? 'var(--bg-input)' : 'transparent',
              border: `1px solid ${activeSuspect === s.id ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>
              {s.name}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                {s.role}
              </span>
            </div>
            <div style={{
              fontSize: '0.75rem', color: 'var(--text-muted)',
              marginTop: '2px',
            }}>
              已对话 {state.chatHistory.filter(m => m.role === 'player').length} 次
              {' · '}
              {emotionLabels[state.emotionState]}
            </div>
          </div>
        )
      })}
    </div>
  )
}
