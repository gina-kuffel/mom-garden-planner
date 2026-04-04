import { useState, useRef, useEffect } from 'react'
import plants from './data/plants'
import PlantDetail from './PlantDetail'

const BED_VIEWS = [
  {
    key: 'bedA',
    label: 'Bed A — Home Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedA.jpeg',
  },
  {
    key: 'bedB',
    label: 'Bed B — Garage Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedB.jpeg',
  },
  {
    key: 'whole',
    label: 'Whole Home',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/whole-home.jpeg',
  },
]

function loadBedPhoto(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ url, naturalW: img.naturalWidth, naturalH: img.naturalHeight })
    img.onerror = () => resolve({ url, naturalW: 1200, naturalH: 900 })
    img.src = url
  })
}

export default function App() {
  const [photo, setPhoto]               = useState(null)
  const [activeView, setActiveView]     = useState('bedA')
  const [placed, setPlaced]             = useState([])
  const [selected, setSelected]         = useState(null)
  const [activeDetail, setActiveDetail] = useState(null)
  const [showLabels, setShowLabels]     = useState(true)
  const [overlaySize, setOverlaySize]   = useState({ w: 0, h: 0 })
  const overlayRef = useRef(null)
  const dragRef    = useRef(null)
  const nextId     = useRef(1)

  // Load default photo (Bed A) on first mount
  useEffect(() => {
    const defaultView = BED_VIEWS.find(v => v.key === 'bedA')
    loadBedPhoto(defaultView.url).then(setPhoto)
  }, [])

  // Track overlay size
  useEffect(() => {
    if (!overlayRef.current) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setOverlaySize({ w: width, h: height })
    })
    obs.observe(overlayRef.current)
    return () => obs.disconnect()
  }, [photo])

  function switchView(viewKey) {
    const view = BED_VIEWS.find(v => v.key === viewKey)
    if (!view) return
    setActiveView(viewKey)
    loadBedPhoto(view.url).then(setPhoto)
    setPlaced([])
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
    }
    img.src = url
  }

  function handleOverlayClick(e) {
    if (!selected || !overlayRef.current) return
    if (dragRef.current?.didDrag) { dragRef.current.didDrag = false; return }
    const rect = overlayRef.current.getBoundingClientRect()
    const xPct = (e.clientX - rect.left) / rect.width
    const yPct = (e.clientY - rect.top)  / rect.height
    const plant = plants.find(p => p.id === selected)
    if (!plant) return
    setPlaced(prev => [...prev, {
      id: nextId.current++,
      plantId: selected,
      x: xPct,
      y: yPct,
      size: plant.matureWidth,
    }])
  }

  function startDrag(e, itemId) {
    e.stopPropagation()
    if (!overlayRef.current) return
    const rect = overlayRef.current.getBoundingClientRect()
    dragRef.current = { id: itemId, startX: e.clientX, startY: e.clientY, rectW: rect.width, rectH: rect.height, didDrag: false }
    function onMove(me) {
      const dx = me.clientX - dragRef.current.startX
      const dy = me.clientY - dragRef.current.startY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.didDrag = true
      setPlaced(prev => prev.map(item => {
        if (item.id !== dragRef.current.id) return item
        const newX = Math.max(0, Math.min(1, item.x + dx / dragRef.current.rectW))
        const newY = Math.max(0, Math.min(1, item.y + dy / dragRef.current.rectH))
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

  const s = {
    root:      { display: 'flex', height: '100vh', overflow: 'hidden', background: '#f2efe8' },
    sidebar:   { width: 300, flexShrink: 0, background: '#fff', borderRight: '1px solid #ddd8cc', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
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
    canvasArea:{ flex: 1, overflow: 'hidden', position: 'relative', background: '#1a1a18' },
    overlay:   { position: 'relative', width: '100%', height: '100%', cursor: selected ? 'crosshair' : 'default' },
    photoImg:  { width: '100%', height: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' },
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
          {placed.length > 0 && (
            <button style={s.btn(false)} onClick={() => setPlaced([])}>Clear all</button>
          )}
          <span style={s.hint}>
            {selected
              ? `Click the photo to place ${plants.find(p => p.id === selected)?.commonName}`
              : photo ? 'Select a plant from the sidebar, then click the photo to place it'
              : 'Loading photo…'}
          </span>
        </div>

        <div style={s.canvasArea}>
          {!photo ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 14, color: '#888' }}>Loading photo…</div>
            </div>
          ) : (
            <div style={s.overlay} ref={overlayRef} onClick={handleOverlayClick}>
              <img src={photo.url} alt="House reference" style={s.photoImg} draggable={false} />
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
                      overlayW={overlaySize.w}
                      onDragStart={e => startDrag(e, item.id)}
                      onRemove={e => removePlaced(e, item.id)}
                    />
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

function PlantThumb({ plant }) {
  const [failed, setFailed] = useState(false)
  if (plant.photoUrl && !failed) {
    return (
      <img src={plant.photoUrl} alt={plant.commonName}
        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(0,0,0,0.08)' }}
        onError={() => setFailed(true)} />
    )
  }
  return (
    <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: plant.color, border: '2px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
      🌿
    </div>
  )
}

function PlacedPlant({ item, plant, showLabel, overlayW, onDragStart, onRemove }) {
  const [failed, setFailed] = useState(false)
  const sizePx = Math.max(40, Math.round(overlayW * 0.02 * item.size))

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
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2.5px solid rgba(255,255,255,0.80)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.40)',
        background: plant.color,
        position: 'relative',
      }}>
        {plant.photoUrl && !failed && (
          <img
            src={plant.photoUrl}
            alt={plant.commonName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setFailed(true)}
            draggable={false}
          />
        )}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onRemove}
          style={{
            position: 'absolute', top: 3, right: 3,
            width: 18, height: 18, borderRadius: '50%',
            background: 'rgba(0,0,0,0.60)', border: 'none',
            color: '#fff', fontSize: 10, lineHeight: '18px',
            textAlign: 'center', cursor: 'pointer', padding: 0,
          }}
        >✕</button>
      </div>
      {showLabel && (
        <div style={{
          marginTop: 4, background: 'rgba(255,255,255,0.92)',
          borderRadius: 4, padding: '2px 6px', fontSize: 10,
          fontWeight: 600, color: '#1e3408', whiteSpace: 'nowrap',
          textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
        }}>
          {plant.commonName.split(' ').slice(0, 2).join(' ')}
        </div>
      )}
    </div>
  )
}
