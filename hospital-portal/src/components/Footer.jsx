import { Link } from 'react-router-dom'
import {
  FaHospital,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPhoneAlt,
} from 'react-icons/fa'

const quickLinks = [
  { to: '/hospitals', label: 'Find Hospitals' },
  { to: '/doctors', label: 'Find Doctors' },
  { to: '/beds', label: 'Bed Availability' },
  { to: '/book-appointment', label: 'Book Appointment' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="bg-ink text-white">

      {/* =====================================================
          EMERGENCY HELPLINE
      ====================================================== */}

      <div className="bg-occupied text-white">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3 flex items-center justify-center gap-2 text-sm font-semibold">

          <FaPhoneAlt />

          Emergency Helpline: 102 &nbsp;|&nbsp; Ambulance: 108

        </div>

      </div>


      {/* =====================================================
          FOOTER CONTENT
      ====================================================== */}

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">


        {/* ===================================================
            BRAND
        ==================================================== */}

        <div>

          <div className="flex items-center gap-2 mb-4">

            <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary-600">

              <FaHospital size={18} />

            </span>

            <span className="font-display font-extrabold text-lg">

              Medi
              <span className="text-primary-500">
                Find
              </span>

            </span>

          </div>


          <p className="text-white/60 text-sm leading-relaxed">

            Book appointments and check real-time bed availability across 120+
            partner hospitals.

          </p>


          {/* SOCIAL LINKS */}

          <div className="flex gap-3 mt-5">

            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map(
              (Icon, i) => (

                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-primary-600 transition-colors"
                  aria-label="Social media"
                >

                  <Icon size={14} />

                </a>

              )
            )}

          </div>

        </div>


        {/* ===================================================
            QUICK LINKS
        ==================================================== */}

        <div>

          <h4 className="font-display font-bold mb-4">
            Quick Links
          </h4>


          <ul className="space-y-2 text-sm">

            {quickLinks.map((l) => (

              <li key={l.to}>

                <Link
                  to={l.to}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>

              </li>

            ))}

          </ul>

        </div>


        {/* ===================================================
            CONTACT
        ==================================================== */}

        <div>

          <h4 className="font-display font-bold mb-4">
            Contact
          </h4>


          <ul className="space-y-2 text-sm text-white/60">

            <li>
              Survey No. 27, Near, Trimurti Chowk,
              Bharati Vidyapeeth Campus,
              Dhankawadi, Pune, Maharashtra 411043
            </li>

            <li>
              <a
                href="mailto:medifind.noreplay@gmail.com"
                className="hover:text-white transition-colors"
              >
                medifind.noreplay@gmail.com
              </a>
            </li>

            <li>
              <a
                href="tel:+917499939803"
                className="hover:text-white transition-colors"
              >
                +91 74999 39803
              </a>
            </li>

          </ul>

        </div>


        {/* ===================================================
            WORKING HOURS
        ==================================================== */}

        <div>

          <h4 className="font-display font-bold mb-4">
            Working Hours
          </h4>


          <p className="text-white/60 text-sm">

            Support desk: Mon - Sat, 9:00 AM - 6:00 PM

            <br />

            Emergency booking: 24 x 7

          </p>

        </div>

      </div>


      {/* =====================================================
          COPYRIGHT
      ====================================================== */}

      <div className="border-t border-white/10 py-5 text-center text-white/50 text-xs">

        © {new Date().getFullYear()} MediFind. All rights reserved.

      </div>

    </footer>
  )
}