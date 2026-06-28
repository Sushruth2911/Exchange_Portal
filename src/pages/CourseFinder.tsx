import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, BookOpen, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react'
import { universities, homeCourses } from '../data/universities'
import { type CourseMapping, type University } from '../types'

function MappingRow({ mapping }: { mapping: CourseMapping }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap text-sm">
          <span className="font-mono text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">{mapping.homeCode}</span>
          <span className="text-gray-800 font-medium">{mapping.homeName}</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="font-mono text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded shrink-0">{mapping.hostCode}</span>
          <span className="text-gray-600">{mapping.hostName}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{mapping.units} units · {mapping.semester}</p>
      </div>
    </div>
  )
}

function UniGroup({ uni, mappings }: { uni: University; mappings: CourseMapping[] }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="h-9 w-9 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
          {uni.logoPlaceholder}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{uni.name}</p>
          <p className="text-xs text-gray-500">{uni.city}, {uni.country}</p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{mappings.length} mapping{mappings.length !== 1 ? 's' : ''}</span>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-gray-100">
          {mappings.map(m => <MappingRow key={m.id} mapping={m} />)}
        </div>
      )}
    </div>
  )
}

export default function CourseFinder() {
  const [searchParams] = useSearchParams()
  const preselectedUniId = searchParams.get('uni') ?? ''

  const [homeCourseQuery, setHomeCourseQuery] = useState('')
  const [selectedHomeCourse, setSelectedHomeCourse] = useState('')
  const [uniFilter, setUniFilter] = useState(preselectedUniId)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredHomeCourses = useMemo(() =>
    homeCourses.filter(c =>
      homeCourseQuery &&
      (c.code.toLowerCase().includes(homeCourseQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(homeCourseQuery.toLowerCase()))
    ), [homeCourseQuery])

  const groups = useMemo(() =>
    universities
      .filter(u => !uniFilter || u.id === uniFilter)
      .map(uni => ({
        uni,
        mappings: uni.mappings.filter(m =>
          !selectedHomeCourse || m.homeCode === selectedHomeCourse
        ),
      }))
      .filter(g => g.mappings.length > 0),
    [selectedHomeCourse, uniFilter]
  )

  const totalMappings = groups.reduce((s, g) => s + g.mappings.length, 0)

  function selectCourse(code: string, label: string) {
    setSelectedHomeCourse(code)
    setHomeCourseQuery(label)
    setShowSuggestions(false)
  }

  function clearCourse() {
    setSelectedHomeCourse('')
    setHomeCourseQuery('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
          <ArrowLeft className="h-4 w-4" /> Back to universities
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Senior Course Mappings</h1>
          <p className="text-gray-500 mt-1">Courses past students successfully mapped at partner universities</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Home course search */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="course-search">Home Course</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                id="course-search"
                type="text"
                placeholder="Search by code or name…"
                value={homeCourseQuery}
                onChange={e => { setHomeCourseQuery(e.target.value); setSelectedHomeCourse(''); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {homeCourseQuery && (
                <button type="button" onClick={clearCourse} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear course filter">
                  ×
                </button>
              )}
              {showSuggestions && filteredHomeCourses.length > 0 && (
                <ul className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto">
                  {filteredHomeCourses.map(c => (
                    <li key={c.code}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onMouseDown={() => selectCourse(c.code, `${c.code} – ${c.name}`)}
                      >
                        <span className="font-mono text-xs text-gray-400">{c.code}</span>
                        <span className="text-gray-700">{c.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* University filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="uni-filter">University</label>
            <select
              id="uni-filter"
              title="Filter by university"
              value={uniFilter}
              onChange={e => setUniFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg text-sm py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All universities</option>
              {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-3">{totalMappings} mapping{totalMappings !== 1 ? 's' : ''} found</p>

        {groups.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No mappings found</p>
            <p className="text-sm mt-1">Try a different course or university</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map(({ uni, mappings }) => (
              <UniGroup key={uni.id} uni={uni} mappings={mappings} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
