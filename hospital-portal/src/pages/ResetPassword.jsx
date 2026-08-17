import { useState } from 'react'
import {
  Link,
  useNavigate,
  useSearchParams
} from 'react-router-dom'

import { api } from '../api.js'

export default function ResetPassword() {
  const navigate = useNavigate()

  const [searchParams] =
    useSearchParams()

  const email =
    searchParams.get('email') || ''

  const [otp, setOtp] = useState('')

  const [resetToken, setResetToken] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [resending, setResending] =
    useState(false)

  const [otpVerified, setOtpVerified] =
    useState(false)

  const [error, setError] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [countdown, setCountdown] =
    useState(0)


  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerifyOTP = async (e) => {
    e.preventDefault()

    setError('')
    setMessage('')

    if (!email) {
      setError(
        'Email address is missing. Please start again.'
      )
      return
    }

    if (!otp.trim()) {
      setError('Please enter the OTP.')
      return
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError(
        'OTP must contain exactly 6 digits.'
      )
      return
    }

    try {

      setLoading(true)

      const data =
        await api.verifyResetOTP(
          email,
          otp.trim()
        )

      setResetToken(
        data.resetToken
      )

      setOtpVerified(true)

      setMessage(
        'OTP verified. You can now create a new password.'
      )

    } catch (err) {

      console.error(
        'Reset OTP error:',
        err
      )

      setError(
        err.message ||
        'Invalid or expired OTP.'
      )

    } finally {

      setLoading(false)

    }
  }


  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResend = async () => {

    setError('')
    setMessage('')

    if (!email) {
      setError(
        'Email address is missing. Please start again.'
      )
      return
    }

    if (countdown > 0) {
      return
    }

    try {

      setResending(true)

      const data =
        await api.forgotPassword(
          email
        )

      setMessage(
        data.message ||
        'A new OTP has been sent to your email.'
      )

      setCountdown(30)

      const interval =
        setInterval(() => {

          setCountdown((current) => {

            if (current <= 1) {

              clearInterval(interval)

              return 0
            }

            return current - 1

          })

        }, 1000)

    } catch (err) {

      console.error(
        'Resend OTP error:',
        err
      )

      setError(
        err.message ||
        'Unable to resend OTP.'
      )

    } finally {

      setResending(false)

    }
  }


  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleResetPassword = async (e) => {

    e.preventDefault()

    setError('')
    setMessage('')

    if (!resetToken) {

      setError(
        'Please verify the OTP first.'
      )

      return
    }

    if (!password || !confirmPassword) {

      setError(
        'Please enter both password fields.'
      )

      return
    }

    if (password.length < 6) {

      setError(
        'Password must be at least 6 characters.'
      )

      return
    }

    if (password !== confirmPassword) {

      setError(
        'Passwords do not match.'
      )

      return
    }

    try {

      setLoading(true)

      const data =
        await api.resetPassword(
          resetToken,
          password
        )

      setMessage(
        data.message ||
        'Password reset successfully.'
      )

      setTimeout(() => {

        navigate('/login')

      }, 1500)

    } catch (err) {

      console.error(
        'Reset password error:',
        err
      )

      setError(
        err.message ||
        'Unable to reset password.'
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
              {otpVerified
                ? 'Create New Password'
                : 'Verify OTP'}
            </h1>

            <p className="mt-2 text-sm text-ink/60">

              {otpVerified
                ? 'Enter a new password for your account.'
                : 'Enter the 6-digit OTP sent to your email.'}

            </p>

            {email && !otpVerified && (
              <p className="mt-1 text-sm font-semibold text-primary-600 break-all">
                {email}
              </p>
            )}

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
          {/* SUCCESS */}
          {/* ================================================= */}

          {message && (

            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">

              {message}

            </div>

          )}


          {/* ================================================= */}
          {/* OTP FORM */}
          {/* ================================================= */}

          {!otpVerified && (

            <form
              onSubmit={handleVerifyOTP}
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
                  : 'Verify OTP'}

              </button>

            </form>

          )}


          {/* ================================================= */}
          {/* RESEND OTP */}
          {/* ================================================= */}

          {!otpVerified && (

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

          )}


          {/* ================================================= */}
          {/* NEW PASSWORD FORM */}
          {/* ================================================= */}

          {otpVerified && (

            <form
              onSubmit={handleResetPassword}
              className="space-y-5"
            >

              <div>

                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-ink mb-2"
                >
                  New Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition"
                />

              </div>


              <div>

                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-ink mb-2"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition"
                />

              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 transition-colors"
              >

                {loading
                  ? 'Resetting...'
                  : 'Reset Password'}

              </button>

            </form>

          )}


          {/* ================================================= */}
          {/* BACK TO LOGIN */}
          {/* ================================================= */}

          <div className="text-center mt-6">

            <Link
              to="/login"
              className="text-sm text-primary-600 font-semibold hover:underline"
            >
              ← Back to Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  )
}