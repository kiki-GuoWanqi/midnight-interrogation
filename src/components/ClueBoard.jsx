import { useState } from 'react'

export default function ClueBoard({ clues, suspects, onEdit, onDelete, onAccuse }) {
  return (
    <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
        color: 'var(--text-muted)', marginBottom: '12px',
      }}>
        CLUE BOARD · 线索板
      </div>

      {/* Clue list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {clues.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
            点击对话中的"保存到线索板"来收集关键信息
          </p>
        )}
        {clues.map(clue => {
          const isForensic = clue.suspectId === '__forensic__'
          return (
            <ClueItem
              key={clue.id}
              clue={clue}
              suspectName={isForensic ? '刑侦报告' : (suspects[clue.suspectId]?.profile?.name || '未知')}
              isForensic={isForensic}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )
        })}
      </div>

      {/* Accuse button */}
      <button
        className="btn btn-danger"
        style={{ marginTop: '16px', width: '100%', padding: '12px' }}
        onClick={onAccuse}
      >
        最终指控
      </button>
    </div>
  )
}

function ClueItem({ clue, suspectName, isForensic, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(clue.text)

  const handleSave = () => {
    onEdit(clue.id, text)
    setEditing(false)
  }

  if (editing) {
    return (
      <div style={{ marginBottom: '10px', padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--accent)' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="input"
          style={{ width: '100%', minHeight: '60px', fontSize: '0.85rem', resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button className="btn" style={{ fontSize: '0.8rem', padding: '4px 12px' }} onClick={handleSave}>保存</button>
          <button style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-body)',
          }} onClick={() => { setEditing(false); setText(clue.text) }}>取消</button>
        </div>
      </div>
    )
  }

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      style={{
        marginBottom: '10px', padding: '10px',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        cursor: 'pointer', fontSize: '0.85rem',
      }}
    >
      <div style={{
        color: isForensic ? '#4a9eff' : 'var(--accent)',
        fontSize: '0.7rem', fontFamily: 'var(--font-mono)', marginBottom: '4px',
      }}>
        {isForensic ? '🔍 刑侦报告' : `FROM: ${suspectName}`}
      </div>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{clue.text}</div>
      <button
        onClick={() => onDelete(clue.id)}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '0.7rem', marginTop: '4px',
          fontFamily: 'var(--font-body)', opacity: 0.5,
        }}
      >
        删除
      </button>
    </div>
  )
}
