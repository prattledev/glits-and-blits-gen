import { useState } from 'react'
import type { StatusState } from '../App'

type ToneType = 'glits' | 'blits'

interface FormState {
  toneType: ToneType
  repetitions: number
}

interface Props {
  generating: boolean
  setGenerating: (v: boolean) => void
  setStatus: (s: StatusState) => void
}

const SECTION: React.CSSProperties = { padding: '16px', borderBottom: '1px solid #1a1f28' }
const LABEL: React.CSSProperties = {
  color: '#6b7280', fontSize: 10, fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase',
  display: 'block', marginBottom: 6,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  )
}


export default function ToneForm({ generating, setGenerating, setStatus }: Props) {
  const [form, setForm] = useState<FormState>({
    toneType: 'glits',
    repetitions: 1,
  })

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const totalDuration = form.toneType === 'glits'
    ? form.repetitions * 4
    : (form.repetitions * 13.4).toFixed(1)

  async function handleGenerate() {
    setGenerating(true)
    setStatus({ type: 'idle', message: '' })
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone_type: form.toneType,
          repetitions: form.repetitions,
        }),
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
      setStatus({ type: 'ok', message: `Downloaded: ${filename}` })
    } catch (e: unknown) {
      setStatus({ type: 'error', message: e instanceof Error ? e.message : String(e) })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      {/* Tone type */}
      <div style={{ ...SECTION, paddingBottom: 20 }}>
        <label style={LABEL}>Tone Type</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {([
            { value: 'glits', label: 'GLITS', sub: 'BBC/EBU stereo · 4 s cycle · 1 kHz' },
            { value: 'blits', label: 'BLITS', sub: 'EBU Tech 3304 · 5.1 · 13.4 s sequence' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('toneType', opt.value)}
              style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: 6,
                border: `1px solid ${form.toneType === opt.value ? '#2563eb' : '#1e2530'}`,
                background: form.toneType === opt.value ? '#0f1e36' : '#111418',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <div style={{ color: form.toneType === opt.value ? '#60a5fa' : '#9ca3af', fontWeight: 700, fontSize: 13 }}>
                {opt.label}
              </div>
              <div style={{ color: '#4b5563', fontSize: 11, marginTop: 2 }}>{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sequence info */}
      <div style={SECTION}>
        {form.toneType === 'glits' ? <GlitsInfo /> : <BlitsInfo />}
      </div>

      {/* Repetitions */}
      <div style={SECTION}>
        <Field label="Repetitions">
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="range" min={1} max={20} step={1}
              value={form.repetitions}
              onChange={(e) => set('repetitions', Number(e.target.value))}
              style={{ flex: 1, accentColor: '#3b82f6' }}
            />
            <span style={{ color: '#93c5fd', fontSize: 13, minWidth: 24, textAlign: 'right' }}>
              ×{form.repetitions}
            </span>
          </div>
          <div style={{ color: '#4b5563', fontSize: 11, marginTop: 4 }}>
            Total duration: {totalDuration} s
          </div>
        </Field>
      </div>

      {/* Generate */}
      <div style={{ padding: 16 }}>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            width: '100%', padding: '13px', fontSize: 13, fontWeight: 700,
            fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase',
            borderRadius: 6, border: 'none',
            cursor: generating ? 'wait' : 'pointer',
            background: generating ? '#1e2530' : '#1d4ed8',
            color: generating ? '#6b7280' : '#fff',
            transition: 'background 0.15s',
          }}
        >
          {generating ? 'Generating…' : 'Generate & Download'}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function GlitsInfo() {
  const rows = [
    { time: '0 – 250 ms',     L: 'SILENT', R: 'tone',   note: '← Left' },
    { time: '250 – 500 ms',   L: 'tone',   R: 'tone',   note: '' },
    { time: '500 – 750 ms',   L: 'tone',   R: 'SILENT', note: '' },
    { time: '750 – 1000 ms',  L: 'tone',   R: 'tone',   note: '' },
    { time: '1000 – 1250 ms', L: 'tone',   R: 'SILENT', note: '← Right' },
    { time: '1250 – 4000 ms', L: 'tone',   R: 'tone',   note: '' },
  ]
  return (
    <div style={{ background: '#0f1218', border: '1px solid #1e2530', borderRadius: 6, padding: 12 }}>
      <div style={{ color: '#f59e0b', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
        4 s cycle · 1 kHz continuous both channels
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr>
            {['Time', 'L', 'R', ''].map((h) => (
              <th key={h} style={{ textAlign: 'left', color: '#374151', paddingBottom: 4, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ color: '#6b7280', paddingRight: 8, paddingBottom: 3, whiteSpace: 'nowrap' }}>{r.time}</td>
              <td style={{ color: r.L === 'SILENT' ? '#ef4444' : '#22c55e', paddingRight: 8, fontWeight: r.L === 'SILENT' ? 700 : 400 }}>{r.L}</td>
              <td style={{ color: r.R === 'SILENT' ? '#ef4444' : '#22c55e', paddingRight: 8, fontWeight: r.R === 'SILENT' ? 700 : 400 }}>{r.R}</td>
              <td style={{ color: '#4b5563', fontSize: 9 }}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BlitsInfo() {
  return (
    <div style={{ background: '#0f1218', border: '1px solid #1e2530', borderRadius: 6, padding: 12 }}>
      <div style={{ color: '#a78bfa', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
        13.4 s sequence · EBU Tech 3304
      </div>

      <Section label="S1  0 – 4.8 s  ·  Channel idents" color="#60a5fa">
        {[
          ['L',   '880 Hz',  '0.0 – 0.6 s'],
          ['R',   '880 Hz',  '0.8 – 1.4 s'],
          ['C',   '1320 Hz', '1.6 – 2.2 s'],
          ['LFE', '82.5 Hz', '2.4 – 3.0 s'],
          ['Ls',  '660 Hz',  '3.2 – 3.8 s'],
          ['Rs',  '660 Hz',  '4.0 – 4.6 s'],
        ].map(([ch, freq, time]) => (
          <Row key={ch} ch={ch} detail={freq} time={time} color="#60a5fa" />
        ))}
      </Section>

      <Section label="S2  4.8 – 10.2 s  ·  Stereo ident  1 kHz" color="#34d399">
        <Row ch="R"   detail="continuous 5.1 s"                    color="#34d399" />
        <Row ch="L"   detail="1 s on · ×3 300 ms on/off · 2 s on" color="#34d399" />
        <Row ch="C/LFE/Ls/Rs" detail="silent"                      color="#34d399" />
      </Section>

      <Section label="S3  10.2 – 13.4 s  ·  Phase-check  2 kHz  (AL − 6 dB)" color="#f472b6">
        <Row ch="All" detail="in-phase · 3 s · 200 ms silence" color="#f472b6" />
      </Section>
    </div>
  )
}

function Section({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color, fontSize: 10, fontWeight: 700, marginBottom: 5 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>{children}</div>
    </div>
  )
}

function Row({ ch, detail, time, color }: { ch: string; detail: string; time?: string; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 10 }}>
      <span style={{
        background: '#1a2030', border: `1px solid ${color}40`,
        borderRadius: 3, padding: '1px 5px', color,
        fontWeight: 700, minWidth: 32, textAlign: 'center', flexShrink: 0,
      }}>{ch}</span>
      <span style={{ color: '#9ca3af' }}>{detail}</span>
      {time && <span style={{ color: '#374151', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{time}</span>}
    </div>
  )
}
