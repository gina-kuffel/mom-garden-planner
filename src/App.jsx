import { useState, useRef, useEffect } from 'react'
import plants from './data/plants'
import PlantDetail from './PlantDetail'

// Photo dimensions: 952 × 1288 (portrait). objectFit: contain is used so the
// full image is always visible and x/y percentages map predictably to real photo pixels.

const BED_VIEWS = [
  {
    key: 'bedA',
    label: 'Bed A — Home Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedA.jpeg',
    // Bed is the dark mulch strip at base of brick wall.
    // In the 952×1288 image: bed bottom edge ~y=530px (0.41), bed center ~y=510px (0.40)
    // Photo shows ~30ft of horizontal width across 952px → scale reference
    bedWidthFt: 30,
    defaultLayout: [
      // Single staggered row of perennials along the mulch strip
      // x spans the bed width (~0.05 to 0.92), y at bed center ~0.40
      { plantId: 'walker-low-catmint',  x: 0.08, y: 0.40 },
      { plantId: 'rozanne-geranium',    x: 0.20, y: 0.39 },
      { plantId: 'walker-low-catmint',  x: 0.33, y: 0.40 },
      { plantId: 'rozanne-geranium',    x: 0.46, y: 0.39 },
      { plantId: 'black-eyed-susan',    x: 0.58, y: 0.40 },
      { plantId: 'rozanne-geranium',    x: 0.70, y: 0.39 },
      { plantId: 'walker-low-catmint',  x: 0.82, y: 0.40 },
      { plantId: 'autumn-fire-sedum',   x: 0.92, y: 0.39 },
    ],
  },
  {
    key: 'bedB',
    label: 'Bed B — Garage Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedB.jpeg',
    // Bed is the bare dirt strip at base of brick/siding. 
    // In the 952×1288 image: bed bottom ~y=700px (0.54), bed center ~y=670px (0.52)
    bedWidthFt: 30,
    defaultLayout: [
      // Back row: shrubs at y~0.49 (against the foundation)
      { plantId: 'cherry-bomb-ninebark',  x: 0.10, y: 0.49 },
      { plantId: 'incrediball-hydrangea', x: 0.28, y: 0.48 },
      { plantId: 'karl-foerster-grass',   x: 0.45, y: 0.49 },
      { plantId: 'little-lime-hydrangea', x: 0.62, y: 0.48 },
      { plantId: 'karl-foerster-grass',   x: 0.78, y: 0.49 },
      // Front row: perennials at y~0.55 (toward lawn edge)
      { plantId: 'walker-low-catmint',    x: 0.12, y: 0.55 },
      { plantId: 'black-eyed-susan',      x: 0.26, y: 0.54 },
      { plantId: 'black-eyed-susan',      x: 0.40, y: 0.55 },
      { plantId: 'prairie-dropseed',      x: 0.54, y: 0.54 },
      { plantId: 'prairie-dropseed',      x: 0.66, y: 0.55 },
      { plantId: 'rozanne-geranium',      x: 0.78, y: 0.54 },
      { plantId: 'autumn-fire-sedum',     x: 0.89, y: 0.55 },
    ],
  },
  {
    key: 'whole',
    label: 'Whole Home',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/whole-home.jpeg',
    bedWidthFt: 60,
    defaultLayout: [],
  },
]

const PHOTO_W = 952
const PHOTO_H = 1288

