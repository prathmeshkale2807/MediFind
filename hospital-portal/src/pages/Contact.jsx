import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FaMapMarkedAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaExternalLinkAlt
} from 'react-icons/fa'

import { api } from '../api.js'

function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  })

  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  // =====================================================
  // SEND CONTACT MESSAGE
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setSending(true)

      await api.sendContactMessage(form)

      setSent(true)

      setForm({
        name: '',
        email: '',
        message: ''
      })

    } catch (err) {
      console.error(
        'Contact form error:',
        err
      )

      alert(
        err.message ||
        'Unable to send your message.'
      )

    } finally {
      setSending(false)
    }
  }


  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 16
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.4
        }}
        className="mb-10 max-w-xl"
      >

        <h1 className="text-3xl font-display font-extrabold text-ink mb-3">
          Contact Us
        </h1>

        <p className="text-muted">
          Have a question or need help with a booking? Reach out any time.
        </p>

      </motion.div>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">


        {/* ===================================================
            LEFT SIDE
        ==================================================== */}

        <div className="space-y-6">


          {/* =================================================
              GOOGLE MAP
          ================================================== */}

          <div className="rounded-2xl overflow-hidden shadow-card h-64 bg-slate-100">

            <iframe
              title="MediFind Location"

              src="https://www.google.com/maps?q=Survey+No.+27,+Near+Trimurti+Chowk,+Bharati+Vidyapeeth+Campus,+Dhankawadi,+Pune,+Maharashtra+411043&output=embed"

              className="w-full h-full border-0"

              loading="lazy"

              referrerPolicy="no-referrer-when-downgrade"
            />

          </div>


          {/* =================================================
              OPEN MAP BUTTON
          ================================================== */}

          <a
            href="https://www.google.com/maps/search/?api=1&query=Survey+No.+27,+Near+Trimurti+Chowk,+Bharati+Vidyapeeth+Campus,+Dhankawadi,+Pune,+Maharashtra+411043"

            target="_blank"

            rel="noopener noreferrer"

            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl border border-slate-200 bg-white text-primary-600 font-semibold text-sm hover:bg-primary-50 transition-colors"
          >

            <FaMapMarkedAlt />

            Open Location in Google Maps

            <FaExternalLinkAlt size={12} />

          </a>


          {/* =================================================
              CONTACT INFORMATION
          ================================================== */}

          <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">


            {/* =================================================
                PHONE
            ================================================== */}

            <a
              href="tel:+917499939803"
              className="flex items-center gap-3 group"
            >

              <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 grid place-items-center shrink-0 group-hover:bg-primary-100 transition-colors">

                <FaPhoneAlt />

              </span>

              <div>

                <p className="font-semibold text-ink text-sm">
                  Phone
                </p>

                <p className="text-muted text-sm group-hover:text-primary-600 transition-colors">
                  +91 74999 39803
                </p>

              </div>

            </a>


            {/* =================================================
                EMAIL
            ================================================== */}

            <a
              href="mailto:medifind.noreplay@gmail.com"
              className="flex items-center gap-3 group"
            >

              <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 grid place-items-center shrink-0 group-hover:bg-primary-100 transition-colors">

                <FaEnvelope />

              </span>

              <div>

                <p className="font-semibold text-ink text-sm">
                  Email
                </p>

                <p className="text-muted text-sm group-hover:text-primary-600 transition-colors">
                  medifind.noreplay@gmail.com
                </p>

              </div>

            </a>


            {/* =================================================
                ADDRESS
            ================================================== */}

            <a
              href="https://www.google.com/maps/search/?api=1&query=Survey+No.+27,+Near+Trimurti+Chowk,+Bharati+Vidyapeeth+Campus,+Dhankawadi,+Pune,+Maharashtra+411043"

              target="_blank"

              rel="noopener noreferrer"

              className="flex items-center gap-3 group"
            >

              <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 grid place-items-center shrink-0 group-hover:bg-primary-100 transition-colors">

                <FaMapMarkerAlt />

              </span>

              <div>

                <p className="font-semibold text-ink text-sm">
                  Address
                </p>

                <p className="text-muted text-sm group-hover:text-primary-600 transition-colors">

                  Survey No. 27, Near, Trimurti Chowk,
                  Bharati Vidyapeeth Campus,
                  Dhankawadi, Pune, Maharashtra 411043

                </p>

              </div>

            </a>


            {/* =================================================
                SUPPORT HOURS
            ================================================== */}

            <div className="flex items-center gap-3">

              <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 grid place-items-center shrink-0">

                <FaClock />

              </span>

              <div>

                <p className="font-semibold text-ink text-sm">
                  Support Hours
                </p>

                <p className="text-muted text-sm">
                  Monday – Saturday, 9:00 AM – 6:00 PM
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            RIGHT SIDE — CONTACT FORM
        ==================================================== */}

        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">


          {sent ? (

            /* =================================================
               SUCCESS MESSAGE
            ================================================== */

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96
              }}

              animate={{
                opacity: 1,
                scale: 1
              }}

              className="text-center py-10"
            >

              <FaCheckCircle
                className="text-available mx-auto mb-4"
                size={48}
              />

              <h3 className="font-display font-bold text-lg text-ink mb-2">
                Message Sent
              </h3>

              <p className="text-muted text-sm mb-6">
                Thank you for contacting MediFind.
                We'll get back to you within 24 hours.
              </p>

              <button
                type="button"

                onClick={() => setSent(false)}

                className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
              >

                Send Another Message

              </button>

            </motion.div>

          ) : (

            /* =================================================
               CONTACT FORM
            ================================================== */

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >


              {/* =================================================
                  NAME
              ================================================== */}

              <label className="block">

                <span className="block text-sm font-semibold text-ink mb-1.5">
                  Your Name
                </span>

                <input
                  required
                  minLength={2}

                  value={form.name}

                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value
                    }))
                  }

                  type="text"

                  placeholder="e.g. Prathmesh Kale"

                  className="input"
                />

              </label>


              {/* =================================================
                  EMAIL
              ================================================== */}

              <label className="block">

                <span className="block text-sm font-semibold text-ink mb-1.5">
                  Email
                </span>

                <input
                  required

                  value={form.email}

                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      email: e.target.value
                    }))
                  }

                  type="email"

                  placeholder="e.g. prathmesh@email.com"

                  className="input"
                />

              </label>


              {/* =================================================
                  MESSAGE
              ================================================== */}

              <label className="block">

                <span className="block text-sm font-semibold text-ink mb-1.5">
                  Message
                </span>

                <textarea
                  required
                  minLength={5}

                  value={form.message}

                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      message: e.target.value
                    }))
                  }

                  rows={5}

                  placeholder="How can we help?"

                  className="input resize-none"
                />

              </label>


              {/* =================================================
                  SEND BUTTON
              ================================================== */}

              <button
                type="submit"

                disabled={sending}

                className={`w-full py-3.5 rounded-xl text-white font-semibold transition-colors ${
                  sending
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >

                {sending
                  ? 'Sending...'
                  : 'Send Message'}

              </button>

            </form>

          )}

        </div>

      </div>

    </div>
  )
}

export default Contact