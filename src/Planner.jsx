import { useState, useRef, useEffect } from 'react'
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

function polyBounds(poly) {
  const xs = poly.map(p => p.x), ys = poly.map(p => p.y)
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
}

let _id = 1
function buildLayout(poly, viewDef, w, h) {
  if (!poly || poly.length < 3) return []
  const pts = poly.map(p => ({ x: p.x * w, y: p.y * h }))
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const polyH = maxY - minY
  const maxR = Math.max(6, (polyH / 2) * 0.82)
  const backY  = minY + maxR
  const frontY = maxY - maxR
  const xPad = (maxX - minX) * 0.02
  const backXs  = evenSpread(viewDef.backRow.length,  minX + xPad, maxX - xPad)
  const frontXs = evenSpread(viewDef.frontRow.length, minX + xPad, maxX - xPad)
  return [
    ...viewDef.backRow.map((plantId, i) => ({ id: _id++, plantId, x: backXs[i], y: backY, size: plants.find(p => p.id === plantId)?.matureWidth ?? 3, maxR })),
    ...viewDef.frontRow.map((plantId, i) => ({ id: _id++, plantId, x: frontXs[i], y: frontY, size: plants.find(p => p.id === plantId)?.matureWidth ?? 3, maxR })),
  ]
}

export default function Planner({ onRetrace }) {
  const [activeView, setActiveView]     = useState('bedA')
  const [placed, setPlaced]             = useState([])
  const [selected, setSelected]         = useState(null)
  const [activeDetail, setActiveDetail] = useState(null)
  const [showLabels, setShowLabels]     = useState(true)
  const [imgSize, setImgSize]           = useState({ w: 0, h: 0 })
  const [ctnSize, setCtnSize]           = useState({ w: 0, h: 0 })
  const imgRef = useRef(null)
  const ctnRef = useRef(null)
  const dragRef = useRef(null)

  const viewDef = BED_VIEWS.find(v => v.key === activeView) ?? BED_VIEWS[0]
  const zones   = loadZones()
  const poly    = zones[activeView]

  // Image rendered width = container width, height proportional
  const renderedW = ctnSize.w
  const renderedH = imgSize.w > 0 ? Math.round(ctnSize.w * imgSize.h / imgSize.w) : ctnSize.h

  useEffect(() => {
    if (!ctnRef.current) return
    const obs = new ResizeObserver(([e]) => setCtnSize({ w: e.contentRect.width, h: e.contentRect.height }))
    obs.observe(ctnRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    setImgSize({ w: 0, h: 0 })
  }, [activeView])

  useEffect(() => {
    if (renderedW > 0 && renderedH > 0 && poly) {
      setPlaced(buildLayout(poly, viewDef, renderedW, renderedH))
    } else {
      setPlaced([])
    }
  }, [activeView, renderedW, renderedH])

  function onImgLoad(e) {
    setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
  }

  function handleImgClick(e) {
    if (!selected || !imgRef.current) return
    if (dragRef.current?.didDrag) { dragRef.current.didDrag = false; return }
    const rect = imgRef.current.getBoundingClientRect()
    const plant = plants.find(p => p.id === selected)
    if (!plant) return
    const maxR = poly ? (() => {
      const pts = poly.map(p => ({ x: p.x * renderedW, y: p.y * renderedH }))
      const ys = pts.map(p => p.y)
      return Math.max(6, ((Math.max(...ys) - Math.min(...ys)) / 2) * 0.82)
    })() : 20
    setPlaced(prev => [...prev, { id: _id++, plantId: selected, x: e.clientX - rect.left, y: e.clientY - rect.top, size: plant.matureWidth, maxR }])
  }

  function startDrag(e, itemId) {
    e.stopPropagation()
    dragRef.current = { id: itemId, startX: e.clientX, startY: e.clientY, didDrag: false }
    function onMove(me) {
      const dx = me.clientX - dragRef.current.startX
      const dy = me.clientY - dragRef.current.startY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.didDrag = true
      setPlaced(prev => prev.map(item => {
        if (item.id !== dragRef.current.id) return item
        dragRef.current.startX = me.clientX; dragRef.current.startY = me.clientY
        return { ...item, x: item.x + dx, y: item.y + dy }
      }))
    }
    function onUp() { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const pxPerFoot = poly && renderedW > 0
    ? (() => { const { minX, maxX } = polyBounds(poly); return ((maxX - minX) * renderedW) / viewDef.bedWidthFt * 0.22 })()
    : renderedW / viewDef.bedWidthFt * 0.22

  const toSVGPt = (p) => `${p.x * renderedW},${p.y * renderedH}`

  const btn  = (on) => ({ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${on ? '#88b040' : '#c8c0a8'}`, background: on ? '#d8eeb8' : '#fff', color: on ? '#2a4010' : '#3a4a28' })
  const vBtn = (on) => ({ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${on ? '#5577cc' : '#c8c0a8'}`, background: on ? '#dde8ff' : '#fff', color: on ? '#1a2a6a' : '#3a4a28' })

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f2efe8' }}>
      {/* Sidebar */}
      <div style={{ width: 280, flexShrink: 0, background: '#fff', borderRight: '1px solid #ddd8cc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #ece8e0' }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#2a3a18', marginBottom: 2 }}>Mom's Garden Planner</div>
          <div style={{ fontSize: 11, color: '#8a9870' }}>Arlington Heights, IL · Zone 6a/6b</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {plants.map(p => (
            <div key={p.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', background: selected === p.id ? '#edf5e0' : 'transparent', borderLeft: `3px solid ${selected === p.id ? '#6a9030' : 'transparent'}` }}
              onClick={() => { setSelected(prev => prev === p.id ? null : p.id); setActiveDetail(p) }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(0,0,0,0.08)', background: p.color }}
                dangerouslySetInnerHTML={{ __html: p.svgIcon }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2a3818' }}>{p.commonName}</div>
                <div style={{ fontSize: 10, color: '#8a9a68', fontStyle: 'italic' }}>{p.botanicalName}</div>
                <div style={{ fontSize: 10, color: '#aab888' }}>{p.matureWidth}′w × {p.matureHeight}′h · {p.type}</div>
              </div>
            </div>
          ))}
        </div>
        {activeDetail && <PlantDetail plant={activeDetail} onClose={() => setActiveDetail(null)} />}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', background: '#fff', borderBottom: '1px solid #ddd8cc', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
          {BED_VIEWS.map(v => <button key={v.key} style={vBtn(activeView === v.key)} onClick={() => { setActiveView(v.key); setSelected(null) }}>{v.label}</button>)}
          <div style={{ width: 1, height: 22, background: '#e0dbd0', margin: '0 2px' }} />
          <button style={btn(showLabels)} onClick={() => setShowLabels(v => !v)}>Labels {showLabels ? 'ON' : 'OFF'}</button>
          {selected && <button style={btn(false)} onClick={() => setSelected(null)}>✕ Cancel</button>}
          {poly && <button style={btn(false)} onClick={() => setPlaced(buildLayout(poly, viewDef, renderedW, renderedH))}>Reset layout</button>}
          <button style={{ ...btn(false), marginLeft: 'auto', fontSize: 11, color: '#8a7a60' }} onClick={onRetrace}>✏️ Retrace beds</button>
          <span style={{ fontSize: 11, color: '#aab888' }}>
            {!poly ? '⚠ No outline — click Retrace beds' : selected ? `Click photo to place ${plants.find(p => p.id === selected)?.commonName}` : 'Select plant · drag · ✕ to remove'}
          </span>
        </div>

        {/* Scrollable photo — same rendering as setup: full width, proportional height, NO objectFit */}
        <div ref={ctnRef} style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <div style={{ position: 'relative', width: renderedW, height: renderedH }}>
            <img
              ref={imgRef}
              src={viewDef.url}
              alt="Bed"
              onLoad={onImgLoad}
              onClick={handleImgClick}
              style={{ display: 'block', width: renderedW, height: renderedH, cursor: selected ? 'crosshair' : 'default', userSelect: 'none' }}
              draggable={false}
            />

            {poly && renderedW > 0 && (
              <svg style={{ position: 'absolute', inset: 0, width: renderedW, height: renderedH, pointerEvents: 'none' }}
                viewBox={`0 0 ${renderedW} ${renderedH}`}>
                <polygon
                  points={poly.map(toSVGPt).join(' ')}
                  fill="rgba(100,200,80,0.10)"
                  stroke="rgba(60,160,40,0.8)"
                  strokeWidth="2" strokeDasharray="6,3"
                />
              </svg>
            )}

            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {placed.map(item => {
                const plant = plants.find(p => p.id === item.plantId)
                if (!plant) return null
                const rawR = Math.round(item.size * pxPerFoot) / 2
                const r    = Math.min(item.maxR ?? 30, Math.max(6, rawR))
                const sz   = r * 2
                return (
                  <div key={item.id} style={{ position: 'absolute', left: item.x, top: item.y, width: sz, height: sz, transform: 'translate(-50%,-50%)', pointerEvents: 'auto', cursor: 'grab', userSelect: 'none' }}
                    onMouseDown={e => startDrag(e, item.id)}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 6px rgba(0,0,0,0.5)', background: plant.color }}
                      dangerouslySetInnerHTML={{ __html: plant.svgIcon }} />
                    <button onMouseDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); setPlaced(prev => prev.filter(i => i.id !== item.id)) }}
                      style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', fontSize: 8, lineHeight: '14px', textAlign: 'center', cursor: 'pointer', padding: 0 }}>✕</button>
                    {showLabels && (
                      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 2, background: 'rgba(255,255,255,0.92)', borderRadius: 3, padding: '1px 4px', fontSize: 8, fontWeight: 600, color: '#1e3408', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
                        {plant.commonName.split(' ').slice(0, 2).join(' ')}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
