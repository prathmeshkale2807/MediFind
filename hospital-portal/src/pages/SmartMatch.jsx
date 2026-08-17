import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaBrain,
  FaChevronDown,
  FaCheck,
  FaCalendarCheck,
  FaHospital,
  FaRupeeSign,
  FaUserMd,
  FaClock,
  FaArrowRight,
} from 'react-icons/fa'

import { api } from '../api.js'
import Loading from '../components/Loading.jsx'

const budgetOptions = [
  { label: '₹300–₹500', min: 300, max: 500 },
  { label: '₹500–₹800', min: 500, max: 800 },
  { label: '₹800–₹1200', min: 800, max: 1200 },
  { label: '₹1200+', min: 1200, max: '' },
  { label: 'Any budget', min: '', max: '' },
]

const availabilityOptions = [
  { value: 'today', label: 'Today' },
  { value: 'any', label: 'Any day' },
]

export default function SmartMatch() {
  const navigate = useNavigate()

  const [doctors, setDoctors] = useState([])
  const [alternativeDoctors, setAlternativeDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const [specialization, setSpecialization] = useState('')
  const [budget, setBudget] = useState(budgetOptions[0])
  const [hospitalId, setHospitalId] = useState('')
  const [availability, setAvailability] = useState('today')

  useEffect(() => {
    let active = true

    Promise.all([
      api.getDoctors(),
      api.getHospitals(),
    ])
      .then(([doctorData, hospitalData]) => {
        if (!active) return

        const doctorList = Array.isArray(doctorData)
          ? doctorData
          : doctorData.doctors || []

        const hospitalList = Array.isArray(hospitalData)
          ? hospitalData
          : hospitalData.hospitals || []

        setDoctors(doctorList)
        setHospitals(hospitalList)
      })
      .catch((err) => {
        if (active) {
          setError(
            err.message ||
            'Unable to load SmartMatch data.'
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const specializations = useMemo(() => {
    return [
      ...new Set(
        doctors
          .map((doctor) =>
            doctor.specialization ??
            doctor.specialization_name ??
            ''
          )
          .map((value) => String(value).trim())
          .filter(Boolean)
      ),
    ].sort()
  }, [doctors])

  async function findMyDoctor(e) {
    e.preventDefault()

    setError('')
    setSearching(true)
    setSearched(true)

    try {
      const data = await api.smartMatchDoctors({
        specialization,
        budgetMin: budget.min,
        budgetMax: budget.max,
        hospitalId,
        availability,
      })

      setDoctors(
        Array.isArray(data.doctors)
          ? data.doctors
          : []
      )

      setAlternativeDoctors(
        Array.isArray(data.alternatives)
          ? data.alternatives
          : []
      )
    } catch (err) {
      setError(
        err.message ||
        'Unable to find matching doctors.'
      )
    } finally {
      setSearching(false)
    }
  }

  function bookDoctor(doctor) {
    navigate('/book-appointment', {
      state: {
        doctorId:
          doctor.doctor_id ??
          doctor.id,
        hospitalId:
          doctor.hospital_id ??
          doctor.hospitalId,
      },
    })
  }

  function resetMatch() {
    setSpecialization('')
    setBudget(budgetOptions[0])
    setHospitalId('')
    setAvailability('today')
    setSearched(false)
    setAlternativeDoctors([])
    setError('')
    setLoading(true)

    Promise.all([
      api.getDoctors(),
      api.getHospitals(),
    ])
      .then(([doctorData, hospitalData]) => {
        setDoctors(
          Array.isArray(doctorData)
            ? doctorData
            : doctorData.doctors || []
        )
        setHospitals(
          Array.isArray(hospitalData)
            ? hospitalData
            : hospitalData.hospitals || []
        )
      })
      .catch((err) => {
        setError(err.message || 'Unable to reload doctors.')
      })
      .finally(() => setLoading(false))
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-20">
        <Loading label="Preparing SmartMatch..." />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 text-primary-700 px-4 py-2 text-sm font-bold mb-4">
          <FaBrain />
          AI-inspired doctor matching
        </div>

        <h1 className="text-4xl font-display font-extrabold text-ink">
          MediFind SmartMatch
        </h1>

        <p className="text-muted mt-3">
          Tell us what you need and we'll rank the doctors
          that best fit your preferences.
        </p>
      </motion.div>

      <form
        onSubmit={findMyDoctor}
        className="bg-white rounded-3xl shadow-card border border-slate-100 p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            icon={<FaUserMd />}
            label="What do you need help with?"
            value={specialization}
            onChange={setSpecialization}
          >
            <option value="">Select specialization</option>
            {specializations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>

          <SelectField
            icon={<FaRupeeSign />}
            label="Your budget"
            value={budget.label}
            onChange={(value) => {
              const selected =
                budgetOptions.find(
                  (item) => item.label === value
                )
              setBudget(selected || budgetOptions[0])
            }}
          >
            {budgetOptions.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            icon={<FaHospital />}
            label="Preferred hospital"
            value={hospitalId}
            onChange={setHospitalId}
          >
            <option value="">Any hospital</option>
            {hospitals.map((hospital) => {
              const id =
                hospital.hospital_id ??
                hospital.id

              return (
                <option key={id} value={id}>
                  {hospital.hospital_name ??
                    hospital.name}
                </option>
              )
            })}
          </SelectField>

          <SelectField
            icon={<FaClock />}
            label="Availability"
            value={availability}
            onChange={setAvailability}
          >
            {availabilityOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </SelectField>
        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={searching}
          className="mt-7 w-full sm:w-auto sm:min-w-56 mx-auto flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold px-7 py-3.5 transition"
        >
          {searching ? (
            'Finding doctors...'
          ) : (
            <>
              Find My Doctor
              <FaArrowRight />
            </>
          )}
        </button>
      </form>

      {searched && !searching && (
        <div className="mt-10">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-sm font-semibold text-primary-600">
                SmartMatch Results
              </p>
              <h2 className="text-2xl font-display font-extrabold text-ink">
                {doctors.length
                  ? 'Best doctors for you'
                  : 'No matching doctors found'}
              </h2>
            </div>

            <button
              type="button"
              onClick={resetMatch}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Reset
            </button>
          </div>

          {doctors.length > 0 && (
            <div className="space-y-4">
              {doctors.map((doctor, index) => (
                <DoctorMatchCard
                  key={
                    doctor.doctor_id ??
                    doctor.id ??
                    `${doctor.full_name}-${index}`
                  }
                  doctor={doctor}
                  rank={index + 1}
                  onBook={() => bookDoctor(doctor)}
                />
              ))}
            </div>
          )}

          {doctors.length === 0 && alternativeDoctors.length > 0 && (
            <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4">
              <p className="font-bold text-ink">
                🔎 No exact match found
              </p>
              <p className="text-sm text-muted mt-1">
                We couldn't find a doctor who matches all your requirements.
                Here are the best ranked alternatives.
              </p>
            </div>
          )}

          {alternativeDoctors.length > 0 && doctors.length === 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-display font-extrabold text-ink">
                Best alternative doctors
              </h3>

              {alternativeDoctors.map((doctor, index) => (
                <DoctorMatchCard
                  key={
                    doctor.doctor_id ??
                    doctor.id ??
                    `${doctor.full_name}-alternative-${index}`
                  }
                  doctor={doctor}
                  rank={index + 1}
                  onBook={() => bookDoctor(doctor)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SelectField({
  icon,
  label,
  value,
  onChange,
  children,
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-bold text-ink mb-2">
        <span className="text-primary-600">{icon}</span>
        {label}
      </span>

      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input appearance-none pr-10"
        >
          {children}
        </select>

        <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs" />
      </span>
    </label>
  )
}

function DoctorMatchCard({
  doctor,
  rank,
  onBook,
}) {
  const percentage = Math.max(
    0,
    Math.min(
      100,
      Number(
        doctor.match_percentage ??
        doctor.match_score ??
        0
      )
    )
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(rank * 0.05, 0.2) }}
      className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 sm:p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 grid place-items-center font-extrabold">
              {rank === 1 ? '🥇' : `#${rank}`}
            </div>

            <div>
              <h3 className="text-xl font-display font-extrabold text-ink">
                {doctor.full_name ??
                  doctor.name ??
                  'Doctor'}
              </h3>

              <p className="text-primary-600 font-semibold capitalize">
                {doctor.specialization ||
                  'Specialist'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {(doctor.reasons || []).map(
              (reason) => (
                <span
                  key={reason}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1.5 text-xs font-semibold"
                >
                  <FaCheck />
                  {reason}
                </span>
              )
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-sm">
            <Info
              icon={<FaHospital />}
              label="Hospital"
              value={
                doctor.hospital_name ??
                doctor.hospitalName ??
                'Not assigned'
              }
            />

            <Info
              icon={<FaUserMd />}
              label="Experience"
              value={`${doctor.experience ?? 0} years`}
            />

            <Info
              icon={<FaRupeeSign />}
              label="Consultation"
              value={`₹${Number(doctor.fee ?? 0).toFixed(0)}`}
            />

            {doctor.distance_km != null && doctor.is_alternative && (
              <Info
                icon={<FaHospital />}
                label="Distance"
                value={`${Number(doctor.distance_km).toFixed(1)} km`}
              />
            )}
          </div>

          {doctor.available_times?.length > 0 && (
            <div className="mt-4 text-sm">
              <p className="font-bold text-ink mb-2">
                Available today
              </p>
              <div className="flex flex-wrap gap-2">
                {doctor.available_times.slice(0, 6).map((time) => (
                  <span
                    key={time}
                    className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-xs font-semibold text-ink/70"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-44 lg:border-l lg:border-slate-100 lg:pl-5">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-muted font-bold">
              Match
            </p>
            <p className="text-4xl font-display font-extrabold text-primary-600">
              {percentage}%
            </p>
          </div>

          <button
            type="button"
            onClick={onBook}
            className="mt-4 w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-3 transition inline-flex items-center justify-center gap-2"
          >
            <FaCalendarCheck />
            Book Appointment
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function Info({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-muted flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="font-semibold text-ink mt-1">
        {value}
      </p>
    </div>
  )
}
