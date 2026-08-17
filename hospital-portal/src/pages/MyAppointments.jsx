import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaHospital,
  FaClipboardCheck,
  FaBell,
  FaSyncAlt
} from 'react-icons/fa'

import { api } from '../api.js'
import Loading from '../components/Loading.jsx'


export default function MyAppointments() {

  const [appointments, setAppointments] = useState([])

  const [loading, setLoading] = useState(true)

  const [refreshing, setRefreshing] = useState(false)

  const [error, setError] = useState('')


  // =====================================================
  // LOAD APPOINTMENTS
  // =====================================================

  useEffect(() => {

    loadAppointments()

  }, [])


  async function loadAppointments(
    showRefresh = false
  ) {

    try {

      if (showRefresh) {

        setRefreshing(true)

      } else {

        setLoading(true)

      }


      setError('')


      const data =
        await api.getMyAppointments()


      setAppointments(
        Array.isArray(data)
          ? data
          : data.appointments || []
      )


    } catch (err) {

      console.error(
        'Appointments error:',
        err
      )


      setError(
        err.message ||
        'Unable to load your appointments.'
      )


    } finally {

      setLoading(false)

      setRefreshing(false)

    }

  }


  // =====================================================
  // COUNTS
  // =====================================================

  const pendingCount =
    appointments.filter(
      appointment =>
        appointment.status === 'pending'
    ).length


  const confirmedCount =
    appointments.filter(
      appointment =>
        appointment.status === 'confirmed'
    ).length


  const completedCount =
    appointments.filter(
      appointment =>
        appointment.status === 'completed'
    ).length


  const rejectedCount =
    appointments.filter(
      appointment =>
        appointment.status === 'rejected' ||
        appointment.status === 'cancelled'
    ).length


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-16 sm:py-20">

        <Loading
          label="Loading your appointments..."
        />

      </div>

    )

  }


  return (

    <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-8 sm:py-12">


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">

        <div className="min-w-0">

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-ink">

            My Appointments

          </h1>


          <p className="text-sm sm:text-base text-muted mt-2">

            View and track your hospital appointments.

          </p>

        </div>


        {/* ================================================= */}
        {/* HEADER ACTIONS */}
        {/* ================================================= */}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">


          {/* NOTIFICATIONS */}

          <Link
            to="/notifications"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-ink hover:bg-slate-50 transition-colors w-full sm:w-auto"
          >

            <FaBell className="text-primary-600" />

            Notifications

          </Link>


          {/* REFRESH */}

          <button
            type="button"
            onClick={() =>
              loadAppointments(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors w-full sm:w-auto"
          >

            <FaSyncAlt
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            />

            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}

          </button>

        </div>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (

        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm break-words">

          {error}

        </div>

      )}


      {/* ================================================= */}
      {/* SUMMARY CARDS */}
      {/* ================================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">


        {/* PENDING */}

        <SummaryCard
          label="Pending"
          count={pendingCount}
          icon="⏳"
          className="bg-yellow-50 text-yellow-700"
        />


        {/* CONFIRMED */}

        <SummaryCard
          label="Confirmed"
          count={confirmedCount}
          icon="✅"
          className="bg-green-50 text-green-700"
        />


        {/* COMPLETED */}

        <SummaryCard
          label="Completed"
          count={completedCount}
          icon="🏁"
          className="bg-blue-50 text-blue-700"
        />


        {/* REJECTED */}

        <SummaryCard
          label="Rejected"
          count={rejectedCount}
          icon="❌"
          className="bg-red-50 text-red-700"
        />

      </div>


      {/* ================================================= */}
      {/* NO APPOINTMENTS */}
      {/* ================================================= */}

      {appointments.length === 0 ? (

        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-10 text-center">

          <FaClipboardCheck
            className="mx-auto text-primary-600 mb-4"
            size={48}
          />


          <h2 className="text-xl font-display font-bold text-ink">

            No appointments yet

          </h2>


          <p className="text-sm sm:text-base text-muted mt-2 mb-6">

            You haven't booked any appointments yet.

          </p>


          <Link
            to="/book-appointment"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors w-full sm:w-auto"
          >

            Book an Appointment

          </Link>

        </div>

      ) : (

        <div className="space-y-4 sm:space-y-5">


          {appointments.map(
            (appointment) => (

              <div
                key={
                  appointment.appointment_id
                }
                className={`
                  bg-white
                  rounded-2xl
                  shadow-card
                  p-4
                  sm:p-6
                  border-l-4
                  overflow-hidden

                  ${
                    appointment.status ===
                    'confirmed'

                      ? 'border-green-500'

                      : appointment.status ===
                        'completed'

                      ? 'border-blue-500'

                      : appointment.status ===
                        'rejected' ||
                        appointment.status ===
                        'cancelled'

                      ? 'border-red-500'

                      : 'border-yellow-500'
                  }
                `}
              >


                {/* ================================================= */}
                {/* APPOINTMENT HEADER */}
                {/* ================================================= */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">


                  <div className="min-w-0">

                    <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide break-words">

                      Appointment #{appointment.appointment_id}

                    </p>


                    <h2 className="text-lg sm:text-xl font-display font-bold text-ink mt-1 break-words">

                      Dr.{' '}

                      {appointment.doctor_name ||
                        'Doctor'}

                    </h2>


                    <p className="text-sm text-muted break-words">

                      {appointment.specialization ||
                        'Specialization not specified'}

                    </p>

                  </div>


                  <div className="shrink-0 self-start sm:self-auto">

                    <StatusBadge
                      status={
                        appointment.status
                      }
                    />

                  </div>

                </div>


                {/* ================================================= */}
                {/* DETAILS */}
                {/* ================================================= */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-muted">


                  {/* HOSPITAL */}

                  <div className="flex items-start gap-3 min-w-0">

                    <FaHospital
                      className="text-primary-600 shrink-0 mt-0.5"
                    />

                    <span className="break-words min-w-0">

                      {appointment.hospital_name ||
                        'Hospital not specified'}

                    </span>

                  </div>


                  {/* DATE */}

                  <div className="flex items-start gap-3 min-w-0">

                    <FaCalendarAlt
                      className="text-primary-600 shrink-0 mt-0.5"
                    />

                    <span className="break-words min-w-0">

                      {formatDate(
                        appointment.appointment_date
                      )}

                    </span>

                  </div>


                  {/* TIME */}

                  <div className="flex items-start gap-3 min-w-0">

                    <FaClock
                      className="text-primary-600 shrink-0 mt-0.5"
                    />

                    <span className="break-words min-w-0">

                      {formatTime(
                        appointment.appointment_time
                      )}

                    </span>

                  </div>


                  {/* REASON */}

                  {appointment.reason && (

                    <div className="flex items-start gap-3 min-w-0">

                      <FaUserMd
                        className="text-primary-600 shrink-0 mt-0.5"
                      />

                      <span className="break-words min-w-0">

                        {appointment.reason}

                      </span>

                    </div>

                  )}

                </div>


                {/* ================================================= */}
                {/* CONFIRMED MESSAGE */}
                {/* ================================================= */}

                {appointment.status ===
                  'confirmed' && (

                  <div className="mt-5 rounded-xl bg-green-50 border border-green-100 px-4 py-3">

                    <p className="text-sm font-semibold text-green-700">

                      ✅ Appointment Confirmed

                    </p>


                    <p className="text-xs sm:text-sm text-green-700/80 mt-1">

                      Your doctor has confirmed
                      this appointment.

                    </p>

                  </div>

                )}


                {/* ================================================= */}
                {/* REJECTED MESSAGE */}
                {/* ================================================= */}

                {(
                  appointment.status ===
                    'rejected' ||
                  appointment.status ===
                    'cancelled'
                ) && (

                  <div className="mt-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">

                    <p className="text-sm font-semibold text-red-700">

                      ❌ Appointment Rejected

                    </p>


                    <p className="text-xs sm:text-sm text-red-700/80 mt-1">

                      This appointment was not
                      accepted by the doctor.

                    </p>

                  </div>

                )}


                {/* ================================================= */}
                {/* COMPLETED MESSAGE */}
                {/* ================================================= */}

                {appointment.status ===
                  'completed' && (

                  <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">

                    <p className="text-sm font-semibold text-blue-700">

                      🏁 Appointment Completed

                    </p>


                    <p className="text-xs sm:text-sm text-blue-700/80 mt-1">

                      This appointment has been
                      completed.

                    </p>

                  </div>

                )}

              </div>

            )
          )}

        </div>

      )}

    </div>

  )

}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  label,
  count,
  icon,
  className
}) {

  return (

    <div className="bg-white rounded-2xl shadow-card p-4 sm:p-5 min-w-0">

      <div className="flex items-center justify-between gap-2">

        <div className="min-w-0">

          <p className="text-[10px] sm:text-xs font-semibold text-muted uppercase tracking-wide truncate">

            {label}

          </p>


          <p className="text-xl sm:text-2xl font-display font-extrabold text-ink mt-1">

            {count}

          </p>

        </div>


        <div
          className={`
            w-9
            h-9
            sm:w-11
            sm:h-11
            shrink-0
            rounded-xl
            flex
            items-center
            justify-center
            text-lg
            sm:text-xl
            ${className}
          `}
        >

          {icon}

        </div>

      </div>

    </div>

  )

}


// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status
}) {

  const styles = {

    pending:
      'bg-yellow-50 text-yellow-700',

    confirmed:
      'bg-green-50 text-green-700',

    completed:
      'bg-blue-50 text-blue-700',

    rejected:
      'bg-red-50 text-red-700',

    cancelled:
      'bg-red-50 text-red-700'

  }


  const labels = {

    pending:
      'Pending',

    confirmed:
      'Confirmed',

    completed:
      'Completed',

    rejected:
      'Rejected',

    cancelled:
      'Cancelled'

  }


  return (

    <span
      className={`
        inline-flex
        items-center
        justify-center
        px-3
        sm:px-4
        py-1.5
        sm:py-2
        rounded-full
        text-[11px]
        sm:text-xs
        font-semibold
        whitespace-nowrap

        ${
          styles[status] ||
          'bg-slate-100 text-slate-700'
        }
      `}
    >

      {labels[status] ||
        status ||
        'Pending'}

    </span>

  )

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(date) {

  if (!date) {

    return 'Date not available'

  }


  try {

    return new Date(
      date
    ).toLocaleDateString(
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
// FORMAT TIME
// =====================================================

function formatTime(time) {

  if (!time) {

    return 'Time not available'

  }


  return String(time).slice(
    0,
    5
  )

}