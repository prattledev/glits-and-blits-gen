import ToneForm from './components/ToneForm'
import './index.css'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 340 }}>
        <div style={{ color: '#2e2e2e', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 32 }}>
          Line-up Tone Generator
        </div>
        <ToneForm />
      </div>
    </div>
  )
}
