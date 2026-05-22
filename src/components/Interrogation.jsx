import { useState, useRef, useEffect, useCallback } from 'react'
import Header from './Header'
import CaseBoard from './CaseBoard'
import ClueBoard from './ClueBoard'
import ChatBubble from './ChatBubble'
import SuspectPortrait from './SuspectPortrait'
import { chat } from '../api'
import { createTypewriter } from '../utils'
import { startBGM, stopBGM, toggleBGM, getIsPlaying } from '../bgm'

export default function Interrogation({ state, dispatch }) {
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [bgmPlaying, setBgmPlaying] = useState(getIsPlaying)
  const [retryCtx, setRetryCtx] = useState(null) // { systemPrompt, msgs, sentToId }
  const [toast, setToast] = useState('')
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const cancelTypewriterRef = useRef(null)
  const requestIdRef = useRef(0)
  const toastTimerRef = useRef(null)

  const activeId = state.activeSuspect
  const activeSuspect = state.suspects[activeId]
  const activeProfile = activeSuspect?.profile
  const forensicAvailable =
    state.usedForensicClues.length < (state.dynamicForensicClues || state.currentCase.forensicClues).length

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSuspect?.chatHistory, typing?.text])

  // Focus input when switching suspects
  useEffect(() => {
    inputRef.current?.focus()
  }, [activeId])

  // Auto-start BGM on mount
  useEffect(() => {
    startBGM()
    setBgmPlaying(true)
    return () => {
      stopBGM()
      setBgmPlaying(false)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelTypewriterRef.current?.()
      clearTimeout(toastTimerRef.current)
    }
  }, [])

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(''), 2000)
  }, [])

  // Core API call — shared by handleSend and handleRetry
  const doApiCall = useCallback(async (systemPrompt, msgs, sentToId, requestId) => {
    try {
      const result = await chat(systemPrompt, msgs)
      if (requestId !== requestIdRef.current) return

      const emotionMark = result.emotionMark || null
      const cleanText = result.text.replace(/^\[紧张\]|^\[慌乱\]/, '').trim()

      setRetryCtx(null)
      setIsTyping(true)
      setTyping({ text: '', emotionMark })

      cancelTypewriterRef.current = createTypewriter(
        cleanText,
        (partial) => setTyping({ text: partial, emotionMark }),
        () => {
          if (requestId !== requestIdRef.current) return
          dispatch({ type: 'RECEIVE_MESSAGE', suspectId: sentToId, text: cleanText, emotionMark })
          setTyping(null)
          setIsTyping(false)
        },
        40
      )
    } catch {
      if (requestId !== requestIdRef.current) return
      // Refund the question — real API failure
      dispatch({ type: 'CHAT_ERROR', refund: true })
      setRetryCtx({ systemPrompt, msgs, sentToId })
    }
  }, [dispatch])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || state.isLoading || isTyping || state.questionsRemaining <= 0) return

    cancelTypewriterRef.current?.()
    setTyping(null)
    setIsTyping(false)
    setRetryCtx(null)

    const requestId = ++requestIdRef.current
    const sentToId = activeId

    dispatch({ type: 'SEND_MESSAGE', suspectId: activeId, text })
    setInput('')

    const msgs = activeSuspect.chatHistory.map(m => ({
      role: m.role === 'player' ? 'user' : 'assistant',
      content: m.text,
    }))
    msgs.push({ role: 'user', content: text })

    await doApiCall(activeProfile?.systemPrompt || '', msgs, sentToId, requestId)
  }

  const handleRetry = async () => {
    if (!retryCtx || state.isLoading || isTyping) return
    const { systemPrompt, msgs, sentToId } = retryCtx
    const requestId = ++requestIdRef.current
    dispatch({ type: 'SET_LOADING' })
    await doApiCall(systemPrompt, msgs, sentToId, requestId)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSwitchSuspect = (id) => {
    if (id === activeId) return
    requestIdRef.current++
    cancelTypewriterRef.current?.()
    setTyping(null)
    setIsTyping(false)
    setRetryCtx(null)
    if (state.isLoading) dispatch({ type: 'CHAT_ERROR' }) // no refund — user switched away
    dispatch({ type: 'SWITCH_SUSPECT', suspectId: id })
  }

  const handleSaveClue = (message) => {
    dispatch({ type: 'SAVE_CLUE', suspectId: activeId, text: message.text })
    showToast('已保存到线索板')
  }

  const handleToggleBGM = () => {
    toggleBGM()
    setBgmPlaying(getIsPlaying())
  }

  const questionsExhausted = state.questionsRemaining <= 0 && !isTyping

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        questionsRemaining={state.questionsRemaining}
        questionsTotal={state.questionsTotal}
        onForensic={() => dispatch({ type: 'ADD_FORENSIC_CLUE' })}
        forensicAvailable={forensicAvailable && state.questionsRemaining > 0}
        isLoading={state.isLoading || isTyping}
        bgmPlaying={bgmPlaying}
        onToggleBGM={handleToggleBGM}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Case Board */}
        <div style={{
          width: '260px', minWidth: '220px',
          borderRight: '1px solid var(--border)', overflow: 'auto',
        }}>
          <CaseBoard
            currentCase={state.currentCase}
            activeSuspect={activeId}
            suspects={state.suspects}
            onSwitchSuspect={handleSwitchSuspect}
          />
        </div>

        {/* Center: Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Suspect bar */}
          <div style={{
            padding: '10px 20px', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <SuspectPortrait name={activeProfile?.name} size={36} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
              {activeProfile?.name}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {activeProfile?.role}
            </span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
            {activeSuspect?.chatHistory.length === 0 && !typing && !retryCtx && (
              <p style={{
                color: 'var(--text-muted)', textAlign: 'center',
                marginTop: '60px', fontStyle: 'italic',
              }}>
                你走进了审讯室。{activeProfile?.name}坐在桌对面，等待着你的第一个问题。
              </p>
            )}
            {activeSuspect?.chatHistory.map(msg => (
              <ChatBubble
                key={msg.id}
                message={msg}
                suspectName={activeProfile?.name}
                onSave={msg.role === 'suspect' ? handleSaveClue : undefined}
              />
            ))}
            {/* Typewriter bubble */}
            {typing && (
              <ChatBubble
                message={{ role: 'suspect', text: typing.text, emotionMark: typing.emotionMark }}
                suspectName={activeProfile?.name}
              />
            )}
            {/* API error with retry */}
            {retryCtx && !state.isLoading && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0',
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  {activeProfile?.name}沉默不语…
                </span>
                <button
                  className="btn"
                  style={{ fontSize: '0.8rem', padding: '4px 14px' }}
                  onClick={handleRetry}
                >
                  重试
                </button>
              </div>
            )}
            {/* Loading */}
            {state.isLoading && !typing && (
              <div style={{
                color: 'var(--text-muted)', fontSize: '0.85rem',
                fontStyle: 'italic', padding: '8px 0',
              }}>
                {activeProfile?.name}正在思考...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '16px 20px', borderTop: '1px solid var(--border)',
            background: 'var(--bg-card)',
          }}>
            {questionsExhausted ? (
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <p style={{ color: 'var(--danger)', marginBottom: '10px' }}>
                  提问次数已用尽。
                </p>
                <button className="btn btn-danger"
                  onClick={() => dispatch({ type: 'GO_TO_ACCUSATION' })}>
                  做出最终指控
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  ref={inputRef}
                  className="input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`向${activeProfile?.name}提问... (Enter发送)`}
                  disabled={state.isLoading || isTyping}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn"
                  onClick={handleSend}
                  disabled={!input.trim() || state.isLoading || isTyping}
                >
                  发送
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Clue Board */}
        <div style={{
          width: '280px', minWidth: '240px',
          borderLeft: '1px solid var(--border)',
        }}>
          <ClueBoard
            clues={state.clues}
            suspects={state.suspects}
            onEdit={(clueId, newText) => dispatch({ type: 'EDIT_CLUE', clueId, newText })}
            onDelete={(clueId) => dispatch({ type: 'DELETE_CLUE', clueId })}
            onAccuse={() => dispatch({ type: 'GO_TO_ACCUSATION' })}
          />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-card)', border: '1px solid var(--accent)',
          color: 'var(--accent)', fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem', padding: '8px 20px',
          pointerEvents: 'none', zIndex: 9000,
          animation: 'fadeInUp 0.2s ease',
        }}>
          {toast}
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateX(-50%) translateY(8px); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
