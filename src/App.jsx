import { useState } from 'react'
import PropertySetup from './PropertySetup'
import Planner from './Planner'

const STORAGE_KEY = 'propertyZones_v3'
function hasZones() {
  try {
    const z = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return z.bedA && z.bedB
  } catch { return false }
}

export default function App() {
  const [setupDone, setSetupDone] = useState(hasZones)
  if (!setupDone) return <PropertySetup onDone={() => setSetupDone(true)} />
  return <Planner onRetrace={() => setSetupDone(false)} />
}
