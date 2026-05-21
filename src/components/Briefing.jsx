import SuspectCard from './SuspectCard'

export default function Briefing({ state, dispatch }) {
  const c = state.currentCase

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Case Title */}
      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>
        案件档案：{c.name}
      </h1>

      {/* Victim Info */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            VICTIM
          </span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '0.95rem' }}>
          <div><span style={{ color: 'var(--text-muted)' }}>姓名：</span>{c.victim.name}</div>
          <div><span style={{ color: 'var(--text-muted)' }}>年龄：</span>{c.victim.age}岁</div>
          <div><span style={{ color: 'var(--text-muted)' }}>身份：</span>{c.victim.role}</div>
          <div><span style={{ color: 'var(--text-muted)' }}>死因：</span>{c.victim.deathCause}</div>
          <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--text-muted)' }}>地点：</span>{c.victim.location}</div>
          <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--text-muted)' }}>时间：</span>{c.victim.time}</div>
        </div>
        <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>
          {c.victim.bio}
        </p>
      </div>

      {/* Public Clues */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '10px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            EVIDENCE — 警方初步调查
          </span>
        </h3>
        <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {c.publicClues.map((clue, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>{clue}</li>
          ))}
        </ul>
      </div>

      {/* Suspects */}
      <h3 style={{ marginBottom: '16px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          SUSPECTS — 嫌疑人
        </span>
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {c.suspects.map(s => (
          <SuspectCard key={s.id} suspect={s} caseId={c.id} />
        ))}
      </div>

      {/* Start Button */}
      <div style={{ textAlign: 'center' }}>
        <button className="btn" style={{ fontSize: '1.1rem', padding: '14px 48px' }}
          onClick={() => dispatch({ type: 'GO_TO_INTERROGATION' })}>
          开始审讯
        </button>
      </div>
    </div>
  )
}
