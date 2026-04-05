import { useState, useRef, useEffect } from 'react'
import plants from './data/plants'
import PlantDetail from './PlantDetail'

// How many pixels wide = 1 foot, given the bed polygon width in px and known bed width in ft.
// Perspective scale: plants viewed from ~20ft away appear smaller than at-grade size.
const PERSPECTIVE = 0.4

const BED_VIEWS = [
  {
    key: 'bedA',
    label: 'Bed A — Home Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedA.jpeg',
    cropTop: 0.22, cropBot: 0.48,
    bedWidthFt: 30,
    // Finalized plant plan for this bed
    backRow:  ['cherry-bomb-ninebark','incrediball-hydrangea','karl-foerster-grass','little-lime-hydrangea','karl-foerster-grass'],
    frontRow: ['walker-low-catmint','rozanne-geranium','walker-low-catmint','black-eyed-susan','rozanne-geranium','walker-low-catmint','autumn-fire-sedum'],
  },
  {
    key: 'bedB',
    label: 'Bed B — Garage Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedB.jpeg',
    cropTop: 0.30, cropBot: 0.65,
    bedWidthFt: 30,
    backRow:  ['karl-foerster-grass','black-eyed-susan','black-eyed-susan','black-eyed-susan','karl-foerster-grass'],
    frontRow: ['walker-low-catmint','prairie-dropseed','rozanne-geranium','autumn-fire-sedum'],
  },
  {
    key: 'whole',
    label: 'Whole Home',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/whole-home.jpeg',
    cropTop: 0.0, cropBot: 1.0,
    bedWidthFt: 60,
    backRow: [], frontRow: [],
  },
]

// Given a polygon (array of {x,y} fractions), compute bounding box
function polyBounds(poly) {
  const xs = poly.map(p => p.x), ys = poly.map(p => p.y)
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
}

// Distribute n items evenly between lo and hi
function evenSpread(n, lo, hi) {
  if (n <= 0) return []
  if (n === 1) return [(lo + hi) / 2]
  return Array.from({ length: n }, (_, i) => lo + (i / (n - 1)) * (hi - lo))
}

// Build placed items from a polygon + view definition
let _id = 1
function buildLayout(poly, viewDef) {
  if (!poly || poly.length < 3) return []
  const { minX, maxX, minY, maxY } = polyBounds(poly)
  const pad = 0.01
  const backXs  = evenSpread(viewDef.backRow.length,  minX + pad, maxX - pad)
  const frontXs = evenSpread(viewDef.frontRow.length, minX + pad, maxX - pad)
  const backY  = minY + (maxY - minY) * 0.25   // 25% from top edge
  const frontY = minY + (maxY - minY) * 0.75   // 75% from top edge (near bed front)
  return [
    ...viewDef.backRow.map((plantId, i) => ({
      id: _id++, plantId, x: backXs[i], y: backY,
      size: plants.find(p => p.id === plantId)?.matureWidth ?? 3,
    })),
    ...viewDef.frontRow.map((plantId, i) => ({
      id: _id++, plantId, x: frontXs[i], y: frontY,
      size: plants.find(p => p.id === plantId)?.matureWidth ?? 3,
    })),
  ]
}

const STORAGE_KEY = 'gardenBedPolygons'
function loadPolygons() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
function savePolygons(polys) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(polys)) } catch {}
}

