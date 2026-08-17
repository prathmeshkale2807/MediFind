import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({
  children,
  adminOnly = false,
  doctorOnly = false,
}) {
  const location = useLocation()

  const token = localStorage.getItem('token')
  const userString = localStorage.getItem('user')

  // Not logged in
  if (!token || !userString) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  let user

  try {
    user = JSON.parse(userString)
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  // Admin-only route
  if (
    adminOnly &&
    user.role !== 'admin'
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  // Doctor-only route
  if (
    doctorOnly &&
    user.role !== 'doctor'
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return children
}