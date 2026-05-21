export default function Header({ questionsRemaining, questionsTotal, onForensic, forensicAvailable, isLoading, bgmPlaying, onToggleBGM }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px 12px 56px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-card)',
    }}>
      {/* Questions counter */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>剩余提问：</span>
        <span style={{
          color: questionsRemaining <= 5 ? 'var(--danger)' : 'var(--accent)',
          fontSize: '1.1rem', fontWeight: 'bold',
        }}>
          {questionsRemaining}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>/{questionsTotal}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {/* BGM toggle */}
        <button
          className="btn"
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          onClick={onToggleBGM}
          title="背景音乐"
        >
          {bgmPlaying ? '🎵 音乐' : '🔇 音乐'}
        </button>

        {/* Forensic support */}
        <button
          className="btn"
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={onForensic}
          disabled={!forensicAvailable || isLoading}
          title="消耗1次提问机会获取法医报告等刑侦线索"
        >
          刑侦支援
          {forensicAvailable && (
            <span style={{ fontSize: '0.7rem', marginLeft: '4px', opacity: 0.7 }}>(-1)</span>
          )}
        </button>
      </div>
    </div>
  )
}
