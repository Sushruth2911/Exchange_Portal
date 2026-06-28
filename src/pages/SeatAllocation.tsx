import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import { universities } from '../data/universities'

const COUNTRIES = [...new Set(universities.map(u => u.country))].sort()

type SortKey = 'name' | 'country' | 's1' | 's2' | 'total'

function SeatBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const color = value === 0 ? 'bg-gray-200' : value <= 2 ? 'bg-red-400' : value <= 4 ? 'bg-yellow-400' : 'bg-blue-400'
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-semibold tabular-nums ${value === 0 ? 'text-gray-300' : value <= 2 ? 'text-red-600' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  )
}

export default function SeatAllocation() {
  const [query, setQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const maxSeats = useMemo(() => Math.max(...universities.map(u => u.seats.s1 + u.seats.s2), 1), [])

  const rows = useMemo(() => {
    let list = universities.filter(u => {
      if (countryFilter && u.country !== countryFilter) return false
      if (query) {
        const q = query.toLowerCase()
        if (!u.name.toLowerCase().includes(q) && !u.country.toLowerCase().includes(q) && !u.city.toLowerCase().includes(q)) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      let va: string | number, vb: string | number
      if (sortKey === 'name') { va = a.name; vb = b.name }
      else if (sortKey === 'country') { va = a.country; vb = b.country }
      else if (sortKey === 's1') { va = a.seats.s1; vb = b.seats.s1 }
      else if (sortKey === 's2') { va = a.seats.s2; vb = b.seats.s2 }
      else { va = a.seats.s1 + a.seats.s2; vb = b.seats.s1 + b.seats.s2 }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [query, countryFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const totalS1 = rows.reduce((s, u) => s + u.seats.s1, 0)
  const totalS2 = rows.reduce((s, u) => s + u.seats.s2, 0)

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null
    return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
  }

  function Th({ col, label, align = 'left' }: { col: SortKey; label: string; align?: 'left' | 'right' }) {
    return (
      <th
        className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700 whitespace-nowrap text-${align}`}
        onClick={() => toggleSort(col)}
      >
        <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
          {label}
          <SortIcon col={col} />
        </span>
      </th>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Seat Allocation</h1>
          <p className="text-gray-500 mt-1">Allocated exchange seats per partner university per semester</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Universities', value: universities.length },
            { label: 'Semester 1 Seats', value: universities.reduce((s, u) => s + u.seats.s1, 0) },
            { label: 'Semester 2 Seats', value: universities.reduce((s, u) => s + u.seats.s2, 0) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search university…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <select
            title="Filter by country"
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg text-sm py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All countries</option>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <Th col="name" label="University" />
                <Th col="country" label="Country" />
                <Th col="s1" label="Semester 1" align="right" />
                <Th col="s2" label="Semester 2" align="right" />
                <Th col="total" label="Total" align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No universities match your search</td>
                </tr>
              ) : (
                rows.map(uni => (
                  <tr key={uni.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/university/${uni.id}`} className="flex items-center gap-2.5 group">
                        <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {uni.logoPlaceholder}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{uni.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />{uni.city}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{uni.country}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <SeatBar value={uni.seats.s1} max={maxSeats} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <SeatBar value={uni.seats.s2} max={maxSeats} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-gray-900 tabular-nums">{uni.seats.s1 + uni.seats.s2}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700" colSpan={2}>
                    Totals ({rows.length} {rows.length === 1 ? 'university' : 'universities'})
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{totalS1}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{totalS2}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-blue-600">{totalS1 + totalS2}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Seat counts are subject to change. Contact the CAO for confirmed allocations.
        </p>
      </div>
    </div>
  )
}
