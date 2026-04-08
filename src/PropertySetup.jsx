import { useState, useRef, useEffect } from 'react'

const ZONES = [
  {
    key: 'bedA',
    label: 'Bed A — Home Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedA.jpeg',
    color: 'rgba(80,180,60,0.35)',
    stroke: '#2a8a10',
    instruction: 'Click the 4 corners of the mulch bed along the front of the house.',
  },
  {
    key: 'bedB',
    label: 'Bed B — Garage Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedB.jpeg',
    color: 'rgba(60,160,220,0.35)',
    stroke: '#1060c0',
    instruction: 'Click the 4 corners of the mulch bed along the front of the garage.',
  },
]

const STORAGE_KEY = 'propertyZones_v3'
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} } }
function save(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch {} }

// G Unit badge
const GBadge = ({ size = 32 }) => (
  <div style={{
    width: `${size}px`, height: `${size}px`, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 0 2px rgba(255,255,255,0.25), 0 2px 8px rgba(0,0,0,0.2)',
  }}>
    <span style={{ color: '#fff', fontWeight: 700, fontSize: size >= 48 ? '22px' : size >= 32 ? '15px' : '11px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>G</span>
  </div>
)

export default function PropertySetup({ onDone }) {
  const [zones, setZones]     = useState(load)
  const [step, setStep]       = useState(0)
  const [drawing, setDrawing] = useState(false)
  const [pts, setPts]         = useState([])
  const [mouse, setMouse]     = useState(null)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [ctnSize, setCtnSize] = useState({ w: 0, h: 0 })
  const imgRef = useRef(null)
  const ctnRef = useRef(null)

  const zone = ZONES[step]
  const allDone = ZONES.every(z => zones[z.key])

  useEffect(() => {
    if (!ctnRef.current) return
    const obs = new ResizeObserver(([e]) => setCtnSize({ w: e.contentRect.width, h: e.contentRect.height }))
    obs.observe(ctnRef.current)
    return () => obs.disconnect()
  }, [step])

  function onImgLoad(e) {
    setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
  }

  const renderedW = ctnSize.w
  const renderedH = imgSize.w > 0 ? Math.round(ctnSize.w * imgSize.h / imgSize.w) : ctnSize.h

  function getPoint(e) {
    const rect = imgRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top)  / rect.height,
    }
  }

  function handleClick(e) {
    if (!drawing || !imgRef.current) return
    const pt = getPoint(e)
    if (pts.length >= 3) {
      if (Math.hypot(pt.x - pts[0].x, pt.y - pts[0].y) < 0.03) { finishZone(pts); return }
    }
    setPts(prev => [...prev, pt])
  }

  function handleDblClick(e) {
    if (drawing && pts.length >= 3) { e.preventDefault(); finishZone(pts.slice(0, -1)) }
  }

  function finishZone(finalPts) {
    if (finalPts.length < 3) return
    const updated = { ...zones, [zone.key]: finalPts }
    setZones(updated); save(updated)
    setDrawing(false); setPts([])
  }

  function clearZone() {
    const updated = { ...zones }; delete updated[zone.key]
    setZones(updated); save(updated)
  }

  const toSVG = (p) => `${p.x * renderedW},${p.y * renderedH}`
  const savedPoly = zones[zone.key]

  // G Unit toolbar button styles
  const bedBtn = (on, color) => ({
    padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
    background: on ? '#fff' : 'transparent',
    color: on ? '#0f172a' : '#94a3b8',
  })
  const toolBtn = (on, warn) => ({
    padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: `1px solid ${warn ? 'rgba(248,113,113,0.5)' : on ? '#6366f1' : 'rgba(71,85,105,0.5)'}`,
    background: warn ? 'rgba(239,68,68,0.12)' : on ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: warn ? '#f87171' : on ? '#a5b4fc' : '#94a3b8',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      {/* G Unit header banner */}
      <div style={{ position: 'relative', overflow: 'hidden', backgroundImage: 'url(https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=2070&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center 40%', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,0.92) 0%, rgba(88,28,135,0.75) 50%, rgba(49,46,129,0.88) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px 16px', display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <span style={{ color: '#fff', fontSize: 26, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>G</span>
          </div>
          <div>
            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 300, color: '#fff', margin: 0, lineHeight: 1.2 }}><strong style={{ fontWeight: 700 }}>Unit</strong> Garden Planner</h1>
            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#bfdbfe', letterSpacing: '0.05em' }}>Bed Setup · {zone.label}</p>
          </div>
        </div>
      </div>

      {/* Instruction bar */}
      <div style={{ background: 'rgba(15,23,42,0.7)', borderBottom: '1px solid rgba(71,85,105,0.4)', padding: '10px 20px', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{zone.instruction} <span style={{ color: '#64748b' }}>Double-click or click the first ● to close.</span></div>
      </div>

      {/* Toolbar */}
      <div style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(71,85,105,0.4)', padding: '8px 16px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        {/* Bed tabs */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(30,41,59,0.7)', borderRadius: 9, padding: 3, border: '1px solid rgba(71,85,105,0.4)' }}>
          {ZONES.map((z, i) => (
            <button key={z.key}
              style={bedBtn(step === i)}
              onClick={() => { setStep(i); setDrawing(false); setPts([]) }}
            >{zones[z.key] ? `✓ ${z.label}` : z.label}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 22, background: 'rgba(71,85,105,0.5)', margin: '0 2px' }} />
        {!drawing
          ? <button style={toolBtn(false)} onClick={() => { setDrawing(true); setPts([]) }}>✏️ {savedPoly ? 'Retrace' : 'Trace this bed'}</button>
          : <button style={toolBtn(false, true)} onClick={() => { setDrawing(false); setPts([]) }}>✕ Cancel</button>
        }
        {savedPoly && !drawing && (
          <button style={{ ...toolBtn(false, true) }} onClick={clearZone}>Clear</button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {drawing && (
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
              {pts.length === 0 ? 'Click each corner of the bed' : `${pts.length} corners — double-click or click ● to finish`}
            </span>
          )}
          {!drawing && savedPoly && step < ZONES.length - 1 && (
            <button style={{ padding: '6px 16px', borderRadius: 7, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', color: '#fff' }}
              onClick={() => { setStep(s => s + 1); setPts([]) }}>Next → {ZONES[step + 1].label}</button>
          )}
          {allDone && !drawing && (
            <button style={{ padding: '7px 20px', borderRadius: 7, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
              onClick={onDone}>Done — open planner →</button>
          )}
        </div>
      </div>

      {/* Photo area */}
      <div ref={ctnRef} style={{ flex: 1, overflow: 'auto', position: 'relative', background: 'rgba(15,23,42,0.6)' }}>
        <div style={{ position: 'relative', width: renderedW, height: renderedH }}>
          <img
            ref={imgRef}
            src={zone.url}
            alt={zone.label}
            onLoad={onImgLoad}
            onClick={handleClick}
            onDoubleClick={handleDblClick}
            onMouseMove={drawing ? (e) => setMouse(getPoint(e)) : undefined}
            style={{ display: 'block', width: renderedW, height: renderedH, cursor: drawing ? 'crosshair' : 'default', userSelect: 'none' }}
            draggable={false}
          />
          {renderedW > 0 && (
            <svg style={{ position: 'absolute', inset: 0, width: renderedW, height: renderedH, pointerEvents: 'none' }}
              viewBox={`0 0 ${renderedW} ${renderedH}`}>
              {savedPoly && (
                <polygon points={savedPoly.map(toSVG).join(' ')}
                  fill={zone.color} stroke={zone.stroke} strokeWidth="2.5" strokeDasharray="6,3" />
              )}
              {drawing && pts.length > 0 && (
                <>
                  <polyline
                    points={[...pts, mouse].filter(Boolean).map(toSVG).join(' ')}
                    fill="none" stroke="rgba(255,130,0,0.9)" strokeWidth="2.5" strokeDasharray="5,3" />
                  {pts.map((pt, i) => (
                    <circle key={i} cx={pt.x * renderedW} cy={pt.y * renderedH}
                      r={i === 0 ? 10 : 6}
                      fill={i === 0 ? 'rgba(255,130,0,0.95)' : 'rgba(165,180,252,0.9)'}
                      stroke="white" strokeWidth="2.5" />
                  ))}
                </>
              )}
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
