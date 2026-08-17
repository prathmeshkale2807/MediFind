import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FaBed,
  FaHospital,
  FaSearch,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaAmbulance,
  FaClock,
  FaFilter,
  FaExclamationTriangle,
} from 'react-icons/fa'
import Loading from '../components/Loading.jsx'
import { api } from '../api.js'

const BED_TYPES = [
  { key: 'all', label: 'All beds' },
  { key: 'general', label: 'General' },
  { key: 'icu', label: 'ICU' },
  { key: 'ventilator', label: 'Ventilator' },
]

function normalizeType(value = '') {
  const v = String(value).toLowerCase().trim()
  if (v.includes('icu')) return 'icu'
  if (v.includes('vent')) return 'ventilator'
  return 'general'
}

function formatUpdated(value) {
  if (!value) return 'Update time unavailable'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Update time unavailable'
  return `Updated ${d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`
}

function getStatus(available, total) {
  if (!total) return { label: 'No data', tone: 'neutral' }
  const pct = (available / total) * 100
  if (available <= 0) return { label: 'Full', tone: 'danger' }
  if (pct <= 15) return { label: 'Critical', tone: 'danger' }
  if (pct <= 30) return { label: 'Limited', tone: 'warning' }
  return { label: 'Available', tone: 'success' }
}