function loadBedPhoto(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ url, naturalW: img.naturalWidth, naturalH: img.naturalHeight })
    img.onerror = () => resolve({ url, naturalW: PHOTO_W, naturalH: PHOTO_H })
    img.src = url
  })
}

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
  const [photo, setPhoto]               = useState(null)
  const [activeView, setActiveView]     = useState('bedA')
  const [placed, setPlaced]             = useState([])
  const [selected, setSelected]         = useState(null)
  const [activeDetail, setActiveDetail] = useState(null)
  const [showLabels, setShowLabels]     = useState(true)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })
  const containerRef = useRef(null)
  const dragRef      = useRef(null)

  useEffect(() => {
    const view = BED_VIEWS.find(v => v.key === 'bedA')
    loadBedPhoto(view.url).then(setPhoto)
    setPlaced(makeLayout(view.defaultLayout))
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setContainerSize({ w: width, h: height })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  function switchView(viewKey) {
    const view = BED_VIEWS.find(v => v.key === viewKey)
    if (!view) return
    setActiveView(viewKey)
    loadBedPhoto(view.url).then(setPhoto)
    setPlaced(makeLayout(view.defaultLayout))
    setSelected(null)
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setPhoto({ url, naturalW: img.naturalWidth, naturalH: img.naturalHeight })
      setActiveView(null)
      setPlaced([])
    }
    img.src = url
  }

  // With objectFit: contain, the image is letterboxed.
  // We need to compute the actual rendered image rect within the container
  // so that click/drag coordinates map correctly to photo percentages.
  function getImageRect(natW, natH, cW, cH) {
    const scaleW = cW / natW
    const scaleH = cH / natH
    const scale  = Math.min(scaleW, scaleH)
    const imgW   = natW * scale
    const imgH   = natH * scale
    const offX   = (cW - imgW) / 2
    const offY   = (cH - imgH) / 2
    return { imgW, imgH, offX, offY, scale }
  }

  const natW = photo?.naturalW ?? PHOTO_W
  const natH = photo?.naturalH ?? PHOTO_H
  const { imgW, imgH, offX, offY } = getImageRect(natW, natH, containerSize.w, containerSize.h)

  function eventToPhotoFraction(clientX, clientY) {
    if (!containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    const relX = clientX - rect.left
    const relY = clientY - rect.top
    return {
      x: Math.max(0, Math.min(1, (relX - offX) / imgW)),
      y: Math.max(0, Math.min(1, (relY - offY) / imgH)),
    }
  }

  function handleOverlayClick(e) {
    if (!selected) return
    if (dragRef.current?.didDrag) { dragRef.current.didDrag = false; return }
    const { x, y } = eventToPhotoFraction(e.clientX, e.clientY)
    const plant = plants.find(p => p.id === selected)
    if (!plant) return
    setPlaced(prev => [...prev, {
      id: _nextId++,
      plantId: selected,
      x, y,
      size: plant.matureWidth,
    }])
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
        const newX = Math.max(0, Math.min(1, item.x + dx / imgW))
        const newY = Math.max(0, Math.min(1, item.y + dy / imgH))
        dragRef.current.startX = me.clientX
        dragRef.current.startY = me.clientY
        return { ...item, x: newX, y: newY }
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

  const currentViewDef = BED_VIEWS.find(v => v.key === activeView)
  const bedWidthFt = currentViewDef?.bedWidthFt ?? 30
  // pxPerFoot: how many rendered pixels = 1 foot, based on image width
  const pxPerFoot = imgW / bedWidthFt

  const s = {
    root:      { display: 'flex', height: '100vh', overflow: 'hidden', background: '#1a1a1a' },
    sidebar:   { width: 280, flexShrink: 0, background: '#fff', borderRight: '1px solid #ddd8cc', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    sideHead:  { padding: '16px 16px 12px', borderBottom: '1px solid #ece8e0' },
    h1:        { fontSize: 17, fontWeight: 600, color: '#2a3a18', marginBottom: 2 },
    sub:       { fontSize: 11, color: '#8a9870' },
    plantList: { flex: 1, overflowY: 'auto', padding: '8px 0' },
    plantItem: (on) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', background: on ? '#edf5e0' : 'transparent', borderLeft: `3px solid ${on ? '#6a9030' : 'transparent'}`, transition: 'background 0.1s' }),
    pName:     { fontSize: 12, fontWeight: 600, color: '#2a3818', lineHeight: 1.3 },
    pSci:      { fontSize: 10, color: '#8a9a68', fontStyle: 'italic' },
    pMeta:     { fontSize: 10, color: '#aab888' },
    main:      { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    toolbar:   { display: 'flex', gap: 8, padding: '10px 16px', background: '#fff', borderBottom: '1px solid #ddd8cc', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' },
    btn:       (on) => ({ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: `1px solid ${on ? '#88b040' : '#c8c0a8'}`, background: on ? '#d8eeb8' : '#fff', color: on ? '#2a4010' : '#3a4a28', cursor: 'pointer' }),
    viewBtn:   (on) => ({ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: `1px solid ${on ? '#5577cc' : '#c8c0a8'}`, background: on ? '#dde8ff' : '#fff', color: on ? '#1a2a6a' : '#3a4a28', cursor: 'pointer' }),
    uploadBtn: { padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: '1px solid #c8c0a8', background: '#fff', color: '#3a4a28', cursor: 'pointer' },
    divider:   { width: 1, height: 22, background: '#e0dbd0', margin: '0 2px' },
    hint:      { fontSize: 11, color: '#aab888', marginLeft: 'auto' },
    // Canvas: dark background so letterbox bars are unobtrusive
    canvasArea:{ flex: 1, overflow: 'hidden', position: 'relative', background: '#1a1a1a', cursor: selected ? 'crosshair' : 'default' },
    // Overlay sits at exact image position within the container
    imgOverlay:{ position: 'absolute', left: offX, top: offY, width: imgW, height: imgH, pointerEvents: 'none' },
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
          <label style={s.uploadBtn}>
            📷 Custom Photo
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </label>
          <div style={s.divider} />
          <button style={s.btn(showLabels)} onClick={() => setShowLabels(v => !v)}>
            Labels {showLabels ? 'ON' : 'OFF'}
          </button>
          {selected && (
            <button style={s.btn(false)} onClick={() => setSelected(null)}>✕ Cancel placing</button>
          )}
          <button style={s.btn(false)} onClick={() => setPlaced(makeLayout(currentViewDef?.defaultLayout ?? []))}>
            Reset layout
          </button>
          <span style={s.hint}>
            {selected
              ? `Click photo to place ${plants.find(p => p.id === selected)?.commonName}`
              : 'Select a plant to add · drag to reposition · ✕ to remove'}
          </span>
        </div>

        <div style={s.canvasArea} ref={containerRef} onClick={handleOverlayClick}>
          {photo && (
            <img
              src={photo.url}
              alt="House reference"
              style={{ position: 'absolute', left: offX, top: offY, width: imgW, height: imgH, display: 'block', userSelect: 'none' }}
              draggable={false}
            />
          )}
          {/* Plant overlays positioned relative to the actual image rect */}
          <div style={s.imgOverlay}>
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
  const sizePx = Math.max(20, Math.round(item.size * pxPerFoot))
  return (
    <div
      style={{
        position: 'absolute',
        left: `${item.x * 100}%`,
        top:  `${item.y * 100}%`,
        width: sizePx,
        height: sizePx,
        transform: 'translate(-50%, -50%)',
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
