export default function SuspectPortrait({ size = 120, name = '' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--bg-input)', border: '2px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontFamily: 'var(--font-display)', color: 'var(--accent)',
      fontSize: `${size * 0.38}px`,
    }}>
      {name.slice(0, 1)}
    </div>
  )
}
