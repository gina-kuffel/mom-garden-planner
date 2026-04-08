import { useState, useRef, useEffect, useCallback } from 'react'
import plants from './data/plants'
import PlantDetail from './PlantDetail'

const STORAGE_KEY = 'propertyZones_v3'
function loadZones() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} } }

const BED_VIEWS = [
  {
    key: 'bedA', label: 'Bed A — Home Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedA.jpeg',
    bedWidthFt: 30,
    backRow:  ['cherry-bomb-ninebark','incrediball-hydrangea','karl-foerster-grass','little-lime-hydrangea','karl-foerster-grass'],
    frontRow: ['walker-low-catmint','rozanne-geranium','walker-low-catmint','black-eyed-susan','rozanne-geranium','walker-low-catmint','autumn-fire-sedum'],
  },
  {
    key: 'bedB', label: 'Bed B — Garage Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedB.jpeg',
    bedWidthFt: 30,
    backRow:  ['karl-foerster-grass','black-eyed-susan','black-eyed-susan','black-eyed-susan','karl-foerster-grass'],
    frontRow: ['walker-low-catmint','prairie-dropseed','rozanne-geranium','autumn-fire-sedum'],
  },
]

function evenSpread(n, lo, hi) {
  if (n <= 0) return []
  if (n === 1) return [(lo + hi) / 2]
  return Array.from({ length: n }, (_, i) => lo + (i / (n - 1)) * (hi - lo))
}

let _id = 1

