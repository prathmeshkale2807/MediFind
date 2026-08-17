import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  FaUsers,
  FaUserMd,
  FaHospital,
  FaBed,
  FaCalendarCheck,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes
} from 'react-icons/fa'

import { api } from '../api.js'
import Loading from '../components/Loading.jsx'


export default function AdminPortal() {

  const navigate = useNavigate()

  // =====================================================
  // CURRENT USER
  // =====================================================

  const user = (() => {

    try {

      return JSON.parse(
        localStorage.getItem('user')
      )

    } catch {

      return null

    }

  })()


  // =====================================================
  // DASHBOARD
  // =====================================================

  const [dashboard, setDashboard] =
    useState(null)

  const [appointments, setAppointments] =
    useState([])


  // =====================================================
  // DOCTORS
  // =====================================================

  const [doctors, setDoctors] =
    useState([])

  const [hospitals, setHospitals] =
    useState([])


  // =====================================================
  // LOADING / ERROR
  // =====================================================

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')


  // =====================================================
  // APPOINTMENT STATUS
  // =====================================================

  const [updatingId, setUpdatingId] =
    useState(null)


  // =====================================================
  // DOCTOR FORM
  // =====================================================

  const [showDoctorForm, setShowDoctorForm] =
    useState(false)

  const [editingDoctor, setEditingDoctor] =
    useState(null)

  const [doctorLoading, setDoctorLoading] =
    useState(false)

  const [doctorError, setDoctorError] =
    useState('')

  const [doctorVerification, setDoctorVerification] =
    useState(null)

const emptyDoctor = {
  hospital_id: '',
  user_id: '',
  full_name: '',
  specialization: '',
  phone: '',
  email: '',
  experience: '',
  fee: ''
}

  const [doctorForm, setDoctorForm] =
    useState(emptyDoctor)
const emptyHospital = {
    hospital_name: '',
    address: '',
    city: '',
    contact_number: '',
    email: '',
    total_beds: '',
    available_beds: '',
    latitude: '',
    longitude: ''
}

  const [showHospitalForm, setShowHospitalForm] = useState(false)
  const [editingHospital, setEditingHospital] = useState(null)
  const [hospitalLoading, setHospitalLoading] = useState(false)
  const [hospitalError, setHospitalError] = useState('')
  const [hospitalForm, setHospitalForm] = useState(emptyHospital)


  // =====================================================
  // LOAD ADMIN DATA
  // =====================================================

  useEffect(() => {

    if (!user || user.role !== 'admin') {
      return
    }

    loadAdminData()

  }, [])


  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  async function loadAdminData() {

    try {

      setLoading(true)
      setError('')


      const [
        dashboardData,
        appointmentData,
        doctorData,
        hospitalData
      ] = await Promise.all([

        api.getAdminDashboard(),

        api.getAdminAppointments(),

        api.getAdminDoctors(),

        api.getAdminHospitals()

      ])

      


      // Dashboard

      setDashboard(
        dashboardData
      )


      // Appointments

      setAppointments(

        Array.isArray(appointmentData)

          ? appointmentData

          : appointmentData.appointments || []

      )


      // Doctors

      const doctorList = Array.isArray(doctorData)
        ? doctorData
        : doctorData.doctors || []

      const normalizedDoctors = doctorList.map(normalizeDoctor)

      setDoctors(normalizedDoctors)


      // Hospitals

      setHospitals(

        Array.isArray(hospitalData)

          ? hospitalData

          : hospitalData.hospitals || []

      )


    } catch (err) {

      console.error(
        'Admin data error:',
        err
      )

      setError(
        err.message ||
        'Unable to load admin data.'
      )

    } finally {

      setLoading(false)

    }

  }


  // =====================================================
  // UPDATE APPOINTMENT STATUS
  // =====================================================

  async function changeStatus(
    id,
    status
  ) {

    try {

      setUpdatingId(id)
      setError('')


      await api.updateAppointmentStatus(
        id,
        status
      )


      setAppointments(
        current =>

          current.map(
            appointment =>

              Number(
                appointment.appointment_id
              ) === Number(id)

                ? {
                    ...appointment,
                    status
                  }

                : appointment

          )
      )


      // Update pending count

      setDashboard(
        current => {

          if (!current) {
            return current
          }


          const pendingCount =
            appointments.filter(
              appointment =>

                Number(
                  appointment.appointment_id
                ) === Number(id)

                  ? status === 'pending'

                  : appointment.status === 'pending'
            ).length


          return {

            ...current,

            pending_appointments:
              pendingCount

          }

        }
      )


    } catch (err) {

      console.error(
        'Appointment status error:',
        err
      )

      setError(
        err.message ||
        'Unable to update appointment.'
      )

    } finally {

      setUpdatingId(null)

    }

  }


  // =====================================================
  // NORMALIZE DOCTOR DATA
  // =====================================================

  function normalizeDoctor(doctor = {}) {

    const rawExperience = doctor.experience

    const experienceNumber =
      typeof rawExperience === 'number'
        ? rawExperience
        : Number(
            String(rawExperience ?? '')
              .replace(/[^0-9.]/g, '')
          )

    const rawFee = doctor.fee

    const feeNumber =
      typeof rawFee === 'number'
        ? rawFee
        : Number(
            String(rawFee ?? '')
              .replace(/[^0-9.]/g, '')
          )

return {

  ...doctor,

  // -------------------------------------------------
  // DOCTOR ID
  // -------------------------------------------------

  doctor_id:
    doctor.doctor_id ??
    doctor.id ??
    doctor.doctorId,

  // -------------------------------------------------
  // HOSPITAL ID
  // -------------------------------------------------

  hospital_id:
    doctor.hospital_id ??
    doctor.hospitalId ??
    doctor.hospital_id_fk ??
    '',

  // -------------------------------------------------
  // USER ID
  // -------------------------------------------------

  user_id:
    doctor.user_id ??
    doctor.userId ??
    '',

  // -------------------------------------------------
  // NAME
  // -------------------------------------------------

  full_name:
    doctor.full_name ??
    doctor.name ??
    'Unknown Doctor',

  // -------------------------------------------------
  // HOSPITAL NAME
  // -------------------------------------------------

  hospital_name:
    doctor.hospital_name ??
    doctor.hospitalName ??
    'Not assigned',

  // -------------------------------------------------
  // EXPERIENCE
  // -------------------------------------------------

  experience:
    Number.isFinite(experienceNumber)
      ? experienceNumber
      : 0,

  // -------------------------------------------------
  // FEE
  // -------------------------------------------------

  fee:
    Number.isFinite(feeNumber)
      ? feeNumber
      : 0
}
}


  // =====================================================
  // OPEN ADD DOCTOR FORM
  // =====================================================

  function openAddDoctor() {

    setEditingDoctor(null)

    setDoctorForm(
      emptyDoctor
    )

    setDoctorError('')
    setDoctorVerification(null)

    setShowDoctorForm(true)

  }


  // =====================================================
  // OPEN EDIT DOCTOR FORM
  // =====================================================

function openEditDoctor(doctor) {

  const normalizedDoctor =
    normalizeDoctor(doctor)

  setEditingDoctor(
    normalizedDoctor
  )

  setDoctorError('')

  setDoctorForm({

    hospital_id:
      normalizedDoctor.hospital_id,

    user_id:
      normalizedDoctor.user_id,

    full_name:
      normalizedDoctor.full_name,

    specialization:
      normalizedDoctor.specialization,

    phone:
      normalizedDoctor.phone,

    email:
      normalizedDoctor.email,

    experience:
      normalizedDoctor.experience,

    fee:
      normalizedDoctor.fee

  })

  setShowDoctorForm(true)
}



  // =====================================================
  // CLOSE DOCTOR FORM
  // =====================================================

  function closeDoctorForm() {

    if (doctorLoading) {
      return
    }

    setShowDoctorForm(false)

    setEditingDoctor(null)

    setDoctorError('')
    setDoctorVerification(null)

    setDoctorForm(
      emptyDoctor
    )

  }


  // =====================================================
  // DOCTOR INPUT CHANGE
  // =====================================================

  function handleDoctorChange(
    e
  ) {

    const {
      name,
      value
    } = e.target


    setDoctorForm(
      current => ({

        ...current,

        [name]: value

      })
    )

  }


  // =====================================================
  // SAVE DOCTOR
  // =====================================================

  async function handleDoctorSubmit(
    e
  ) {

    e.preventDefault()

    setDoctorError('')


    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (
      !doctorForm.hospital_id ||
      !doctorForm.full_name.trim() ||
      !doctorForm.specialization.trim() ||
      !doctorForm.phone.trim() ||
      !doctorForm.email.trim() ||
      doctorForm.experience === ''
    ) {

      setDoctorError(
        'Please fill all required doctor fields.'
      )

      return

    }


    if (
      !Number.isFinite(Number(doctorForm.experience)) ||
      Number(doctorForm.experience) < 0
    ) {

      setDoctorError(
        'Experience cannot be negative.'
      )

      return

    }
if (
  doctorForm.fee === '' ||
  !Number.isFinite(Number(doctorForm.fee)) ||
  Number(doctorForm.fee) < 0
) {

  setDoctorError(
    'Consultation fee must be a valid non-negative amount.'
  )

  return

}

    try {

      setDoctorLoading(true)


     const payload = {
  hospital_id: Number(doctorForm.hospital_id),

  user_id: doctorForm.user_id
    ? Number(doctorForm.user_id)
    : null,

  full_name: doctorForm.full_name.trim(),

  specialization:
    doctorForm.specialization.trim(),

  phone:
    doctorForm.phone.trim(),

  email:
    doctorForm.email.trim(),

  experience:
    Number(doctorForm.experience),

  fee:
    Number(doctorForm.fee)
}

      // ---------------------------------------------
      // ADD
      // ---------------------------------------------
if (!editingDoctor) {

    const response = await api.addAdminDoctor(payload)

    const newDoctor = response.doctor

    if (newDoctor) {

        setDoctors(current => [
            normalizeDoctor(newDoctor),
            ...current
        ])

// Backend already sends the first OTP when
// the doctor is created.
//
// Do NOT resend another OTP here.
setDoctorVerification({
    email: payload.email,
    success: true,
    message:
        'Doctor added successfully. A verification OTP has been sent to this email.'
})
    } else {

        const doctorData =
            await api.getAdminDoctors()

        const doctorList = Array.isArray(doctorData)
            ? doctorData
            : doctorData.doctors || []

        setDoctors(
            doctorList.map(normalizeDoctor)
        )
    }
}

      // ---------------------------------------------
      // UPDATE
      // ---------------------------------------------
// ---------------------------------------------
// UPDATE DOCTOR
// ---------------------------------------------

else {

  const doctorId =
    editingDoctor.doctor_id ??
    editingDoctor.id ??
    editingDoctor.doctorId

  if (!doctorId) {

    setDoctorError(
      'Doctor ID was not found.'
    )

    return
  }

  console.log(
    'Updating doctor:',
    doctorId
  )

  console.log(
    'Update payload:',
    payload
  )

  // -------------------------------------------------
  // SEND UPDATE TO BACKEND
  // -------------------------------------------------

  await api.updateAdminDoctor(
    doctorId,
    payload
  )

  // -------------------------------------------------
  // IMPORTANT:
  // RELOAD DOCTORS FROM DATABASE
  // -------------------------------------------------
  //
  // This is important because the update response
  // contains the doctor fields but may not contain
  // the joined hospital_name.
  //
  // Reloading gets the latest hospital name too.
  // -------------------------------------------------

  const doctorData =
    await api.getAdminDoctors()

  const doctorList =
    Array.isArray(doctorData)
      ? doctorData
      : doctorData.doctors || []

  const normalizedDoctors =
    doctorList.map(normalizeDoctor)

  setDoctors(
    normalizedDoctors
  )

  console.log(
    'Doctors after update:',
    normalizedDoctors
  )
}

      closeDoctorForm()


    } catch (err) {

      console.error(
        'Doctor save error:',
        err
      )

      setDoctorError(
        err.message ||
        'Unable to save doctor.'
      )

    } finally {

      setDoctorLoading(false)

    }

  }


  // =====================================================
  // DELETE DOCTOR
  // =====================================================

  async function handleDeleteDoctor(
    doctor
  ) {

    const doctorId =
      doctor.doctor_id ??
      doctor.id ??
      doctor.doctorId

    console.log(
      'Doctor selected for deletion:',
      doctor
    )

    console.log(
      'Doctor ID:',
      doctorId
    )

    if (!doctorId) {

      setError(
        'Unable to delete doctor: Doctor ID was not found.'
      )

      return
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete Dr. ${doctor.full_name || doctor.name || 'this doctor'}?`
      )

    if (!confirmed) {
      return
    }

    try {

      setDoctorError('')
      setError('')

      await api.deleteAdminDoctor(
        doctorId
      )

      setDoctors(
        current =>
          current.filter(
            item => {

              const itemId =
                item.doctor_id ??
                item.id ??
                item.doctorId

              return Number(itemId) !== Number(doctorId)

            }
          )
      )

    } catch (err) {

      console.error(
        'Delete doctor error:',
        err
      )

      setError(
        err.message ||
        'Unable to delete doctor.'
      )

    }

  }



  // =====================================================
  // HOSPITAL MANAGEMENT
  // =====================================================

 function scrollToHospitalForm() {
  setTimeout(() => {
    document
      .getElementById('hospital-edit-form')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
  }, 50)
}

function openAddHospital() {
  setEditingHospital(null)

  setHospitalForm(emptyHospital)

  setHospitalError('')

  setShowHospitalForm(true)

  scrollToHospitalForm()
}

function openEditHospital(hospital) {
  setEditingHospital(hospital)

  setHospitalError('')

  setHospitalForm({
    hospital_name: hospital.hospital_name ?? '',
    address: hospital.address ?? '',
    city: hospital.city ?? '',
    contact_number: hospital.contact_number ?? '',
    email: hospital.email ?? '',
    total_beds: hospital.total_beds ?? '',
    available_beds: hospital.available_beds ?? '',
    latitude: hospital.latitude ?? '',
    longitude: hospital.longitude ?? '',
  })

  setShowHospitalForm(true)

  scrollToHospitalForm()
}
  function closeHospitalForm() {
    if (hospitalLoading) return
    setShowHospitalForm(false)
    setEditingHospital(null)
    setHospitalError('')
    setHospitalForm(emptyHospital)
  }

  function handleHospitalChange(e) {
    const { name, value } = e.target
    setHospitalForm(current => ({ ...current, [name]: value }))
  }
  
  function getHospitalLocation() {
    setHospitalError('')

    if (!navigator.geolocation) {
      setHospitalError(
        'Geolocation is not supported by your browser.'
      )
      return
    }

    setHospitalLoading(true)

    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        setHospitalForm(current => ({
          ...current,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }))

        setHospitalLoading(false)
      },
      error => {
        console.error('Location error:', error)

        let message = 'Unable to access your location.'

        if (error.code === error.PERMISSION_DENIED) {
          message =
            'Location permission was denied. Please allow location access and try again.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message =
            'Your location could not be determined. Please check your device location settings.'
        } else if (error.code === error.TIMEOUT) {
          message =
            'Location request timed out. Please try again.'
        }

        setHospitalError(message)
        setHospitalLoading(false)
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 300000
      }
    )
  }

  async function handleHospitalSubmit(e) {
    e.preventDefault()
    setHospitalError('')

    if (
      !hospitalForm.hospital_name.trim() ||
      !hospitalForm.address.trim() ||
      !hospitalForm.city.trim() ||
      !hospitalForm.contact_number.trim() ||
      !hospitalForm.email.trim() ||
      hospitalForm.total_beds === '' ||
      hospitalForm.available_beds === ''
    ) {
      setHospitalError('Please fill all required hospital fields.')
      return
    }

    const totalBeds = Number(hospitalForm.total_beds)
    const availableBeds = Number(hospitalForm.available_beds)

    if (!Number.isInteger(totalBeds) || totalBeds < 0) {
      setHospitalError('Total beds must be a valid non-negative number.')
      return
    }

    if (!Number.isInteger(availableBeds) || availableBeds < 0) {
      setHospitalError('Available beds must be a valid non-negative number.')
      return
    }

    if (availableBeds > totalBeds) {
      setHospitalError('Available beds cannot be greater than total beds.')
      return
    }

    try {
      setHospitalLoading(true)
const payload = {
    hospital_name: hospitalForm.hospital_name.trim(),
    address: hospitalForm.address.trim(),
    city: hospitalForm.city.trim(),
    contact_number: hospitalForm.contact_number.trim(),
    email: hospitalForm.email.trim(),
    total_beds: totalBeds,
    available_beds: availableBeds,

    latitude:
        hospitalForm.latitude !== ''
            ? Number(hospitalForm.latitude)
            : null,

    longitude:
        hospitalForm.longitude !== ''
            ? Number(hospitalForm.longitude)
            : null
}
      if (!editingHospital) {
        const response = await api.addAdminHospital(payload)
        if (response.hospital) {
          setHospitals(current => [response.hospital, ...current])
        } else {
          const data = await api.getAdminHospitals()
          setHospitals(Array.isArray(data) ? data : data.hospitals || [])
        }
      } else {
        const response = await api.updateAdminHospital(
          editingHospital.hospital_id,
          payload
        )

        if (response.hospital) {
          setHospitals(current =>
            current.map(hospital =>
              Number(hospital.hospital_id) === Number(editingHospital.hospital_id)
                ? { ...hospital, ...response.hospital }
                : hospital
            )
          )
        } else {
          const data = await api.getAdminHospitals()
          setHospitals(Array.isArray(data) ? data : data.hospitals || [])
        }
      }

      closeHospitalForm()
    } catch (err) {
      console.error('Hospital save error:', err)
      setHospitalError(err.message || 'Unable to save hospital.')
    } finally {
      setHospitalLoading(false)
    }
  }

  async function handleDeleteHospital(hospital) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${hospital.hospital_name}?`
    )

    if (!confirmed) return

    try {
      setError('')
      await api.deleteAdminHospital(hospital.hospital_id)

      setHospitals(current =>
        current.filter(item =>
          Number(item.hospital_id) !== Number(hospital.hospital_id)
        )
      )
    } catch (err) {
      console.error('Delete hospital error:', err)
      setError(err.message || 'Unable to delete hospital.')
    }
  }

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    )

  }


  // =====================================================
  // NOT ADMIN
  // =====================================================

  if (user.role !== 'admin') {

    return (
      <Navigate
        to="/"
        replace
      />
    )

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20">

        <Loading
          label="Loading admin portal..."
        />

      </div>

    )

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-8">

        <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
          Administration
        </p>


        <h1 className="text-3xl font-display font-extrabold text-ink mt-1">
          Admin Portal
        </h1>


        <p className="text-muted mt-2">
          Manage the hospital portal, doctors and appointments.
        </p>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (

        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">

          {error}

        </div>

      )}


      {/* ================================================= */}
      {/* DASHBOARD CARDS */}
      {/* ================================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">


        <DashboardCard
          icon={<FaUsers />}
          label="Users"
          value={
            dashboard?.users ?? 0
          }
        />


        <DashboardCard
          icon={<FaUserMd />}
          label="Doctors"
          value={
            dashboard?.doctors ?? 0
          }
        />


        <DashboardCard
          icon={<FaHospital />}
          label="Hospitals"
          value={
            dashboard?.hospitals ?? 0
          }
        />


        <DashboardCard
          icon={<FaBed />}
          label="Available Beds"
          value={
            dashboard?.available_beds ?? 0
          }
        />


        <DashboardCard
          icon={<FaCalendarCheck />}
          label="Appointments"
          value={
            dashboard?.appointments ?? 0
          }
        />

      </div>


      {/* ================================================= */}
      {/* APPOINTMENTS */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl shadow-card p-6 mb-8">


        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">


          <div>

            <h2 className="text-xl font-display font-bold text-ink">
              Appointments
            </h2>


            <p className="text-sm text-muted mt-1">
              Review and update appointment status.
            </p>

          </div>


          <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-semibold">

            {dashboard?.pending_appointments ?? 0}
            {' '}
            Pending

          </span>

        </div>


        {appointments.length === 0 ? (

          <p className="text-muted text-sm py-6 text-center">
            No appointments found.
          </p>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b border-slate-100 text-left">

                  <th className="py-3 pr-4">
                    Patient
                  </th>

                  <th className="py-3 pr-4">
                    Doctor
                  </th>

                  <th className="py-3 pr-4">
                    Hospital
                  </th>

                  <th className="py-3 pr-4">
                    Date
                  </th>

                  <th className="py-3 pr-4">
                    Time
                  </th>

                  <th className="py-3">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {appointments.map(
                  appointment => (

                    <tr
                      key={
                        appointment.appointment_id
                      }
                      className="border-b border-slate-50"
                    >


                      <td className="py-4 pr-4">

                        <p className="font-semibold text-ink">

                          {appointment.patient_name ||
                            'Unknown Patient'}

                        </p>


                        <p className="text-xs text-muted">

                          {appointment.patient_email ||
                            'No email'}

                        </p>

                      </td>


                      <td className="py-4 pr-4">

                        {appointment.doctor_name ||
                          'Unknown Doctor'}

                      </td>


                      <td className="py-4 pr-4">

                        {appointment.hospital_name ||
                          'Unknown Hospital'}

                      </td>


                      <td className="py-4 pr-4">

                        {appointment.appointment_date}

                      </td>


                      <td className="py-4 pr-4">

                        {appointment.appointment_time}

                      </td>


                      <td className="py-4">

                        <select

                          value={
                            appointment.status ||
                            'pending'
                          }

                          disabled={
                            updatingId ===
                            appointment.appointment_id
                          }

                          onChange={
                            e =>
                              changeStatus(
                                appointment.appointment_id,
                                e.target.value
                              )
                          }

                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary-600 bg-white disabled:opacity-60"

                        >

                          <option value="pending">
                            Pending
                          </option>

                          <option value="confirmed">
                            Confirmed
                          </option>

                          <option value="rejected">
                            Rejected
                          </option>

                          <option value="completed">
                            Completed
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>

                        </select>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* DOCTOR MANAGEMENT */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl shadow-card p-6 mb-8">


        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">


          <div>

            <h2 className="text-xl font-display font-bold text-ink">
              Doctor Management
            </h2>


            <p className="text-sm text-muted mt-1">
              Add, edit and remove doctors from the hospital portal.
            </p>

          </div>


          <button
            type="button"
            onClick={openAddDoctor}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >

            <FaPlus size={13} />

            Add Doctor

          </button>

        </div>


        {/* ================================================= */}
        {/* DOCTOR FORM */}
        {/* ================================================= */}

        {showDoctorForm && (

          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">


            <div className="flex items-center justify-between mb-5">


              <div>

                <h3 className="text-lg font-display font-bold text-ink">

                  {editingDoctor
                    ? 'Edit Doctor'
                    : 'Add New Doctor'}

                </h3>


                <p className="text-sm text-muted mt-1">

                  {editingDoctor
                    ? 'Update doctor information.'
                    : 'Enter the doctor details below.'}

                </p>

              </div>


              <button
                type="button"
                onClick={closeDoctorForm}
                disabled={doctorLoading}
                className="w-9 h-9 rounded-lg grid place-items-center text-ink/60 hover:bg-white hover:text-ink transition-colors disabled:opacity-50"
              >

                <FaTimes />

              </button>

            </div>


            {/* FORM ERROR */}

            {doctorError && (

              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">

                {doctorError}

              </div>

            )}

            {doctorVerification && (
    <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-4">

        <div className="flex items-start gap-3">

            <div className="text-green-600 text-xl">
                ✓
            </div>

            <div className="flex-1">

                <p className="font-semibold text-green-800">
                    Doctor added successfully
                </p>

                <p className="text-sm text-green-700 mt-1">
                    {doctorVerification.message}
                </p>

                <p className="text-sm text-green-800 font-semibold mt-2 break-all">
                    📧 {doctorVerification.email}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/doctor-verify?email=${encodeURIComponent(
                                doctorVerification.email
                            )}`
                        )
                    }
                    className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                    Verify Doctor Email
                </button>

            </div>

        </div>

    </div>
)}


            <form
              onSubmit={handleDoctorSubmit}
              className="grid md:grid-cols-2 gap-5"
            >


              {/* FULL NAME */}

              <div>

                <label className="block text-sm font-semibold text-ink mb-2">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="full_name"
                  value={
                    doctorForm.full_name
                  }
                  onChange={
                    handleDoctorChange
                  }
                  placeholder="Dr. John Smith"
                  disabled={doctorLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />

              </div>


              {/* SPECIALIZATION */}

              <div>

                <label className="block text-sm font-semibold text-ink mb-2">
                  Specialization *
                </label>

                <input
                  type="text"
                  name="specialization"
                  value={
                    doctorForm.specialization
                  }
                  onChange={
                    handleDoctorChange
                  }
                  placeholder="Cardiologist"
                  disabled={doctorLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />

              </div>


              {/* PHONE */}

              <div>

                <label className="block text-sm font-semibold text-ink mb-2">
                  Phone *
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    doctorForm.phone
                  }
                  onChange={
                    handleDoctorChange
                  }
                  placeholder="9876543210"
                  disabled={doctorLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />

              </div>


              {/* EMAIL */}

              <div>

                <label className="block text-sm font-semibold text-ink mb-2">
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    doctorForm.email
                  }
                  onChange={
                    handleDoctorChange
                  }
                  placeholder="doctor@example.com"
                  disabled={doctorLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />

              </div>


              {/* EXPERIENCE */}

              <div>

                <label className="block text-sm font-semibold text-ink mb-2">
                  Experience (years) *
                </label>

                <input
                  type="number"
                  min="0"
                  name="experience"
                  value={
                    doctorForm.experience === ''
                      ? ''
                      : Number(doctorForm.experience) || 0
                  }
                  onChange={
                    handleDoctorChange
                  }
                  placeholder="5"
                  disabled={doctorLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />

              </div>


              {/* HOSPITAL */}

              <div>

                <label className="block text-sm font-semibold text-ink mb-2">
                  Hospital *
                </label>

                <select
                  name="hospital_id"
                  value={
                    doctorForm.hospital_id
                  }
                  onChange={
                    handleDoctorChange
                  }
                  disabled={doctorLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                >

                  <option value="">
                    Select hospital
                  </option>


                  {hospitals.map(
                    hospital => (

                      <option
                        key={
                          hospital.hospital_id
                        }
                        value={
                          hospital.hospital_id
                        }
                      >

                        {hospital.hospital_name}

                      </option>

                    )
                  )}

                </select>

              </div>

              
  {/* CONSULTATION FEE */}

<div>
  <label className="block text-sm font-semibold text-ink mb-2">
    Consultation Fee (₹) *
  </label>

  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600 font-semibold">
      ₹
    </span>

    <input
      type="number"
      min="0"
      step="1"
      name="fee"
      value={doctorForm.fee}
      onChange={handleDoctorChange}
      placeholder="500"
      disabled={doctorLoading}
      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
    />
  </div>

  <p className="text-xs text-muted mt-2">
    Enter the doctor's consultation fee.
  </p>
</div>


              {/* USER ID */}

              <div className="md:col-span-2">

                <label className="block text-sm font-semibold text-ink mb-2">
                  Doctor User ID
                  <span className="font-normal text-muted">
                    {' '}
                    (optional)
                  </span>
                </label>

                <input
                  type="number"
                  min="1"
                  name="user_id"
                  value={
                    doctorForm.user_id
                  }
                  onChange={
                    handleDoctorChange
                  }
                  placeholder="Enter the doctor user's ID if an account already exists"
                  disabled={doctorLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />

                <p className="text-xs text-muted mt-2">
                  If this doctor has a login account, enter its user ID so the doctor can access Doctor Appointments.
                </p>

              </div>


              {/* BUTTONS */}

              {/* LOCATION */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="block text-sm font-semibold text-ink">
                    Hospital Location
                  </label>

                  <button
                    type="button"
                    onClick={getHospitalLocation}
                    disabled={hospitalLoading}
                    className="px-4 py-2 rounded-xl bg-primary-50 text-primary-600 text-sm font-semibold hover:bg-primary-100 transition-colors disabled:opacity-60"
                  >
                    📍 Use Current Location
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-2">
                      Latitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={hospitalForm.latitude}
                      onChange={handleHospitalChange}
                      placeholder="18.520430"
                      disabled={hospitalLoading}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-2">
                      Longitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={hospitalForm.longitude}
                      onChange={handleHospitalChange}
                      placeholder="73.856743"
                      disabled={hospitalLoading}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted mt-2">
                  Click "Use Current Location" while you are at the hospital.
                  The coordinates will be saved with the hospital.
                </p>
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">


                <button
                  type="submit"
                  disabled={doctorLoading}
                  className="px-6 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors"
                >

                  {doctorLoading

                    ? 'Saving...'

                    : editingDoctor
                      ? 'Update Doctor'
                      : 'Add Doctor'}

                </button>


                <button
                  type="button"
                  onClick={closeDoctorForm}
                  disabled={doctorLoading}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-ink text-sm font-semibold hover:bg-white disabled:opacity-60 transition-colors"
                >

                  Cancel

                </button>

              </div>

            </form>

          </div>

        )}


        {/* ================================================= */}
        {/* DOCTORS LIST */}
        {/* ================================================= */}

        {doctors.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">

            <div className="text-4xl mb-3">
              👨‍⚕️
            </div>

            <h3 className="font-display font-bold text-lg text-ink">
              No doctors found
            </h3>

            <p className="text-sm text-muted mt-1">
              Add your first doctor using the button above.
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 gap-5">

            {doctors.map(
              doctor => (

                <div
                  key={
                    doctor.doctor_id ??
                    doctor.id ??
                    doctor.doctorId
                  }
                  className="border border-slate-100 rounded-2xl p-5 hover:shadow-sm transition-shadow"
                >


                  {/* TOP */}

                  <div className="flex items-start justify-between gap-4">


                    <div className="flex items-center gap-3">


                      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 grid place-items-center shrink-0">

                        <FaUserMd size={21} />

                      </div>


                      <div>

                        <h3 className="font-display font-bold text-ink">

                          {doctor.full_name ||
                            doctor.name ||
                            'Unknown Doctor'}

                        </h3>


                        <p className="text-sm text-primary-600 font-semibold">

                          {doctor.specialization ||
                            'Specialization not available'}

                        </p>

                      </div>

                    </div>


                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">

                      ID #{
                        doctor.doctor_id ??
                        doctor.id ??
                        doctor.doctorId ??
                        'N/A'
                      }

                    </span>

                  </div>


                  {/* DETAILS */}
                    <div className="mt-5 space-y-2">

                      <p className="text-sm text-ink/70">
                        <span className="font-semibold text-ink">
                          Hospital:
                        </span>
                        {' '}
                        {doctor.hospital_name ||
                          doctor.hospitalName ||
                          'Not assigned'}
                      </p>

                      <p className="text-sm text-ink/70">
                        <span className="font-semibold text-ink">
                          Experience:
                        </span>
                        {' '}
                        {Number.isFinite(Number(doctor.experience))
                          ? Number(doctor.experience)
                          : String(doctor.experience ?? 0).replace(/[^0-9.]/g, '') || 0} years
                      </p>

                      {/* CONSULTATION FEE */}
                      <p className="text-sm text-ink/70">
                        <span className="font-semibold text-ink">
                          Consultation Fee:
                        </span>
                        {' '}
                        ₹{doctor.fee ?? 0}
                      </p>

                      <p className="text-sm text-ink/70">
                        <span className="font-semibold text-ink">
                          Phone:
                        </span>
                        {' '}
                        {doctor.phone || 'Not available'}
                      </p>

                      <p className="text-sm text-ink/70 break-all">
                        <span className="font-semibold text-ink">
                          Email:
                        </span>
                        {' '}
                        {doctor.email || 'Not available'}
                      </p>

                    </div>

                  {/* ACTIONS */}

                  <div className="mt-5 flex gap-3">


                    <button
                      type="button"
                      onClick={() =>
                        openEditDoctor(
                          doctor
                        )
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary-200 text-primary-600 text-sm font-semibold hover:bg-primary-50 transition-colors"
                    >

                      <FaEdit size={13} />

                      Edit

                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteDoctor(
                          doctor
                        )
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
                    >

                      <FaTrash size={13} />

                      Delete

                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* HOSPITAL MANAGEMENT */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl shadow-card p-6 mb-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-ink">
              Hospital Management
            </h2>
            <p className="text-sm text-muted mt-1">
              Add, edit and remove hospitals from the portal.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddHospital}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <FaPlus size={13} />
            Add Hospital
          </button>
        </div>

     {showHospitalForm && (
  <div
    id="hospital-edit-form"
    className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5"
  >

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-display font-bold text-ink">
                  {editingHospital ? 'Edit Hospital' : 'Add New Hospital'}
                </h3>
                <p className="text-sm text-muted mt-1">
                  {editingHospital
                    ? 'Update hospital information.'
                    : 'Enter the hospital details below.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeHospitalForm}
                disabled={hospitalLoading}
                className="w-9 h-9 rounded-lg grid place-items-center text-ink/60 hover:bg-white hover:text-ink transition-colors disabled:opacity-50"
              >
                <FaTimes />
              </button>
            </div>

            {hospitalError && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {hospitalError}
              </div>
            )}

            <form
              onSubmit={handleHospitalSubmit}
              className="grid md:grid-cols-2 gap-5"
            >

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  name="hospital_name"
                  value={hospitalForm.hospital_name}
                  onChange={handleHospitalChange}
                  placeholder="City Hospital"
                  disabled={hospitalLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={hospitalForm.city}
                  onChange={handleHospitalChange}
                  placeholder="Pune"
                  disabled={hospitalLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={hospitalForm.address}
                  onChange={handleHospitalChange}
                  placeholder="Hospital address"
                  rows="3"
                  disabled={hospitalLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  value={hospitalForm.contact_number}
                  onChange={handleHospitalChange}
                  placeholder="9876543210"
                  disabled={hospitalLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={hospitalForm.email}
                  onChange={handleHospitalChange}
                  placeholder="hospital@example.com"
                  disabled={hospitalLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Total Beds *
                </label>
                <input
                  type="number"
                  min="0"
                  name="total_beds"
                  value={hospitalForm.total_beds}
                  onChange={handleHospitalChange}
                  placeholder="100"
                  disabled={hospitalLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Available Beds *
                </label>
                <input
                  type="number"
                  min="0"
                  name="available_beds"
                  value={hospitalForm.available_beds}
                  onChange={handleHospitalChange}
                  placeholder="40"
                  disabled={hospitalLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                />
                <p className="text-xs text-muted mt-2">
                  Available beds cannot be greater than total beds.
                </p>
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={hospitalLoading}
                  className="px-6 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors"
                >
                  {hospitalLoading
                    ? 'Saving...'
                    : editingHospital
                      ? 'Update Hospital'
                      : 'Add Hospital'}
                </button>

                <button
                  type="button"
                  onClick={closeHospitalForm}
                  disabled={hospitalLoading}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-ink text-sm font-semibold hover:bg-white disabled:opacity-60 transition-colors"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        )}

        {hospitals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <div className="text-4xl mb-3">🏥</div>
            <h3 className="font-display font-bold text-lg text-ink">
              No hospitals found
            </h3>
            <p className="text-sm text-muted mt-1">
              Add your first hospital using the button above.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">

            {hospitals.map(hospital => (
              <div
                key={hospital.hospital_id}
                className="border border-slate-100 rounded-2xl p-5 hover:shadow-sm transition-shadow"
              >

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">

                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 grid place-items-center shrink-0">
                      <FaHospital size={21} />
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-ink">
                        {hospital.hospital_name || 'Unknown Hospital'}
                      </h3>
                      <p className="text-sm text-primary-600 font-semibold">
                        {hospital.city || 'City not available'}
                      </p>
                    </div>

                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    ID #{hospital.hospital_id}
                  </span>
                </div>

                <div className="mt-5 space-y-2">

                  <p className="text-sm text-ink/70">
                    <span className="font-semibold text-ink">Address:</span>{' '}
                    {hospital.address || 'Not available'}
                  </p>

                  <p className="text-sm text-ink/70">
                    <span className="font-semibold text-ink">Contact:</span>{' '}
                    {hospital.contact_number || 'Not available'}
                  </p>

                  <p className="text-sm text-ink/70 break-all">
                    <span className="font-semibold text-ink">Email:</span>{' '}
                    {hospital.email || 'Not available'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-muted">Total Beds</p>
                      <p className="text-lg font-display font-extrabold text-ink mt-1">
                        {hospital.total_beds ?? 0}
                      </p>
                    </div>

                    <div className="rounded-xl bg-green-50 p-3">
                      <p className="text-xs text-green-700">Available Beds</p>
                      <p className="text-lg font-display font-extrabold text-green-700 mt-1">
                        {hospital.available_beds ?? 0}
                      </p>
                    </div>

                  </div>
                </div>

                <div className="mt-5 flex gap-3">

                  <button
                    type="button"
                    onClick={() => openEditHospital(hospital)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary-200 text-primary-600 text-sm font-semibold hover:bg-primary-50 transition-colors"
                  >
                    <FaEdit size={13} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteHospital(hospital)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
                  >
                    <FaTrash size={13} />
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>


      {/* ================================================= */}
      {/* ADMIN INFORMATION */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl shadow-card p-6">

        <h2 className="text-lg font-display font-bold text-ink">
          Admin Information
        </h2>


        <div className="mt-4 grid sm:grid-cols-2 gap-4">


          <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs text-muted">
              Logged in as
            </p>

            <p className="font-semibold text-ink mt-1">

              {user.full_name ||
                user.name ||
                'Administrator'}

            </p>

          </div>


          <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs text-muted">
              Email
            </p>

            <p className="font-semibold text-ink mt-1">

              {user.email ||
                'Not available'}

            </p>

          </div>

        </div>

      </div>

    </div>

  )

}


// =====================================================
// DASHBOARD CARD
// =====================================================

function DashboardCard({
  icon,
  label,
  value
}) {

  return (

    <div className="bg-white rounded-2xl shadow-card p-5">


      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 grid place-items-center mb-4">

        {icon}

      </div>


      <p className="text-sm text-muted">
        {label}
      </p>


      <p className="text-2xl font-display font-extrabold text-ink mt-1">

        {value}

      </p>

    </div>

  )

}