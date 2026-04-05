import { useState, useRef, useEffect } from 'react'
import plants from './data/plants'
import PlantDetail from './PlantDetail'

const BED_VIEWS = [
  {
    key: 'bedA',
    label: 'Bed A — Home Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedA.jpeg',
    cropCenter: '35%',
    bedWidthFt: 30,
    backRow:  ['cherry-bomb-ninebark','incrediball-hydrangea','karl-foerster-grass','little-lime-hydrangea','karl-foerster-grass'],
    frontRow: ['walker-low-catmint','rozanne-geranium','walker-low-catmint','black-eyed-susan','rozanne-geranium','walker-low-catmint','autumn-fire-sedum'],
  },
  {
    key: 'bedB',
    label: 'Bed B — Garage Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedB.jpeg',
    cropCenter: '47%',
    bedWidthFt: 30,
    backRow:  ['karl-foerster-grass','black-eyed-susan','black-eyed-susan','black-eyed-susan','karl-foerster-grass'],
    frontRow: ['walker-low-catmint','prairie-dropseed','rozanne-geranium','autumn-fire-sedum'],
  },
  {
    key: 'whole',
    label: 'Whole Home',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/whole-home.jpeg',
    cropCenter: '50%',
    bedWidthFt: 60,
    backRow: [], frontRow: [],
  },
]

function evenSpread(n, lo, hi) {
  if (n <= 0) return []
  if (n === 1) return [(lo + hi) / 2]
  return Array.from({ length: n }, (_, i) => lo + (i / (n - 1)) * (hi - lo))
}

let _id = 1
function buildLayout(bedLeft, bedRight, backY, frontY, viewDef) {
  const pad = (bedRight - bedLeft) * 0.03
  const backXs  = evenSpread(viewDef.backRow.length,  bedLeft + pad, bedRight - pad)
  const frontXs = evenSpread(viewDef.frontRow.length, bedLeft + pad, bedRight - pad)
  return [
    ...viewDef.backRow.map((plantId, i)  => ({ id: _id++, plantId, x: backXs[i],  y: backY,  size: plants.find(p => p.id === plantId)?.matureWidth ?? 3 })),
    ...viewDef.frontRow.map((plantId, i) => ({ id: _id++, plantId, x: frontXs[i], y: frontY, size: plants.find(p => p.id === plantId)?.matureWidth ?? 3 })),
  ]
}

// Default calibrated layouts — y values from real clicks on the actual bed
const DEFAULT_LAYOUTS = {
  bedA: (w, h) => buildLayout(0.22 * w, 0.97 * w, 0.449 * h, 0.479 * h, BED_VIEWS[0]),
  bedB: (w, h) => buildLayout(0.04 * w, 0.94 * w, 0.44 * h,  0.57 * h,  BED_VIEWS[1]),
}

