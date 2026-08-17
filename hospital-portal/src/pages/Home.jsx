import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import {
  FaCalendarCheck,
  FaBed,
  FaAmbulance,
  FaUserMd,
  FaStar,
  FaClinicMedical,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaDirections,
  FaSearchLocation,
  FaHospital,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner
} from 'react-icons/fa'

import HospitalCard from '../components/HospitalCard.jsx'
import { stats, testimonials } from '../data/hospitals.js'
import NearbyHospitalMap from '../components/NearbyHospitalMap.jsx'
import { api, API_BASE_URL } from '../api.js'



// =========================================================
// ANIMATION
// =========================================================

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24
  },

  show: {
    opacity: 1,
    y: 0
  }
}


// =========================================================
// FEATURES
// =========================================================

const features = [
  {
    icon: FaCalendarCheck,
    title: 'Instant Appointments',
    text: 'Book a verified doctor in under two minutes, no phone calls needed.'
  },

  {
    icon: FaBed,
    title: 'Live Bed Tracking',
    text: 'See General, ICU and Ventilator bed counts updated in real time.'
  },

  {
    icon: FaAmbulance,
    title: '24x7 Emergency Support',
    text: 'One tap to reach the nearest hospital with an open emergency bed.'
  },

  {
    icon: FaShieldAlt,
    title: 'Verified Hospitals',
    text: 'Every partner hospital is background-checked and NABH aware.'
  }
]


// =========================================================
// HOME
// =========================================================

