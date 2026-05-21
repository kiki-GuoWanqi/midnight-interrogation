import SuspectPortrait from './SuspectPortrait'

export default function SuspectCard({ suspect, caseId, emotion, isActive, onClick }) {
  const emotionColors = {
    calm: 'var(--text-muted)',
    nervous: '#d4a843',
    agitated: 'var(--danger)',
  }
  const emotionLabels = { calm: '平静', nervous: '紧张', agitated: '慌乱' }
  const currentEmotion = emotion || 'calm'

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s',
        textAlign: 'center',
      }}
    >
      <SuspectPortrait name={suspect.name} size={90} />

      <div style={{
        fontFamily: 'var(--font-display)', fontSize: '1.05rem',
        marginTop: '12px', marginBottom: '4px',
      }}>
        {suspect.name}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
        {suspect.role} / {suspect.relationToVictim}
      </div>

      {emotion !== undefined && (
        <div style={{
          fontSize: '0.8rem',
          color: emotionColors[currentEmotion],
          fontFamily: 'var(--font-mono)',
          borderTop: '1px solid var(--border)',
          paddingTop: '8px', marginTop: '4px',
        }}>
          状态：{emotionLabels[currentEmotion]}
        </div>
      )}
    </div>
  )
}
