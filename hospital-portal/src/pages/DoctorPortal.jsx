import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DoctorPortal() {

  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [doctor, setDoctor] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =====================================================
  // LOAD DOCTOR PROFILE
  // =====================================================

  useEffect(() => {

    const storedUser =
      localStorage.getItem('user')

    if (!storedUser) {

      navigate('/login', {
        replace: true
      })

      return

    }


    try {

      const parsedUser =
        JSON.parse(storedUser)

      setUser(parsedUser)

    } catch (error) {

      console.error(
        'Unable to read logged-in user:',
        error
      )

      navigate('/login', {
        replace: true
      })

      return

    }


    loadDoctorProfile()

  }, [navigate])


  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const loadDoctorProfile = async () => {

    try {

      setLoading(true)
      setError('')


      const token =
        localStorage.getItem('token')


      if (!token) {

        navigate('/login', {
          replace: true
        })

        return

      }


      const API_URL =
        import.meta.env.VITE_API_URL ||
        'http://localhost:3000'


      const response =
        await fetch(
          `${API_URL}/doctors/me`,
          {
            method: 'GET',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`
            }
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Unable to load doctor profile.'
        )

      }


      setDoctor(
        data.doctor
      )


    } catch (err) {

      console.error(
        'Doctor profile error:',
        err
      )

      setError(
        err.message ||
        'Unable to load doctor profile.'
      )


    } finally {

      setLoading(false)

    }

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      'token'
    )

    localStorage.removeItem(
      'user'
    )

    window.dispatchEvent(
      new Event('auth-change')
    )

    navigate('/login')

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-ink/60">
            Loading doctor profile...
          </p>

        </div>

      </div>

    )

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="min-h-screen bg-slate-50">


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-5 py-6">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-sm text-primary-600 font-semibold">
                Doctor Portal
              </p>
<h1 className="text-2xl font-extrabold text-ink mt-1">

  Welcome,{' '}

  {String(
    doctor?.full_name ||
    user?.full_name ||
    'Doctor'
  ).replace(/^(Dr\.?\s*)+/i, 'Dr. ')}

  {' '}👨‍⚕️

</h1>

              <p className="text-sm text-ink/60 mt-1">
                Manage your doctor profile and appointments.
              </p>

            </div>


            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-ink hover:bg-slate-50 transition"
            >
              Logout
            </button>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="max-w-7xl mx-auto px-5 py-8">


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (

          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">

            {error}

            <button
              onClick={loadDoctorProfile}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>

          </div>

        )}


        {/* ================================================= */}
        {/* PROFILE CARD */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">


          {/* PROFILE HEADER */}

          <div className="p-6 border-b border-slate-100">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                👨‍⚕️
              </div>

              <div>

                <p className="text-sm text-primary-600 font-semibold">
                  Doctor Profile
                </p>

                <h2 className="text-xl font-extrabold text-ink">
                  {doctor?.full_name || 'Doctor'}
                </h2>

                <p className="text-sm text-ink/60">
                  {doctor?.specialization ||
                    'Specialization not available'}
                </p>

              </div>

            </div>

          </div>


          {/* PROFILE INFORMATION */}

          <div className="p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">


              {/* EMAIL */}

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-semibold text-ink/50 uppercase">
                  Email
                </p>

                <p className="mt-1 text-sm font-semibold text-ink break-all">
                  {doctor?.email ||
                    user?.email ||
                    'Not available'}
                </p>

              </div>


              {/* PHONE */}

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-semibold text-ink/50 uppercase">
                  Phone
                </p>

                <p className="mt-1 text-sm font-semibold text-ink">
                  {doctor?.phone ||
                    'Not available'}
                </p>

              </div>


              {/* SPECIALIZATION */}

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-semibold text-ink/50 uppercase">
                  Specialization
                </p>

                <p className="mt-1 text-sm font-semibold text-ink">
                  {doctor?.specialization ||
                    'Not available'}
                </p>

              </div>


              {/* EXPERIENCE */}

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-semibold text-ink/50 uppercase">
                  Experience
                </p>

                <p className="mt-1 text-sm font-semibold text-ink">

                  {doctor?.experience != null
                    ? `${doctor.experience} years`
                    : 'Not available'}

                </p>

              </div>


              {/* HOSPITAL */}

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-semibold text-ink/50 uppercase">
                  Hospital
                </p>

                <p className="mt-1 text-sm font-semibold text-ink">
                  {doctor?.hospital_name ||
                    'Not assigned'}
                </p>

              </div>


              {/* HOSPITAL CITY */}

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-semibold text-ink/50 uppercase">
                  City
                </p>

                <p className="mt-1 text-sm font-semibold text-ink">
                  {doctor?.city ||
                    'Not available'}
                </p>

              </div>


            </div>


            {/* ================================================= */}
            {/* VERIFICATION */}
            {/* ================================================= */}

            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  ✅
                </div>

                <div>

                  <p className="font-bold text-green-700">
                    {doctor?.email_verified
                      ? 'Email Verified'
                      : 'Email Not Verified'}
                  </p>

                  <p className="text-sm text-green-700/70 mt-1">

                    {doctor?.email_verified
                      ? 'Your doctor email has been successfully verified.'
                      : 'Please verify your doctor email.'}

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================================= */}

        <div className="mt-8">

          <h2 className="text-lg font-bold text-ink">
            Quick Actions
          </h2>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">


            {/* APPOINTMENTS */}

            <button
              onClick={() =>
                navigate(
                  '/doctor-appointments'
                )
              }
              className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition"
            >

              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl mb-4">
                📅
              </div>

              <h3 className="font-bold text-lg text-ink">
                My Appointments
              </h3>

              <p className="text-sm text-ink/60 mt-2">
                View and manage your patient appointments.
              </p>

            </button>


            {/* REFRESH PROFILE */}

            <button
              onClick={
                loadDoctorProfile
              }
              className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition"
            >

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-4">
                🔄
              </div>

              <h3 className="font-bold text-lg text-ink">
                Refresh Profile
              </h3>

              <p className="text-sm text-ink/60 mt-2">
                Reload your latest doctor information from the database.
              </p>

            </button>


          </div>

        </div>


      </div>

    </div>

  )

}