export default function App() {
  const [activeView, setActiveView]   = useState('bedA')
  const [polygons, setPolygons]       = useState(loadPolygons)
  const [drawMode, setDrawMode]       = useState(false)
  const [drawPoints, setDrawPoints]   = useState([])
  const [mousePos, setMousePos]       = useState(null)
  const [placed, setPlaced]           = useState([])
  const [selected, setSelected]       = useState(null)
  const [activeDetail, setActiveDetail] = useState(null)
  const [showLabels, setShowLabels]   = useState(true)
  const [overlaySize, setOverlaySize] = useState({ w: 0, h: 0 })
  const overlayRef = useRef(null)
  const dragRef    = useRef(null)

  const viewDef = BED_VIEWS.find(v => v.key === activeView) ?? BED_VIEWS[0]
  const currentPoly = polygons[activeView] ?? null

  // Rebuild layout whenever polygon changes for this view
  useEffect(() => {
    if (currentPoly) setPlaced(buildLayout(currentPoly, viewDef))
  }, [activeView, polygons])

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
    setSelected(null)
    setDrawMode(false)
    setDrawPoints([])
  }

  // Derive pxPerFoot from the drawn polygon width
  const pxPerFoot = currentPoly
    ? (polyBounds(currentPoly).maxX - polyBounds(currentPoly).minX) * overlaySize.w / viewDef.bedWidthFt * PERSPECTIVE
    : overlaySize.w / viewDef.bedWidthFt * PERSPECTIVE * 0.6

  function getOverlayFraction(e) {
    const rect = overlayRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top)  / rect.height,
    }
  }

  function handleOverlayClick(e) {
    if (!overlayRef.current) return

    if (drawMode) {
      const pt = getOverlayFraction(e)
      // Close polygon if clicking near first point or have 4+ points and double-clicked
      if (drawPoints.length >= 3) {
        const first = drawPoints[0]
        const dist = Math.hypot(pt.x - first.x, pt.y - first.y)
        if (dist < 0.03) {
          // Close the polygon
          finishPolygon(drawPoints)
          return
        }
      }
      setDrawPoints(prev => [...prev, pt])
      return
    }

    if (!selected) return
    if (dragRef.current?.didDrag) { dragRef.current.didDrag = false; return }
    const { x, y } = getOverlayFraction(e)
    const plant = plants.find(p => p.id === selected)
    if (!plant) return
    setPlaced(prev => [...prev, { id: _id++, plantId: selected, x, y, size: plant.matureWidth }])
  }

  function handleDoubleClick(e) {
    if (drawMode && drawPoints.length >= 3) {
      e.preventDefault()
      finishPolygon(drawPoints)
    }
  }

  function finishPolygon(pts) {
    const updated = { ...polygons, [activeView]: pts }
    setPolygons(updated)
    savePolygons(updated)
    setDrawMode(false)
    setDrawPoints([])
  }

  function startDraw() {
    setDrawMode(true)
    setDrawPoints([])
    setSelected(null)
  }

  function clearPolygon() {
    const updated = { ...polygons }
    delete updated[activeView]
    setPolygons(updated)
    savePolygons(updated)
    setPlaced([])
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

  const cropCenterPct = ((viewDef.cropTop + viewDef.cropBot) / 2 * 100).toFixed(1)
  const imgStyle = {
    width: '100%', height: '100%',
    objectFit: 'cover',
    objectPosition: `center ${cropCenterPct}%`,
    display: 'block', userSelect: 'none',
  }

  // Build SVG polygon points string from fraction coords
  const toSVGPts = (pts) => pts.map(p => `${p.x * overlaySize.w},${p.y * overlaySize.h}`).join(' ')

  const cursor = drawMode ? 'crosshair' : selected ? 'crosshair' : 'default'

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
    btn:       (on, color) => ({
      padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
      border: `1px solid ${on ? (color||'#88b040') : '#c8c0a8'}`,
      background: on ? (color==='#e06030' ? '#ffe0d0' : '#d8eeb8') : '#fff',
      color: on ? (color==='#e06030' ? '#7a2010' : '#2a4010') : '#3a4a28',
    }),
    viewBtn:   (on) => ({ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: `1px solid ${on ? '#5577cc' : '#c8c0a8'}`, background: on ? '#dde8ff' : '#fff', color: on ? '#1a2a6a' : '#3a4a28', cursor: 'pointer' }),
    divider:   { width: 1, height: 22, background: '#e0dbd0', margin: '0 2px' },
    hint:      { fontSize: 11, color: drawMode ? '#c05010' : '#aab888', marginLeft: 'auto', fontWeight: drawMode ? 600 : 400 },
    canvasArea:{ flex: 1, overflow: 'hidden', position: 'relative' },
    overlay:   { position: 'relative', width: '100%', height: '100%', cursor, overflow: 'hidden' },
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
            <div key={p.id} style={s.plantItem(!drawMode && selected === p.id)}
              onClick={() => { if (drawMode) return; setSelected(prev => prev === p.id ? null : p.id); setActiveDetail(p) }}>
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
          {!drawMode ? (
            <button style={s.btn(false)} onClick={startDraw}>
              ✏️ {currentPoly ? 'Redraw Bed' : 'Define Bed'}
            </button>
          ) : (
            <button style={s.btn(true, '#e06030')} onClick={() => { setDrawMode(false); setDrawPoints([]) }}>
              ✕ Cancel draw
            </button>
          )}
          {currentPoly && !drawMode && (
            <button style={s.btn(false)} onClick={clearPolygon}>Clear bed</button>
          )}
          <div style={s.divider} />
          <button style={s.btn(showLabels)} onClick={() => setShowLabels(v => !v)}>
            Labels {showLabels ? 'ON' : 'OFF'}
          </button>
          {selected && !drawMode && (
            <button style={s.btn(false)} onClick={() => setSelected(null)}>✕ Cancel</button>
          )}
          {currentPoly && !drawMode && (
            <button style={s.btn(false)} onClick={() => setPlaced(buildLayout(currentPoly, viewDef))}>
              Reset layout
            </button>
          )}
          <span style={s.hint}>
            {drawMode
              ? drawPoints.length === 0
                ? 'Click to place corners of the bed outline. Double-click or click near start to finish.'
                : `${drawPoints.length} points — keep clicking corners, double-click or click near ● to close`
              : selected
              ? `Click photo to place ${plants.find(p => p.id === selected)?.commonName}`
              : currentPoly
              ? 'Drag to reposition · ✕ to remove · select a plant to add more'
              : '← Define the bed outline first'}
          </span>
        </div>

        <div style={s.canvasArea}>
          <div style={s.overlay} ref={overlayRef}
            onClick={handleOverlayClick}
            onDoubleClick={handleDoubleClick}
            onMouseMove={drawMode ? (e) => setMousePos(getOverlayFraction(e)) : undefined}
          >
            <img src={viewDef.url} alt="Bed reference" style={imgStyle} draggable={false} />

            {/* SVG layer for bed polygon drawing */}
            {(currentPoly || drawPoints.length > 0) && overlaySize.w > 0 && (
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                viewBox={`0 0 ${overlaySize.w} ${overlaySize.h}`}
              >
                {/* Finished polygon */}
                {currentPoly && (
                  <polygon
                    points={toSVGPts(currentPoly)}
                    fill="rgba(100,180,80,0.15)"
                    stroke="rgba(80,160,60,0.8)"
                    strokeWidth="2"
                    strokeDasharray="6,3"
                  />
                )}
                {/* In-progress polygon */}
                {drawPoints.length > 0 && (
                  <>
                    <polyline
                      points={[...drawPoints, mousePos].filter(Boolean).map(p => `${p.x * overlaySize.w},${p.y * overlaySize.h}`).join(' ')}
                      fill="none"
                      stroke="rgba(255,140,0,0.9)"
                      strokeWidth="2"
                      strokeDasharray="5,3"
                    />
                    {drawPoints.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x * overlaySize.w}
                        cy={pt.y * overlaySize.h}
                        r={i === 0 ? 7 : 4}
                        fill={i === 0 ? 'rgba(255,140,0,0.9)' : 'rgba(255,200,50,0.9)'}
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    ))}
                  </>
                )}
              </svg>
            )}

            {/* Plant circles */}
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
    <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(0,0,0,0.08)', background: plant.color }}
      dangerouslySetInnerHTML={{ __html: plant.svgIcon }} />
  )
}

function PlacedPlant({ item, plant, showLabel, pxPerFoot, onDragStart, onRemove }) {
  const sizePx = Math.max(14, Math.round(item.size * pxPerFoot))
  return (
    <div style={{ position: 'absolute', left: `${item.x * 100}%`, top: `${item.y * 100}%`, width: sizePx, height: sizePx, transform: 'translate(-50%, -50%)', pointerEvents: 'auto', cursor: 'grab', userSelect: 'none' }}
      onMouseDown={onDragStart}>
      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 6px rgba(0,0,0,0.5)', background: plant.color }}
        dangerouslySetInnerHTML={{ __html: plant.svgIcon }} />
      <button onMouseDown={e => e.stopPropagation()} onClick={onRemove}
        style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', fontSize: 8, lineHeight: '14px', textAlign: 'center', cursor: 'pointer', padding: 0 }}>✕</button>
      {showLabel && (
        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 2, background: 'rgba(255,255,255,0.92)', borderRadius: 3, padding: '1px 4px', fontSize: 8, fontWeight: 600, color: '#1e3408', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
          {plant.commonName.split(' ').slice(0, 2).join(' ')}
        </div>
      )}
    </div>
  )
}