function BedCard({ hospital, selectedType }) {
  const beds = hospital.beds || []
  const visible = selectedType === 'all'
    ? beds
    : beds.filter((b) => b.type === selectedType)

  if (!visible.length) return null

  const total = visible.reduce((sum, b) => sum + b.total, 0)
  const available = visible.reduce((sum, b) => sum + b.available, 0)
  const occupied = Math.max(total - available, 0)
  const occupancy = total ? Math.round((occupied / total) * 100) : 0
  const status = getStatus(available, total)

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden"
    >
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-ink flex items-center gap-2">
              <FaHospital className="text-primary-600" /> {hospital.name}
            </h2>
            <p className="text-sm text-muted mt-1 flex items-center gap-1">
              <FaMapMarkerAlt /> {hospital.address || 'Location unavailable'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            status.tone === 'danger' ? 'bg-red-50 text-red-700' :
            status.tone === 'warning' ? 'bg-amber-50 text-amber-700' :
            status.tone === 'success' ? 'bg-emerald-50 text-emerald-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-muted">Available</p>
            <p className="text-xl font-extrabold text-available-dark">{available}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-muted">Total</p>
            <p className="text-xl font-extrabold text-ink">{total}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-muted">Occupied</p>
            <p className="text-xl font-extrabold text-ink">{occupied}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>Occupancy</span><span>{occupancy}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                occupancy >= 85 ? 'bg-red-500' : occupancy >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${occupancy}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {visible.map((bed) => {
          const itemStatus = getStatus(bed.available, bed.total)
          const pct = bed.total ? Math.round((bed.available / bed.total) * 100) : 0
          return (
            <div key={bed.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-semibold text-ink">
                  <FaBed className="text-primary-600" /> {bed.label}
                </div>
                <span className={`text-xs font-bold ${
                  itemStatus.tone === 'danger' ? 'text-red-600' :
                  itemStatus.tone === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {bed.available} available
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted mt-2">
                <span>{bed.total - bed.available} occupied of {bed.total}</span>
                <span>{pct}% free</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    pct <= 15 ? 'bg-red-500' : pct <= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-5 py-3 bg-slate-50 flex flex-wrap gap-4 text-xs text-muted">
        <span className="flex items-center gap-1"><FaClock /> {formatUpdated(hospital.updatedAt)}</span>
        {hospital.emergencyBeds > 0 && (
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <FaAmbulance /> {hospital.emergencyBeds} emergency beds recorded
          </span>
        )}
      </div>
    </motion.article>
  )
}

export default function BedStatus() {
  const [beds, setBeds] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [onlyCritical, setOnlyCritical] = useState(false)
  const [sortBy, setSortBy] = useState('available')

  async function loadBeds(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const [bedData, hospitalData] = await Promise.all([
        api.getBeds(),
        api.getHospitals(),
      ])
      setBeds(Array.isArray(bedData) ? bedData : [])
      setHospitals(Array.isArray(hospitalData) ? hospitalData : [])
    } catch (err) {
      setError(err.message || 'Unable to load bed availability.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadBeds() }, [])

  const dashboard = useMemo(() => {
    const hospitalMap = new Map()
    hospitals.forEach((h) => hospitalMap.set(Number(h.id), {
      id: Number(h.id),
      name: h.name,
      address: h.address,
      distanceKm: h.distanceKm,
      emergencyBeds: Number(h.emergencyBeds || 0),
      updatedAt: null,
      beds: [],
    }))

    beds.forEach((row) => {
      const hid = Number(row.hospital_id)
      if (!hospitalMap.has(hid)) {
        hospitalMap.set(hid, {
          id: hid,
          name: row.hospital_name || `Hospital #${hid}`,
          address: row.city || '',
          distanceKm: null,
          emergencyBeds: 0,
          updatedAt: null,
          beds: [],
        })
      }
      const h = hospitalMap.get(hid)
      const type = normalizeType(row.bed_type)
      const total = Number(row.total_beds || 0)
      const available = Math.min(Math.max(Number(row.available_beds || 0), 0), total)
      h.beds.push({
        id: row.bed_id,
        type,
        label: type === 'icu' ? 'ICU Beds' : type === 'ventilator' ? 'Ventilator Beds' : 'General Beds',
        total,
        available,
      })
      if (row.updated_at) {
        if (!h.updatedAt || new Date(row.updated_at) > new Date(h.updatedAt)) h.updatedAt = row.updated_at
      }
    })

    let rows = [...hospitalMap.values()].filter((h) => h.beds.length)

    const q = search.trim().toLowerCase()
    if (q) rows = rows.filter((h) => `${h.name} ${h.address}`.toLowerCase().includes(q))

    rows = rows.filter((h) => {
      const visible = selectedType === 'all' ? h.beds : h.beds.filter((b) => b.type === selectedType)
      const available = visible.reduce((s, b) => s + b.available, 0)
      const total = visible.reduce((s, b) => s + b.total, 0)
      const freePct = total ? (available / total) * 100 : 0
      if (onlyAvailable && available <= 0) return false
      if (onlyCritical && !(available > 0 && freePct <= 30)) return false
      return visible.length > 0
    })

    rows.sort((a, b) => {
      const bedsA = selectedType === 'all' ? a.beds : a.beds.filter((x) => x.type === selectedType)
      const bedsB = selectedType === 'all' ? b.beds : b.beds.filter((x) => x.type === selectedType)
      const availA = bedsA.reduce((s, x) => s + x.available, 0)
      const availB = bedsB.reduce((s, x) => s + x.available, 0)
      if (sortBy === 'distance') return (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999)
      if (sortBy === 'occupancy') {
        const pctA = bedsA.reduce((s, x) => s + x.total, 0) ? availA / bedsA.reduce((s, x) => s + x.total, 0) : 0
        const pctB = bedsB.reduce((s, x) => s + x.total, 0) ? availB / bedsB.reduce((s, x) => s + x.total, 0) : 0
        return pctB - pctA
      }
      return availB - availA
    })
    return rows
  }, [beds, hospitals, search, selectedType, onlyAvailable, onlyCritical, sortBy])

  const totals = useMemo(() => {
    const rows = dashboard
    const all = rows.flatMap((h) => selectedType === 'all' ? h.beds : h.beds.filter((b) => b.type === selectedType))
    return {
      hospitals: rows.length,
      total: all.reduce((s, b) => s + b.total, 0),
      available: all.reduce((s, b) => s + b.available, 0),
      critical: rows.filter((h) => {
        const bs = selectedType === 'all' ? h.beds : h.beds.filter((b) => b.type === selectedType)
        const t = bs.reduce((s, b) => s + b.total, 0)
        const a = bs.reduce((s, b) => s + b.available, 0)
        return a > 0 && t > 0 && a / t <= 0.3
      }).length,
    }
  }, [dashboard, selectedType])

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-ink mb-2">Smart Bed Availability</h1>
          <p className="text-muted max-w-3xl">
            Find hospitals with available beds, see occupancy pressure, identify critical capacity and refresh the latest recorded status before travelling.
          </p>
        </div>
        <button
          onClick={() => loadBeds(true)}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl bg-primary-600 text-white font-semibold flex items-center gap-2 disabled:opacity-60"
        >
          <FaSyncAlt className={refreshing ? 'animate-spin' : ''} /> Refresh availability
        </button>
      </div>

      {loading ? <Loading label="Fetching bed availability..." /> : error ? (
        <div className="bg-red-50 text-red-700 rounded-2xl p-5">Unable to load bed data: {error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-card p-4"><p className="text-xs text-muted">Hospitals shown</p><p className="text-2xl font-extrabold text-ink">{totals.hospitals}</p></div>
            <div className="bg-white rounded-2xl shadow-card p-4"><p className="text-xs text-muted">Beds available</p><p className="text-2xl font-extrabold text-emerald-600">{totals.available}</p></div>
            <div className="bg-white rounded-2xl shadow-card p-4"><p className="text-xs text-muted">Beds tracked</p><p className="text-2xl font-extrabold text-ink">{totals.total}</p></div>
            <div className="bg-white rounded-2xl shadow-card p-4"><p className="text-xs text-muted">Capacity under pressure</p><p className="text-2xl font-extrabold text-amber-600">{totals.critical}</p></div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-4 mb-7 space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hospital or area..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-200" />
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200">
                <option value="available">Most beds available</option>
                <option value="occupancy">Lowest occupancy</option>
                <option value="distance">Nearest first</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink flex items-center gap-2 mr-1"><FaFilter /> Bed type</span>
              {BED_TYPES.map((type) => (
                <button key={type.key} onClick={() => setSelectedType(type.key)} className={`px-3 py-2 rounded-lg text-sm font-semibold ${selectedType === type.key ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {type.label}
                </button>
              ))}
              <button onClick={() => setOnlyAvailable((v) => !v)} className={`px-3 py-2 rounded-lg text-sm font-semibold ${onlyAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                <FaBed className="inline mr-1" /> Available only
              </button>
              <button onClick={() => setOnlyCritical((v) => !v)} className={`px-3 py-2 rounded-lg text-sm font-semibold ${onlyCritical ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                <FaExclamationTriangle className="inline mr-1" /> Limited availability
              </button>
            </div>
          </div>

          {dashboard.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card p-12 text-center text-muted">No hospitals match your current bed filters.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dashboard.map((hospital) => <BedCard key={hospital.id} hospital={hospital} selectedType={selectedType} />)}
            </div>
          )}

          <div className="mt-7 rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800 flex gap-3">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <p><strong>Important:</strong> bed counts are availability records maintained by hospitals and may change quickly. Call the hospital before travelling or treating this information as a confirmed admission.</p>
          </div>
        </>
      )}
    </div>
  )
}
