import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa'

// A controlled search bar. Parent page owns the state so the
// same component can be reused on Home and Hospitals pages.
export default function SearchBar({ value, onChange, onSubmit, placeholder }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(value)
      }}
      className="w-full bg-white rounded-2xl shadow-card flex flex-col sm:flex-row items-stretch gap-2 p-2"
    >
      <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-slate-50">
        <FaSearch className="text-muted shrink-0" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="text"
          placeholder={placeholder || 'Search hospital, speciality or doctor'}
          className="w-full bg-transparent outline-none text-sm text-ink placeholder:text-muted"
        />
      </div>
      <div className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 text-muted text-sm">
        <FaMapMarkerAlt />
        Pune, MH
      </div>
      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
      >
        Search
      </button>
    </form>
  )
}
