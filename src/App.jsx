import { useState, useRef, useEffect } from 'react'
import plants from './data/plants'
import PlantDetail from './PlantDetail'

const BED_VIEWS = [
  {
    key: 'bedA',
    label: 'Bed A — Home Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedA.jpeg',
    cropTop: 0.22,
    cropBot: 0.48,
    bedWidthFt: 30,
    defaultLayout: [
      // x/y calibrated from real clicks on the mulch strip — April 2026
      { plantId: 'walker-low-catmint',  x: 0.229, y: 0.485 },
      { plantId: 'rozanne-geranium',    x: 0.303, y: 0.483 },
      { plantId: 'walker-low-catmint',  x: 0.375, y: 0.491 },
      { plantId: 'rozanne-geranium',    x: 0.467, y: 0.495 },
      { plantId: 'black-eyed-susan',    x: 0.557, y: 0.496 },
      { plantId: 'rozanne-geranium',    x: 0.638, y: 0.495 },
      { plantId: 'walker-low-catmint',  x: 0.712, y: 0.500 },
      { plantId: 'autumn-fire-sedum',   x: 0.869, y: 0.502 },
    ],
  },
  {
    key: 'bedB',
    label: 'Bed B — Garage Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedB.jpeg',
    cropTop: 0.30,
    cropBot: 0.65,
    bedWidthFt: 30,
    defaultLayout: [
      { plantId: 'cherry-bomb-ninebark',  x: 0.10, y: 0.48 },
      { plantId: 'incrediball-hydrangea', x: 0.27, y: 0.46 },
      { plantId: 'karl-foerster-grass',   x: 0.44, y: 0.47 },
      { plantId: 'little-lime-hydrangea', x: 0.61, y: 0.46 },
      { plantId: 'karl-foerster-grass',   x: 0.78, y: 0.47 },
      { plantId: 'walker-low-catmint',    x: 0.11, y: 0.65 },
      { plantId: 'black-eyed-susan',      x: 0.25, y: 0.64 },
      { plantId: 'black-eyed-susan',      x: 0.38, y: 0.65 },
      { plantId: 'prairie-dropseed',      x: 0.52, y: 0.64 },
      { plantId: 'prairie-dropseed',      x: 0.65, y: 0.65 },
      { plantId: 'rozanne-geranium',      x: 0.78, y: 0.64 },
      { plantId: 'autumn-fire-sedum',     x: 0.89, y: 0.65 },
    ],
  },
  {
    key: 'whole',
    label: 'Whole Home',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/whole-home.jpeg',
    cropTop: 0.0,
    cropBot: 1.0,
    bedWidthFt: 60,
    defaultLayout: [],
  },
]

let _nextId = 1
function makeLayout(layoutDef) {
  return layoutDef.map(p => ({
    id: _nextId++,
    plantId: p.plantId,
    x: p.x,
    y: p.y,
    size: plants.find(pl => pl.id === p.plantId)?.matureWidth ?? 3,
  }))
}

