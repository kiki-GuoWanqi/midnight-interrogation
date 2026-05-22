import SuspectPortrait from './SuspectPortrait'

export default function Verdict({ state, dispatch, judging }) {
  if (judging) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: '16px', padding: '40px 20px',
      }}>
        <h2 style={{ marginBottom: '8px' }}>案件裁决中</h2>
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          正在还原案件真相，构建完整故事……
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
          此过程需要约10-20秒
        </p>
      </div>
    )
  }

  const v = state.verdict
  if (!v) return null

  const culprit = state.currentCase.suspects.find(s => s.id === state.culpritId)
  const accused = state.currentCase.suspects.find(s => s.id === state.accusation.targetId)

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>

      {/* ── Result header ── */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>
          {v.correct ? '✓' : '✗'}
        </div>
        <h1 style={{
          color: v.correct ? 'var(--accent)' : 'var(--danger)',
          marginBottom: '8px',
        }}>
          {v.correct ? '指控成立' : '指控不成立'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {v.correct
            ? '你的推理正确，真凶已被锁定。'
            : '你指控了错误的人。真正的凶手仍然逍遥法外。'}
        </p>
      </div>

      {/* ── Culprit reveal ── */}
      <div className="card" style={{ marginBottom: '20px', borderColor: 'var(--danger)' }}>
        <Label style={{ color: 'var(--danger)' }}>CASE CLOSED — 真凶身份</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
          <SuspectPortrait name={culprit.name} size={56} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--danger)' }}>
              {culprit.name}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{culprit.role}</div>
          </div>
        </div>
        {/* brief truth from judge API as fallback when no narrative */}
        {!v.narrative && v.truth && (
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{v.truth}</p>
        )}
      </div>

      {/* ── Full narrative ── */}
      {v.narrative && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <Label>CASE NARRATIVE — 案件全貌</Label>
          <p style={{
            color: 'var(--text-secondary)', lineHeight: 1.95,
            whiteSpace: 'pre-wrap', fontSize: '0.97rem',
          }}>
            {v.narrative}
          </p>
        </div>
      )}

      {/* ── Clue analysis ── */}
      {v.clueAnalysis && v.clueAnalysis.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <Label>CLUE ANALYSIS — 线索解读</Label>
          <div style={{ marginTop: '4px' }}>
            {v.clueAnalysis.map((item, i) => (
              <div key={i} style={{
                padding: '12px 0',
                borderBottom: i < v.clueAnalysis.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  color: 'var(--text-muted)', fontSize: '0.85rem',
                  marginBottom: '4px', lineHeight: 1.6,
                }}>
                  <span style={{ color: 'var(--accent-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginRight: '6px' }}>
                    线索
                  </span>
                  {item.clue}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, paddingLeft: '8px', borderLeft: '2px solid var(--accent-dim)' }}>
                  {item.analysis}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Your accusation ── */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <Label>YOUR ACCUSATION — 你的指控</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
          <SuspectPortrait name={accused.name} size={40} />
          <div>
            <span style={{ color: v.correct ? 'var(--accent)' : 'var(--danger)' }}>
              {accused.name}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>
              {accused.role}
            </span>
          </div>
        </div>
        {state.accusation.reason && (
          <p style={{
            marginTop: '10px', color: 'var(--text-muted)',
            fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.7,
          }}>
            "{state.accusation.reason}"
          </p>
        )}
      </div>

      {/* ── Play again ── */}
      <div style={{ textAlign: 'center' }}>
        <button className="btn" style={{ fontSize: '1.1rem', padding: '14px 48px' }}
          onClick={() => dispatch({ type: 'NEW_GAME' })}>
          再来一局
        </button>
      </div>
    </div>
  )
}

function Label({ children, style }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
      color: 'var(--text-muted)', marginBottom: '12px',
      letterSpacing: '0.05em', ...style,
    }}>
      {children}
    </div>
  )
}
