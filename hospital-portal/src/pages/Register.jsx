import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api.js'

export default function Register() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()

    setError('')

    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    try {
      setLoading(true)

      const data = await api.register(
        fullName.trim(),
        email.trim(),
        password
      )

      console.log('Registration response:', data)

      /*
       * The backend now sends:
       *
       * requiresVerification: true
       *
       * after sending the OTP.
       */

      if (data.requiresVerification) {
        navigate(
          `/verify-otp?email=${encodeURIComponent(
            email.trim()
          )}`
        )

        return
      }

      // Fallback in case backend returns
      // a normal successful registration.
      navigate('/login')

    } catch (err) {
      console.error('Registration error:', err)

      setError(
        err.message ||
        'Registration failed. Please try again.'
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-12 bg-slate-50">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {/* Heading */}

          <div className="text-center mb-8">

            <h1 className="font-display text-2xl font-extrabold text-ink">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-ink/60">
              Create your MediFind account
            </p>

          </div>


          {/* Error */}

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}


          {/* Form */}

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* Full Name */}

            <div>

              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-ink mb-2"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="Enter your full name"
                autoComplete="name"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition"
              />

            </div>


            {/* Email */}

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


            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-semibold text-ink mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create a password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition"
              />

            </div>


            {/* Confirm Password */}

            <div>

              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-ink mb-2"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition"
              />

            </div>


            {/* Register Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 transition-colors"
            >
              {loading
                ? 'Sending OTP...'
                : 'Create Account'}
            </button>

          </form>


          {/* Login */}

          <p className="text-center text-sm text-ink/60 mt-6">

            Already have an account?{' '}

            <Link
              to="/login"
              className="text-primary-600 font-semibold hover:underline"
            >
              Login
            </Link>

          </p>


          {/* Home */}

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