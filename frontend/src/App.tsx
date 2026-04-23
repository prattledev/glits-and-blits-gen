import { useState } from 'react'
import ToneForm from './components/ToneForm'
import StatusPanel from './components/StatusPanel'
import './index.css'

export type StatusState = { type: 'idle' | 'ok' | 'error'; message: string }

export default function App() {
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState<StatusState>({ type: 'idle', message: '' })

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f12', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar>
          <ToneForm generating={generating} setGenerating={setGenerating} setStatus={setStatus} />
        </Sidebar>
        <Main>
          <StatusPanel status={status} generating={generating} />
        </Main>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header style={{
      borderBottom: '1px solid #1e2530',
      background: '#080a0d',
      padding: '0 24px',
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <WaveIcon />
        <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Broadcast Test Tone Generator
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4a5568', fontSize: 11 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
        EBU R68 · SMPTE RP155
      </div>
    </header>
  )
}

function WaveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2 12 Q4 4 6 12 Q8 20 10 12 Q12 4 14 12 Q16 20 18 12 Q20 4 22 12" />
    </svg>
  )
}

function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <aside style={{
      width: 320,
      borderRight: '1px solid #1e2530',
      background: '#0d0f12',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      {children}
    </aside>
  )
}

function Main({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {children}
    </main>
  )
}
