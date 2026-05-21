export default function ChatBubble({ message, suspectName, onSave }) {
  const isPlayer = message.role === 'player'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isPlayer ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
    }}>
      {/* Sender label */}
      <div style={{
        fontSize: '0.75rem', color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)', marginBottom: '4px',
      }}>
        {isPlayer ? '你' : suspectName}
      </div>

      {/* Emotion tag */}
      {message.emotionMark && (
        <div style={{
          fontSize: '0.7rem', color: 'var(--danger)',
          fontFamily: 'var(--font-mono)',
          marginBottom: '4px', letterSpacing: '0.1em',
        }}>
          [{message.emotionMark}]
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: '80%',
        padding: '12px 16px',
        borderRadius: '4px',
        background: isPlayer ? 'rgba(201, 168, 76, 0.1)' : 'var(--bg-input)',
        border: `1px solid ${isPlayer ? 'var(--accent-dim)' : 'var(--border)'}`,
        color: isPlayer ? 'var(--accent)' : 'var(--text-primary)',
        fontSize: '0.95rem',
        lineHeight: 1.7,
      }}>
        {message.text}
      </div>

      {/* Save to clue button */}
      {!isPlayer && onSave && (
        <button
          onClick={() => onSave(message)}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.75rem', marginTop: '4px',
            fontFamily: 'var(--font-body)',
            textDecoration: 'underline', opacity: 0.6,
          }}
          onMouseEnter={e => e.target.style.opacity = '1'}
          onMouseLeave={e => e.target.style.opacity = '0.6'}
        >
          保存到线索板
        </button>
      )}
    </div>
  )
}
