import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import DoctorCard from '../components/DoctorCard.jsx'
import Loading from '../components/Loading.jsx'
import { api } from '../api.js'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [selectedHospital, setSelectedHospital] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [minFee, setMinFee] = useState('')
  const [maxFee, setMaxFee] = useState('')
  const [minExperience, setMinExperience] = useState('')
  const [availability, setAvailability] = useState('')
  const [sortBy, setSortBy] = useState('recommended')

  useEffect(() => {
    let active = true

    Promise.all([api.getDoctors(), api.getHospitals()])
      .then(([doctorData, hospitalData]) => {
        if (!active) return
        setDoctors(Array.isArray(doctorData) ? doctorData : doctorData?.doctors || [])
        setHospitals(Array.isArray(hospitalData) ? hospitalData : hospitalData?.hospitals || [])
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load doctors.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const specializations = useMemo(() => {
    const specs = doctors.map((d) => d.specialization).filter(Boolean).map((s) => s.trim())
    return [...new Set(specs)].sort((a, b) => a.localeCompare(b))
  }, [doctors])

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase()
    const min = minFee === '' ? null : Number(minFee)
    const max = maxFee === '' ? null : Number(maxFee)
    const experienceLimit = minExperience === '' ? null : Number(minExperience)

    const results = doctors.filter((doc) => {
      const name = doc.name || doc.full_name || ''
      const spec = doc.specialization || ''
      const hospitalName = doc.hospitalName || doc.hospital_name || ''
      const docHospitalId = doc.hospitalId ?? doc.hospital_id
      const fee = Number(doc.fee)
      const experience = Number.parseFloat(String(doc.experience || '').replace(/[^0-9.]/g, '')) || 0
      const availabilityText = String(doc.availability || '').toLowerCase()

      const matchesSearch = !query ||
        name.toLowerCase().includes(query) ||
        spec.toLowerCase().includes(query) ||
        hospitalName.toLowerCase().includes(query)

      const matchesHospital =
        !selectedHospital || String(docHospitalId) === String(selectedHospital)

      const matchesSpec =
        !selectedSpecialization || spec.toLowerCase() === selectedSpecialization.toLowerCase()

      const matchesMinFee = min === null || (Number.isFinite(fee) && fee >= min)
      const matchesMaxFee = max === null || (Number.isFinite(fee) && fee <= max)
      const matchesExperience = experienceLimit === null || experience >= experienceLimit

      const matchesAvailability = !availability ||
        (availability === 'today'
          ? availabilityText.includes('today') || availabilityText.includes('available')
          : availabilityText.includes(availability.toLowerCase()))

      return (
        matchesSearch &&
        matchesHospital &&
        matchesSpec &&
        matchesMinFee &&
        matchesMaxFee &&
        matchesExperience &&
        matchesAvailability
      )
    })

    return results.sort((a, b) => {
      const feeA = Number(a.fee) || 0
      const feeB = Number(b.fee) || 0
      const expA = Number.parseFloat(String(a.experience || '').replace(/[^0-9.]/g, '')) || 0
      const expB = Number.parseFloat(String(b.experience || '').replace(/[^0-9.]/g, '')) || 0

      if (sortBy === 'feeLow') return feeA - feeB
      if (sortBy === 'feeHigh') return feeB - feeA
      if (sortBy === 'experience') return expB - expA
      if (sortBy === 'name') return String(a.name || '').localeCompare(String(b.name || ''))

      // Recommended: experience first, then lower fee.
      return (expB - expA) || (feeA - feeB)
    })
  }, [
    doctors,
    search,
    selectedHospital,
    selectedSpecialization,
    minFee,
    maxFee,
    minExperience,
    availability,
    sortBy,
  ])

  const clearFilters = () => {
    setSearch('')
    setSelectedHospital('')
    setSelectedSpecialization('')
    setMinFee('')
    setMaxFee('')
    setMinExperience('')
    setAvailability('')
    setSortBy('recommended')
  }

  const hasFilters = Boolean(
    search || selectedHospital || selectedSpecialization || minFee || maxFee || minExperience || availability
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20">
        <Loading label="Loading doctors..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-ink">
              Find a Doctor
            </h1>
            <p className="text-muted mt-1">
              Search, filter and compare doctors by hospital, specialization, fee and experience.
            </p>
          </div>
          <div className="text-sm font-semibold text-primary-600 bg-primary-50 px-4 py-2 rounded-xl w-fit">
            {filteredDoctors.length} doctor{filteredDoctors.length === 1 ? '' : 's'} found
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search doctor, specialization or hospital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input lg:col-span-2"
          />

          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="input"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>

          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="input"
          >
            <option value="">All Hospitals</option>
            {hospitals.map((h, idx) => (
              <option key={h.id ?? h.hospital_id ?? idx} value={h.id ?? h.hospital_id}>
                {h.name ?? h.hospital_name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            placeholder="Minimum fee ₹"
            value={minFee}
            onChange={(e) => setMinFee(e.target.value)}
            className="input"
          />

          <input
            type="number"
            min="0"
            placeholder="Maximum fee ₹"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            className="input"
          />

          <select
            value={minExperience}
            onChange={(e) => setMinExperience(e.target.value)}
            className="input"
          >
            <option value="">Any Experience</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
            <option value="10">10+ years</option>
            <option value="15">15+ years</option>
          </select>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="input"
          >
            <option value="">Any Availability</option>
            <option value="today">Available Today</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-slate-100">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input sm:w-64"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="experience">Most Experienced</option>
            <option value="feeLow">Lowest Fee</option>
            <option value="feeHigh">Highest Fee</option>
            <option value="name">Doctor Name</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map((doc, idx) => (
            <DoctorCard key={doc.id ?? doc.doctor_id ?? idx} doctor={doc} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="text-4xl mb-3">🔎</div>
          <p className="text-ink font-bold mb-1">No doctors found</p>
          <p className="text-muted text-sm mb-5">
            Try widening your budget, choosing another hospital, or reducing the experience requirement.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
