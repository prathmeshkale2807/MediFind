import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarCheck,
  FaSyncAlt,
  FaArrowLeft
} from 'react-icons/fa'

import { api } from '../api.js'


export default function Notifications() {

  const [notifications, setNotifications] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [markingAll, setMarkingAll] =
    useState(false)

  const [error, setError] =
    useState('')


  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = async (
    showRefresh = false
  ) => {

    try {

      if (showRefresh) {

        setRefreshing(true)

      } else {

        setLoading(true)

      }


      setError('')


      const data =
        await api.getMyNotifications()


      setNotifications(
        Array.isArray(data)
          ? data
          : data.notifications || []
      )


    } catch (err) {

      console.error(
        'Notification error:',
        err
      )


      setError(
        err.message ||
        'Unable to load notifications.'
      )


    } finally {

      setLoading(false)
      setRefreshing(false)

    }

  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadNotifications()

  }, [])


  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (id) => {

    try {

      await api.markNotificationAsRead(id)


      setNotifications(
        (previous) =>

          previous.map(
            (notification) =>

              notification.notification_id === id

                ? {
                    ...notification,
                    is_read: true
                  }

                : notification
          )
      )


      window.dispatchEvent(
        new Event(
          'notifications-change'
        )
      )


    } catch (err) {

      console.error(
        'Mark notification error:',
        err
      )

    }

  }


  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {

    if (markingAll) {
      return
    }


    try {

      setMarkingAll(true)


      await api.markAllNotificationsAsRead()


      setNotifications(
        (previous) =>

          previous.map(
            (notification) => ({
              ...notification,
              is_read: true
            })
          )
      )


      window.dispatchEvent(
        new Event(
          'notifications-change'
        )
      )


    } catch (err) {

      console.error(
        'Mark all notifications error:',
        err
      )


      setError(
        err.message ||
        'Unable to mark notifications as read.'
      )


    } finally {

      setMarkingAll(false)

    }

  }


  // =====================================================
  // COUNTS
  // =====================================================

  const unreadCount =
    notifications.filter(
      notification =>
        !notification.is_read
    ).length


  const totalCount =
    notifications.length


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return ''
    }


    try {

      return new Date(
        date
      ).toLocaleString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      )

    } catch {

      return date

    }

  }


  // =====================================================
  // NOTIFICATION ICON
  // =====================================================

  const getIcon = (type) => {

    if (
      type ===
      'appointment_confirmed'
    ) {

      return (
        <FaCheckCircle />
      )

    }


    if (
      type ===
      'appointment_rejected'
    ) {

      return (
        <FaTimesCircle />
      )

    }


    if (
      type ===
      'appointment_completed'
    ) {

      return (
        <FaCalendarCheck />
      )

    }


    return (
      <FaBell />
    )

  }


  // =====================================================
  // ICON / CARD COLORS
  // =====================================================

  const getIconBackground = (
    type
  ) => {

    if (
      type ===
      'appointment_confirmed'
    ) {

      return {
        wrapper:
          'bg-green-50 text-green-600',

        border:
          'border-green-100',

        unread:
          'border-green-200 bg-green-50/30'
      }

    }


    if (
      type ===
      'appointment_rejected'
    ) {

      return {
        wrapper:
          'bg-red-50 text-red-600',

        border:
          'border-red-100',

        unread:
          'border-red-200 bg-red-50/30'
      }

    }


    if (
      type ===
      'appointment_completed'
    ) {

      return {
        wrapper:
          'bg-blue-50 text-blue-600',

        border:
          'border-blue-100',

        unread:
          'border-blue-200 bg-blue-50/30'
      }

    }


    return {
      wrapper:
        'bg-slate-50 text-slate-600',

      border:
        'border-slate-100',

      unread:
        'border-primary-200 bg-primary-50/20'
    }

  }


  // =====================================================
  // NOTIFICATION LABEL
  // =====================================================

  const getTypeLabel = (
    type
  ) => {

    if (
      type ===
      'appointment_confirmed'
    ) {

      return 'Appointment Confirmed'

    }


    if (
      type ===
      'appointment_rejected'
    ) {

      return 'Appointment Rejected'

    }


    if (
      type ===
      'appointment_completed'
    ) {

      return 'Appointment Completed'

    }


    return 'Notification'

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-5">

        <div className="text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-2xl mb-4">

            <FaBell />

          </div>


          <p className="text-sm text-ink/60">

            Loading notifications...

          </p>

        </div>

      </div>

    )

  }


  return (

    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="bg-white border-b border-slate-200">

        <div className="max-w-4xl mx-auto px-4 sm:px-5 py-6 sm:py-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">


            {/* TITLE */}

            <div className="min-w-0">

              <p className="text-sm font-semibold text-primary-600">

                MediFind

              </p>


              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mt-1">

                Notifications 🔔

              </h1>


              <p className="text-sm text-ink/60 mt-2">

                Stay updated about your appointments.

              </p>


              {/* COUNT */}

              <div className="flex flex-wrap items-center gap-2 mt-4">

                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">

                  <FaBell />

                  {totalCount}{' '}

                  {totalCount === 1
                    ? 'Notification'
                    : 'Notifications'}

                </span>


                {unreadCount > 0 && (

                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">

                    <span className="w-2 h-2 rounded-full bg-primary-600" />

                    {unreadCount}{' '}

                    Unread

                  </span>

                )}

              </div>

            </div>


            {/* ACTIONS */}

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">


              {/* REFRESH */}

              <button
                type="button"
                onClick={() =>
                  loadNotifications(true)
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-ink hover:bg-slate-50 disabled:opacity-60 transition w-full sm:w-auto"
              >

                <FaSyncAlt
                  className={
                    refreshing
                      ? 'animate-spin'
                      : ''
                  }
                />

                {refreshing
                  ? 'Refreshing...'
                  : 'Refresh'}

              </button>


              {/* MARK ALL */}

              {unreadCount > 0 && (

                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={markingAll}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition w-full sm:w-auto"
                >

                  <FaCheckCircle />

                  {markingAll
                    ? 'Marking...'
                    : 'Mark all as read'}

                </button>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="max-w-4xl mx-auto px-4 sm:px-5 py-6 sm:py-8">


        {/* ERROR */}

        {error && (

          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 break-words">

            {error}

          </div>

        )}


        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {!notifications.length &&
          !error && (

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 sm:p-12 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-2xl mb-5">

                <FaBell />

              </div>


              <h2 className="text-xl font-bold text-ink">

                No notifications yet

              </h2>


              <p className="text-sm text-ink/60 mt-2 max-w-sm mx-auto">

                Your appointment updates will appear here.

              </p>


              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition w-full sm:w-auto"
              >

                <FaArrowLeft />

                Back to Home

              </Link>

            </div>

          )}


        {/* ================================================= */}
        {/* NOTIFICATIONS */}
        {/* ================================================= */}

        <div className="space-y-3 sm:space-y-4">

          {notifications.map(
            (notification) => {

              const colors =
                getIconBackground(
                  notification.type
                )


              return (

                <div
                  key={
                    notification.notification_id
                  }

                  onClick={() => {

                    if (
                      !notification.is_read
                    ) {

                      markAsRead(
                        notification.notification_id
                      )

                    }

                  }}

                  role={
                    !notification.is_read
                      ? 'button'
                      : undefined
                  }

                  tabIndex={
                    !notification.is_read
                      ? 0
                      : undefined
                  }

                  className={`
                    bg-white
                    rounded-2xl
                    border
                    shadow-sm
                    p-4
                    sm:p-5
                    cursor-pointer
                    transition
                    hover:shadow-md
                    overflow-hidden

                    ${
                      notification.is_read
                        ? colors.border
                        : colors.unread
                    }
                  `}
                >

                  <div className="flex gap-3 sm:gap-4">


                    {/* ================================================= */}
                    {/* ICON */}
                    {/* ================================================= */}

                    <div
                      className={`
                        w-11
                        h-11
                        sm:w-12
                        sm:h-12
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        text-lg
                        sm:text-xl
                        shrink-0

                        ${colors.wrapper}
                      `}
                    >

                      {getIcon(
                        notification.type
                      )}

                    </div>


                    {/* ================================================= */}
                    {/* CONTENT */}
                    {/* ================================================= */}

                    <div className="flex-1 min-w-0">


                      {/* TITLE ROW */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          {/* TYPE */}

                          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-primary-600 mb-1">

                            {getTypeLabel(
                              notification.type
                            )}

                          </p>


                          {/* TITLE */}

                          <h2 className="font-bold text-ink text-sm sm:text-base break-words">

                            {notification.title}

                          </h2>

                        </div>


                        {/* UNREAD */}

                        {!notification.is_read && (

                          <span
                            className="w-2.5 h-2.5 rounded-full bg-primary-600 shrink-0 mt-2"
                            title="Unread"
                          />

                        )}

                      </div>


                      {/* MESSAGE */}

                      <p className="text-sm text-ink/70 mt-2 leading-relaxed break-words">

                        {notification.message}

                      </p>


                      {/* DATE */}

                      <p className="text-xs text-ink/50 mt-3">

                        {formatDate(
                          notification.created_at
                        )}

                      </p>


                      {/* READ STATUS */}

                      <div className="mt-3">

                        {notification.is_read ? (

                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">

                            <FaCheckCircle />

                            Read

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary-600">

                            <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />

                            Tap to mark as read

                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

              )

            }
          )}

        </div>


        {/* ================================================= */}
        {/* BACK */}
        {/* ================================================= */}

        {notifications.length > 0 && (

          <div className="text-center mt-8">

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline"
            >

              <FaArrowLeft />

              Back to Home

            </Link>

          </div>

        )}

      </div>

    </div>

  )

}