import { useState, useRef, useEffect } from 'react'

const AERIAL_URL = 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/whole-home.jpeg'

const ZONES = [
  { key: 'bedA',   label: 'Bed A (house front)',  color: 'rgba(80,180,60,0.5)',  stroke: '#2a8a10' },
  { key: 'bedB',   label: 'Bed B (garage front)', color: 'rgba(60,160,220,0.4)', stroke: '#1060c0' },
]

const STORAGE_KEY = 'propertyZones_v1'
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} } }
function save(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch {} }

export default function PropertySetup({ onDone }) {
  const [zones, setZones]       = useState(load)
  const [activeZone, setActive] = useState(null)
  const [drawing, setDrawing]   = useState(false)
  const [pts, setPts]           = useState([])
  const [mouse, setMouse]       = useState(null)
  const [size, setSize]         = useState({ w: 0, h: 0 })
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  function startZone(zoneKey) {
    setActive(zoneKey)
    setDrawing(true)
    setPts([])
  }

  function handleClick(e) {
    if (!drawing || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const pt = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top)  / rect.height,
    }
    // Close if clicking near first point
    if (pts.length >= 3) {
      const first = pts[0]
      if (Math.hypot(pt.x - first.x, pt.y - first.y) < 0.025) {
        finishZone(pts)
        return
      }
    }
    setPts(prev => [...prev, pt])
  }

  function handleDblClick(e) {
    if (drawing && pts.length >= 3) {
      e.preventDefault()
      finishZone(pts.slice(0, -1))
    }
  }

  function finishZone(finalPts) {
    if (finalPts.length < 3) return
    const updated = { ...zones, [activeZone]: finalPts }
    setZones(updated)
    save(updated)
    setDrawing(false)
    setPts([])
    setActive(null)
  }

  function clearZone(key) {
    const updated = { ...zones }
    delete updated[key]
    setZones(updated)
    save(updated)
  }

  function toSVG(p) { return `${p.x * size.w},${p.y * size.h}` }

  const allDone = ZONES.every(z => zones[z.key])

  const btn = (active, color) => ({
    padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: `1px solid ${active ? (color || '#4a9020') : '#c8c0a8'}`,
    background: active ? (color ? '#dde8ff' : '#d8eeb8') : '#fff',
    color: active ? (color ? '#1a2a6a' : '#1a4008') : '#3a4a28',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f2efe8' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd8cc', padding: '12px 20px', flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#2a3a18', marginBottom: 4 }}>
          Step 1 — Trace your bed outlines
        </div>
        <div style={{ fontSize: 11, color: '#7a8a68' }}>
          Click a bed button, then click each corner of that bed on the photo. Double-click or click near the first point ● to finish.
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd8cc', padding: '8px 16px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        {ZONES.map(z => (
          <div key={z.key} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              style={btn(drawing && activeZone === z.key, z.key === 'bedB' ? '#1060c0' : null)}
              onClick={() => drawing && activeZone === z.key ? (setDrawing(false), setPts([]), setActive(null)) : startZone(z.key)}
            >
              {drawing && activeZone === z.key ? '✕ Cancel' : `✏️ Trace ${z.label}`}
            </button>
            {zones[z.key] && (
              <button style={{ ...btn(false), color: '#c05010', borderColor: '#e0a888' }} onClick={() => clearZone(z.key)}>
                Clear
              </button>
            )}
            {zones[z.key] && <span style={{ fontSize: 10, color: '#4a9020' }}>✓ saved</span>}
          </div>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {drawing && (
            <span style={{ fontSize: 11, color: '#c05010', fontWeight: 600 }}>
              {pts.length === 0
                ? `Click corners of ${ZONES.find(z => z.key === activeZone)?.label}`
                : `${pts.length} points — double-click or click ● to finish`}
            </span>
          )}
          {allDone && !drawing && (
            <button
              style={{ ...btn(true), background: '#2a6010', color: '#fff', borderColor: '#1a4008', padding: '7px 18px', fontSize: 13 }}
              onClick={onDone}
            >
              Done — go to planner →
            </button>
          )}
        </div>
      </div>

      {/* Photo with SVG overlay */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div
          ref={ref}
          style={{ position: 'relative', width: '100%', height: '100%', cursor: drawing ? 'crosshair' : 'default' }}
          onClick={handleClick}
          onDoubleClick={handleDblClick}
          onMouseMove={drawing ? (e) => {
            const rect = ref.current.getBoundingClientRect()
            setMouse({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
          } : undefined}
        >
          <img
            src={AERIAL_URL}
            alt="Aerial view"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none' }}
            draggable={false}
          />

          {size.w > 0 && (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              viewBox={`0 0 ${size.w} ${size.h}`}>

              {/* Finished zones */}
              {ZONES.map(z => zones[z.key] && (
                <g key={z.key}>
                  <polygon
                    points={zones[z.key].map(toSVG).join(' ')}
                    fill={z.color}
                    stroke={z.stroke}
                    strokeWidth="2.5"
                    strokeDasharray="6,3"
                  />
                  {/* Label at centroid */}
                  <text
                    x={zones[z.key].reduce((s, p) => s + p.x * size.w, 0) / zones[z.key].length}
                    y={zones[z.key].reduce((s, p) => s + p.y * size.h, 0) / zones[z.key].length}
                    textAnchor="middle" dominantBaseline="middle"
                    style={{ fontFamily: 'sans-serif', fontSize: 13, fontWeight: 700, fill: z.stroke, paintOrder: 'stroke', stroke: 'rgba(255,255,255,0.8)', strokeWidth: 4 }}
                  >
                    {z.label}
                  </text>
                </g>
              ))}

              {/* In-progress drawing */}
              {drawing && pts.length > 0 && (
                <>
                  <polyline
                    points={[...pts, mouse].filter(Boolean).map(toSVG).join(' ')}
                    fill="none" stroke="rgba(255,130,0,0.9)" strokeWidth="2" strokeDasharray="5,3"
                  />
                  {pts.map((pt, i) => (
                    <circle key={i}
                      cx={pt.x * size.w} cy={pt.y * size.h}
                      r={i === 0 ? 9 : 5}
                      fill={i === 0 ? 'rgba(255,130,0,0.95)' : 'rgba(255,210,50,0.9)'}
                      stroke="white" strokeWidth="2"
                    />
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
