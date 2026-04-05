import { useState, useEffect, useRef } from 'react'
import { Stage, Layer, Image as KImage, Line, Circle, Group, Text } from 'react-konva'
import useImage from 'use-image'
import plantsData from './data/plants'
import PlantDetail from './PlantDetail'

const PHOTO_W = 952
const PHOTO_H = 1288

const BED_VIEWS = [
  {
    key: 'bedA',
    label: 'Bed A — Home Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedA.jpeg',
    cropTop: 0.30, cropBot: 0.52,
    bedWidthFt: 30,
    backRow:  ['cherry-bomb-ninebark','incrediball-hydrangea','karl-foerster-grass','little-lime-hydrangea','karl-foerster-grass'],
    frontRow: ['walker-low-catmint','rozanne-geranium','walker-low-catmint','black-eyed-susan','rozanne-geranium','walker-low-catmint','autumn-fire-sedum'],
  },
  {
    key: 'bedB',
    label: 'Bed B — Garage Front',
    url: 'https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedB.jpeg',
    cropTop: 0.35, cropBot: 0.60,
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

function evenSpread(n, lo, hi) {
  if (n <= 0) return []
  if (n === 1) return [(lo + hi) / 2]
  return Array.from({ length: n }, (_, i) => lo + (i / (n - 1)) * (hi - lo))
}

function polyBounds(pts) {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
}

function buildLayout(poly, viewDef) {
  if (!poly || poly.length < 3) return []
  const { minX, maxX, minY, maxY } = polyBounds(poly)
  const xPad = (maxX - minX) * 0.04
  const backY  = minY + (maxY - minY) * 0.28
  const frontY = minY + (maxY - minY) * 0.72
  const backXs  = evenSpread(viewDef.backRow.length,  minX + xPad, maxX - xPad)
  const frontXs = evenSpread(viewDef.frontRow.length, minX + xPad, maxX - xPad)
  let id = Date.now()
  return [
    ...viewDef.backRow.map((plantId, i)  => ({ id: id++, plantId, x: backXs[i],  y: backY,  size: plantsData.find(p => p.id === plantId)?.matureWidth ?? 3 })),
    ...viewDef.frontRow.map((plantId, i) => ({ id: id++, plantId, x: frontXs[i], y: frontY, size: plantsData.find(p => p.id === plantId)?.matureWidth ?? 3 })),
  ]
}

const STORAGE_KEY = 'gardenPolygons_v4'
function loadPolygons() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} } }
function savePolygons(p) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)) } catch {} }