export default function App() {
  const [activeView, setActiveView]     = useState('bedA')
  const [placed, setPlaced]             = useState(() => makeLayout(BED_VIEWS[0].defaultLayout))
  const [selected, setSelected]         = useState(null)
  const [activeDetail, setActiveDetail] = useState(null)
  const [showLabels, setShowLabels]     = useState(true)
  const [overlaySize, setOverlaySize]   = useState({ w: 0, h: 0 })
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
  }, [activeView])

  function switchView(viewKey) {
    setActiveView(viewKey)
    setPlaced(makeLayout(BED_VIEWS.find(v => v.key === viewKey)?.defaultLayout ?? []))
    setSelected(null)
  }

  function handleOverlayClick(e) {
    if (!selected || !overlayRef.current) return
    if (dragRef.current?.didDrag) { dragRef.current.didDrag = false; return }
    const rect = overlayRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const plant = plants.find(p => p.id === selected)
    if (!plant) return
    setPlaced(prev => [...prev, { id: _nextId++, plantId: selected, x, y, size: plant.matureWidth }])
  }

  function startDrag(e, itemId) {
    e.stopPropagation()
    if (!overlayRef.current) return
    const rect = overlayRef.current.getBoundingClientRect()
    dragRef.current = { id: itemId, startX: e.clientX, startY: e.clientY, w: rect.width, h: rect.height, didDrag: false }
    function onMove(me) {
      const dx = me.clientX - dragRef.current.startX
      const dy = me.clientY - dragRef.current.startY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.didDrag = true
      setPlaced(prev => prev.map(item => {
        if (item.id !== dragRef.current.id) return item
        dragRef.current.startX = me.clientX
        dragRef.current.startY = me.clientY
        return {
          ...item,
          x: Math.max(0, Math.min(1, item.x + dx / dragRef.current.w)),
          y: Math.max(0, Math.min(1, item.y + dy / dragRef.current.h)),
        }
      }))
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function removePlaced(e, itemId) {
    e.stopPropagation()
    setPlaced(prev => prev.filter(i => i.id !== itemId))
  }

  // Scale: viewport width / bedWidthFt gives px-per-foot.
  // Multiply by 0.55 so a mature 3ft perennial is ~55px — readable but not overwhelming.
  const pxPerFoot = (overlaySize.w / viewDef.bedWidthFt) * 0.55

  const cropCenterPct = ((viewDef.cropTop + viewDef.cropBot) / 2 * 100).toFixed(1)
  const imgStyle = {
    width: '100%', height: '100%',
    objectFit: 'cover',
    objectPosition: `center ${cropCenterPct}%`,
    display: 'block',
    userSelect: 'none',
  }

  const s = {
    root:      { display: 'flex', height: '100vh', overflow: 'hidden', background: '#f2efe8' },
    sidebar:   { width: 280, flexShrink: 0, background: '#fff', borderRight: '1px solid #ddd8cc', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    sideHead:  { padding: '16px 16px 12px', borderBottom: '1px solid #ece8e0' },
    h1:        { fontSize: 17, fontWeight: 600, color: '#2a3a18', marginBottom: 2 },
    sub:       { fontSize: 11, color: '#8a9870' },
    plantList: { flex: 1, overflowY: 'auto', padding: '8px 0' },
    plantItem: (on) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', background: on ? '#edf5e0' : 'transparent', borderLeft: `3px solid ${on ? '#6a9030' : 'transparent'}`, transition: 'background 0.1s' }),
    pName:     { fontSize: 12, fontWeight: 600, color: '#2a3818', lineHeight: 1.3 },
    pSci:      { fontSize: 10, color: '#8a9a68', fontStyle: 'italic' },
    pMeta:     { fontSize: 10, color: '#aab888' },
    main:      { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
    toolbar:   { display: 'flex', gap: 8, padding: '10px 16px', background: '#fff', borderBottom: '1px solid #ddd8cc', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' },
    btn:       (on) => ({ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: `1px solid ${on ? '#88b040' : '#c8c0a8'}`, background: on ? '#d8eeb8' : '#fff', color: on ? '#2a4010' : '#3a4a28', cursor: 'pointer' }),
    viewBtn:   (on) => ({ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: `1px solid ${on ? '#5577cc' : '#c8c0a8'}`, background: on ? '#dde8ff' : '#fff', color: on ? '#1a2a6a' : '#3a4a28', cursor: 'pointer' }),
    divider:   { width: 1, height: 22, background: '#e0dbd0', margin: '0 2px' },
    hint:      { fontSize: 11, color: '#aab888', marginLeft: 'auto' },
    canvasArea:{ flex: 1, overflow: 'hidden', position: 'relative' },
    overlay:   { position: 'relative', width: '100%', height: '100%', cursor: selected ? 'crosshair' : 'default', overflow: 'hidden' },
    placedWrap:{ position: 'absolute', inset: 0, pointerEvents: 'none' },
  }

  return (
    <div style={s.root}>
      <div style={s.sidebar}>
        <div style={s.sideHead}>
          <div style={s.h1}>Mom's Garden Planner</div>
          <div style={s.sub}>Arlington Heights, IL · Zone 6a/6b</div>
        </div>
        <div style={s.plantList}>
          {plants.map(p => (
            <div key={p.id} style={s.plantItem(selected === p.id)}
              onClick={() => { setSelected(prev => prev === p.id ? null : p.id); setActiveDetail(p) }}>
              <PlantThumb plant={p} />
              <div>
                <div style={s.pName}>{p.commonName}</div>
                <div style={s.pSci}>{p.botanicalName}</div>
                <div style={s.pMeta}>{p.matureWidth}′w × {p.matureHeight}′h · {p.type}</div>
              </div>
            </div>
          ))}
        </div>
        {activeDetail && <PlantDetail plant={activeDetail} onClose={() => setActiveDetail(null)} />}
      </div>

      <div style={s.main}>
        <div style={s.toolbar}>
          {BED_VIEWS.map(v => (
            <button key={v.key} style={s.viewBtn(activeView === v.key)} onClick={() => switchView(v.key)}>
              {v.label}
            </button>
          ))}
          <div style={s.divider} />
          <button style={s.btn(showLabels)} onClick={() => setShowLabels(v => !v)}>
            Labels {showLabels ? 'ON' : 'OFF'}
          </button>
          {selected && (
            <button style={s.btn(false)} onClick={() => setSelected(null)}>✕ Cancel</button>
          )}
          <button style={s.btn(false)} onClick={() => { setPlaced(makeLayout(viewDef.defaultLayout)); setSelected(null) }}>
            Reset layout
          </button>
          <span style={s.hint}>
            {selected
              ? `Click photo to place ${plants.find(p => p.id === selected)?.commonName}`
              : 'Select a plant · drag to reposition · ✕ to remove'}
          </span>
        </div>

        <div style={s.canvasArea}>
          <div style={s.overlay} ref={overlayRef} onClick={handleOverlayClick}>
            <img src={viewDef.url} alt="Bed reference" style={imgStyle} draggable={false} />
            <div style={s.placedWrap}>
              {placed.map(item => {
                const plant = plants.find(p => p.id === item.plantId)
                if (!plant) return null
                return (
                  <PlacedPlant
                    key={item.id}
                    item={item}
                    plant={plant}
                    showLabel={showLabels}
                    pxPerFoot={pxPerFoot}
                    onDragStart={e => startDrag(e, item.id)}
                    onRemove={e => removePlaced(e, item.id)}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlantThumb({ plant }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
      overflow: 'hidden', border: '2px solid rgba(0,0,0,0.08)',
      background: plant.color,
    }}
      dangerouslySetInnerHTML={{ __html: plant.svgIcon }}
    />
  )
}

function PlacedPlant({ item, plant, showLabel, pxPerFoot, onDragStart, onRemove }) {
  const sizePx = Math.max(16, Math.round(item.size * pxPerFoot))
  return (
    <div
      style={{
        position: 'absolute',
        left: `${item.x * 100}%`,
        top:  `${item.y * 100}%`,
        width: sizePx,
        height: sizePx,
        // Anchor bottom of circle to the y coordinate so plants sit ON the bed line
        transform: 'translate(-50%, -100%)',
        pointerEvents: 'auto',
        cursor: 'grab',
        userSelect: 'none',
      }}
      onMouseDown={onDragStart}
    >
      <div style={{
        width: '100%', height: '100%',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.9)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
        background: plant.color,
      }}
        dangerouslySetInnerHTML={{ __html: plant.svgIcon }}
      />
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={onRemove}
        style={{
          position: 'absolute', top: 0, right: 0,
          width: 14, height: 14, borderRadius: '50%',
          background: 'rgba(0,0,0,0.65)', border: 'none',
          color: '#fff', fontSize: 8, lineHeight: '14px',
          textAlign: 'center', cursor: 'pointer', padding: 0,
        }}
      >✕</button>
      {showLabel && (
        <div style={{
          position: 'absolute',
          top: '100%', left: '50%', transform: 'translateX(-50%)',
          marginTop: 2,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 3, padding: '1px 4px', fontSize: 8,
          fontWeight: 600, color: '#1e3408', whiteSpace: 'nowrap',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }}>
          {plant.commonName.split(' ').slice(0, 2).join(' ')}
        </div>
      )}
    </div>
  )
}
