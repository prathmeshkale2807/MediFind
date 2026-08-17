import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useSearchParams
} from 'react-router-dom'

import { api } from '../api.js'

export default function VerifyOTP() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [countdown, setCountdown] = useState(0)

  // Start resend countdown when page opens
  useEffect(() => {
    setCountdown(30)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      return
    }

    const timer = setInterval(() => {
      setCountdown((current) => current - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleVerify = async (e) => {
    e.preventDefault()

    setError('')
    setMessage('')

    if (!email) {
      setError(
        'Email address is missing. Please register again.'
      )
      return
    }

    if (!otp.trim()) {
      setError('Please enter the OTP.')
      return
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('OTP must contain exactly 6 digits.')
      return
    }

    try {
      setLoading(true)

      const data = await api.verifyEmail(
        email,
        otp.trim()
      )

      setMessage(
        data.message ||
        'Email verified successfully!'
      )

      setTimeout(() => {
        navigate('/login')
      }, 1200)

    } catch (err) {
      console.error('OTP verification error:', err)

      setError(
        err.message ||
        'Invalid or expired OTP.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')

    if (!email) {
      setError(
        'Email address is missing. Please register again.'
      )
      return
    }

    if (countdown > 0) {
      return
    }

    try {
      setResending(true)

      const data =
        await api.resendVerification(email)

      setMessage(
        data.message ||
        'A new OTP has been sent to your email.'
      )

      setCountdown(30)

    } catch (err) {
      console.error('Resend OTP error:', err)

      setError(
        err.message ||
        'Unable to resend OTP.'
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-12 bg-slate-50">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {/* Heading */}

          <div className="text-center mb-8">

            <h1 className="font-display text-2xl font-extrabold text-ink">
              Verify Your Email
            </h1>

            <p className="mt-2 text-sm text-ink/60">
              We sent a 6-digit OTP to
            </p>

            <p className="mt-1 text-sm font-semibold text-primary-600 break-all">
              {email}
            </p>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}

          {message && (
            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {/* OTP Form */}

          <form
            onSubmit={handleVerify}
            className="space-y-5"
          >

            <div>

              <label
                htmlFor="otp"
                className="block text-sm font-semibold text-ink mb-2"
              >
                Enter OTP
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const value =
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6)

                  setOtp(value)
                }}
                placeholder="Enter 6-digit OTP"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center text-lg font-semibold tracking-[0.35em] outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 transition-colors"
            >
              {loading
                ? 'Verifying...'
                : 'Verify Email'}
            </button>

          </form>

          {/* Resend */}

          <div className="text-center mt-6">

            <p className="text-sm text-ink/60">
              Didn't receive the OTP?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={
                resending ||
                countdown > 0
              }
              className="mt-2 text-sm text-primary-600 font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {resending
                ? 'Sending...'
                : countdown > 0
                  ? `Resend OTP in ${countdown}s`
                  : 'Resend OTP'}
            </button>

          </div>

          {/* Back to Register */}

          <div className="text-center mt-5">

            <Link
              to="/register"
              className="text-sm text-ink/60 hover:text-primary-600 transition-colors"
            >
              ← Back to Register
            </Link>

          </div>

        </div>

      </div>

    </div>
  )
}