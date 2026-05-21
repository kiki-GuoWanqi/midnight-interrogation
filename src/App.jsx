import { useReducer, useState, useCallback } from 'react'
import { gameReducer, initialState } from './reducer'
import StartScreen from './components/StartScreen'
import Briefing from './components/Briefing'
import Interrogation from './components/Interrogation'
import Accusation from './components/Accusation'
import Verdict from './components/Verdict'
import ConfirmModal from './components/ConfirmModal'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleBack = useCallback(() => {
    switch (state.phase) {
      case 'briefing':
        dispatch({ type: 'BACK_TO_START' })
        break
      case 'interrogation':
        setShowConfirm(true)
        break
      case 'accusation':
        dispatch({ type: 'BACK_TO_INTERROGATION' })
        break
    }
  }, [state.phase])

  const showBackButton = ['briefing', 'interrogation', 'accusation'].includes(state.phase)

  const renderPhase = () => {
    switch (state.phase) {
      case 'start':
        return <StartScreen dispatch={dispatch} />
      case 'briefing':
        return <Briefing state={state} dispatch={dispatch} />
      case 'interrogation':
        return <Interrogation state={state} dispatch={dispatch} />
      case 'accusation':
        return <Accusation state={state} dispatch={dispatch} />
      case 'judging':
        return <Verdict state={state} dispatch={dispatch} judging />
      case 'reveal':
        return <Verdict state={state} dispatch={dispatch} />
      default:
        return <StartScreen dispatch={dispatch} />
    }
  }

  return (
    <div className="app" style={{ position: 'relative' }}>
      {/* Back button */}
      {showBackButton && (
        <button
          onClick={handleBack}
          title="返回"
          style={{
            position: 'fixed', top: '12px', left: '12px', zIndex: 5000,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', cursor: 'pointer',
            width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontFamily: 'var(--font-body)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.color = 'var(--accent)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          ←
        </button>
      )}

      {renderPhase()}

      {/* Confirmation modal */}
      {showConfirm && (
        <ConfirmModal
          title="结束当前审讯？"
          message="返回后当前审讯进度将丢失，确认退出吗？"
          onConfirm={() => {
            setShowConfirm(false)
            dispatch({ type: 'NEW_GAME' })
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
