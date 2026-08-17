import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api.js'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

try {
  setLoading(true)

  const data = await api.login(
    email.trim(),
    password
  )

  console.log('Login successful:', data)

  // Normal successful login
  if (data.requiresVerification) {

    if (data.doctorVerification) {
      navigate(
        `/doctor-verify?email=${encodeURIComponent(
          data.email || email.trim()
        )}`
      )
    } else {
      navigate(
        `/verify-otp?email=${encodeURIComponent(
          data.email || email.trim()
        )}`
      )
    }

    return
  }

      // =================================================
      // SAVE TOKEN
      // =================================================

      if (data.token) {
        localStorage.setItem(
          'token',
          data.token
        )
      }

      // =================================================
      // SAVE USER
      // =================================================

      if (data.user) {
        localStorage.setItem(
          'user',
          JSON.stringify(data.user)
        )
      }

      // =================================================
      // UPDATE NAVBAR
      // =================================================

      window.dispatchEvent(
        new Event('auth-change')
      )

   // =================================================
// ROLE-BASED REDIRECT
// =================================================

const userRole =
  data.user?.role?.toLowerCase()

if (userRole === 'doctor') {

  navigate('/doctor-portal')

} else if (userRole === 'admin') {

  navigate('/admin')

} else {

  navigate('/')

}

} catch (err) {

  console.error('Login error:', err)

  // ==========================================
  // DOCTOR EMAIL VERIFICATION REQUIRED
  // ==========================================

  if (
    err.status === 403 &&
    err.requiresVerification &&
    err.doctorVerification
  ) {

    navigate(
      `/doctor-verify?email=${encodeURIComponent(
        err.email || email.trim()
      )}`
    )

    return
  }

  // ==========================================
  // NORMAL USER EMAIL VERIFICATION
  // ==========================================

  if (
    err.status === 403 &&
    err.requiresVerification
  ) {

    navigate(
      `/verify-otp?email=${encodeURIComponent(
        err.email || email.trim()
      )}`
    )

    return
  }

  setError(
    err.message ||
    'Login failed. Please check your email and password.'
  )

} finally {

  setLoading(false)

}

  }


  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = async () => {

    setError('')

    // User must enter email first
    if (!email.trim()) {

      setError(
        'Please enter your email first.'
      )

      return
    }

    try {

      setLoading(true)

      console.log(
        'Sending password reset OTP to:',
        email.trim()
      )

      // Send OTP directly to entered email
      await api.forgotPassword(
        email.trim()
      )

      // Open OTP page directly
      navigate(
        `/reset-password?email=${encodeURIComponent(
          email.trim()
        )}`
      )

    } catch (err) {

      console.error(
        'Forgot password error:',
        err
      )

      setError(
        err.message ||
        'Unable to send OTP. Please try again.'
      )

    } finally {

      setLoading(false)

    }
  }


  return (

    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-12 bg-slate-50">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">


          {/* ================================================= */}
          {/* HEADING */}
          {/* ================================================= */}

          <div className="text-center mb-8">

            <h1 className="font-display text-2xl font-extrabold text-ink">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-ink/60">
              Login to your MediFind account
            </p>

          </div>


          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (

            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">

              {error}

            </div>

          )}


          {/* ================================================= */}
          {/* FORM */}
          {/* ================================================= */}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >


            {/* ================================================= */}
            {/* EMAIL */}
            {/* ================================================= */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-semibold text-ink mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition"
              />

            </div>


            {/* ================================================= */}
            {/* PASSWORD */}
            {/* ================================================= */}

            <div>

              <div className="flex items-center justify-between mb-2">

                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-ink"
                >
                  Password
                </label>


                {/* FORGOT PASSWORD */}

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-xs font-semibold text-primary-600 hover:underline disabled:opacity-50"
                >
                  Forgot Password?
                </button>

              </div>


              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition"
              />

            </div>


            {/* ================================================= */}
            {/* LOGIN BUTTON */}
            {/* ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 transition-colors"
            >

              {loading
                ? 'Logging in...'
                : 'Login'}

            </button>

          </form>


          {/* ================================================= */}
          {/* REGISTER */}
          {/* ================================================= */}

          <p className="text-center text-sm text-ink/60 mt-6">

            Don't have an account?{' '}

            <Link
              to="/register"
              className="text-primary-600 font-semibold hover:underline"
            >
              Register
            </Link>

          </p>


          {/* ================================================= */}
          {/* BACK TO HOME */}
          {/* ================================================= */}

          <div className="text-center mt-4">

            <Link
              to="/"
              className="text-sm text-ink/60 hover:text-primary-600 transition-colors"
            >
              ← Back to Home
            </Link>

          </div>

        </div>

      </div>

    </div>
  )
}