const CASE_SUMMARIES = {
  red_wine: {
    tagline: '科技公司CEO在书房中毒身亡。妻子、合伙人、私人秘书——三人各有秘密，谁在说谎？',
    scene: '滨江市·翡翠湾顶楼公寓 | 深夜书房 | 2026年3月',
    icon: '🍷',
  },
  gallery: {
    tagline: '知名画家中夜死于画廊。经纪人、前助理、大藏家——艺术圈的体面之下，隐藏着代笔、赝品与背叛。',
    scene: '滨江艺术区·白盒子画廊 | 午夜展厅 | 2026年3月',
    icon: '🎨',
  },
  villa_newyear: {
    tagline: '集团董事长在除夕夜离奇坠楼。长子、继女、家庭医生——家族晚宴上的每个人，都有不为人知的秘密。',
    scene: '沈家老宅·颐园别墅 | 除夕之夜 | 2026年2月',
    icon: '🏮',
  },
}

export default function CaseSelect({ dispatch }) {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>选择案件</h1>
      <p style={{
        textAlign: 'center', color: 'var(--text-secondary)',
        marginBottom: '40px', fontStyle: 'italic',
      }}>
        每个案件包含三名嫌疑人，真凶随机隐藏于其中。
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {Object.keys(CASE_SUMMARIES).map(id => {
          const summary = CASE_SUMMARIES[id]
          return (
            <button
              key={id}
              onClick={() => dispatch({ type: 'SELECT_CASE', caseId: id })}
              style={{
                display: 'flex', gap: '20px', alignItems: 'flex-start',
                padding: '24px', textAlign: 'left',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                cursor: 'pointer', color: 'inherit', fontFamily: 'inherit',
                transition: 'all 0.2s', borderRadius: '0',
                width: '100%',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ fontSize: '2.5rem', lineHeight: 1, flexShrink: 0 }}>
                {summary.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.3rem',
                  color: 'var(--accent)', marginBottom: '8px',
                }}>
                  {getCaseName(id)}
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '8px' }}>
                  {summary.tagline}
                </p>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}>
                  {summary.scene}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function getCaseName(id) {
  const names = {
    red_wine: '顶楼的红酒',
    gallery: '画廊深夜',
    villa_newyear: '别墅除夕',
  }
  return names[id] || id
}
