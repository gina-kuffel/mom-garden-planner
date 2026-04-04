const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_MAP = {January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11}
const DEER = {
  high: { label: '🦌 Resistant', color: '#4a9030' },
  moderate: { label: '🦌 Moderate', color: '#a07820' },
  low: { label: '🦌 Susceptible', color: '#a84020' },
}

import { useState } from 'react'

export default function PlantDetail({ plant, onClose }) {
  const [imgFailed, setImgFailed] = useState(false)
  const deer = DEER[plant.deerResistance] || DEER.moderate

  return (
    <div style={{ borderTop: '1px solid #ece8e0', background: '#fafaf6', padding: 14, maxHeight: 380, overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#2a3818' }}>{plant.commonName}</div>
          <div style={{ fontSize: 11, color: '#8a9a68', fontStyle: 'italic' }}>{plant.botanicalName}</div>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 16, color: '#aaa', cursor: 'pointer', padding: '0 0 0 8px' }}>✕</button>
      </div>

      {plant.photoUrl && !imgFailed && (
        <img
          src={plant.photoUrl}
          alt={plant.commonName}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, marginBottom: 10, border: '1px solid #e0d8c8' }}
        />
      )}

      <div style={{ fontSize: 12, color: '#4a5838', lineHeight: 1.75 }}>
        <Row label="Size" value={`${plant.matureWidth}′ wide × ${plant.matureHeight}′ tall`} />
        <Row label="Sun" value={plant.sunRequirement} />
        <Row label="Water" value={plant.waterNeeds} />
        <Row label="Zone" value={plant.zone} />
        <Row label="Clay" value={plant.clayTolerant ? '✓ Tolerant' : '⚠️ Amend needed'} color={plant.clayTolerant ? '#4a9030' : '#a07820'} />
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontWeight: 600 }}>Deer: </span>
          <span style={{ color: deer.color }}>{deer.label}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: '#8aaa60', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Bloom window</div>
          <div style={{ display: 'flex', gap: 2 }}>
            {MONTHS.map((m, i) => {
              const active = plant.bloomTime?.some(bt => MONTH_MAP[bt] === i)
              return <div key={m} style={{ flex: 1, height: 5, borderRadius: 2, background: active ? '#78b030' : '#e8e8d8' }} />
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#aab888', marginTop: 2 }}>
            <span>Jan</span><span>Jun</span><span>Dec</span>
          </div>
        </div>
        {plant.notes && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#5a7040', lineHeight: 1.65, paddingTop: 8, borderTop: '1px solid #ece8e0' }}>
            {plant.notes}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, color }) {
  return (
    <div style={{ marginBottom: 3 }}>
      <span style={{ fontWeight: 600 }}>{label}: </span>
      <span style={color ? { color } : {}}>{value}</span>
    </div>
  )
}
