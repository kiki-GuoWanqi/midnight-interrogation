import SuspectPortrait from './SuspectPortrait'

export default function Verdict({ state, dispatch, judging }) {
  if (judging) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', padding: '40px 20px',
      }}>
        <h2 style={{ marginBottom: '16px' }}>裁判评议中</h2>
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          正在分析你的推理与案件真相...
        </p>
      </div>
    )
  }

  const v = state.verdict
  if (!v) return null

  const culprit = state.currentCase.suspects.find(s => s.id === state.culpritId)
  const accused = state.currentCase.suspects.find(s => s.id === state.accusation.targetId)

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Result header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          fontSize: '4rem', marginBottom: '8px',
        }}>
          {v.correct ? '✓' : '✗'}
        </div>
        <h1 style={{
          color: v.correct ? 'var(--accent)' : 'var(--danger)',
          marginBottom: '8px',
        }}>
          {v.correct ? '指控成立' : '指控不成立'}
        </h1>
        {v.correct
          ? <p style={{ color: 'var(--text-secondary)' }}>你的推理正确，真凶已被锁定。</p>
          : <p style={{ color: 'var(--text-secondary)' }}>你指控了错误的人。真正的凶手仍然逍遥法外。</p>
        }
      </div>

      {/* Score */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          INVESTIGATION SCORE
        </div>
        <div style={{
          fontSize: '3rem', fontFamily: 'var(--font-display)',
          color: v.score >= 70 ? 'var(--accent)' : v.score >= 40 ? '#d4a843' : 'var(--danger)',
        }}>
          {v.score}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>分 / 100</div>
      </div>

      {/* AI Comment */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            AI JUDGE COMMENT
          </span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{v.comment}</p>
      </div>

      {/* Truth reveal */}
      <div className="card" style={{ marginBottom: '24px', borderColor: 'var(--danger)' }}>
        <h3 style={{
          marginBottom: '10px', fontSize: '0.95rem', color: 'var(--danger)',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            CASE CLOSED — 案件真相
          </span>
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <SuspectPortrait name={culprit.name} size={52} />
          <p style={{ lineHeight: 1.8, flex: 1 }}>
            <strong style={{ color: 'var(--danger)', fontSize: '1.05rem' }}>
              真凶：{culprit.name}（{culprit.role}）
            </strong>
          </p>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.8 }}>
          {v.truth}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '14px', padding: '10px', background: 'var(--bg-input)', borderRadius: '4px' }}>
          <SuspectPortrait name={accused.name} size={36} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            你指控了：{accused.name}（{accused.role}）
          </p>
        </div>
      </div>

      {/* Play again */}
      <div style={{ textAlign: 'center' }}>
        <button className="btn" style={{ fontSize: '1.1rem', padding: '14px 48px' }}
          onClick={() => dispatch({ type: 'NEW_GAME' })}>
          再来一局
        </button>
      </div>
    </div>
  )
}
