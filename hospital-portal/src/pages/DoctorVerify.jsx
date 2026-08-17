import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  FaEnvelope,
  FaShieldAlt,
  FaCheckCircle,
  FaLock,
} from 'react-icons/fa'
import { api } from '../api.js'

export default function DoctorVerify() {

  const navigate = useNavigate()

  const [searchParams] =
    useSearchParams()

  const emailFromAdmin =
    searchParams.get('email') || ''

  const [email, setEmail] =
    useState(emailFromAdmin)

  const [otp, setOtp] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [resending, setResending] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  const [verified, setVerified] =
    useState(false)


  // =====================================================
  // VERIFY OTP + CREATE PASSWORD
  // =====================================================

  const handleVerify = async (e) => {

    e.preventDefault()

    setMessage('')
    setError('')

    const cleanEmail =
      email.trim().toLowerCase()

    const cleanOTP =
      otp.trim()


    // =====================================================
    // EMAIL VALIDATION
    // =====================================================

    if (!cleanEmail) {

      setError(
        'Please enter your email address.'
      )

      return
    }


    // =====================================================
    // OTP VALIDATION
    // =====================================================

    if (!/^\d{6}$/.test(cleanOTP)) {

      setError(
        'Please enter the 6-digit OTP.'
      )

      return
    }


    // =====================================================
    // PASSWORD VALIDATION
    // =====================================================

    if (!password) {

      setError(
        'Please create a password.'
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


    // =====================================================
    // VERIFY
    // =====================================================

    try {

      setLoading(true)


      const result =
        await api.verifyDoctorEmail(
          cleanEmail,
          cleanOTP,
          password
        )


      setVerified(true)

      setMessage(
        result.message ||
          'Doctor account verified successfully.'
      )

      setOtp('')
      setPassword('')
      setConfirmPassword('')


      // Redirect to login after 2 seconds

      setTimeout(() => {

        navigate('/login', {
          replace: true
        })

      }, 2000)


    } catch (err) {

      console.error(
        'Doctor verification error:',
        err
      )

      setError(
        err.message ||
          'Unable to verify the doctor account.'
      )

    } finally {

      setLoading(false)

    }

  }


  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResend = async () => {

    setMessage('')
    setError('')

    const cleanEmail =
      email.trim().toLowerCase()


    if (!cleanEmail) {

      setError(
        'Enter the doctor email first.'
      )

      return
    }


    try {

      setResending(true)


      const result =
        await api.resendDoctorVerification(
          cleanEmail
        )


      setMessage(
        result.message ||
          'A new OTP has been sent to your email.'
      )

      setOtp('')


    } catch (err) {

      console.error(
        'Resend OTP error:',
        err
      )

      setError(
        err.message ||
          'Unable to resend the OTP.'
      )

    } finally {

      setResending(false)

    }

  }


  // =====================================================
  // VERIFIED SCREEN
  // =====================================================

  if (verified) {

    return (

      <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 bg-slate-50">

        <div className="w-full max-w-lg bg-white rounded-3xl shadow-card p-8 sm:p-10 text-center">

          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-100 text-green-600 grid place-items-center">

            <FaCheckCircle size={42} />

          </div>


          <h1 className="text-3xl font-display font-extrabold text-ink mb-3">

            Doctor Account Verified!

          </h1>


          <p className="text-muted mb-4">

            Your email has been verified and your
            doctor account password has been created.

          </p>


          <p className="text-sm text-primary-600 font-semibold">

            Redirecting you to Doctor Login...

          </p>


          <button
            onClick={() =>
              navigate('/login', {
                replace: true
              })
            }
            className="mt-6 w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
          >

            Go to Doctor Login

          </button>

        </div>

      </div>

    )

  }


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (

    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 bg-slate-50">

      <div className="w-full max-w-lg">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="text-center mb-8">

          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 grid place-items-center">

            <FaShieldAlt size={28} />

          </div>


          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-ink mb-3">

            Verify Doctor Account

          </h1>


          <p className="text-muted">

            Enter the OTP sent to your email
            and create a password for your
            MediFind doctor account.

          </p>

        </div>


        {/* ================================================= */}
        {/* CARD */}
        {/* ================================================= */}

        <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8">

          <form
            onSubmit={handleVerify}
            className="space-y-5"
          >


            {/* ================================================= */}
            {/* EMAIL */}
            {/* ================================================= */}

            <div>

              <label className="block text-sm font-semibold text-ink mb-2">

                Doctor Email

              </label>


              <div className="relative">

                <FaEnvelope
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />


                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="doctor@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                  required
                />

              </div>

            </div>


            {/* ================================================= */}
            {/* OTP */}
            {/* ================================================= */}

            <div>

              <label className="block text-sm font-semibold text-ink mb-2">

                Verification OTP

              </label>


              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {

                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ''
                    )

                  setOtp(value)

                }}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition text-center text-2xl font-bold tracking-[0.5em]"
              />


              <p className="text-xs text-muted mt-2">

                The OTP is valid for 10 minutes.

              </p>

            </div>


            {/* ================================================= */}
            {/* NEW PASSWORD */}
            {/* ================================================= */}

            <div>

              <label className="block text-sm font-semibold text-ink mb-2">

                Create Password

              </label>


              <div className="relative">

                <FaLock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={15}
                />


                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create your password"
                  autoComplete="new-password"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                />

              </div>


              <p className="text-xs text-muted mt-2">

                Password must be at least 6 characters.

              </p>

            </div>


            {/* ================================================= */}
            {/* CONFIRM PASSWORD */}
            {/* ================================================= */}

            <div>

              <label className="block text-sm font-semibold text-ink mb-2">

                Confirm Password

              </label>


              <div className="relative">

                <FaLock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={15}
                />


                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                />

              </div>

            </div>


            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (

              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">

                {error}

              </div>

            )}


            {/* ================================================= */}
            {/* SUCCESS */}
            {/* ================================================= */}

            {message && (

              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">

                {message}

              </div>

            )}


            {/* ================================================= */}
            {/* VERIFY + SET PASSWORD */}
            {/* ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >

              {loading
                ? 'Verifying...'
                : 'Verify & Create Password'}

            </button>


            {/* ================================================= */}
            {/* RESEND */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || loading}
              className="w-full py-3.5 rounded-xl border border-primary-200 text-primary-600 font-semibold hover:bg-primary-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >

              {resending
                ? 'Sending...'
                : 'Resend OTP'}

            </button>

          </form>

        </div>

      </div>

    </div>

  )

}