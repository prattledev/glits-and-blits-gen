import { useState } from 'react'

type ToneType = 'glits' | 'blits'
type Status = { type: 'idle' | 'ok' | 'error'; message: string }

export default function ToneForm() {
  const [toneType, setToneType] = useState<ToneType>('glits')
  const [repetitions, setRepetitions] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState<Status>({ type: 'idle', message: '' })

  const duration = toneType === 'glits'
    ? `${repetitions * 4} s`
    : `${(repetitions * 13.4).toFixed(1)} s`

  async function handleGenerate() {
    setGenerating(true)
    setStatus({ type: 'idle', message: '' })
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone_type: toneType, repetitions }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match?.[1] ?? 'tone.wav'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      setStatus({ type: 'ok', message: filename })
    } catch (e: unknown) {
      setStatus({ type: 'error', message: e instanceof Error ? e.message : String(e) })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', gap: 8 }}>
        {(['glits', 'blits'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setToneType(t)}
            style={{
              flex: 1, padding: '10px 0',
              background: toneType === t ? '#1a1a1a' : 'transparent',
              border: `1px solid ${toneType === t ? '#3a3a3a' : '#1e1e1e'}`,
              color: toneType === t ? '#d0d0d0' : '#383838',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 3,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#2e2e2e', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Repetitions</span>
          <span style={{ color: '#505050', fontSize: 11 }}>×{repetitions} · {duration}</span>
        </div>
        <input
          type="range" min={1} max={20} step={1}
          value={repetitions}
          onChange={(e) => setRepetitions(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#3a3a3a' }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        style={{
          padding: '12px 0',
          background: generating ? '#0f0f0f' : '#161616',
          border: '1px solid #242424',
          color: generating ? '#303030' : '#a0a0a0',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          cursor: generating ? 'wait' : 'pointer', borderRadius: 3,
        }}
      >
        {generating ? 'Generating…' : 'Generate & Download'}
      </button>

      {status.type !== 'idle' && (
        <div style={{ fontSize: 11, textAlign: 'center', letterSpacing: '0.04em', color: status.type === 'ok' ? '#3a5a3a' : '#5a3a3a' }}>
          {status.type === 'ok' ? `↓ ${status.message}` : status.message}
        </div>
      )}

    </div>
  )
}
