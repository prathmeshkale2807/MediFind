import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'

export default function DoctorAppointments() {

  const navigate = useNavigate()

 const [appointments, setAppointments] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')


  // =====================================================
  // LOAD DOCTOR APPOINTMENTS
  // =====================================================
const loadAppointments = async () => {
  try {
    setLoading(true)
    setError('')

    const data = await api.getDoctorAppointments()

    const appointmentList = Array.isArray(data)
      ? data
      : Array.isArray(data?.appointments)
        ? data.appointments
        : []

    setAppointments(appointmentList)

  } catch (err) {
    console.error(
      'Doctor appointments error:',
      err
    )

    setAppointments([])

    setError(
      err.message ||
      'Unable to load appointments.'
    )

  } finally {
    setLoading(false)
  }
}

  // =====================================================
  // CHECK DOCTOR LOGIN
  // =====================================================

  useEffect(() => {

    const token =
      localStorage.getItem('token')

    const savedUser =
      localStorage.getItem('user')

    if (!token || !savedUser) {

      navigate('/login', {
        replace: true
      })

      return

    }


    try {

      const user =
        JSON.parse(savedUser)

      if (user.role !== 'doctor') {

        navigate('/', {
          replace: true
        })

        return

      }

    } catch {

      localStorage.removeItem('token')
      localStorage.removeItem('user')

      navigate('/login', {
        replace: true
      })

      return

    }


    loadAppointments()

  }, [navigate])


  // =====================================================
  // UPDATE APPOINTMENT STATUS
  // =====================================================

 // =====================================================
// UPDATE APPOINTMENT STATUS
// =====================================================

const updateStatus = async (
  appointmentId,
  status
) => {

  // ---------------------------------------------------
  // Prevent duplicate clicks
  // ---------------------------------------------------

  if (updatingId === appointmentId) {
    return
  }


  // ---------------------------------------------------
  // Save old appointment in case request fails
  // ---------------------------------------------------
const oldAppointment =
  (Array.isArray(appointments)
    ? appointments
    : []
  ).find(
      (appointment) =>
        Number(appointment.appointment_id) ===
        Number(appointmentId)
    )


  if (!oldAppointment) {
    return
  }


  try {

    setUpdatingId(appointmentId)

    setError('')


    // =================================================
    // OPTIMISTIC UI UPDATE
    // =================================================
    // Change the screen immediately.
    // The doctor doesn't have to wait for the server.

    setAppointments((current) =>
      current.map((appointment) =>

        Number(
          appointment.appointment_id
        ) === Number(appointmentId)

          ? {
              ...appointment,
              status
            }

          : appointment

      )
    )


    // =================================================
    // SEND REQUEST TO SERVER
    // =================================================

    await api.updateDoctorAppointmentStatus(
      appointmentId,
      status
    )


    // =================================================
    // SUCCESS
    // =================================================

    console.log(
      `Appointment ${appointmentId} updated to ${status}`
    )


  } catch (err) {

    console.error(
      'Status update error:',
      err
    )


    // =================================================
    // ROLLBACK UI IF SERVER FAILS
    // =================================================

    setAppointments((current) =>
      current.map((appointment) =>

        Number(
          appointment.appointment_id
        ) === Number(appointmentId)

          ? oldAppointment

          : appointment

      )
    )


    setError(
      err.message ||
      'Unable to update appointment status.'
    )


  } finally {

    setUpdatingId(null)

  }

}


  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {

    if (!date)
      return 'Not available'


    try {

      return new Date(date).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      )

    } catch {

      return date

    }

  }


  // =====================================================
  // TIME FORMAT
  // =====================================================

  const formatTime = (time) => {

    if (!time)
      return 'Not available'

    return String(time).slice(0, 5)

  }


  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {

    switch (status) {

      case 'confirmed':

        return (
          'bg-green-50 text-green-700 border-green-200'
        )


      case 'rejected':

        return (
          'bg-red-50 text-red-700 border-red-200'
        )


      case 'completed':

        return (
          'bg-blue-50 text-blue-700 border-blue-200'
        )


      case 'cancelled':

        return (
          'bg-slate-100 text-slate-600 border-slate-200'
        )


      default:

        return (
          'bg-yellow-50 text-yellow-700 border-yellow-200'
        )

    }

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

     <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 sm:px-5 py-8 sm:py-10">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-ink/60">
            Loading your appointments...
          </p>

        </div>

      </div>

    )

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

  <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 sm:px-5 py-8 sm:py-10">

      <div className="max-w-6xl mx-auto">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-primary-600 mb-2">
            Doctor Dashboard
          </p>

          <h1 className="font-display text-3xl font-extrabold text-ink">
            My Appointments
          </h1>

          <p className="mt-2 text-sm text-ink/60">
            Review patient appointments and manage their status.
          </p>

        </div>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (

          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">

            {error}

          </div>

        )}


        {/* ================================================= */}
        {/* EMPTY STATE */}
        {/* ================================================= */}

        {(Array.isArray(appointments)
  ? appointments
  : []
).length === 0 ? (

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">

            <div className="text-4xl mb-4">
              📅
            </div>

            <h2 className="font-display text-xl font-bold text-ink">
              No appointments yet
            </h2>

            <p className="mt-2 text-sm text-ink/60">
              You don't have any appointments assigned to you.
            </p>

          </div>

        ) : (

          <div className="grid gap-5">


            {/* ================================================= */}
            {/* APPOINTMENT CARDS */}
            {/* ================================================= */}

            {(Array.isArray(appointments)
  ? appointments
  : []
).map((appointment) => (

              <div
                key={appointment.appointment_id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">


                  {/* ================================================= */}
                  {/* PATIENT INFO */}
                  {/* ================================================= */}

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-3 mb-4">

                      <h2 className="font-display text-xl font-bold text-ink">

                        {appointment.patient_name ||
                          'Patient'}

                      </h2>


                      <span
                        className={`
                          px-3
                          py-1
                          rounded-full
                          border
                          text-xs
                          font-semibold
                          capitalize
                          ${getStatusStyle(
                            appointment.status
                          )}
                        `}
                      >

                        {appointment.status ||
                          'pending'}

                      </span>

                    </div>


                    {/* ================================================= */}
                    {/* DATE / TIME */}
                    {/* ================================================= */}

                    <div className="grid sm:grid-cols-2 gap-3 mb-4">


                      {/* DATE */}

                      <div className="rounded-xl bg-slate-50 px-4 py-3">

                        <p className="text-xs text-ink/50 mb-1">
                          Appointment Date
                        </p>

                        <p className="text-sm font-semibold text-ink">

                          📅 {formatDate(
                            appointment.appointment_date
                          )}

                        </p>

                      </div>


                      {/* TIME */}

                      <div className="rounded-xl bg-slate-50 px-4 py-3">

                        <p className="text-xs text-ink/50 mb-1">
                          Appointment Time
                        </p>

                        <p className="text-sm font-semibold text-ink">

                          🕐 {formatTime(
                            appointment.appointment_time
                          )}

                        </p>

                      </div>

                    </div>


                    {/* ================================================= */}
                    {/* PATIENT DETAILS */}
                    {/* ================================================= */}

                    <div className="space-y-2">


                      {appointment.patient_email && (

                        <p className="text-sm text-ink/70">

                          <span className="font-semibold">
                            Email:
                          </span>{' '}

                          {appointment.patient_email}

                        </p>

                      )}


                      {appointment.patient_phone && (

                        <p className="text-sm text-ink/70">

                          <span className="font-semibold">
                            Phone:
                          </span>{' '}

                          {appointment.patient_phone}

                        </p>

                      )}


                      {appointment.reason && (

                        <p className="text-sm text-ink/70">

                          <span className="font-semibold">
                            Problem:
                          </span>{' '}

                          {appointment.reason}

                        </p>

                      )}

                    </div>

                  </div>


                  {/* ================================================= */}
                  {/* ACTIONS */}
                  {/* ================================================= */}

                  <div className="lg:w-64">


                    {/* ================================================= */}
                    {/* PENDING */}
                    {/* ================================================= */}

                    {appointment.status === 'pending' && (

                      <div className="flex flex-col gap-3">


                        {/* ACCEPT */}

                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            appointment.appointment_id
                          }
                          onClick={() =>
                            updateStatus(
                              appointment.appointment_id,
                              'confirmed'
                            )
                          }
                          className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 transition-colors"
                        >

                          {updatingId ===
                          appointment.appointment_id

                            ? 'Updating...'

                            : '✓ Accept Appointment'}

                        </button>


                        {/* REJECT */}

                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            appointment.appointment_id
                          }
                          onClick={() =>
                            updateStatus(
                              appointment.appointment_id,
                              'rejected'
                            )
                          }
                          className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-60 transition-colors"
                        >

                          {updatingId ===
                          appointment.appointment_id

                            ? 'Updating...'

                            : '✕ Reject Appointment'}

                        </button>

                        <button
  type="button"
  onClick={loadAppointments}
  disabled={loading}
  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50"
>
  🔄 Refresh
</button>

                      </div>

                    )}


                    {/* ================================================= */}
                    {/* CONFIRMED */}
                    {/* ================================================= */}

                    {appointment.status === 'confirmed' && (

                      <div className="flex flex-col gap-3">


                        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">

                          <p className="text-xs text-green-600 mb-1">
                            Appointment Status
                          </p>

                          <p className="text-sm font-bold text-green-700">
                            ✓ Confirmed
                          </p>

                        </div>


                        {/* COMPLETE */}

                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            appointment.appointment_id
                          }
                          onClick={() =>
                            updateStatus(
                              appointment.appointment_id,
                              'completed'
                            )
                          }
                          className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 transition-colors"
                        >

                          {updatingId ===
                          appointment.appointment_id

                            ? 'Updating...'

                            : '✓ Mark as Completed'}

                        </button>

                      </div>

                    )}


                    {/* ================================================= */}
                    {/* REJECTED */}
                    {/* ================================================= */}

                    {appointment.status === 'rejected' && (

                      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">

                        <p className="text-xs text-red-600 mb-1">
                          Appointment Status
                        </p>

                        <p className="text-sm font-bold text-red-700">
                          ✕ Rejected
                        </p>

                      </div>

                    )}


                    {/* ================================================= */}
                    {/* COMPLETED */}
                    {/* ================================================= */}

                    {appointment.status === 'completed' && (

                      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-center">

                        <p className="text-xs text-blue-600 mb-1">
                          Appointment Status
                        </p>

                        <p className="text-sm font-bold text-blue-700">
                          ✓ Completed
                        </p>

                      </div>

                    )}


                    {/* ================================================= */}
                    {/* CANCELLED */}
                    {/* ================================================= */}

                    {appointment.status === 'cancelled' && (

                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">

                        <p className="text-xs text-slate-500 mb-1">
                          Appointment Status
                        </p>

                        <p className="text-sm font-bold text-slate-600">
                          Cancelled
                        </p>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  )

}