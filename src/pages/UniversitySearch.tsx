import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, MapPin, GitCompare, X, ChevronDown, ChevronUp, Bookmark } from 'lucide-react'
import { universities } from '../data/universities'
import { type University } from '../types'
import { Badge } from '../components/Badge'
import { useBookmarks } from '../hooks/useBookmarks'

const COUNTRIES = [...new Set(universities.map(u => u.country))].sort()
const FACULTIES = [...new Set(universities.flatMap(u => u.faculty))].sort()
const LANGUAGES = [...new Set(universities.flatMap(u => u.languages))].sort()

const tagVariant: Record<string, 'blue' | 'orange' | 'green' | 'purple'> = {
  'High Interest': 'blue',
  'Competitive Choice': 'orange',
  'Course-Friendly': 'green',
  'Safer Option': 'purple',
}

function UniversityCard({
  uni,
  compareList,
  onToggleCompare,
  isBookmarked,
  onToggleBookmark,
}: {
  uni: University
  compareList: string[]
  onToggleCompare: (id: string) => void
  isBookmarked: boolean
  onToggleBookmark: (id: string) => void
}) {
  const inCompare = compareList.includes(uni.id)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-4 flex flex-col gap-3 relative group">
      {/* Full-card navigation link sits behind buttons */}
      <Link
        to={`/university/${uni.id}`}
        className="absolute inset-0 rounded-xl"
        aria-label={`View details for ${uni.name}`}
      />

      {/* Bookmark button — relative z so it sits above the link */}
      <button
        type="button"
        onClick={() => onToggleBookmark(uni.id)}
        aria-label={isBookmarked ? `Remove ${uni.name} from bookmarks` : `Bookmark ${uni.name}`}
        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors z-10 ${isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50 opacity-0 group-hover:opacity-100'}`}
      >
        <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
      </button>

      {/* Logo + Name */}
      <div className="flex items-center gap-3 pr-8 relative">
        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
          {uni.logoPlaceholder}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">{uni.name}</h3>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            {uni.city}, {uni.country}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 relative">
        {uni.tags.map(tag => (
          <Badge key={tag} variant={tagVariant[tag] ?? 'gray'} size="sm">{tag}</Badge>
        ))}
        {uni.ranking && <Badge variant="gray" size="sm">#{uni.ranking} QS</Badge>}
      </div>

      {/* Compare button */}
      <button
        type="button"
        onClick={() => onToggleCompare(uni.id)}
        className={`relative z-10 w-full text-xs py-1.5 rounded-lg border font-medium transition-colors flex items-center justify-center gap-1.5 ${
          inCompare
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : compareList.length >= 4
            ? 'border-gray-100 text-gray-300 cursor-not-allowed'
            : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
        }`}
        disabled={!inCompare && compareList.length >= 4}
        aria-label={inCompare ? `Remove ${uni.name} from compare` : `Add ${uni.name} to compare`}
      >
        <GitCompare className="h-3.5 w-3.5" />
        {inCompare ? 'Added to compare' : 'Compare'}
      </button>
    </div>
  )
}

export default function UniversitySearch() {
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks()
  const [query, setQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [demandFilter, setDemandFilter] = useState('')
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'ranking' | 'cost' | 'vacancies' | 'deadline'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [compareList, setCompareList] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let list = universities.filter(u => {
      if (showBookmarkedOnly && !isBookmarked(u.id)) return false
      if (query) {
        const q = query.toLowerCase()
        if (!u.name.toLowerCase().includes(q) && !u.city.toLowerCase().includes(q) && !u.country.toLowerCase().includes(q)) return false
      }
      if (selectedCountry && u.country !== selectedCountry) return false
      if (selectedFaculty && !u.faculty.includes(selectedFaculty)) return false
      if (selectedLanguage && !u.languages.includes(selectedLanguage)) return false
      if (demandFilter && u.studentDemand !== demandFilter) return false
      return true
    })

    list = [...list].sort((a, b) => {
      let va: number | string, vb: number | string
      if (sortBy === 'name') { va = a.name; vb = b.name }
      else if (sortBy === 'ranking') { va = a.ranking ?? 9999; vb = b.ranking ?? 9999 }
      else if (sortBy === 'cost') { va = a.estimatedMonthlyCost; vb = b.estimatedMonthlyCost }
      else if (sortBy === 'vacancies') { va = a.seats.s1 + a.seats.s2; vb = b.seats.s1 + b.seats.s2 }
      else { va = a.applicationDeadline; vb = b.applicationDeadline }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [query, selectedCountry, selectedFaculty, selectedLanguage, demandFilter, showBookmarkedOnly, isBookmarked, sortBy, sortDir])

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  function toggleCompare(id: string) {
    setCompareList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function clearFilters() {
    setSelectedCountry(''); setSelectedFaculty(''); setSelectedLanguage(''); setDemandFilter('')
  }

  const activeFilters = [selectedCountry, selectedFaculty, selectedLanguage, demandFilter].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partner Universities</h1>
            <p className="text-gray-500 mt-1">{universities.length} universities across {COUNTRIES.length} countries</p>
          </div>
          <button
            type="button"
            onClick={() => setShowBookmarkedOnly(b => !b)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showBookmarkedOnly ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Bookmark className="h-4 w-4" fill={showBookmarkedOnly ? 'currentColor' : 'none'} />
            Bookmarked
          </button>
        </div>

        {/* Search + filter bar */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search university, city, or country…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilters > 0 && <span className="bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{activeFilters}</span>}
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="f-country">Country</label>
              <select id="f-country" title="Filter by country" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-full border border-gray-300 rounded-lg text-sm py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All</option>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="f-faculty">Faculty</label>
              <select id="f-faculty" title="Filter by faculty" value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)} className="w-full border border-gray-300 rounded-lg text-sm py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All</option>
                {FACULTIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="f-language">Language</label>
              <select id="f-language" title="Filter by language" value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="w-full border border-gray-300 rounded-lg text-sm py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All</option>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="f-demand">Student Demand</label>
              <select id="f-demand" title="Filter by student demand" value={demandFilter} onChange={e => setDemandFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg text-sm py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            {activeFilters > 0 && (
              <div className="col-span-full flex justify-end">
                <button type="button" onClick={clearFilters} className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sort bar */}
        <div className="flex items-center gap-2 mb-5 text-sm text-gray-600 flex-wrap">
          <span className="text-gray-400">Sort:</span>
          {(['name', 'ranking', 'cost', 'vacancies', 'deadline'] as const).map(col => (
            <button
              key={col}
              type="button"
              onClick={() => toggleSort(col)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors capitalize ${sortBy === col ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
            >
              {col === 'vacancies' ? 'seats' : col}
              {sortBy === col ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
            </button>
          ))}
          <span className="ml-auto text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">{showBookmarkedOnly ? 'No bookmarked universities' : 'No universities match your filters'}</p>
            <button type="button" onClick={() => { setQuery(''); clearFilters(); setShowBookmarkedOnly(false) }} className="mt-2 text-blue-600 hover:underline text-sm">Clear all</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(uni => (
              <UniversityCard
                key={uni.id}
                uni={uni}
                compareList={compareList}
                onToggleCompare={toggleCompare}
                isBookmarked={isBookmarked(uni.id)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compare tray */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-4 py-3 z-50">
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Comparing:</span>
            <div className="flex gap-2 flex-1 flex-wrap">
              {compareList.map(id => {
                const u = universities.find(x => x.id === id)!
                return (
                  <span key={id} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs px-3 py-1">
                    {u.name}
                    <button type="button" aria-label={`Remove ${u.name} from compare`} onClick={() => toggleCompare(id)}><X className="h-3 w-3" /></button>
                  </span>
                )
              })}
            </div>
            <Link
              to={`/compare?ids=${compareList.join(',')}`}
              aria-disabled={compareList.length < 2}
              className={`px-4 py-2 rounded-lg text-sm font-medium shrink-0 text-white transition-colors ${compareList.length < 2 ? 'bg-blue-300 pointer-events-none' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Compare {compareList.length}
            </Link>
            <button type="button" aria-label="Clear compare list" onClick={() => setCompareList([])} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
