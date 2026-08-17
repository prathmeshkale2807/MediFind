import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  FaLock,
  FaCheckCircle,
  FaUserMd
} from 'react-icons/fa'
import { api } from '../api.js'

export default function DoctorActivate() {

  const navigate = useNavigate()

  const [searchParams] =
    useSearchParams()

  const token =
    searchParams.get('token') || ''


  const [password, setPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState(false)


  const handleSubmit = async (e) => {

    e.preventDefault()

    setError('')


    if (!token) {

      setError(
        'Invalid activation link.'
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


      await api.activateDoctorAccount(
        token,
        password
      )


      setSuccess(true)


      setTimeout(() => {

        navigate('/login', {
          replace: true
        })

      }, 2500)


    } catch (err) {

      console.error(
        'Doctor activation error:',
        err
      )

      setError(
        err.message ||
        'Unable to activate your account.'
      )

    } finally {

      setLoading(false)

    }

  }


  if (success) {

    return (

      <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 bg-slate-50">

        <div className="w-full max-w-lg bg-white rounded-3xl shadow-card p-8 text-center">

          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-100 text-green-600 grid place-items-center">

            <FaCheckCircle size={42} />

          </div>


          <h1 className="text-3xl font-display font-extrabold text-ink mb-3">

            Account Activated!

          </h1>


          <p className="text-muted mb-4">

            Your MediFind doctor account is ready.

          </p>


          <p className="text-sm text-primary-600 font-semibold">

            Redirecting to Doctor Login...

          </p>


          <button
            onClick={() =>
              navigate('/login', {
                replace: true
              })
            }
            className="mt-6 w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
          >

            Go to Doctor Login

          </button>

        </div>

      </div>

    )

  }


  return (

    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 bg-slate-50">

      <div className="w-full max-w-lg">

        <div className="text-center mb-8">

          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 grid place-items-center">

            <FaUserMd size={28} />

          </div>


          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-ink mb-3">

            Activate Doctor Account

          </h1>


          <p className="text-muted">

            Create your password to activate
            your MediFind doctor account.

          </p>

        </div>


        <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

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
                  placeholder="Create password"
                  autoComplete="new-password"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />

              </div>

            </div>


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
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />

              </div>

            </div>


            {error && (

              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">

                {error}

              </div>

            )}


            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60 transition"
            >

              {loading
                ? 'Activating...'
                : 'Activate Account'}

            </button>

          </form>

        </div>

      </div>

    </div>

  )

}