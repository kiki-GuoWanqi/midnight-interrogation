import { useState, useRef, useEffect } from 'react'
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
  const [typing, setTyping] = useState(null) // { text: string, emotionMark: string|null }
  const [isTyping, setIsTyping] = useState(false)
  const [bgmPlaying, setBgmPlaying] = useState(getIsPlaying)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const cancelTypewriterRef = useRef(null)

  const activeId = state.activeSuspect
  const activeSuspect = state.suspects[activeId]
  const activeProfile = activeSuspect?.profile
  const forensicAvailable =
    state.usedForensicClues.length < state.currentCase.forensicClues.length

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
    }
  }, [])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || state.isLoading || isTyping || state.questionsRemaining <= 0) return

    // Cancel any ongoing typewriter
    cancelTypewriterRef.current?.()
    setTyping(null)
    setIsTyping(false)

    dispatch({ type: 'SEND_MESSAGE', suspectId: activeId, text })
    setInput('')

    try {
      const msgs = activeSuspect.chatHistory.map(m => ({
        role: m.role === 'player' ? 'user' : 'assistant',
        content: m.text,
      }))
      msgs.push({ role: 'user', content: text })

      const result = await chat(
        activeProfile?.systemPrompt || '',
        msgs,
        state
      )

      const emotionMark = result.emotionMark || null
      const cleanText = result.text.replace(/^\[紧张\]|^\[慌乱\]/, '').trim()

      // Start typewriter
      setIsTyping(true)
      setTyping({ text: '', emotionMark })

      cancelTypewriterRef.current = createTypewriter(
        cleanText,
        (partial) => {
          setTyping({ text: partial, emotionMark })
        },
        () => {
          // Typewriter done — add to chat history
          dispatch({
            type: 'RECEIVE_MESSAGE',
            suspectId: activeId,
            text: cleanText,
            emotionMark,
          })
          setTyping(null)
          setIsTyping(false)
        },
        40
      )
    } catch {
      dispatch({ type: 'CHAT_ERROR' })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSwitchSuspect = (id) => {
    cancelTypewriterRef.current?.()
    setTyping(null)
    setIsTyping(false)
    dispatch({ type: 'SWITCH_SUSPECT', suspectId: id })
  }

  const handleSaveClue = (message) => {
    dispatch({ type: 'SAVE_CLUE', suspectId: activeId, text: message.text })
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
            {activeSuspect?.chatHistory.length === 0 && !typing && (
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
                message={{
                  role: 'suspect',
                  text: typing.text,
                  emotionMark: typing.emotionMark,
                }}
                suspectName={activeProfile?.name}
              />
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
    </div>
  )
}
