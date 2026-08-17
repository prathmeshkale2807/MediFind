import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaGraduationCap,
  FaBriefcase,
  FaClock,
  FaRupeeSign,
} from 'react-icons/fa'

const defaultPhotos = [
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop"
]

export default function DoctorCard({ doctor }) {
  if (!doctor) return null

  const doctorId = doctor.id ?? doctor.doctor_id
  const hospitalId = doctor.hospitalId ?? doctor.hospital_id
  const name = doctor.name || doctor.full_name || 'Doctor'
  const photo = doctor.photo || defaultPhotos[0]
  const qualification = doctor.qualification || 'MBBS'
  
  const rawExperience = doctor.experience
  const experienceText = 
    typeof rawExperience === 'number' || (rawExperience && !String(rawExperience).includes('experience'))
      ? `${rawExperience} years`
      : rawExperience || 'Experience not available'

  const availability = doctor.availability || 'Contact hospital for availability'

  const rawFee = doctor.fee
  const consultationFee =
    rawFee !== null && rawFee !== undefined && rawFee !== ''
      ? Number(rawFee)
      : null

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-5 flex flex-col items-center text-center"
    >
      <img
        src={photo}
        alt={name}
        className="w-24 h-24 rounded-full object-cover border-4 border-primary-50 mb-4"
      />

      <h3 className="font-display font-bold text-ink">
        {name}
      </h3>

      <p className="text-primary-600 text-sm font-semibold mb-3">
        {doctor.specialization || 'General Physician'}
      </p>

      <div className="w-full mb-4 rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="w-8 h-8 rounded-lg bg-white text-primary-600 grid place-items-center">
            <FaRupeeSign size={14} />
          </span>
          <span>Consultation Fee</span>
        </div>

        <span className="text-primary-600 font-bold">
          {consultationFee !== null
            ? `₹${consultationFee}`
            : 'Not available'}
        </span>
      </div>

      <ul className="text-sm text-muted space-y-1.5 mb-4 w-full text-left">
        <li className="flex items-center gap-2">
          <FaGraduationCap className="text-primary-600 shrink-0" />
          {qualification}
        </li>

        <li className="flex items-center gap-2">
          <FaBriefcase className="text-primary-600 shrink-0" />
          {experienceText}
        </li>

        <li className="flex items-center gap-2">
          <FaClock className="text-primary-600 shrink-0" />
          {availability}
        </li>
      </ul>

      <Link
        to={`/doctors/${doctorId}`}
        className="mb-2 w-full py-2 rounded-xl border border-primary-200 text-primary-700 text-sm font-semibold hover:bg-primary-50 transition-colors text-center"
      >
        View Profile
      </Link>

      <Link
        to="/book-appointment"
        state={{
          doctorId,
          hospitalId,
        }}
        className="mt-auto w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
      >
        Book Appointment
      </Link>
    </motion.div>
  )
}