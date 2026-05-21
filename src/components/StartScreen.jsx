export default function StartScreen({ dispatch }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', padding: '40px 20px',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '8px' }}>午夜审讯</h1>
      <p style={{
        fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
        fontSize: '0.95rem', letterSpacing: '0.15em', marginBottom: '48px',
      }}>
        MIDNIGHT INTERROGATION
      </p>
      <p style={{
        maxWidth: '400px', color: 'var(--text-secondary)',
        fontStyle: 'italic', marginBottom: '48px', lineHeight: 1.8,
      }}>
        "每个嫌疑人都在说谎。<br />你的任务是找到那个说谎最深的人。"
      </p>

      {/* Rules */}
      <div className="card" style={{
        maxWidth: '460px', textAlign: 'left',
        marginBottom: '48px', padding: '20px 24px',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
          color: 'var(--text-muted)', marginBottom: '12px',
        }}>
          RULES — 游戏规则
        </div>
        <ul style={{
          color: 'var(--text-secondary)', fontSize: '0.9rem',
          lineHeight: 2, listStyle: 'none', padding: 0, margin: 0,
        }}>
          <li>1. 选择一个案件，审问3名嫌疑人</li>
          <li>2. 每人都有秘密，每人都在隐瞒什么</li>
          <li>3. 你共用 <b style={{ color: 'var(--accent)' }}>25次</b> 提问机会</li>
          <li>4. 消耗1次提问可调用「刑侦支援」获取法医线索</li>
          <li>5. 将关键对话保存到线索板，构建证据链</li>
          <li>6. 提问用尽后，做出你的<b style={{ color: 'var(--danger)' }}>最终指控</b></li>
        </ul>
      </div>

      <button className="btn" style={{ fontSize: '1.1rem', padding: '14px 48px' }}
        onClick={() => dispatch({ type: 'NEW_GAME' })}>
        开始调查
      </button>
    </div>
  )
}