// ─── BedCanvas ───────────────────────────────────────────────────────────────
function BedCanvas({ viewDef, poly, onPolyChange, placed, onPlacedChange, drawMode, selectedPlantId, showLabels, stageSize }) {
  const [img] = useImage(viewDef.url, 'anonymous')
  const stageRef = useRef(null)

  // Use Konva's crop to show exactly the cropTop..cropBot slice of the source photo,
  // stretched to fill the full stage. This is clean, correct, and uses Konva natively.
  const srcCropY = viewDef.cropTop * PHOTO_H
  const srcCropH = (viewDef.cropBot - viewDef.cropTop) * PHOTO_H
  const imgProps = {
    image: img,
    x: 0, y: 0,
    width: stageSize.w,
    height: stageSize.h,
    crop: { x: 0, y: srcCropY, width: PHOTO_W, height: srcCropH },
  }

  // Scale: the cropped photo region spans the full stage width = bedWidthFt feet
  const pxPerFoot = poly
    ? (polyBounds(poly).maxX - polyBounds(poly).minX) / viewDef.bedWidthFt
    : stageSize.w / viewDef.bedWidthFt

  const polyHeightPx = poly ? (polyBounds(poly).maxY - polyBounds(poly).minY) : 60
  const maxR = polyHeightPx * 0.44

  function getRadius(sizeFt) {
    return Math.min(maxR, Math.max(8, (sizeFt * pxPerFoot) / 2))
  }

  function handleClick(e) {
    const pos = stageRef.current.getPointerPosition()
    const targetName = e.target.name()

    // Only respond to clicks on the background image or stage itself
    if (targetName !== 'bg-image' && e.target !== e.target.getStage()) return

    if (drawMode) {
      // Close polygon if clicking near first point
      if (poly && poly.length >= 3) {
        const first = poly[0]
        if (Math.hypot(pos.x - first.x, pos.y - first.y) < 14) {
          onPolyChange(poly) // finalized — parent calls finishDraw
          return
        }
      }
      onPolyChange([...(poly || []), { x: pos.x, y: pos.y }])
      return
    }

    if (selectedPlantId) {
      const plant = plantsData.find(p => p.id === selectedPlantId)
      if (!plant) return
      onPlacedChange(prev => [...prev, { id: Date.now(), plantId: selectedPlantId, x: pos.x, y: pos.y, size: plant.matureWidth }])
    }
  }

  return (
    <Stage
      width={stageSize.w} height={stageSize.h}
      ref={stageRef}
      onClick={handleClick}
      style={{ cursor: drawMode || selectedPlantId ? 'crosshair' : 'default' }}
    >
      <Layer>
        {/* Photo — cropped to bed zone via Konva's native crop prop */}
        <KImage name="bg-image" {...imgProps} listening={true} />

        {/* Plants — hard-clipped inside the polygon via clipFunc */}
        {poly && poly.length >= 3 && (
          <Group
            clipFunc={ctx => {
              ctx.beginPath()
              ctx.moveTo(poly[0].x, poly[0].y)
              poly.slice(1).forEach(p => ctx.lineTo(p.x, p.y))
              ctx.closePath()
            }}
          >
            {placed.map(item => {
              const plant = plantsData.find(p => p.id === item.plantId)
              if (!plant) return null
              const r = getRadius(item.size)
              return (
                <Group key={item.id} x={item.x} y={item.y} draggable
                  onDragEnd={e => onPlacedChange(prev => prev.map(p =>
                    p.id === item.id ? { ...p, x: e.target.x(), y: e.target.y() } : p
                  ))}
                >
                  <Circle radius={r} fill={plant.color}
                    stroke="rgba(255,255,255,0.85)" strokeWidth={2}
                    shadowBlur={4} shadowOpacity={0.4} />
                  {showLabels && r >= 14 && (
                    <Text
                      text={plant.commonName.split(' ').slice(0, 2).join(' ')}
                      fontSize={Math.max(7, Math.min(11, r * 0.42))}
                      fill="white" fontStyle="bold" align="center"
                      width={r * 2} offsetX={r} offsetY={r * 0.22}
                    />
                  )}
                  <Circle x={r * 0.65} y={-r * 0.65} radius={7}
                    fill="rgba(0,0,0,0.7)"
                    onClick={e => { e.cancelBubble = true; onPlacedChange(prev => prev.filter(p => p.id !== item.id)) }}
                  />
                  <Text x={r * 0.65 - 3.5} y={-r * 0.65 - 4.5} text="✕"
                    fontSize={8} fill="white"
                    onClick={e => { e.cancelBubble = true; onPlacedChange(prev => prev.filter(p => p.id !== item.id)) }}
                  />
                </Group>
              )
            })}
          </Group>
        )}

        {/* Polygon outline */}
        {poly && poly.length >= 2 && (
          <Line points={poly.flatMap(p => [p.x, p.y])} closed={poly.length >= 3}
            fill="rgba(100,200,80,0.08)" stroke="rgba(50,170,30,0.9)"
            strokeWidth={2.5} dash={[8, 4]} listening={false} />
        )}

        {/* Draw-mode corner dots */}
        {drawMode && poly && poly.map((pt, i) => (
          <Circle key={i} x={pt.x} y={pt.y}
            radius={i === 0 ? 9 : 5}
            fill={i === 0 ? 'rgba(255,120,0,0.95)' : 'rgba(255,200,50,0.9)'}
            stroke="white" strokeWidth={2} listening={false} />
        ))}
      </Layer>
    </Stage>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeView, setActiveView]           = useState('bedA')
  const [polygons, setPolygons]               = useState(loadPolygons)
  const [drawMode, setDrawMode]               = useState(false)
  const [placed, setPlaced]                   = useState([])
  const [selectedPlantId, setSelectedPlantId] = useState(null)
  const [activeDetail, setActiveDetail]       = useState(null)
  const [showLabels, setShowLabels]           = useState(true)
  const [stageSize, setStageSize]             = useState({ w: 800, h: 500 })
  const containerRef = useRef(null)

  const viewDef     = BED_VIEWS.find(v => v.key === activeView) ?? BED_VIEWS[0]
  const currentPoly = polygons[activeView] ?? null

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(([e]) => setStageSize({ w: e.contentRect.width, h: e.contentRect.height }))
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (currentPoly && currentPoly.length >= 3 && stageSize.w > 0) {
      setPlaced(buildLayout(currentPoly, viewDef))
    } else if (!currentPoly) {
      setPlaced([])
    }
  }, [activeView, polygons, stageSize.w])

  function handlePolyChange(pts) {
    const updated = { ...polygons, [activeView]: pts }
    setPolygons(updated)
    savePolygons(updated)
  }

  function finishDraw() {
    setDrawMode(false)
    setSelectedPlantId(null)
    if (currentPoly && currentPoly.length >= 3) {
      setPlaced(buildLayout(currentPoly, viewDef))
    }
  }

  function startDraw() {
    const updated = { ...polygons }
    delete updated[activeView]
    setPolygons(updated)
    savePolygons(updated)
    setPlaced([])
    setDrawMode(true)
    setSelectedPlantId(null)
  }

  function switchView(key) {
    setActiveView(key)
    setDrawMode(false)
    setSelectedPlantId(null)
  }

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
          {plantsData.map(p => (
            <div key={p.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', background: selectedPlantId === p.id ? '#edf5e0' : 'transparent', borderLeft: `3px solid ${selectedPlantId === p.id ? '#6a9030' : 'transparent'}` }}
              onClick={() => { if (drawMode) return; setSelectedPlantId(prev => prev === p.id ? null : p.id); setActiveDetail(p) }}
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
          {!drawMode
            ? <button style={btn(false)} onClick={startDraw}>✏️ {currentPoly ? 'Redraw Bed' : 'Define Bed'}</button>
            : <button style={btn(true, true)} onClick={finishDraw}>✓ Done drawing</button>
          }
          {currentPoly && !drawMode && (
            <button style={btn(false)} onClick={() => {
              const u = { ...polygons }; delete u[activeView]; setPolygons(u); savePolygons(u); setPlaced([])
            }}>Clear bed</button>
          )}
          <div style={{ width: 1, height: 22, background: '#e0dbd0', margin: '0 2px' }} />
          <button style={btn(showLabels)} onClick={() => setShowLabels(v => !v)}>Labels {showLabels ? 'ON' : 'OFF'}</button>
          {selectedPlantId && !drawMode && <button style={btn(false)} onClick={() => setSelectedPlantId(null)}>✕ Cancel</button>}
          {currentPoly && !drawMode && (
            <button style={btn(false)} onClick={() => setPlaced(buildLayout(currentPoly, viewDef))}>Reset layout</button>
          )}
          <span style={{ fontSize: 11, color: drawMode ? '#c05010' : '#aab888', marginLeft: 'auto', fontWeight: drawMode ? 600 : 400 }}>
            {drawMode
              ? (currentPoly?.length ?? 0) === 0
                ? '🖊 Click each corner of the bed outline — click ✓ Done when finished'
                : `${currentPoly.length} corners placed — click ✓ Done drawing when finished`
              : selectedPlantId ? `Click photo to place ${plantsData.find(p => p.id === selectedPlantId)?.commonName}`
              : currentPoly ? 'Drag plants · ✕ to remove · select plant to add more'
              : '← Click Define Bed and trace the bed outline on the photo'}
          </span>
        </div>

        <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
          {stageSize.w > 0 && (
            <BedCanvas
              viewDef={viewDef} poly={currentPoly}
              onPolyChange={handlePolyChange}
              placed={placed} onPlacedChange={setPlaced}
              drawMode={drawMode} selectedPlantId={selectedPlantId}
              showLabels={showLabels} stageSize={stageSize}
            />
          )}
        </div>
      </div>
    </div>
  )
}
