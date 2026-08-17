import { FaUserMd, FaHospital, FaCalendarAlt, FaClock } from 'react-icons/fa'

// Shows a summary of a booked appointment.
// appointment: { patientName, hospitalName, doctorName, date, time }
export default function AppointmentCard({ appointment }) {
  const { patientName, hospitalName, doctorName, date, time } = appointment

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 border-l-4 border-primary-600">
      <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
        Appointment Confirmed
      </p>
      <h3 className="font-display font-bold text-lg text-ink mb-3">{patientName}</h3>

      <ul className="space-y-2 text-sm text-muted">
        <li className="flex items-center gap-2">
          <FaHospital className="text-primary-600 shrink-0" /> {hospitalName}
        </li>
        <li className="flex items-center gap-2">
          <FaUserMd className="text-primary-600 shrink-0" /> {doctorName}
        </li>
        <li className="flex items-center gap-2">
          <FaCalendarAlt className="text-primary-600 shrink-0" /> {date}
        </li>
        <li className="flex items-center gap-2">
          <FaClock className="text-primary-600 shrink-0" /> {time}
        </li>
      </ul>
    </div>
  )
}
