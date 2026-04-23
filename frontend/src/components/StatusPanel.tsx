import type { StatusState } from '../App'

interface Props {
  status: StatusState
  generating: boolean
}

export default function StatusPanel({ status, generating }: Props) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 40, gap: 28,
    }}>
      <SineGraphic animating={generating} />

      <div style={{ textAlign: 'center' }}>
        {generating && (
          <div style={{ color: '#60a5fa', fontSize: 13, letterSpacing: '0.06em' }}>
            Rendering audio…
          </div>
        )}
        {!generating && status.type === 'ok' && (
          <div style={{ color: '#22c55e', fontSize: 13 }}>
            ✓ {status.message}
          </div>
        )}
        {!generating && status.type === 'error' && (
          <div style={{ color: '#ef4444', fontSize: 13, maxWidth: 400 }}>
            ✗ {status.message}
          </div>
        )}
        {!generating && status.type === 'idle' && (
          <div style={{ color: '#374151', fontSize: 13 }}>
            Select a tone type and click Generate
          </div>
        )}
      </div>

      <ReferenceTable />
    </div>
  )
}

function SineGraphic({ animating }: { animating: boolean }) {
  const W = 480; const H = 100
  const pts: string[] = []
  for (let x = 0; x <= W; x += 2) {
    const y = H / 2 - Math.sin((x / W) * Math.PI * 4) * (H / 2 - 8)
    pts.push(`${x},${y}`)
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ opacity: animating ? 1 : 0.2, transition: 'opacity 0.3s', maxWidth: '100%' }}>
      <defs>
        <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#1e40af" stopOpacity="0" />
          <stop offset="20%"  stopColor="#3b82f6" stopOpacity="1" />
          <stop offset="80%"  stopColor="#3b82f6" stopOpacity="1" />
          <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#1e2530" strokeWidth="1" />
      <path d={'M ' + pts.join(' L ')} fill="none" stroke="url(#wg)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ReferenceTable() {
  const rows = [
    { std: 'EBU R68',   level: '−18 dBFS',           use: 'European broadcast alignment level' },
    { std: 'SMPTE RP155', level: '−20 dBFS',         use: 'North American broadcast' },
    { std: 'EBU R128',  level: '−23 dBFS',           use: 'Loudness-normalised delivery' },
    { std: 'GLITS',     level: '1 kHz · −18 dBFS',   use: 'BBC/EBU stereo alignment (4 s cycle)' },
    { std: 'BLITS',     level: 'Multi-freq · −18 dBFS', use: 'EBU Tech 3304 · 5.1 channel ID (13.4 s)' },
  ]
  return (
    <div style={{ border: '1px solid #1a1f28', borderRadius: 8, overflow: 'hidden', maxWidth: 560, width: '100%' }}>
      <div style={{
        background: '#0a0c0f', borderBottom: '1px solid #1a1f28',
        padding: '8px 16px', color: '#4b5563', fontSize: 10,
        fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        Broadcast Reference Standards
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1a1f28' }}>
            {['Standard', 'Level', 'Usage'].map((h) => (
              <th key={h} style={{
                padding: '7px 14px', textAlign: 'left', color: '#374151',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid #131820' : 'none' }}>
              <td style={{ padding: '8px 14px', color: '#60a5fa', fontSize: 12, fontWeight: 700 }}>{r.std}</td>
              <td style={{ padding: '8px 14px', color: '#c9d0db', fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>{r.level}</td>
              <td style={{ padding: '8px 14px', color: '#6b7280', fontSize: 12 }}>{r.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