function buildLayoutNorm(poly, viewDef) {
  if (!poly || poly.length < 3) return []
  const xs = poly.map(p => p.x), ys = poly.map(p => p.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const polyW = maxX - minX
  const polyH = maxY - minY
  const backYn  = minY + polyH * 0.22
  const frontYn = minY + polyH * 0.78
  const xPad = polyW * 0.03
  return [
    ...viewDef.backRow.map((plantId, i) => {
      const xs = evenSpread(viewDef.backRow.length, minX + xPad, maxX - xPad)
      return { id: _id++, plantId, nx: xs[i], ny: backYn }
    }),
    ...viewDef.frontRow.map((plantId, i) => {
      const xs = evenSpread(viewDef.frontRow.length, minX + xPad, maxX - xPad)
      return { id: _id++, plantId, nx: xs[i], ny: frontYn }
    }),
  ]
}

// G Unit badge — matches Daily Command Center exactly
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

export default function Planner({ onRetrace }) {
  const [activeView, setActiveView]     = useState('bedA')
  const [placed, setPlaced]             = useState([])
  const [selected, setSelected]         = useState(null)
  const [activeDetail, setActiveDetail] = useState(null)
  const [showLabels, setShowLabels]     = useState(true)
  const [showDebug, setShowDebug]       = useState(false)
  const [imgSize, setImgSize]           = useState({ w: 0, h: 0 })
  const [ctnSize, setCtnSize]           = useState({ w: 0, h: 0 })
  const imgRef = useRef(null)
  const ctnRef = useRef(null)
  const dragRef = useRef(null)

  const viewDef = BED_VIEWS.find(v => v.key === activeView) ?? BED_VIEWS[0]
  const zones   = loadZones()
  const poly    = zones[activeView]

  const imgLoaded = imgSize.w > 0 && imgSize.h > 0
  const renderedW = ctnSize.w
  const renderedH = imgLoaded && renderedW > 0 ? Math.round(renderedW * imgSize.h / imgSize.w) : 0

  const toX = (nx) => nx * renderedW
  const toY = (ny) => ny * renderedH

  useEffect(() => {
    if (!ctnRef.current) return
    const obs = new ResizeObserver(([e]) => setCtnSize({ w: e.contentRect.width, h: e.contentRect.height }))
    obs.observe(ctnRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    setImgSize({ w: 0, h: 0 })
    setPlaced([])
  }, [activeView])

  useEffect(() => {
    if (imgLoaded && renderedW > 0 && renderedH > 0 && poly) {
      setPlaced(buildLayoutNorm(poly, viewDef))
    }
  }, [activeView, imgLoaded, renderedW, renderedH])

  function onImgLoad(e) {
    setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
  }

  function handleImgClick(e) {
    if (!selected || !imgRef.current) return
    if (dragRef.current?.didDrag) { dragRef.current.didDrag = false; return }
    const rect = imgRef.current.getBoundingClientRect()
    const plant = plants.find(p => p.id === selected)
    if (!plant) return
    const nx = (e.clientX - rect.left) / rect.width
    const ny = (e.clientY - rect.top)  / rect.height
    setPlaced(prev => [...prev, { id: _id++, plantId: selected, nx, ny }])
  }

  function startDrag(e, itemId) {
    e.stopPropagation()
    dragRef.current = { id: itemId, startX: e.clientX, startY: e.clientY, didDrag: false }
    function onMove(me) {
      if (!imgRef.current) return
      const dx = me.clientX - dragRef.current.startX
      const dy = me.clientY - dragRef.current.startY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.didDrag = true
      dragRef.current.startX = me.clientX
      dragRef.current.startY = me.clientY
      setPlaced(prev => prev.map(item => {
        if (item.id !== dragRef.current.id) return item
        return { ...item, nx: item.nx + dx / renderedW, ny: item.ny + dy / renderedH }
      }))
    }
    function onUp() { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const bedWidthPx = poly && renderedW > 0
    ? (() => { const xs = poly.map(p => p.x); return (Math.max(...xs) - Math.min(...xs)) * renderedW })()
    : renderedW
  const bedHeightPx = poly && renderedH > 0
    ? (() => { const ys = poly.map(p => p.y); return (Math.max(...ys) - Math.min(...ys)) * renderedH })()
    : renderedH * 0.15

  const totalPlants = viewDef.backRow.length + viewDef.frontRow.length
  const maxRFromH = bedHeightPx / 2 * 0.9
  const maxRFromW = bedWidthPx / totalPlants / 2 * 0.85
  const globalMaxR = Math.max(8, Math.min(maxRFromH, maxRFromW))

  const toSVGPt = (p) => `${p.x * renderedW},${p.y * renderedH}`

  // G Unit button styles
  const bedBtn = (on) => ({
    padding: '8px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
    background: on ? '#fff' : 'transparent',
    color: on ? '#0f172a' : '#94a3b8',
  })
  const toolBtn = (on) => ({
    padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: `1px solid ${on ? '#6366f1' : 'rgba(71,85,105,0.5)'}`,
    background: on ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: on ? '#a5b4fc' : '#94a3b8',
  })

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: 280, flexShrink: 0, background: 'rgba(15,23,42,0.95)', borderRight: '1px solid rgba(71,85,105,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Sidebar header — G Badge + title */}
        <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid rgba(71,85,105,0.4)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <GBadge size={36} />
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>Mom's Garden</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Arlington Heights · Zone 6a/6b</div>
          </div>
        </div>
        {/* Plant list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {plants.map(p => (
            <div key={p.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer',
                background: selected === p.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                borderLeft: `3px solid ${selected === p.id ? '#6366f1' : 'transparent'}`,
              }}
              onClick={() => { setSelected(prev => prev === p.id ? null : p.id); setActiveDetail(p) }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.12)', background: p.color }}
                dangerouslySetInnerHTML={{ __html: p.svgIcon }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{p.commonName}</div>
                <div style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic' }}>{p.botanicalName}</div>
                <div style={{ fontSize: 10, color: '#475569' }}>{p.matureWidth}′w × {p.matureHeight}′h · {p.type}</div>
              </div>
            </div>
          ))}
        </div>
        {activeDetail && <PlantDetail plant={activeDetail} onClose={() => setActiveDetail(null)} />}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* G Unit header banner */}
        <div style={{ position: 'relative', overflow: 'hidden', backgroundImage: 'url(https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=2070&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center 40%', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,0.92) 0%, rgba(88,28,135,0.75) 50%, rgba(49,46,129,0.88) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px 16px', display: 'flex', alignItems: 'flex-end', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <span style={{ color: '#fff', fontSize: 26, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>G</span>
            </div>
            <div>
              <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 300, color: '#fff', margin: 0, lineHeight: 1.2 }}><strong style={{ fontWeight: 700 }}>Unit</strong> Garden Planner</h1>
              <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 400, color: '#bfdbfe', letterSpacing: '0.05em' }}>Mom's Foundation Beds · Arlington Heights, IL</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(71,85,105,0.4)', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Bed view switcher — pill style matching DCC nav */}
          <div style={{ display: 'flex', gap: 2, background: 'rgba(30,41,59,0.7)', borderRadius: 9, padding: 3, border: '1px solid rgba(71,85,105,0.4)' }}>
            {BED_VIEWS.map(v => (
              <button key={v.key} style={bedBtn(activeView === v.key)} onClick={() => { setActiveView(v.key); setSelected(null) }}>{v.label}</button>
            ))}
          </div>
          <div style={{ width: 1, height: 22, background: 'rgba(71,85,105,0.5)', margin: '0 2px' }} />
          <button style={toolBtn(showLabels)} onClick={() => setShowLabels(v => !v)}>Labels {showLabels ? 'ON' : 'OFF'}</button>
          <button style={toolBtn(showDebug)} onClick={() => setShowDebug(v => !v)}>Debug</button>
          {selected && <button style={{ ...toolBtn(false), color: '#f87171', borderColor: 'rgba(248,113,113,0.4)' }} onClick={() => setSelected(null)}>✕ Cancel</button>}
          {poly && <button style={toolBtn(false)} onClick={() => setPlaced(buildLayoutNorm(poly, viewDef))}>Reset layout</button>}
          <button style={{ ...toolBtn(false), marginLeft: 'auto', fontSize: 11 }} onClick={onRetrace}>✏️ Retrace beds</button>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            {!poly ? '⚠ No outline — click Retrace beds' : selected ? `Click photo to place ${plants.find(p => p.id === selected)?.commonName}` : 'Select plant · drag · ✕ to remove'}
          </span>
        </div>

        {/* Photo + plant overlay area */}
        <div ref={ctnRef} style={{ flex: 1, overflow: 'auto', position: 'relative', background: 'rgba(15,23,42,0.6)' }}>
          {renderedW > 0 && (
            <div style={{ position: 'relative', width: renderedW, height: renderedH || 'auto' }}>
              <img
                ref={imgRef}
                src={viewDef.url}
                alt="Bed"
                onLoad={onImgLoad}
                onClick={handleImgClick}
                style={{ display: 'block', width: renderedW, height: renderedH || undefined, cursor: selected ? 'crosshair' : 'default', userSelect: 'none' }}
                draggable={false}
              />

              {/* Debug overlay */}
              {showDebug && renderedH > 0 && (
                <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.8)', color: '#a5f3fc', fontSize: 10, padding: '4px 8px', borderRadius: 4, zIndex: 100, pointerEvents: 'none', lineHeight: 1.6, fontFamily: 'monospace' }}>
                  imgSize: {imgSize.w}×{imgSize.h}<br/>
                  rendered: {renderedW}×{renderedH}<br/>
                  imgLoaded: {String(imgLoaded)}<br/>
                  poly pts: {poly?.length ?? 0}<br/>
                  {poly && (() => {
                    const xs = poly.map(p=>p.x), ys = poly.map(p=>p.y)
                    return <>
                      polyX norm: [{Math.min(...xs).toFixed(3)}, {Math.max(...xs).toFixed(3)}]<br/>
                      polyY norm: [{Math.min(...ys).toFixed(3)}, {Math.max(...ys).toFixed(3)}]<br/>
                      polyX px: [{(Math.min(...xs)*renderedW).toFixed(0)}, {(Math.max(...xs)*renderedW).toFixed(0)}]<br/>
                      polyY px: [{(Math.min(...ys)*renderedH).toFixed(0)}, {(Math.max(...ys)*renderedH).toFixed(0)}]<br/>
                    </>
                  })()}
                  placed: {placed.length}<br/>
                  {placed[0] && <>p[0] norm: ({placed[0].nx.toFixed(3)}, {placed[0].ny.toFixed(3)})<br/>p[0] px: ({toX(placed[0].nx).toFixed(0)}, {toY(placed[0].ny).toFixed(0)})</>}
                </div>
              )}

              {/* Bed outline */}
              {poly && imgLoaded && renderedW > 0 && renderedH > 0 && (
                <svg style={{ position: 'absolute', inset: 0, width: renderedW, height: renderedH, pointerEvents: 'none' }}
                  viewBox={`0 0 ${renderedW} ${renderedH}`}>
                  <polygon
                    points={poly.map(toSVGPt).join(' ')}
                    fill="rgba(100,200,80,0.12)"
                    stroke="rgba(60,160,40,0.9)"
                    strokeWidth="2.5" strokeDasharray="6,3"
                  />
                  {showDebug && poly && (() => {
                    const ys = poly.map(p => p.y)
                    const xs = poly.map(p => p.x)
                    const minY = Math.min(...ys), maxY = Math.max(...ys)
                    const minX = Math.min(...xs), maxX = Math.max(...xs)
                    const backY  = (minY + (maxY - minY) * 0.22) * renderedH
                    const frontY = (minY + (maxY - minY) * 0.78) * renderedH
                    const x1 = minX * renderedW, x2 = maxX * renderedW
                    return <>
                      <line x1={x1} y1={backY}  x2={x2} y2={backY}  stroke="cyan"   strokeWidth="1.5" strokeDasharray="4,3" />
                      <line x1={x1} y1={frontY} x2={x2} y2={frontY} stroke="yellow" strokeWidth="1.5" strokeDasharray="4,3" />
                    </>
                  })()}
                </svg>
              )}

              {/* Plant tokens */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {placed.map(item => {
                  const plant = plants.find(p => p.id === item.plantId)
                  if (!plant) return null
                  const px = toX(item.nx)
                  const py = toY(item.ny)
                  const r  = Math.max(8, Math.min(globalMaxR, globalMaxR))
                  const sz = r * 2
                  return (
                    <div key={item.id} style={{ position: 'absolute', left: px, top: py, width: sz, height: sz, transform: 'translate(-50%,-50%)', pointerEvents: 'auto', cursor: 'grab', userSelect: 'none' }}
                      onMouseDown={e => startDrag(e, item.id)}>
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', background: plant.color }}
                        dangerouslySetInnerHTML={{ __html: plant.svgIcon }} />
                      <button onMouseDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); setPlaced(prev => prev.filter(i => i.id !== item.id)) }}
                        style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: 'rgba(239,68,68,0.85)', border: 'none', color: '#fff', fontSize: 8, lineHeight: '14px', textAlign: 'center', cursor: 'pointer', padding: 0, pointerEvents: 'auto' }}>✕</button>
                      {showLabels && (
                        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 2, background: 'rgba(15,23,42,0.88)', borderRadius: 3, padding: '1px 5px', fontSize: 8, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                          {plant.commonName.split(' ').slice(0, 2).join(' ')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
