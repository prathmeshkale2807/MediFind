import { useState, useEffect } from 'react'

import {
  Link,
  NavLink,
  useNavigate,
  useLocation
} from 'react-router-dom'

import {
  FaHospital,
  FaBars,
  FaTimes,
  FaBell
} from 'react-icons/fa'

import {
  motion,
  AnimatePresence
} from 'framer-motion'

import { api } from '../api.js'


// =====================================================
// MAIN NAVIGATION LINKS
// =====================================================

const links = [
  { to: '/', label: 'Home' },
  { to: '/smart-match', label: 'SmartMatch' },
  { to: '/hospitals', label: 'Hospitals' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/beds', label: 'Beds' },
  { to: '/book-appointment', label: 'Appointments' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]


export default function Navbar() {

  const [open, setOpen] = useState(false)


  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(() => {

    try {

      const savedUser =
        localStorage.getItem('user')

      return savedUser
        ? JSON.parse(savedUser)
        : null

    } catch {

      return null

    }

  })


  // =====================================================
  // NOTIFICATION COUNT
  // =====================================================

  const [unreadCount, setUnreadCount] =
    useState(0)


  const navigate = useNavigate()
  const location = useLocation()


  // =====================================================
  // LOAD UNREAD NOTIFICATION COUNT
  // =====================================================

  const loadUnreadNotifications = async () => {

    try {

      const token =
        localStorage.getItem('token')

      const savedUser =
        localStorage.getItem('user')


      // No login = no notifications

      if (!token || !savedUser) {

        setUnreadCount(0)

        return

      }


      const currentUser =
        JSON.parse(savedUser)


      // Notifications are for patients

      if (
        currentUser.role !== 'patient'
      ) {

        setUnreadCount(0)

        return

      }


      const data =
        await api.getUnreadNotificationCount()


      setUnreadCount(
        Number(data.count || 0)
      )

    } catch (error) {

      console.error(
        'Notification count error:',
        error
      )

      setUnreadCount(0)

    }

  }


  // =====================================================
  // CHECK LOGIN STATUS WHEN ROUTE CHANGES
  // =====================================================

  useEffect(() => {

    try {

      const savedUser =
        localStorage.getItem('user')

      if (savedUser) {

        setUser(
          JSON.parse(savedUser)
        )

      } else {

        setUser(null)
        setUnreadCount(0)

      }

    } catch {

      setUser(null)
      setUnreadCount(0)

    }

  }, [location.pathname])


  // =====================================================
  // LOAD NOTIFICATION COUNT
  // =====================================================

  useEffect(() => {

    loadUnreadNotifications()

  }, [user, location.pathname])


  // =====================================================
  // LISTEN FOR LOGIN / LOGOUT
  // =====================================================

  useEffect(() => {

    const updateUser = () => {

      try {

        const savedUser =
          localStorage.getItem('user')

        if (savedUser) {

          const updatedUser =
            JSON.parse(savedUser)

          setUser(updatedUser)

        } else {

          setUser(null)
          setUnreadCount(0)

        }

      } catch {

        setUser(null)
        setUnreadCount(0)

      }

    }


    window.addEventListener(
      'auth-change',
      updateUser
    )


    return () => {

      window.removeEventListener(
        'auth-change',
        updateUser
      )

    }

  }, [])


  // =====================================================
  // LISTEN FOR NOTIFICATION CHANGES
  // =====================================================

  useEffect(() => {

    const updateNotifications = () => {

      loadUnreadNotifications()

    }


    window.addEventListener(
      'notifications-change',
      updateNotifications
    )


    return () => {

      window.removeEventListener(
        'notifications-change',
        updateNotifications
      )

    }

  }, [])


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = () => {

    setOpen(false)

    navigate('/login')

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setUser(null)

    setUnreadCount(0)

    setOpen(false)

    window.dispatchEvent(
      new Event('auth-change')
    )

    navigate('/login')

  }


  // =====================================================
  // OPEN NOTIFICATIONS
  // =====================================================

  const handleNotifications = () => {

    setOpen(false)

    navigate('/notifications')

  }


  // =====================================================
  // NAVIGATION LINK STYLE
  // =====================================================

  const linkClass = ({ isActive }) =>

    `text-sm font-semibold transition-colors ${
      isActive
        ? 'text-primary-600'
        : 'text-ink/70 hover:text-primary-600'
    }`


  return (

    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">

      <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 lg:px-8 h-16">


        {/* ================================================= */}
        {/* LOGO */}
        {/* ================================================= */}

        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
        >

          <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary-600 text-white">

            <FaHospital size={18} />

          </span>


          <span className="font-display font-extrabold text-lg tracking-tight">

            Medi

            <span className="text-primary-600">
              Find
            </span>

          </span>

        </Link>


        {/* ================================================= */}
        {/* DESKTOP NAVIGATION */}
        {/* ================================================= */}

       <div className="hidden lg:flex items-center gap-10 ml-6">

          {links.map((link) => (

            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
            >

              {link.label}

            </NavLink>

          ))}

        </div>


        {/* ================================================= */}
        {/* DESKTOP USER SECTION */}
        {/* ================================================= */}

        <div className="hidden lg:flex items-center gap-6 ml-6">

          {user ? (

            <>


              {/* ================================================= */}
              {/* PATIENT APPOINTMENTS */}
              {/* ================================================= */}

              {user.role === 'patient' && (

                <Link
                  to="/dashboard"
                  className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  Dashboard
                </Link>
              )}

              {user.role === 'patient' && (

                <Link
                  to="/my-appointments"
                  className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors whitespace-nowrap"
                >

                  My Appointments

                </Link>

              )}


              {/* ================================================= */}
              {/* NOTIFICATIONS */}
              {/* ================================================= */}

              {user.role === 'patient' && (

                <Link
                  to="/prescriptions"
                  className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  Prescriptions
                </Link>
              )}

              {user.role === 'patient' && (

                <button
                  type="button"
                  onClick={handleNotifications}
                  className="relative flex items-center justify-center w-9 h-9 rounded-full text-ink/70 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  aria-label="Notifications"
                  title="Notifications"
                >

                  <FaBell size={17} />

                  {unreadCount > 0 && (

                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">

                      {unreadCount > 99
                        ? '99+'
                        : unreadCount}

                    </span>

                  )}

                </button>

              )}


              {/* ================================================= */}
              {/* DOCTOR PORTAL */}
              {/* ================================================= */}

              {user.role === 'doctor' && (

                <Link
                  to="/doctor-portal"
                  className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors whitespace-nowrap"
                >

                  Doctor Portal

                </Link>

              )}


              {/* ================================================= */}
              {/* DOCTOR APPOINTMENTS */}
              {/* ================================================= */}

              {user.role === 'doctor' && (

                <Link
                  to="/doctor-features"
                  className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  Schedule & Prescriptions
                </Link>
              )}

              {user.role === 'doctor' && (

                <Link
                  to="/doctor-appointments"
                  className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors whitespace-nowrap"
                >

                  Doctor Appointments

                </Link>

              )}


              {/* ================================================= */}
              {/* ADMIN PORTAL */}
              {/* ================================================= */}

              {user.role === 'admin' && (

                <Link
                  to="/admin"
                  className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors whitespace-nowrap"
                >

                  Admin Portal

                </Link>

              )}


              {/* ================================================= */}
              {/* USER NAME */}
              {/* ================================================= */}

              <span className="text-sm font-semibold text-ink/70 whitespace-nowrap">

                Hi, {user.full_name || user.name || 'User'}

              </span>


              {/* ================================================= */}
              {/* LOGOUT */}
              {/* ================================================= */}

              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-full text-sm font-semibold text-primary-600 border border-primary-600 hover:bg-primary-50 transition-colors whitespace-nowrap"
              >

                Logout

              </button>


            </>

          ) : (

            <>

              {/* ================================================= */}
              {/* LOGIN */}
              {/* ================================================= */}

              <button
                onClick={handleLogin}
                className="px-5 py-2 rounded-full text-sm font-semibold text-primary-600 border border-primary-600 hover:bg-primary-50 transition-colors whitespace-nowrap"
              >

                Login

              </button>

            </>

          )}

        </div>


        {/* ================================================= */}
        {/* MOBILE MENU BUTTON */}
        {/* ================================================= */}

        <button
          className="lg:hidden text-ink text-xl"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >

          {open
            ? <FaTimes />
            : <FaBars />
          }

        </button>

      </nav>


      {/* ================================================= */}
      {/* MOBILE MENU */}
      {/* ================================================= */}

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{
              height: 0,
              opacity: 0
            }}

            animate={{
              height: 'auto',
              opacity: 1
            }}

            exit={{
              height: 0,
              opacity: 0
            }}

            transition={{
              duration: 0.25
            }}

            className="lg:hidden overflow-hidden border-t border-slate-100 bg-white"
          >

            <div className="flex flex-col px-5 py-4 gap-4">


              {/* ================================================= */}
              {/* MAIN LINKS */}
              {/* ================================================= */}

              {links.map((link) => (

                <NavLink
                  key={link.to}
                  to={link.to}
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >

                  {link.label}

                </NavLink>

              ))}


              {/* ================================================= */}
              {/* MOBILE AUTH SECTION */}
              {/* ================================================= */}

              {user ? (

                <>


                  {/* ================================================= */}
                  {/* PATIENT */}
                  {/* ================================================= */}

                  {user.role === 'patient' && (

                    <Link
                      to="/my-appointments"
                      onClick={() => setOpen(false)}
                      className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors"
                    >

                      My Appointments

                    </Link>

                  )}


                  {/* ================================================= */}
                  {/* MOBILE NOTIFICATIONS */}
                  {/* ================================================= */}

                  {user.role === 'patient' && (

                    <button
                      type="button"
                      onClick={handleNotifications}
                      className="flex items-center justify-between w-full text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors text-left"
                    >

                      <span className="flex items-center gap-2">

                        <FaBell size={14} />

                        Notifications

                      </span>


                      {unreadCount > 0 && (

                        <span className="min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">

                          {unreadCount > 99
                            ? '99+'
                            : unreadCount}

                        </span>

                      )}

                    </button>

                  )}


                  {/* ================================================= */}
                  {/* DOCTOR PORTAL */}
                  {/* ================================================= */}

                  {user.role === 'doctor' && (

                    <Link
                      to="/doctor-portal"
                      onClick={() => setOpen(false)}
                      className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors"
                    >

                      Doctor Portal

                    </Link>

                  )}


                  {/* ================================================= */}
                  {/* DOCTOR APPOINTMENTS */}
                  {/* ================================================= */}

                  {user.role === 'doctor' && (

                    <Link
                      to="/doctor-appointments"
                      onClick={() => setOpen(false)}
                      className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors"
                    >

                      Doctor Appointments

                    </Link>

                  )}


                  {/* ================================================= */}
                  {/* ADMIN */}
                  {/* ================================================= */}

                  {user.role === 'admin' && (

                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors"
                    >

                      Admin Portal

                    </Link>

                  )}


                  {/* ================================================= */}
                  {/* USER NAME */}
                  {/* ================================================= */}

                  <div className="text-sm font-semibold text-ink/70">

                    Hi, {user.full_name || user.name || 'User'}

                  </div>


                  {/* ================================================= */}
                  {/* LOGOUT */}
                  {/* ================================================= */}

                  <button
                    onClick={handleLogout}
                    className="w-full px-5 py-2 rounded-full text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >

                    Logout

                  </button>


                </>

              ) : (

                <>

                  {/* ================================================= */}
                  {/* LOGIN */}
                  {/* ================================================= */}

                  <button
                    onClick={handleLogin}
                    className="w-full px-5 py-2 rounded-full text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >

                    Login

                  </button>

                </>

              )}

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </header>

  )

}