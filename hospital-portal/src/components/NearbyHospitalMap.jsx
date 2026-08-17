import { useEffect, useRef, useState } from 'react'
import {
  FaHospital,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaDirections
} from 'react-icons/fa'

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY


function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google)
      return
    }

    if (!GOOGLE_MAPS_API_KEY) {
      reject(
        new Error(
          'Google Maps API key is missing. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.'
        )
      )
      return
    }

    const existingScript =
      document.querySelector(
        'script[data-google-maps="true"]'
      )

    if (existingScript) {
      existingScript.addEventListener(
        'load',
        () => resolve(window.google)
      )

      existingScript.addEventListener(
        'error',
        () =>
          reject(
            new Error(
              'Google Maps failed to load.'
            )
          )
      )

      return
    }

    const script =
      document.createElement('script')

    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        GOOGLE_MAPS_API_KEY
      )}&v=weekly`

    script.async = true
    script.defer = true
    script.dataset.googleMaps = 'true'

    script.onload = () =>
      resolve(window.google)

    script.onerror = () =>
      reject(
        new Error(
          'Unable to load Google Maps.'
        )
      )

    document.head.appendChild(script)
  })
}


export default function NearbyHospitalMap({
  userLocation,
  hospitals = []
}) {

  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const infoWindowRef = useRef(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')


  // =========================================================
  // OPEN DIRECTIONS
  // =========================================================

  const openDirections = (
    hospital
  ) => {

    if (
      hospital.latitude == null ||
      hospital.longitude == null
    ) {
      if (hospital.address) {

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

      return
    }


    if (!userLocation) {
      const url =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          hospital.latitude
        )},${encodeURIComponent(
          hospital.longitude
        )}`

      window.open(
        url,
        '_blank',
        'noopener,noreferrer'
      )

      return
    }


    const url =
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        userLocation.latitude
      )},${encodeURIComponent(
        userLocation.longitude
      )}&destination=${encodeURIComponent(
        hospital.latitude
      )},${encodeURIComponent(
        hospital.longitude
      )}`


    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    )
  }


  // =========================================================
  // CREATE MAP
  // =========================================================

  useEffect(() => {

    let cancelled = false

    async function initializeMap() {

      try {

        setLoading(true)
        setError('')


        if (
          !userLocation ||
          userLocation.latitude == null ||
          userLocation.longitude == null
        ) {

          setLoading(false)
          return
        }


        const google =
          await loadGoogleMaps()


        if (cancelled) {
          return
        }


        const { Map } =
          await google.maps.importLibrary(
            'maps'
          )


        const { AdvancedMarkerElement } =
          await google.maps.importLibrary(
            'marker'
          )


        if (cancelled) {
          return
        }


        // -----------------------------------------------------
        // MAP
        // -----------------------------------------------------

        const center = {
          lat: Number(
            userLocation.latitude
          ),

          lng: Number(
            userLocation.longitude
          )
        }


        const map =
          new Map(
            mapRef.current,
            {
              center,
              zoom: 13,
              mapId: 'DEMO_MAP_ID',

              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,

              gestureHandling:
                'greedy'
            }
          )


        mapInstance.current =
          map


        // -----------------------------------------------------
        // INFO WINDOW
        // -----------------------------------------------------

        const infoWindow =
          new google.maps.InfoWindow()

        infoWindowRef.current =
          infoWindow


        // -----------------------------------------------------
        // USER LOCATION MARKER
        // -----------------------------------------------------

        const userPin =
          document.createElement(
            'div'
          )

        userPin.innerHTML = `
          <div style="
            width:22px;
            height:22px;
            border-radius:50%;
            background:#2563eb;
            border:4px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,.35);
          "></div>
        `


        const userMarker =
          new AdvancedMarkerElement({
            map,
            position: center,
            title:
              'Your current location',
            content: userPin
          })


        markersRef.current.push(
          userMarker
        )


        // -----------------------------------------------------
        // HOSPITAL MARKERS
        // -----------------------------------------------------

        hospitals.forEach(
          (hospital) => {

            if (
              hospital.latitude == null ||
              hospital.longitude == null
            ) {
              return
            }


            const position = {
              lat: Number(
                hospital.latitude
              ),

              lng: Number(
                hospital.longitude
              )
            }


            // Registered = green
            // Unregistered = gray
            const markerColor =
              hospital.registered
                ? '#16a34a'
                : '#475569'


            const hospitalPin =
              document.createElement(
                'div'
              )


            hospitalPin.innerHTML = `
              <div style="
                width:38px;
                height:38px;
                border-radius:50% 50% 50% 0;
                transform:rotate(-45deg);
                background:${markerColor};
                border:3px solid white;
                box-shadow:0 3px 10px rgba(0,0,0,.3);
                display:flex;
                align-items:center;
                justify-content:center;
              ">
                <span style="
                  transform:rotate(45deg);
                  color:white;
                  font-size:17px;
                  font-weight:bold;
                ">✚</span>
              </div>
            `


            const marker =
              new AdvancedMarkerElement({

                map,

                position,

                title:
                  hospital.name ||
                  'Hospital',

                content:
                  hospitalPin,

                gmpClickable:
                  true
              })


            marker.addListener(
              'click',
              () => {

                const registered =
                  hospital.registered


                const distance =
                  hospital.distance
                    ? `<div style="
                        margin-top:6px;
                        color:#64748b;
                        font-size:12px;
                      ">
                        ${hospital.distance}
                      </div>`
                    : ''


                const status =
                  registered

                    ? `
                      <div style="
                        color:#15803d;
                        font-weight:700;
                        font-size:12px;
                        margin-top:8px;
                      ">
                        ✓ Registered on MediFind
                      </div>
                    `

                    : `
                      <div style="
                        color:#475569;
                        font-weight:700;
                        font-size:12px;
                        margin-top:8px;
                      ">
                        Not registered on MediFind
                      </div>
                    `


                const address =
                  hospital.address
                    ? `
                      <div style="
                        margin-top:8px;
                        color:#475569;
                        font-size:13px;
                        line-height:1.4;
                      ">
                        ${hospital.address}
                      </div>
                    `
                    : ''


                const rating =
                  hospital.rating != null
                    ? `
                      <div style="
                        margin-top:6px;
                        font-size:13px;
                      ">
                        ⭐ ${hospital.rating}
                      </div>
                    `
                    : ''


                const buttonId =
                  `direction-${Date.now()}`


                const content = `
                  <div style="
                    width:260px;
                    font-family:Arial,sans-serif;
                    padding:4px;
                  ">

                    <div style="
                      font-size:17px;
                      font-weight:700;
                      color:#0f172a;
                    ">
                      ${hospital.name || 'Hospital'}
                    </div>

                    ${status}

                    ${distance}

                    ${address}

                    ${rating}

                    <button
                      id="${buttonId}"
                      style="
                        margin-top:12px;
                        width:100%;
                        border:0;
                        border-radius:8px;
                        padding:9px 12px;
                        background:#2563eb;
                        color:white;
                        font-weight:600;
                        cursor:pointer;
                      "
                    >
                      Get Directions
                    </button>

                  </div>
                `


                infoWindow.setContent(
                  content
                )


                infoWindow.open({
                  map,
                  anchor: marker
                })


                // Wait for InfoWindow DOM
                setTimeout(() => {

                  const button =
                    document.getElementById(
                      buttonId
                    )


                  if (button) {

                    button.onclick = () =>
                      openDirections(
                        hospital
                      )

                  }

                }, 100)

              }
            )


            markersRef.current.push(
              marker
            )

          }
        )


        // -----------------------------------------------------
        // FIT MAP TO USER + HOSPITALS
        // -----------------------------------------------------

        const bounds =
          new google.maps.LatLngBounds()


        bounds.extend(center)


        hospitals.forEach(
          (hospital) => {

            if (
              hospital.latitude != null &&
              hospital.longitude != null
            ) {

              bounds.extend({
                lat: Number(
                  hospital.latitude
                ),

                lng: Number(
                  hospital.longitude
                )
              })

            }

          }
        )


        if (
          hospitals.some(
            (hospital) =>
              hospital.latitude != null &&
              hospital.longitude != null
          )
        ) {

          map.fitBounds(bounds)


          // Don't zoom too far out
          google.maps.event.addListenerOnce(
            map,
            'bounds_changed',
            () => {

              if (
                map.getZoom() > 15
              ) {

                map.setZoom(15)

              }

            }
          )

        }


        setLoading(false)

      } catch (err) {

        console.error(
          'Google Maps error:',
          err
        )


        if (!cancelled) {

          setError(
            err.message ||
            'Unable to load the map.'
          )

          setLoading(false)

        }

      }

    }


    initializeMap()


    return () => {

      cancelled = true


      markersRef.current.forEach(
        (marker) => {

          marker.map = null

        }
      )


      markersRef.current = []


      mapInstance.current = null

      infoWindowRef.current = null

    }

  }, [
    userLocation,
    hospitals
  ])


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="bg-white rounded-3xl shadow-card overflow-hidden">

      {/* HEADER */}

      <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <div className="flex items-center gap-2 text-primary-600 text-sm font-semibold">

              <FaMapMarkerAlt />

              Nearby Hospital Map

            </div>


            <h3 className="text-xl font-display font-bold text-ink mt-1">

              Hospitals within 5 km

            </h3>


            <p className="text-sm text-muted mt-1">

              Green markers are registered on MediFind. Grey markers are not registered.

            </p>

          </div>


          <div className="flex items-center gap-4 text-xs font-semibold">

            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-green-600" />

              Registered

            </div>


            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-slate-600" />

              Not registered

            </div>

          </div>

        </div>

      </div>


      {/* MAP */}

      <div className="relative">

        <div
          ref={mapRef}
          className="w-full h-[420px] sm:h-[500px]"
        />


        {loading && (

          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">

            <div className="text-center">

              <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto" />

              <p className="text-sm font-semibold text-ink mt-4">

                Loading hospital map...

              </p>

            </div>

          </div>

        )}


        {error && (

          <div className="absolute inset-0 bg-white flex items-center justify-center p-6">

            <div className="max-w-md text-center">

              <FaExclamationCircle
                className="mx-auto text-red-500 mb-3"
                size={30}
              />


              <h3 className="font-bold text-ink">

                Map could not be loaded

              </h3>


              <p className="text-sm text-muted mt-2">

                {error}

              </p>


              <p className="text-xs text-muted mt-4">

                Check your Google Maps API key and make sure the Maps JavaScript API is enabled.

              </p>

            </div>

          </div>

        )}

      </div>


      {/* FOOTER */}

      <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

          <div className="flex items-center gap-2 text-sm text-muted">

            <FaHospital className="text-primary-600" />

            <span>

              {hospitals.length}{' '}
              hospitals found within 5 km

            </span>

          </div>


          <span className="text-xs text-muted">

            Click a hospital marker for details

          </span>

        </div>

      </div>

    </div>

  )
}