import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import AppointmentCard from '../components/AppointmentCard.jsx'
import Loading from '../components/Loading.jsx'
import { api } from '../api.js'

const emptyForm = {
  name: '',
  age: '',
  gender: '',
  phone: '',
  email: '',
  hospitalId: '',
  doctorId: '',
  date: '',
  time: '',
  problem: '',
}

export default function BookAppointment() {
  const location = useLocation()
  const preset = location.state || {}

  const [form, setForm] = useState({
    ...emptyForm,
    hospitalId: preset.hospitalId ? String(preset.hospitalId) : '',
    doctorId: preset.doctorId ? String(preset.doctorId) : '',
  })
  const [hospitals, setHospitals] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [slots, setSlots] = useState([])
  const [slotLoading, setSlotLoading] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([api.getHospitals(), api.getDoctors()])
      .then(([hospitalData, doctorData]) => {
        if (!active) return
        setHospitals(hospitalData || [])
        setDoctors(doctorData || [])
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const availableDoctors = useMemo(() => {
    if (!form.hospitalId) return doctors
    return doctors.filter((d) => {
      const hId = d.hospitalId ?? d.hospital_id
      return Number(hId) === Number(form.hospitalId)
    })
  }, [form.hospitalId, doctors])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (field === 'hospitalId') {
      setForm((f) => ({ ...f, hospitalId: value, doctorId: '' }))
    }
  }

  useEffect(() => {
    if (!form.doctorId || !form.date) { setSlots([]); return }
    let active = true
    setSlotLoading(true)
    api.getDoctorSlots(form.doctorId, form.date)
      .then((data) => { if (active) setSlots(data.slots || []) })
      .catch(() => { if (active) setSlots([]) })
      .finally(() => { if (active) setSlotLoading(false) })
    return () => { active = false }
  }, [form.doctorId, form.date])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const data = await api.bookAppointment(form)
      const appointment = data.appointment

      setSubmitted({
        patientName: appointment?.patientName || form.name,
        hospitalName: appointment?.hospitalName || 'Selected hospital',
        doctorName: appointment?.doctorName || 'Selected doctor',
        date: appointment?.date || form.date,
        time: appointment?.time || form.time,
      })
      setShowSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setForm(emptyForm)
    setSubmitted(null)
    setShowSuccess(false)
    setError('')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-20">
        <Loading label="Loading hospitals and doctors..." />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-display font-extrabold text-ink mb-2">Book an Appointment</h1>
        <p className="text-muted mb-8">
          Fill in the details below. Your appointment will be saved to the hospital portal.
        </p>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Patient Name" required>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} type="text" placeholder="e.g. Rahul Deshmukh" className="input" />
          </Field>

          <Field label="Age" required>
            <input required value={form.age} onChange={(e) => update('age', e.target.value)} type="number" min="0" max="120" placeholder="e.g. 34" className="input" />
          </Field>

          <Field label="Gender" required>
            <select required value={form.gender} onChange={(e) => update('gender', e.target.value)} className="input">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>

          <Field label="Phone Number" required>
            <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} type="tel" placeholder="e.g. 9876543210" className="input" />
          </Field>

          <Field label="Email" required>
            <input required value={form.email} onChange={(e) => update('email', e.target.value)} type="email" placeholder="e.g. rahul@email.com" className="input" />
          </Field>

          <Field label="Hospital" required>
            <select required value={form.hospitalId} onChange={(e) => update('hospitalId', e.target.value)} className="input">
              <option value="">Select hospital</option>
              {hospitals.map((h, idx) => {
                const id = h.id ?? h.hospital_id ?? idx
                const name = h.name ?? h.hospital_name ?? 'Hospital'
                return (
                  <option key={`hospital-${id}`} value={id}>
                    {name}
                  </option>
                )
              })}
            </select>
          </Field>

          <Field label="Doctor" required>
            <select required value={form.doctorId} onChange={(e) => update('doctorId', e.target.value)} className="input">
              <option value="">Select doctor</option>
              {availableDoctors.map((d, idx) => {
                const id = d.id ?? d.doctor_id ?? idx
                const name = d.name ?? d.full_name ?? 'Doctor'
                const spec = d.specialization ? ` — ${d.specialization}` : ''
                return (
                  <option key={`doctor-${id}`} value={id}>
                    {name}{spec}
                  </option>
                )
              })}
            </select>
          </Field>

          <Field label="Appointment Date" required>
            <input required value={form.date} onChange={(e) => update('date', e.target.value)} type="date" className="input" />
          </Field>

          <Field label="Appointment Time" required>
            {slotLoading ? (
              <div className="input text-muted">Loading available slots...</div>
            ) : (
              <select required value={form.time} onChange={(e) => update('time', e.target.value)} className="input" disabled={!form.doctorId || !form.date}>
                <option value="">{form.doctorId && form.date ? 'Select available slot' : 'Select doctor and date first'}</option>
                {slots.map((slot) => (
                  <option key={slot.time} value={slot.time} disabled={!slot.available}>
                    {slot.time}{slot.available ? '' : ' — Booked'}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <Field label="Problem Description">
          <textarea value={form.problem} onChange={(e) => update('problem', e.target.value)} rows={4} placeholder="Briefly describe your symptoms or reason for the visit" className="input resize-none" />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60"
        >
          {submitting ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>

      {submitted && !showSuccess && (
        <div className="mt-8">
          <AppointmentCard appointment={submitted} />
        </div>
      )}

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100] flex items-center justify-center px-5"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <FaCheckCircle className="text-available mx-auto mb-4" size={52} />
              <h3 className="text-xl font-display font-extrabold text-ink mb-2">Appointment Booked!</h3>
              <p className="text-muted text-sm mb-6">
                Your appointment has been saved successfully. Please arrive 15 minutes early.
              </p>
              <button onClick={resetForm} className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
                Book Another
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink mb-1.5">
        {label} {required && <span className="text-occupied">*</span>}
      </span>
      {children}
    </label>
  )
}