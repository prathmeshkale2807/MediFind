import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [searchParams] =
    useSearchParams()

  const email =
    searchParams.get('email') || ''

  useEffect(() => {
    // If an email was provided, go directly
    // to the OTP/reset page.
    if (email) {
      navigate(
        `/reset-password?email=${encodeURIComponent(email)}`,
        { replace: true }
      )
    } else {
      // If no email was provided,
      // return to Login.
      navigate('/login', {
        replace: true
      })
    }
  }, [email, navigate])

  return null
}