import { motion } from 'framer-motion'
import { FaBullseye, FaEye, FaHospitalUser, FaBed, FaUserMd, FaHeartbeat } from 'react-icons/fa'

const services = [
  { icon: FaHospitalUser, title: 'Hospital Directory', text: 'Compare 120+ hospitals by speciality, rating and distance.' },
  { icon: FaUserMd, title: 'Doctor Booking', text: 'Book verified doctors across every major specialization.' },
  { icon: FaBed, title: 'Bed Tracking', text: 'Live General, ICU and Ventilator bed counts, updated constantly.' },
  { icon: FaHeartbeat, title: 'Emergency Routing', text: 'Get directed to the nearest hospital with an open emergency bed.' },
]

const team = [
  { name: 'Dr. Meera Nair', role: 'Chief Medical Advisor', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop' },
  { name: 'Aditya Rao', role: 'Founder & CEO', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop' },
  { name: 'Sanya Kapoor', role: 'Head of Product', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop' },
  { name: 'Karan Malhotra', role: 'Head of Engineering', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop' },
]

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-14 max-w-2xl"
      >
        <h1 className="text-3xl font-display font-extrabold text-ink mb-3">About MediFind</h1>
        <p className="text-muted leading-relaxed">
          MediFind connects patients with the right hospital, the right
          doctor and an available bed, in a single, simple dashboard.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
        <div className="bg-white rounded-2xl shadow-card p-7">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 grid place-items-center mb-4">
            <FaBullseye size={20} />
          </div>
          <h2 className="font-display font-bold text-xl text-ink mb-2">Our Mission</h2>
          <p className="text-muted leading-relaxed">
            To remove the guesswork from finding care, so no family has to
            call five hospitals to find one available bed.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-7">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 grid place-items-center mb-4">
            <FaEye size={20} />
          </div>
          <h2 className="font-display font-bold text-xl text-ink mb-2">Our Vision</h2>
          <p className="text-muted leading-relaxed">
            A future where real-time hospital data is as easy to check as
            the weather, for every city in the country.
          </p>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-display font-extrabold text-ink mb-8 text-center">
          Our Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl shadow-card p-6">
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 grid place-items-center mb-4">
                <s.icon size={18} />
              </div>
              <h3 className="font-display font-bold text-ink mb-2">{s.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-display font-extrabold text-ink mb-8 text-center">
          Team Members
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((t) => (
            <div key={t.name} className="text-center">
              <img
                src={t.photo}
                alt={t.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-primary-50"
              />
              <h3 className="font-display font-bold text-ink text-sm">{t.name}</h3>
              <p className="text-muted text-xs">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
