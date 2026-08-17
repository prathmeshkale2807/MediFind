import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaStar, FaMapMarkerAlt, FaBed, FaAmbulance } from 'react-icons/fa'

export default function HospitalCard({ hospital }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover overflow-hidden flex flex-col"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={hospital.image}
          alt={hospital.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <span className="absolute top-3 left-3 bg-white/95 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 text-ink">
          <FaStar className="text-amber-400" /> {hospital.rating}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-lg text-ink mb-1">{hospital.name}</h3>
        <p className="text-muted text-sm flex items-center gap-1.5 mb-3">
          <FaMapMarkerAlt className="text-primary-600 shrink-0" />
          {hospital.address} · {hospital.distance}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {hospital.specialities.map((s) => (
            <span key={s} className="text-xs font-medium bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm mb-5">
          <span className="flex items-center gap-1.5 text-available-dark font-semibold">
            <FaBed /> {hospital.availableBeds} beds free
          </span>
          <span className="flex items-center gap-1.5 text-occupied-dark font-semibold">
            <FaAmbulance /> {hospital.emergencyBeds} emergency
          </span>
        </div>

        <Link
          to={`/hospitals/${hospital.id}`}
          className="mt-auto text-center w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  )
}
