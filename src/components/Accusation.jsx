import { useState } from 'react'
import SuspectPortrait from './SuspectPortrait'
import { judge, generateTruthReveal } from '../api'

export default function Accusation({ state, dispatch }) {
  const [targetId, setTargetId] = useState(state.accusation.targetId)
  const [reason, setReason] = useState(state.accusation.reason)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!targetId) {
      setError('请选择你要指控的嫌疑人')
      return
    }
    if (!reason.trim()) {
      setError('请填写指控理由')
      return
    }
    setError('')
    setSubmitting(true)

    dispatch({ type: 'SET_ACCUSATION_TARGET', suspectId: targetId })
    dispatch({ type: 'SET_ACCUSATION_REASON', reason: reason.trim() })
    dispatch({ type: 'SUBMIT_ACCUSATION' })

    // allSettled so one failure doesn't block the other
    const [judgeSettled, revealSettled] = await Promise.allSettled([
      judge({ targetId, reason: reason.trim() }, state),
      generateTruthReveal(state),
    ])

    const correct = targetId === state.culpritId
    const judgeResult = judgeSettled.status === 'fulfilled'
      ? judgeSettled.value
      : {
          correct,
          score: correct ? 80 : 35,
          comment: '案件真相与你推理的方向有交集，但关键证据链还有待深挖。',
          truth: `真凶是${state.currentCase.suspects.find(s => s.id === state.culpritId).name}。`,
        }
    const revealResult = revealSettled.status === 'fulfilled'
      ? revealSettled.value
      : { narrative: null, clueAnalysis: [] }

    dispatch({
      type: 'SET_VERDICT',
      verdict: {
        ...judgeResult,
        narrative: revealResult.narrative,
        clueAnalysis: revealResult.clueAnalysis,
      },
    })
  }

  const suspects = state.currentCase.suspects

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>最终指控</h1>
      <p style={{
        textAlign: 'center', color: 'var(--text-secondary)',
        marginBottom: '40px', fontStyle: 'italic',
      }}>
        你只有一次机会。选择你认为的真凶，并说明理由。
      </p>

      {/* Suspect selection */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
        marginBottom: '32px',
      }}>
        {suspects.map(s => (
          <div
            key={s.id}
            onClick={() => setTargetId(s.id)}
            style={{
              padding: '20px', textAlign: 'center', cursor: 'pointer',
              background: targetId === s.id ? 'rgba(204, 51, 51, 0.12)' : 'var(--bg-card)',
              border: `2px solid ${targetId === s.id ? 'var(--danger)' : 'var(--border)'}`,
              transition: 'all 0.2s',
            }}
          >
            <SuspectPortrait name={s.name} size={72} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginTop: '8px' }}>{s.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.role}</div>
          </div>
        ))}
      </div>

      {/* Reason */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
          color: 'var(--text-muted)', display: 'block', marginBottom: '8px',
        }}>
          ACCUSATION STATEMENT — 指控理由（1-3句话）
        </label>
        <textarea
          className="input"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="基于审讯中获得的线索，说明你为什么认为此人是凶手..."
          style={{ width: '100%', minHeight: '100px', resize: 'vertical', lineHeight: 1.7 }}
          maxLength={500}
        />
        <div style={{
          fontSize: '0.75rem', color: 'var(--text-muted)',
          textAlign: 'right', marginTop: '4px',
        }}>
          {reason.length}/500
        </div>
      </div>

      {error && (
        <p style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem' }}>
          {error}
        </p>
      )}

      <div style={{ textAlign: 'center' }}>
        <button
          className="btn btn-danger"
          style={{ fontSize: '1.1rem', padding: '14px 48px' }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '提交中...' : '确认指控'}
        </button>
      </div>
    </div>
  )
}
