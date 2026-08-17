import { motion } from 'framer-motion'

// A small "pulse line" loader shaped like a heartbeat trace.
// Used while pages simulate fetching data.
export default function Loading({ label = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
        <motion.path
          d="M0 20 H30 L38 5 L48 35 L56 20 H120"
          stroke="#2563EB"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
      <p className="text-muted text-sm">{label}</p>
    </div>
  )
}
