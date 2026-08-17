// Dummy data for the whole app.
// Later, when the backend is built, these arrays can be
// replaced with data fetched from an API.

export const hospitals = [
  {
    id: 1,
    name: 'Sunrise Multispeciality Hospital',
    image:
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1200&auto=format&fit=crop',
    rating: 4.6,
    address: 'MG Road, Pune, Maharashtra',
    distance: '2.3 km',
    availableBeds: 42,
    emergencyBeds: 5,
    specialities: ['Cardiology', 'Orthopedics', 'Neurology'],
    phone: '+91 98765 43210',
    email: 'contact@sunrisehospital.in',
    about:
      'Sunrise Multispeciality Hospital has served the Pune community for over 20 years, combining advanced medical technology with compassionate care.',
    departments: ['Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'Radiology'],
    beds: { general: { total: 80, occupied: 38 }, icu: { total: 20, occupied: 14 }, ventilator: { total: 10, occupied: 6 } },
  },
  {
    id: 2,
    name: 'Apex Care Hospital',
    image:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop',
    rating: 4.4,
    address: 'FC Road, Pune, Maharashtra',
    distance: '4.1 km',
    availableBeds: 18,
    emergencyBeds: 2,
    specialities: ['Oncology', 'Gastroenterology', 'ENT'],
    phone: '+91 91234 56780',
    email: 'info@apexcare.in',
    about:
      'Apex Care Hospital is a NABH-accredited facility known for its dedicated oncology and gastroenterology departments.',
    departments: ['Oncology', 'Gastroenterology', 'ENT', 'General Surgery'],
    beds: { general: { total: 60, occupied: 50 }, icu: { total: 15, occupied: 13 }, ventilator: { total: 8, occupied: 7 } },
  },
  {
    id: 3,
    name: 'GreenLife Hospital & Research Centre',
    image:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    address: 'Baner Road, Pune, Maharashtra',
    distance: '6.7 km',
    availableBeds: 65,
    emergencyBeds: 9,
    specialities: ['Pediatrics', 'Gynecology', 'Dermatology'],
    phone: '+91 90000 11223',
    email: 'help@greenlifehospital.in',
    about:
      'GreenLife Hospital & Research Centre focuses on family healthcare, with a strong pediatrics and gynecology wing.',
    departments: ['Pediatrics', 'Gynecology', 'Dermatology', 'General Medicine'],
    beds: { general: { total: 100, occupied: 40 }, icu: { total: 25, occupied: 9 }, ventilator: { total: 12, occupied: 3 } },
  },
  {
    id: 4,
    name: 'CityCare Trauma Centre',
    image:
      'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1200&auto=format&fit=crop',
    rating: 4.2,
    address: 'Shivaji Nagar, Pune, Maharashtra',
    distance: '3.5 km',
    availableBeds: 8,
    emergencyBeds: 1,
    specialities: ['Trauma & Emergency', 'Orthopedics', 'Neurosurgery'],
    phone: '+91 99887 76655',
    email: 'support@citycaretrauma.in',
    about:
      'CityCare Trauma Centre is a 24/7 emergency and trauma facility equipped with a level-1 trauma unit.',
    departments: ['Trauma & Emergency', 'Orthopedics', 'Neurosurgery', 'ICU Care'],
    beds: { general: { total: 40, occupied: 35 }, icu: { total: 18, occupied: 17 }, ventilator: { total: 10, occupied: 9 } },
  },
]

export const doctors = [
  {
    id: 1,
    name: 'Dr. Anjali Mehta',
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=600&auto=format&fit=crop',
    qualification: 'MBBS, MD (Cardiology)',
    experience: '14 years',
    specialization: 'Cardiologist',
    availability: 'Mon - Sat, 10:00 AM - 4:00 PM',
    fee: 800,
    hospitalId: 1,
  },
  {
    id: 2,
    name: 'Dr. Rohan Kulkarni',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop',
    qualification: 'MBBS, MS (Orthopedics)',
    experience: '10 years',
    specialization: 'Orthopedic Surgeon',
    availability: 'Mon - Fri, 9:00 AM - 2:00 PM',
    fee: 700,
    hospitalId: 1,
  },
  {
    id: 3,
    name: 'Dr. Sneha Iyer',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop',
    qualification: 'MBBS, DM (Oncology)',
    experience: '12 years',
    specialization: 'Oncologist',
    availability: 'Tue - Sat, 11:00 AM - 5:00 PM',
    fee: 900,
    hospitalId: 2,
  },
  {
    id: 4,
    name: 'Dr. Arjun Verma',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600&auto=format&fit=crop',
    qualification: 'MBBS, MD (Pediatrics)',
    experience: '8 years',
    specialization: 'Pediatrician',
    availability: 'Mon - Sat, 9:00 AM - 1:00 PM',
    fee: 600,
    hospitalId: 3,
  },
  {
    id: 5,
    name: 'Dr. Kavita Rao',
    photo: 'https://images.unsplash.com/photo-1580281657702-257584239a55?q=80&w=600&auto=format&fit=crop',
    qualification: 'MBBS, MS (Gynecology)',
    experience: '16 years',
    specialization: 'Gynecologist',
    availability: 'Mon - Fri, 10:00 AM - 3:00 PM',
    fee: 750,
    hospitalId: 3,
  },
  {
    id: 6,
    name: 'Dr. Imran Sheikh',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600&auto=format&fit=crop',
    qualification: 'MBBS, MCh (Neurosurgery)',
    experience: '18 years',
    specialization: 'Neurosurgeon',
    availability: '24/7 On-Call',
    fee: 1200,
    hospitalId: 4,
  },
]

export const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    text: 'I found a hospital bed for my father within minutes during an emergency. This portal is a lifesaver.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Vikram Singh',
    text: 'Booking an appointment took less than two minutes. The doctor list and fees were all clearly shown.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Ayesha Khan',
    text: 'Real-time bed availability meant we did not have to call five different hospitals. Excellent idea.',
    rating: 4,
  },
]

export const stats = [
  { id: 1, label: 'Partner Hospitals', value: '120+' },
  { id: 2, label: 'Verified Doctors', value: '850+' },
  { id: 3, label: 'Appointments Booked', value: '40K+' },
  { id: 4, label: 'Cities Covered', value: '18' },
]
