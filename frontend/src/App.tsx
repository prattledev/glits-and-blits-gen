import ToneForm from './components/ToneForm'
import './index.css'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 340 }}>
        <div style={{ color: '#707070', fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 32 }}>
          GLITS & BLITS Generator
        </div>
        <ToneForm />
      </div>
    </div>
  )
}