export default function App() {
  const [activeView, setActiveView]           = useState('bedA')
  const [placed, setPlaced]                   = useState([])
  const [selected, setSelected]               = useState(null)
  const [activeDetail, setActiveDetail]       = useState(null)
  const [showLabels, setShowLabels]           = useState(true)
  const [overlaySize, setOverlaySize]         = useState({ w: 0, h: 0 })
  const overlayRef = useRef(null)
  const dragRef    = useRef(null)

  const viewDef = BED_VIEWS.find(v => v.key === activeView) ?? BED_VIEWS[0]

  useEffect(() => {
    if (!overlayRef.current) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setOverlaySize({ w: width, h: height })
    })
    obs.observe(overlayRef.current)
    return () => obs.disconnect()
  }, [])

  // When overlay is measured and view changes, build default layout
  useEffect(() => {
    if (overlaySize.w > 0 && DEFAULT_LAYOUTS[activeView]) {
      setPlaced(DEFAULT_LAYOUTS[activeView](overlaySize.w, overlaySize.h))
    } else if (!DEFAULT_LAYOUTS[activeView]) {
      setPlaced([])
    }
  }, [activeView, overlaySize.w])

  function switchView(key) {
    setActiveView(key)
    setSelected(null)
  }

  function handleOverlayClick(e) {
    if (!selected || !overlayRef.current) return
    if (dragRef.current?.didDrag) { dragRef.current.didDrag = false; return }
    const rect = overlayRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const plant = plants.find(p => p.id === selected)
    if (!plant) return
    setPlaced(prev => [...prev, { id: _id++, plantId: selected, x, y, size: plant.matureWidth }])
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
        dragRef.current.startX = me.clientX
        dragRef.current.startY = me.clientY
        return { ...item, x: item.x + dx, y: item.y + dy }
      }))
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Scale: plant circle diameter = matureWidth / bedWidthFt * overlayWidth * 0.22
  const pxPerFoot = overlaySize.w > 0
    ? (overlaySize.w / viewDef.bedWidthFt) * 0.22
    : 10

  const btn = (on, warn) => ({
    padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: `1px solid ${on ? (warn ? '#e06030' : '#88b040') : '#c8c0a8'}`,
    background: on ? (warn ? '#ffe0d0' : '#d8eeb8') : '#fff',
    color: on ? (warn ? '#7a2010' : '#2a4010') : '#3a4a28',
  })
  const vBtn = (on) => ({
    padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: `1px solid ${on ? '#5577cc' : '#c8c0a8'}`,
    background: on ? '#dde8ff' : '#fff', color: on ? '#1a2a6a' : '#3a4a28',
  })

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
              onClick={() => { setSelected(prev => prev === p.id ? null : p.id); setActiveDetail(p) }}
            >
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
          {BED_VIEWS.map(v => <button key={v.key} style={vBtn(activeView === v.key)} onClick={() => switchView(v.key)}>{v.label}</button>)}
          <div style={{ width: 1, height: 22, background: '#e0dbd0', margin: '0 2px' }} />
          <button style={btn(showLabels)} onClick={() => setShowLabels(v => !v)}>Labels {showLabels ? 'ON' : 'OFF'}</button>
          {selected && <button style={btn(false)} onClick={() => setSelected(null)}>✕ Cancel placing</button>}
          {placed.length > 0 && (
            <button style={btn(false)} onClick={() => {
              if (overlaySize.w > 0 && DEFAULT_LAYOUTS[activeView]) {
                setPlaced(DEFAULT_LAYOUTS[activeView](overlaySize.w, overlaySize.h))
              } else setPlaced([])
            }}>Reset layout</button>
          )}
          <span style={{ fontSize: 11, color: '#aab888', marginLeft: 'auto' }}>
            {selected
              ? `Click photo to place ${plants.find(p => p.id === selected)?.commonName}`
              : 'Select a plant · drag to reposition · ✕ to remove'}
          </span>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            style={{ position: 'relative', width: '100%', height: '100%', cursor: selected ? 'crosshair' : 'default', overflow: 'hidden' }}
          >
            <img
              src={viewDef.url}
              alt="Bed reference"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `center ${viewDef.cropCenter}`, display: 'block', userSelect: 'none' }}
              draggable={false}
            />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {placed.map(item => {
                const plant = plants.find(p => p.id === item.plantId)
                if (!plant) return null
                const sizePx = Math.min(55, Math.max(14, Math.round(item.size * pxPerFoot)))
                return (
                  <div key={item.id} style={{ position: 'absolute', left: item.x, top: item.y, width: sizePx, height: sizePx, transform: 'translate(-50%,-50%)', pointerEvents: 'auto', cursor: 'grab', userSelect: 'none' }}
                    onMouseDown={e => startDrag(e, item.id)}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 6px rgba(0,0,0,0.5)', background: plant.color }}
                      dangerouslySetInnerHTML={{ __html: plant.svgIcon }} />
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); setPlaced(prev => prev.filter(i => i.id !== item.id)) }}
                      style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', fontSize: 8, lineHeight: '14px', textAlign: 'center', cursor: 'pointer', padding: 0 }}
                    >✕</button>
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