export default function Home() {

    // =======================================================
  // PATIENT APPOINTMENT NOTIFICATION
  // =======================================================

  const [appointmentNotification, setAppointmentNotification] =
    useState(null)

  const [showAppointmentNotification, setShowAppointmentNotification] =
    useState(false)

  // =======================================================
  // REGISTERED HOSPITALS
  // =======================================================

  const [hospitals, setHospitals] = useState([])

  const [locationFound, setLocationFound] = useState(false)


  // =======================================================
  // NEARBY HOSPITALS
  // =======================================================

  const [nearbyHospitals, setNearbyHospitals] =
    useState([])


  const [locationLoading, setLocationLoading] =
    useState(false)


  const [locationError, setLocationError] =
    useState('')


  


  const [userLocation, setUserLocation] =
    useState(null)


  // =======================================================
  // LOAD REGISTERED HOSPITALS
  // =======================================================

  useEffect(() => {

    api
      .getHospitals()
      .then((data) => {

        setHospitals(
          Array.isArray(data)
            ? data
            : data.hospitals || []
        )

      })
      .catch((err) => {

        console.error(
          'Unable to load hospitals:',
          err
        )

      })

  }, [])

    // =======================================================
  // CHECK PATIENT APPOINTMENT NOTIFICATIONS
  // =======================================================

  useEffect(() => {

    const checkAppointmentNotification = async () => {

      try {

        const savedUser =
          localStorage.getItem('user')

        const token =
          localStorage.getItem('token')


        // User must be logged in

        if (!savedUser || !token) {
          return
        }


        const user =
          JSON.parse(savedUser)


        // Only patients receive this popup

        if (user.role !== 'patient') {
          return
        }


        const data =
          await api.getMyAppointments()


        const appointments =
          Array.isArray(data)
            ? data
            : data.appointments || []


        if (!appointments.length) {
          return
        }


        // =================================================
        // FIND CONFIRMED / REJECTED APPOINTMENTS
        // =================================================

        const notificationAppointments =
          appointments.filter(
            (appointment) =>
              appointment.status === 'confirmed' ||
              appointment.status === 'rejected'
          )


        if (!notificationAppointments.length) {
          return
        }


        // Get newest appointment

        const appointment =
          notificationAppointments
            .sort((a, b) =>
              Number(b.appointment_id) -
              Number(a.appointment_id)
            )[0]


        const notificationKey =
          `medifind_notification_${appointment.appointment_id}_${appointment.status}`


        // Already shown?

        const alreadySeen =
          localStorage.getItem(notificationKey)


        if (alreadySeen) {
          return
        }


        // =================================================
        // SHOW POPUP
        // =================================================

        setAppointmentNotification(
          appointment
        )

        setShowAppointmentNotification(
          true
        )


        // Mark as seen

        localStorage.setItem(
          notificationKey,
          'true'
        )


      } catch (error) {

        console.error(
          'Appointment notification error:',
          error
        )

      }

    }


    checkAppointmentNotification()

  }, [])


  // =======================================================
  // FIND NEARBY HOSPITALS
  // =======================================================

  const findNearbyHospitals = () => {

    setLocationError('')
    setLocationFound(false)
    setLocationLoading(true)


    if (!navigator.geolocation) {

      setLocationLoading(false)

      setLocationError(
        'Location services are not supported by your browser.'
      )

      return
    }


    navigator.geolocation.getCurrentPosition(

      async (position) => {

        try {

          const latitude =
            position.coords.latitude

          const longitude =
            position.coords.longitude


          setUserLocation({
            latitude,
            longitude
          })


          const data =
            await api.getNearbyHospitals(
              latitude,
              longitude,
              5
            )


          const nearby =
            Array.isArray(data)
              ? data
              : data.hospitals || []


          setNearbyHospitals(
            nearby
          )


          setLocationFound(true)

        } catch (err) {

          console.error(
            'Nearby hospital error:',
            err
          )


          setLocationError(
            err.message ||
            'Unable to find nearby hospitals.'
          )

        } finally {

          setLocationLoading(false)

        }

      },

      (error) => {

        console.error(
          'Location error:',
          error
        )


        let message =
          'Unable to access your location.'


        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {

          message =
            'Location permission was denied. Please allow location access and try again.'

        } else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {

          message =
            'Your location could not be determined. Please check your device location settings.'

        } else if (
          error.code ===
          error.TIMEOUT
        ) {

          message =
            'Location request timed out. Please try again.'

        }


        setLocationError(
          message
        )

        setLocationLoading(false)

      },

      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 300000
      }

    )
  }


  // =======================================================
  // OPEN DIRECTIONS
  // =======================================================

  const openDirections = (
    hospital
  ) => {

    if (
      hospital.googleMapsUri
    ) {

      window.open(
        hospital.googleMapsUri,
        '_blank',
        'noopener,noreferrer'
      )

      return
    }


    if (
      hospital.latitude != null &&
      hospital.longitude != null
    ) {

      let url


      if (userLocation) {

        url =
          `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
            userLocation.latitude
          )},${encodeURIComponent(
            userLocation.longitude
          )}&destination=${encodeURIComponent(
            hospital.latitude
          )},${encodeURIComponent(
            hospital.longitude
          )}`

      } else {

        url =
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            hospital.latitude
          )},${encodeURIComponent(
            hospital.longitude
          )}`

      }


      window.open(
        url,
        '_blank',
        'noopener,noreferrer'
      )

    } else if (hospital.address) {

      const url =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          hospital.address
        )}`


      window.open(
        url,
        '_blank',
        'noopener,noreferrer'
      )
    }
  }


  // =======================================================
  // REGISTERED HOSPITAL CARD
  // =======================================================

  const RegisteredHospitalCard = ({
    hospital
  }) => {

    return (

      <motion.div

        initial={{
          opacity: 0,
          y: 20
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        className="bg-white rounded-2xl shadow-card hover:shadow-card-hover overflow-hidden transition-shadow h-full"

      >

        {/* IMAGE */}

        <div className="relative h-48">

          <img

            src={
              hospital.image ||
              'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1200&auto=format&fit=crop'
            }

            alt={
              hospital.name ||
              'Hospital'
            }

            className="w-full h-full object-cover"

          />


          {/* REGISTERED */}

          <div className="absolute top-4 left-4">

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold shadow">

              <FaCheckCircle />

              Registered on MediFind

            </span>

          </div>


          {/* DISTANCE */}

          {hospital.distance && (

            <div className="absolute bottom-4 right-4">

              <span className="px-3 py-1.5 rounded-full bg-white/95 text-ink text-xs font-bold shadow">

                {hospital.distance}

              </span>

            </div>

          )}

        </div>


        {/* CONTENT */}

        <div className="p-5">

          <h3 className="text-xl font-display font-bold text-ink">

            {hospital.name}

          </h3>


          {/* ADDRESS */}

          <div className="flex items-start gap-2 mt-3 text-sm text-muted">

            <FaMapMarkerAlt className="text-primary-600 mt-1 shrink-0" />

            <span>

              {hospital.address ||
                'Address not available'}

            </span>

          </div>


          {/* RATING */}

          {hospital.rating != null && (

            <div className="flex items-center gap-1 mt-3 text-sm">

              <FaStar className="text-amber-400" />

              <span className="font-semibold">

                {hospital.rating}

              </span>

              <span className="text-muted">

                Google rating

              </span>

            </div>

          )}


          {/* BEDS */}

          {hospital.beds && (

            <div className="grid grid-cols-3 gap-2 mt-4">

              <div className="bg-primary-50 rounded-xl p-3 text-center">

                <p className="text-xs text-muted">
                  General
                </p>

                <p className="font-bold text-primary-600">

                  {hospital.beds?.general?.total || 0}

                </p>

              </div>


              <div className="bg-primary-50 rounded-xl p-3 text-center">

                <p className="text-xs text-muted">
                  ICU
                </p>

                <p className="font-bold text-primary-600">

                  {hospital.beds?.icu?.total || 0}

                </p>

              </div>


              <div className="bg-primary-50 rounded-xl p-3 text-center">

                <p className="text-xs text-muted">
                  Ventilator
                </p>

                <p className="font-bold text-primary-600">

                  {hospital.beds?.ventilator?.total || 0}

                </p>

              </div>

            </div>

          )}


          {/* ACTIONS */}

          <div className="flex gap-3 mt-5">

            {hospital.id && (

              <Link

                to={`/hospitals/${hospital.id}`}

                className="flex-1 text-center px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"

              >

                View Hospital

              </Link>

            )}


            <button

              onClick={() =>
                openDirections(hospital)
              }

              className="px-4 py-3 rounded-xl border border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors"

              title="Open directions"

            >

              <FaDirections />

            </button>

          </div>

        </div>

      </motion.div>

    )
  }


  // =======================================================
  // UNREGISTERED HOSPITAL CARD
  // =======================================================

  const ExternalHospitalCard = ({
    hospital
  }) => {

    return (

      <motion.div

        initial={{
          opacity: 0,
          y: 20
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        className="bg-white rounded-2xl shadow-card hover:shadow-card-hover overflow-hidden transition-shadow h-full"

      >

{/* HEADER */}

<div className="relative h-48 bg-slate-100 overflow-hidden">

  {hospital.image ? (
    <img
      src={hospital.image}
      alt={hospital.name || "Hospital"}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={(e) => {
        console.error(
          "Hospital image failed:",
          hospital.image
        )

        e.currentTarget.style.display = "none"
      }}
    />
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-slate-100 flex items-center justify-center">

      <div className="text-center">

        <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 grid place-items-center mx-auto mb-3">
          <FaHospital size={28} />
        </div>

        <p className="text-sm font-semibold text-muted">
          Hospital found nearby
        </p>

      </div>

    </div>
  )}

  {/* NOT REGISTERED */}

  <div className="absolute top-4 left-4">

    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-white text-xs font-bold shadow">

      <FaExclamationCircle />

      Not registered on MediFind

    </span>

  </div>

  {/* DISTANCE */}

  {hospital.distance && (

    <div className="absolute bottom-4 right-4">

      <span className="px-3 py-1.5 rounded-full bg-white text-ink text-xs font-bold shadow">

        {hospital.distance}

      </span>

    </div>

  )}

</div>
        {/* CONTENT */}

        <div className="p-5">

          <h3 className="text-xl font-display font-bold text-ink">

            {hospital.name}

          </h3>


          {/* NOTICE */}

          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">

            <p className="text-xs font-semibold text-amber-800">

              This hospital does not come under MediFind.

            </p>

            <p className="text-xs text-amber-700 mt-1">

              Hospital information is provided through Google Places.

            </p>

          </div>


          {/* ADDRESS */}

          <div className="flex items-start gap-2 mt-4 text-sm text-muted">

            <FaMapMarkerAlt className="text-primary-600 mt-1 shrink-0" />

            <span>

              {hospital.address ||
                'Address not available'}

            </span>

          </div>


          {/* RATING */}

          {hospital.rating != null && (

            <div className="flex items-center gap-1 mt-3 text-sm">

              <FaStar className="text-amber-400" />

              <span className="font-semibold">

                {hospital.rating}

              </span>

              <span className="text-muted">

                Google rating

              </span>

            </div>

          )}


          {/* PHONE */}

          {hospital.phone && (

            <div className="flex items-center gap-2 mt-3 text-sm text-muted">

              <FaPhone className="text-primary-600" />

              <span>

                {hospital.phone}

              </span>

            </div>

          )}


          {/* ACTIONS */}

          <div className="flex gap-3 mt-5">

            {hospital.phone && (

              <a

                href={`tel:${hospital.phone}`}

                className="flex-1 text-center px-4 py-3 rounded-xl border border-primary-600 text-primary-600 font-semibold text-sm hover:bg-primary-50 transition-colors"

              >

                Call Hospital

              </a>

            )}


            <button

              onClick={() =>
                openDirections(hospital)
              }

              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"

            >

              <FaDirections />

              Directions

            </button>

          </div>

        </div>

      </motion.div>

    )
  }


  // =======================================================
  // HORIZONTAL HOSPITAL CARD
  // =======================================================

  const HospitalSliderCard = ({
    children,
    id
  }) => {

    return (

      <div
        key={id}
        className="
          flex-shrink-0
          w-[300px]
          sm:w-[340px]
          lg:w-[380px]
          snap-start
        "
      >

        {children}

      </div>

    )
  }


  // =======================================================
  // RETURN
  // =======================================================

  return (

    <div>

            {/* ================================================= */}
      {/* APPOINTMENT NOTIFICATION POPUP */}
      {/* ================================================= */}

      {showAppointmentNotification &&
        appointmentNotification && (

        <div className="fixed top-20 right-5 z-[100] w-[calc(100%-2.5rem)] max-w-md">

          <motion.div
            initial={{
              opacity: 0,
              y: -30,
              scale: 0.95
            }}

            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}

            exit={{
              opacity: 0,
              y: -30,
              scale: 0.95
            }}

            className={`
              bg-white
              rounded-2xl
              shadow-2xl
              border
              p-5
              ${
                appointmentNotification.status === 'confirmed'
                  ? 'border-green-200'
                  : 'border-red-200'
              }
            `}
          >

            {/* HEADER */}

            <div className="flex items-start gap-4">

              {/* ICON */}

              <div
                className={`
                  w-12
                  h-12
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-2xl
                  shrink-0
                  ${
                    appointmentNotification.status === 'confirmed'
                      ? 'bg-green-50'
                      : 'bg-red-50'
                  }
                `}
              >

                {appointmentNotification.status === 'confirmed'
                  ? '🎉'
                  : '❌'}

              </div>


              {/* CONTENT */}

              <div className="flex-1">

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <h3 className="font-display font-bold text-ink">

                      {appointmentNotification.status === 'confirmed'
                        ? 'Appointment Confirmed!'
                        : 'Appointment Rejected'}

                    </h3>

                    <p className="text-sm text-ink/60 mt-1">

                      {appointmentNotification.status === 'confirmed'
                        ? 'Your doctor has confirmed your appointment.'
                        : 'Your doctor has rejected your appointment.'}

                    </p>

                  </div>


                  {/* CLOSE */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowAppointmentNotification(false)
                    }
                    className="text-slate-400 hover:text-slate-700 text-lg"
                    aria-label="Close notification"
                  >

                    ×

                  </button>

                </div>


                {/* APPOINTMENT DETAILS */}

                <div className="mt-4 rounded-xl bg-slate-50 p-4">

                  <p className="text-sm font-semibold text-ink">

                    👨‍⚕️{' '}

                    {appointmentNotification.doctor_name ||
                      appointmentNotification.doctor_full_name ||
                      'Doctor'}

                  </p>


                  {appointmentNotification.appointment_date && (

                    <p className="text-xs text-ink/60 mt-2">

                      📅{' '}

                      {new Date(
                        appointmentNotification.appointment_date
                      ).toLocaleDateString(
                        'en-IN',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }
                      )}

                    </p>

                  )}


                  {appointmentNotification.appointment_time && (

                    <p className="text-xs text-ink/60 mt-1">

                      🕐{' '}

                      {String(
                        appointmentNotification.appointment_time
                      ).slice(0, 5)}

                    </p>

                  )}

                </div>


                {/* BUTTON */}

                <Link
                  to="/my-appointments"
                  onClick={() =>
                    setShowAppointmentNotification(false)
                  }
                  className={`
                    block
                    text-center
                    mt-4
                    px-4
                    py-2.5
                    rounded-xl
                    text-sm
                    font-semibold
                    text-white
                    transition-colors
                    ${
                      appointmentNotification.status === 'confirmed'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }
                  `}
                >

                  View Appointment

                </Link>

              </div>

            </div>

          </motion.div>

        </div>

      )}  

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="relative overflow-hidden bg-ink">

        <img

          src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1920&auto=format&fit=crop"

          alt="Hospital corridor"

          className="absolute inset-0 w-full h-full object-cover opacity-30"

        />


        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/80 to-ink" />


        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-24 pb-28 lg:pt-32 lg:pb-36">

          <motion.div

            initial="hidden"

            animate="show"

            variants={fadeUp}

            transition={{
              duration: 0.6
            }}

            className="max-w-2xl"

          >

            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-100 bg-primary-600/30 border border-primary-400/40 px-3 py-1.5 rounded-full mb-6">

              <FaClinicMedical />

              120+ hospitals live right now

            </span>


            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white leading-tight mb-5">

              Find Hospitals Near You

            </h1>


            <p className="text-slate-300 text-lg mb-8 max-w-xl">

              Book appointments and check real-time bed availability, all from one simple dashboard.

            </p>


            <div className="flex flex-col sm:flex-row gap-4">

              <Link

                to="/book-appointment"

                className="text-center px-7 py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"

              >

                Book Appointment

              </Link>


              <button

                onClick={
                  findNearbyHospitals
                }

                disabled={
                  locationLoading
                }

                className="text-center px-7 py-3.5 rounded-xl bg-white text-ink font-semibold hover:bg-slate-100 transition-colors disabled:opacity-70"

              >

                {locationLoading ? (

                  <span className="inline-flex items-center gap-2">

                    <FaSpinner className="animate-spin" />

                    Finding Hospitals...

                  </span>

                ) : (

                  <span className="inline-flex items-center gap-2">

                    <FaSearchLocation />

                    Find Hospitals Near Me

                  </span>

                )}

              </button>

            </div>


            <p className="text-slate-400 text-xs mt-4">

              Searches hospitals within 5 km of your current location.

            </p>

          </motion.div>

        </div>


        {/* HEARTBEAT */}

        <svg

          className="relative block w-full h-10 text-white"

          viewBox="0 0 1200 40"

          preserveAspectRatio="none"

        >

          <path

            d="M0 20 H500 L520 4 L545 36 L565 20 H1200 V40 H0 Z"

            fill="currentColor"

          />

        </svg>

      </section>


      {/* ================================================= */}
      {/* LOCATION ERROR */}
      {/* ================================================= */}

      {locationError && (

        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-8">

          <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-5 py-4">

            <div className="flex items-start gap-3">

              <FaExclamationCircle className="mt-1" />

              <div>

                <p className="font-semibold">
                  Location problem
                </p>

                <p className="text-sm mt-1">
                  {locationError}
                </p>

              </div>

            </div>

          </div>

        </div>

      )}



{/* ================================================= */}
{/* NEARBY HOSPITAL MAP */}
{/* ================================================= */}

{locationFound && userLocation && (

  <section className="max-w-7xl mx-auto px-5 lg:px-8 py-12">

    <NearbyHospitalMap
      userLocation={userLocation}
      hospitals={nearbyHospitals}
    />

  </section>

)}

      {/* ================================================= */}
      {/* HOSPITALS
          HORIZONTAL SLIDER
      ================================================= */}

      <section className="bg-primary-50/50 py-16 lg:py-20">

        <div className="max-w-7xl mx-auto px-5 lg:px-8">

          {/* HEADER */}

          <div className="flex items-end justify-between mb-8">

            <div>

              <div className="flex items-center gap-2 text-primary-600 text-sm font-semibold mb-2">

                <FaMapMarkerAlt />

                {locationFound
                  ? 'Hospitals near your location'
                  : 'Featured Hospitals'}

              </div>


              <h2 className="text-3xl font-display font-extrabold text-ink mb-2">

                {locationFound
                  ? 'Hospitals Near You'
                  : 'Top Hospitals'}

              </h2>


              <p className="text-muted">

                {locationFound

                  ? `${nearbyHospitals.length} hospitals found within 5 km`

                  : 'Highly rated hospitals near your location'}

              </p>

            </div>


            <Link

              to="/hospitals"

              className="hidden sm:block text-primary-600 font-semibold text-sm hover:underline"

            >

              View all →

            </Link>

          </div>


          {/* ================================================= */}
          {/* HORIZONTAL SCROLL AREA */}
          {/* ================================================= */}

          <div

            className="
              flex
              flex-row
              gap-6
              overflow-x-auto
              overflow-y-hidden
              pb-5
              snap-x
              snap-mandatory
            "

            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}

          >

            {/* =============================================== */}
            {/* NEARBY RESULTS */}
            {/* =============================================== */}

            {locationFound && nearbyHospitals.length > 0 ? (

              nearbyHospitals.map(
                (hospital, index) => (

                  <HospitalSliderCard

                    key={
                      hospital.id ||
                      hospital.placeId ||
                      `nearby-${index}`
                    }

                    id={
                      hospital.id ||
                      hospital.placeId ||
                      index
                    }

                  >

                    {hospital.registered ? (

                      <RegisteredHospitalCard
                        hospital={
                          hospital
                        }
                      />

                    ) : (

                      <ExternalHospitalCard
                        hospital={
                          hospital
                        }
                      />

                    )}

                  </HospitalSliderCard>

                )
              )

            ) : (

              /* =============================================== */
              /* DEFAULT REGISTERED HOSPITALS */
              /* =============================================== */

              hospitals.length > 0 ? (

                hospitals.map(
                  (hospital) => (

                    <HospitalSliderCard

                      key={
                        hospital.id
                      }

                      id={
                        hospital.id
                      }

                    >

                      <HospitalCard
                        hospital={
                          hospital
                        }
                      />

                    </HospitalSliderCard>

                  )
                )

              ) : (

                <div className="w-full bg-white rounded-2xl p-10 text-center">

                  <FaHospital
                    className="mx-auto text-primary-600 mb-3"
                    size={30}
                  />

                  <p className="font-semibold text-ink">

                    No hospitals available

                  </p>

                </div>

              )

            )}

          </div>


          {/* ================================================= */}
          {/* SLIDE INDICATOR */}
          {/* ================================================= */}

          {(locationFound
            ? nearbyHospitals.length > 3
            : hospitals.length > 3) && (

            <div className="flex items-center justify-center gap-2 mt-5">

              <span className="text-xs text-muted">

                ← Slide to see more hospitals →

              </span>

            </div>

          )}


          {/* MOBILE VIEW ALL */}

          <div className="mt-5 text-center sm:hidden">

            <Link

              to="/hospitals"

              className="text-primary-600 font-semibold text-sm"

            >

              View all hospitals →

            </Link>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* FEATURES */}
      {/* ================================================= */}

      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-20">

        <motion.div

          initial={{
            opacity: 0,
            y: 20
          }}

          whileInView={{
            opacity: 1,
            y: 0
          }}

          viewport={{
            once: true
          }}

          transition={{
            duration: 0.5
          }}

          className="text-center max-w-xl mx-auto mb-12"

        >

          <h2 className="text-3xl font-display font-extrabold text-ink mb-3">

            Everything you need, in one place

          </h2>


          <p className="text-muted">

            MediFind brings hospitals, doctors and beds together so you never waste time during a health emergency.

          </p>

        </motion.div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {features.map(
            (f, i) => (

              <motion.div

                key={
                  f.title
                }

                initial={{
                  opacity: 0,
                  y: 24
                }}

                whileInView={{
                  opacity: 1,
                  y: 0
                }}

                viewport={{
                  once: true
                }}

                transition={{
                  duration: 0.4,
                  delay: i * 0.08
                }}

                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-6 transition-shadow"

              >

                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 grid place-items-center mb-4">

                  <f.icon size={20} />

                </div>


                <h3 className="font-display font-bold text-ink mb-2">

                  {f.title}

                </h3>


                <p className="text-muted text-sm leading-relaxed">

                  {f.text}

                </p>

              </motion.div>

            )

          )}

        </div>

      </section>


      {/* ================================================= */}
      {/* EMERGENCY BANNER */}
      {/* ================================================= */}

      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16">

        <motion.div

          initial={{
            opacity: 0,
            scale: 0.97
          }}

          whileInView={{
            opacity: 1,
            scale: 1
          }}

          viewport={{
            once: true
          }}

          transition={{
            duration: 0.5
          }}

          className="bg-occupied rounded-3xl px-6 sm:px-12 py-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-white"

        >

          <div className="text-center lg:text-left">

            <h3 className="text-2xl font-display font-extrabold mb-2">

              Medical Emergency?

            </h3>


            <p className="text-white/90 max-w-md">

              Connect instantly to the nearest hospital with an open emergency bed and an ambulance on standby.

            </p>

          </div>


          <a

            href="tel:108"

            className="shrink-0 inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-occupied-dark font-bold hover:bg-slate-100 transition-colors"

          >

            <FaAmbulance size={20} />

            Call Emergency: 108

          </a>

        </motion.div>

      </section>


      {/* ================================================= */}
      {/* STATS */}
      {/* ================================================= */}

      <section className="bg-ink py-16">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">

          {stats.map(
            (s, i) => (

              <motion.div

                key={
                  s.id
                }

                initial={{
                  opacity: 0,
                  y: 16
                }}

                whileInView={{
                  opacity: 1,
                  y: 0
                }}

                viewport={{
                  once: true
                }}

                transition={{
                  duration: 0.4,
                  delay: i * 0.1
                }}

              >

                <p className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-1">

                  {s.value}

                </p>


                <p className="text-slate-400 text-sm">

                  {s.label}

                </p>

              </motion.div>

            )

          )}

        </div>

      </section>


      {/* ================================================= */}
      {/* TESTIMONIALS */}
      {/* ================================================= */}

      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-20">

        <h2 className="text-3xl font-display font-extrabold text-ink text-center mb-12">

          What patients say

        </h2>


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {testimonials.map(
            (t, i) => (

              <motion.div

                key={
                  t.id
                }

                initial={{
                  opacity: 0,
                  y: 24
                }}

                whileInView={{
                  opacity: 1,
                  y: 0
                }}

                viewport={{
                  once: true
                }}

                transition={{
                  duration: 0.4,
                  delay: i * 0.1
                }}

                className="bg-white rounded-2xl shadow-card p-6"

              >

                <div className="flex gap-1 text-amber-400 mb-3">

                  {Array.from({
                    length:
                      t.rating
                  }).map(
                    (_, idx) => (

                      <FaStar
                        key={
                          idx
                        }
                      />

                    )
                  )}

                </div>


                <p className="text-ink/80 text-sm leading-relaxed mb-4">

                  "{t.text}"

                </p>


                <p className="font-semibold text-ink text-sm flex items-center gap-2">

                  <FaUserMd className="text-primary-600" />

                  {t.name}

                </p>

              </motion.div>

            )
          )}

        </div>

      </section>

    </div>

  )
}

