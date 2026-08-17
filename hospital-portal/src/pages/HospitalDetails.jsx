import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaStar, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaCalendarCheck } from 'react-icons/fa'
import BedAvailability from '../components/BedAvailability.jsx'
import DoctorCard from '../components/DoctorCard.jsx'
import Loading from '../components/Loading.jsx'
import { api } from '../api.js'

export default function HospitalDetails() {
  const { id } = useParams()
  const [hospital, setHospital] = useState(null)
  const [hospitalDoctors, setHospitalDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([api.getHospital(id), api.getDoctors(id)])
      .then(([hospitalData, doctorData]) => {
        if (!active) return
        setHospital(hospitalData)
        setHospitalDoctors(doctorData)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20">
        <Loading label="Loading hospital details..." />
      </div>
    )
  }

  if (error || !hospital) return <Navigate to="/hospitals" replace />

  return (
    <div>
      <section className="relative h-64 sm:h-80">
        <img
          src={hospital.image}
          alt={hospital.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 h-full flex flex-col justify-end pb-8">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl sm:text-4xl font-display font-extrabold text-white"
          >
            {hospital.name}
          </motion.h1>
          <p className="text-white/90 flex items-center gap-2 mt-2 text-sm">
            <FaStar className="text-amber-400" /> {hospital.rating} rating ·
            <FaMapMarkerAlt /> {hospital.address}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h2 className="text-xl font-display font-bold text-ink mb-3">About the Hospital</h2>
            <p className="text-muted leading-relaxed">{hospital.about}</p>
          </div>

          <div>
            <h2 className="text-xl font-display font-bold text-ink mb-3">Available Departments</h2>
            <div className="flex flex-wrap gap-2">
              {hospital.departments.map((d) => (
                <span key={d} className="text-sm font-medium bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-display font-bold text-ink mb-4">Doctors at this Hospital</h2>
            {hospitalDoctors.length === 0 ? (
              <p className="text-muted text-sm">Doctor list coming soon.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {hospitalDoctors.map((d) => (
                  <DoctorCard key={d.id} doctor={d} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-display font-bold text-ink mb-3">Today's Available Beds</h2>
            <BedAvailability beds={hospital.beds} />
          </div>

          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-display font-bold text-ink mb-3">Emergency Contact</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <FaPhoneAlt className="text-primary-600" /> {hospital.phone}
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-primary-600" /> {hospital.email}
              </li>
            </ul>
          </div>

          <Link
            to="/book-appointment"
            state={{ hospitalId: hospital.id }}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
          >
            <FaCalendarCheck /> Book Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}
