import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SearchBar from '../components/SearchBar.jsx'
import HospitalCard from '../components/HospitalCard.jsx'
import Loading from '../components/Loading.jsx'
import { api } from '../api.js'

export default function Hospitals() {
  const [query, setQuery] = useState('')
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api.getHospitals()
      .then((data) => {
        if (active) setHospitals(data)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return hospitals
    return hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.specialities.some((s) => s.toLowerCase().includes(q)) ||
        h.address.toLowerCase().includes(q),
    )
  }, [query, hospitals])

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-extrabold text-ink mb-2">
          Hospitals near Pune
        </h1>
        <p className="text-muted mb-6">
          {hospitals.length} hospitals found. Search by name, speciality or area.
        </p>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={setQuery}
          placeholder="Search hospitals, e.g. Cardiology"
        />
      </motion.div>

      {loading ? (
        <Loading label="Fetching nearby hospitals..." />
      ) : error ? (
        <p className="text-center text-occupied-dark py-20">Unable to load hospitals: {error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted py-20">
          No hospitals match "{query}". Try a different search term.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((h) => (
            <HospitalCard key={h.id} hospital={h} />
          ))}
        </div>
      )}
    </div>
  )
}
