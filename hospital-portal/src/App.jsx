import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import Hospitals from './pages/Hospitals.jsx'
import HospitalDetails from './pages/HospitalDetails.jsx'
import Doctors from './pages/Doctors.jsx'
import BookAppointment from './pages/BookAppointment.jsx'
import BedStatus from './pages/BedStatus.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import MyAppointments from './pages/MyAppointments.jsx'
import AdminPortal from './pages/AdminPortal.jsx'
import VerifyOTP from './pages/VerifyOTP.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import DoctorAppointments from './pages/DoctorAppointments.jsx'
import DoctorVerify from './pages/DoctorVerify.jsx'
import DoctorPortal from './pages/DoctorPortal.jsx'
import Notifications from './pages/Notifications.jsx'
import DoctorActivate from './pages/DoctorActivate'
import SmartMatch from './pages/SmartMatch.jsx'
import DoctorProfile from './pages/DoctorProfile.jsx'
import PatientDashboard from './pages/PatientDashboard.jsx'
import Prescriptions from './pages/Prescriptions.jsx'
import DoctorFeatures from './pages/DoctorFeatures.jsx'
export default function App() {

  return (

    <div className="flex flex-col min-h-screen">

      <Navbar />

      <main className="flex-1">

        <Routes>

          {/* ================================================= */}
          {/* PUBLIC ROUTES */}
          {/* ================================================= */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/smart-match"
            element={<SmartMatch />}
          />
     <Route
  path="/doctor-appointments"
  element={
    <ProtectedRoute doctorOnly>
      <DoctorAppointments />
    </ProtectedRoute>
  }

/>
<Route
  path="/doctor/activate"
  element={<DoctorActivate />}
/>

          <Route

            path="/about"
            element={<About />}
          />

<Route
  path="/doctor-verify"
  element={<DoctorVerify />}
/>
          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/verify-otp"
            element={<VerifyOTP />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
  path="/notifications"
  element={
    <ProtectedRoute>
      <Notifications />
    </ProtectedRoute>
  }
/>


          {/* ================================================= */}
          {/* LOGIN REQUIRED */}
          {/* ================================================= */}

          <Route
            path="/hospitals"
            element={
              <ProtectedRoute>
                <Hospitals />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hospitals/:id"
            element={
              <ProtectedRoute>
                <HospitalDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctors/:id"
            element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>}
          />

          <Route
            path="/doctors"
            element={
              <ProtectedRoute>
                <Doctors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/beds"
            element={
              <ProtectedRoute>
                <BedStatus />
              </ProtectedRoute>
            }
          />

          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}
          />

          <Route
            path="/prescriptions"
            element={<ProtectedRoute><Prescriptions /></ProtectedRoute>}
          />

          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <MyAppointments />
              </ProtectedRoute>
            }
          />



          {/* ================================================= */}
{/* DOCTOR ONLY */}
{/* ================================================= */}

<Route
  path="/doctor-features"
  element={
    <ProtectedRoute doctorOnly>
      <DoctorFeatures />
    </ProtectedRoute>
  }
/>

<Route
  path="/doctor-portal"
  element={
    <ProtectedRoute doctorOnly>
      <DoctorPortal />
    </ProtectedRoute>
  }
/>


          {/* ================================================= */}
          {/* ADMIN ONLY */}
          {/* ================================================= */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPortal />
              </ProtectedRoute>
            }
          />

        </Routes>

      </main>

      <Footer />

    </div>

  )
}