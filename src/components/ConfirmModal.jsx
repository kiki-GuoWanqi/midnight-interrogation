export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="card"
        style={{
          maxWidth: '420px', width: '90%', padding: '28px',
          borderColor: 'var(--accent)', textAlign: 'center',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn" onClick={onCancel}>取消</button>
          <button className="btn btn-danger" onClick={onConfirm}>确认退出</button>
        </div>
      </div>
    </div>
  )
}
