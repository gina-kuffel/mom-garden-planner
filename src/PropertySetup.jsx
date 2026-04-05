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

  // Measure container
  useEffect(() => {
    if (!ctnRef.current) return
    const obs = new ResizeObserver(([e]) => setCtnSize({ w: e.contentRect.width, h: e.contentRect.height }))
    obs.observe(ctnRef.current)
    return () => obs.disconnect()
  }, [step])

  // When image loads, record its natural size
  function onImgLoad(e) {
    setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
  }

  // Image rendered at full width of container, height proportional
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

  const btnStyle = (active, warn) => ({
    padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: `1px solid ${active ? (warn ? '#c05010' : '#4a9020') : '#c8c0a8'}`,
    background: active ? (warn ? '#ffe0d0' : '#d8eeb8') : '#fff',
    color: active ? (warn ? '#7a2010' : '#1a4008') : '#3a4a28',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f2efe8' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd8cc', padding: '12px 20px', flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#2a3a18', marginBottom: 3 }}>Bed Setup — {zone.label}</div>
        <div style={{ fontSize: 11, color: '#7a8a68' }}>{zone.instruction} Double-click or click the first ● to close.</div>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #ddd8cc', padding: '8px 16px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        {ZONES.map((z, i) => (
          <button key={z.key}
            style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              border: `1px solid ${step === i ? (z.key === 'bedB' ? '#1060c0' : '#4a9020') : '#c8c0a8'}`,
              background: step === i ? (z.key === 'bedB' ? '#dde8ff' : '#d8eeb8') : '#fff',
              color: step === i ? (z.key === 'bedB' ? '#1a2a6a' : '#1a4008') : '#3a4a28' }}
            onClick={() => { setStep(i); setDrawing(false); setPts([]) }}
          >{zones[z.key] ? `✓ ${z.label}` : z.label}</button>
        ))}
        <div style={{ width: 1, height: 22, background: '#e0dbd0', margin: '0 2px' }} />
        {!drawing
          ? <button style={btnStyle(false)} onClick={() => { setDrawing(true); setPts([]) }}>✏️ {savedPoly ? 'Retrace' : 'Trace this bed'}</button>
          : <button style={btnStyle(true, true)} onClick={() => { setDrawing(false); setPts([]) }}>✕ Cancel</button>
        }
        {savedPoly && !drawing && (
          <button style={{ ...btnStyle(false), color: '#c05010', borderColor: '#e0a888' }} onClick={clearZone}>Clear</button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {drawing && (
            <span style={{ fontSize: 11, color: '#c05010', fontWeight: 600 }}>
              {pts.length === 0 ? 'Click each corner of the bed' : `${pts.length} corners — double-click or click ● to finish`}
            </span>
          )}
          {!drawing && savedPoly && step < ZONES.length - 1 && (
            <button style={{ ...btnStyle(true), background: '#1060c0', color: '#fff', borderColor: '#0840a0' }}
              onClick={() => { setStep(s => s + 1); setPts([]) }}>Next → {ZONES[step + 1].label}</button>
          )}
          {allDone && !drawing && (
            <button style={{ ...btnStyle(true), background: '#2a6010', color: '#fff', borderColor: '#1a4008', padding: '7px 20px', fontSize: 13 }}
              onClick={onDone}>Done — open planner →</button>
          )}
        </div>
      </div>

      {/* Scrollable photo area — image at FULL natural width, no cropping */}
      <div ref={ctnRef} style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
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
                      fill={i === 0 ? 'rgba(255,130,0,0.95)' : 'rgba(255,210,50,0.9)'}
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
