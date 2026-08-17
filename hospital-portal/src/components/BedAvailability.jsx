import { motion } from 'framer-motion'
import { FaBed } from 'react-icons/fa'

// One row: bed type, "x of y available", green/red progress bar.
function BedRow({ label, total, occupied }) {
  const safeTotal = Number(total) || 0
  const safeOccupied = Math.min(Math.max(Number(occupied) || 0, 0), safeTotal)
  const available = Math.max(safeTotal - safeOccupied, 0)
  const occupiedPct = safeTotal > 0 ? Math.round((safeOccupied / safeTotal) * 100) : 0
  const isCritical = available <= Math.round(safeTotal * 0.15)

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="font-semibold text-ink flex items-center gap-2">
          <FaBed className="text-primary-600" /> {label}
        </span>
        <span className={`font-semibold ${isCritical ? 'text-occupied-dark' : 'text-available-dark'}`}>
          {available} available / {safeTotal}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${100 - occupiedPct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${isCritical ? 'bg-occupied' : 'bg-available'}`}
        />
      </div>
    </div>
  )
}

// Accepts a `beds` object: { general: {total, occupied}, icu: {...}, ventilator: {...} }
export default function BedAvailability({ beds }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <BedRow label="General Beds" total={beds.general.total} occupied={beds.general.occupied} />
      <BedRow label="ICU Beds" total={beds.icu.total} occupied={beds.icu.occupied} />
      <BedRow label="Ventilator Beds" total={beds.ventilator.total} occupied={beds.ventilator.occupied} />
    </div>
  )
}
