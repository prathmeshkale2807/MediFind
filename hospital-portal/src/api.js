const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  const SERVER_ROOT = API_BASE_URL.replace(/\/api\/?$/, '')

async function request(path, options = {}) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },

    ...options,
  })

  const data = await response.json().catch(() => ({}))
if (!response.ok) {
  const error = new Error(
    data.message ||
    'Something went wrong while contacting the server.'
  )

  error.status = response.status
  error.requiresVerification =
    data.requiresVerification || false
  error.doctorVerification =
    data.doctorVerification || false
  error.email =
    data.email || null

  throw error
}

  return data
}

export const api = {

  getHospitalImageUrl: (image) =>
  getImageUrl(image),

// ==========================================
// NEARBY HOSPITALS
// ==========================================

getNearbyHospitals: (latitude, longitude, radius = 5) =>
  request(
    `/hospitals/nearby?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}&radius=${encodeURIComponent(radius)}`
  ),
  // ==========================================
  // PUBLIC
  // ==========================================

  getHospitals: () =>
    request('/hospitals'),

  getHospital: (id) =>
    request(`/hospitals/${id}`),

  getDoctors: (hospitalId) =>
    request(
      hospitalId
        ? `/doctors?hospital_id=${hospitalId}`
        : '/doctors'
    ),

  // ==========================================
  // SMARTMATCH
  // ==========================================

  smartMatchDoctors: ({
    specialization = '',
    budgetMin = '',
    budgetMax = '',
    hospitalId = '',
    availability = 'today',
  } = {}) => {
    const params = new URLSearchParams()

    if (specialization) params.set('specialization', specialization)
    if (budgetMin !== '') params.set('budgetMin', budgetMin)
    if (budgetMax !== '') params.set('budgetMax', budgetMax)
    if (hospitalId) params.set('hospitalId', hospitalId)
    if (availability) params.set('availability', availability)

    return request(
      `/smart-match?${params.toString()}`
    )
  },

  getBeds: () =>
    request('/beds'),


  // ==========================================
  // APPOINTMENT BOOKING
  // ==========================================

  bookAppointment: (payload) =>
    request('/appointments/public', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),


  // ==========================================
  // PATIENT APPOINTMENTS
  // ==========================================

  getMyAppointments: () =>
    request('/appointments/my'),


  // ==========================================
  // AUTHENTICATION
  // ==========================================

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    }),


  // REGISTER
  register: (full_name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name,
        email,
        password,
      }),
    }),


  // VERIFY REGISTRATION OTP
  verifyEmail: (email, otp) =>
    request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email,
        otp,
      }),
    }),


  // RESEND REGISTRATION OTP
  resendVerification: (email) =>
    request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    }),

    // ==========================================
// DOCTOR EMAIL VERIFICATION
// ==========================================
verifyDoctorEmail: (email, otp, password) =>
  request('/admin/doctors/verify-email', {
    method: 'POST',
    body: JSON.stringify({
      email,
      otp,
      password,
    }),
  }),
resendDoctorVerification: (email) =>
  request('/admin/doctors/resend-verification', {
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  }),

  activateDoctorAccount: (
    token,
    password
) =>
    request(
        '/doctors/activate',
        {
            method: 'POST',

            body: JSON.stringify({
                token,
                password
            })
        }
    ),

    resendDoctorInvitation: (
    email
) =>
    request(
        '/admin/doctors/resend-invitation',
        {
            method: 'POST',

            body: JSON.stringify({
                email
            })
        }
    ),

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    }),


  // VERIFY FORGOT PASSWORD OTP
  verifyResetOTP: (email, otp) =>
    request('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({
        email,
        otp,
      }),
    }),


  // RESET PASSWORD
  resetPassword: (resetToken, password) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        resetToken,
        password,
      }),
    }),


  // LOGOUT
  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  // ==========================================
// DOCTOR APPOINTMENTS
// ==========================================

// Get appointments assigned to logged-in doctor
getDoctorAppointments: () =>
  request('/doctors/my-appointments'),

// Accept or reject doctor's appointment
updateDoctorAppointmentStatus: (id, status) =>
  request(`/doctors/appointments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({
      status,
    }),
  }),

  // ==========================================
// NOTIFICATIONS
// ==========================================

getMyNotifications: () =>
    request('/notifications/my'),

getUnreadNotificationCount: () =>
    request('/notifications/unread-count'),

markNotificationAsRead: (id) =>
    request(`/notifications/${id}/read`, {
        method: 'PUT',
    }),

markAllNotificationsAsRead: () =>
    request('/notifications/read-all', {
        method: 'PUT',
    }),

  // ==========================================
  // ADVANCED FEATURES
  // ==========================================
  getDoctorProfile: (id) => request(`/features/doctors/${id}/profile`),
  submitDoctorReview: (doctorId, payload) => request(`/features/doctors/${doctorId}/reviews`, { method:'POST', body:JSON.stringify(payload) }),
  getDoctorSlots: (doctorId, date) => request(`/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`),
  getMyAvailability: () => request('/doctors/my-availability'),
  saveMyAvailability: (availability) => request('/doctors/my-availability',{method:'PUT',body:JSON.stringify({availability})}),
  getMyPrescriptions: () => request('/prescriptions/my'),
  createPrescription: (payload) => request('/prescriptions',{method:'POST',body:JSON.stringify(payload)}),
  getPatientDashboard: () => request('/patient/dashboard'),

  // ==========================================
  // ADMIN
  // ==========================================

  getAdminDashboard: () =>
    request('/admin/dashboard'),

  getAdminUsers: () =>
    request('/admin/users'),

  getAdminDoctors: () =>
    request('/admin/doctors'),

  addAdminDoctor: (payload) =>
  request('/admin/doctors', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

updateAdminDoctor: (id, payload) =>
  request(`/admin/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

deleteAdminDoctor: (id) =>
  request(`/admin/doctors/${id}`, {
    method: 'DELETE',
  }),

  getAdminHospitals: () =>
    request('/admin/hospitals'),


addAdminHospital: (payload) =>
  request('/admin/hospitals', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

updateAdminHospital: (id, payload) =>
  request(`/admin/hospitals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

deleteAdminHospital: (id) =>
  request(`/admin/hospitals/${id}`, {
    method: 'DELETE',
  }),

  getAdminBeds: () =>
    request('/admin/beds'),

  getAdminAppointments: () =>
    request('/admin/appointments'),

  updateAppointmentStatus: (id, status) =>
    request(
      `/admin/appointments/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({
          status,
        }),
      }
    ),

    // ==========================================
// CONTACT US
// ==========================================

sendContactMessage: (payload) =>
  request('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
}

export { API_BASE_URL }
const getImageUrl = (image) => {
  if (!image) return null

  // Already a complete URL
  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:')
  ) {
    return image
  }

  // Backend relative image URL
  const getImageUrl = (image) => {
  if (!image) return null

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:')
  ) {
    return image
  }

  return `${SERVER_ROOT}${image.startsWith('/') ? '' : '/'}${image}`
}
}