import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Globe, DollarSign, Home, Calendar, Trophy, Users, BookOpen, Bookmark, ExternalLink, ChevronRight } from 'lucide-react'
import { universities } from '../data/universities'
import { Badge } from '../components/Badge'
import { useBookmarks } from '../hooks/useBookmarks'

const tagVariant: Record<string, 'blue' | 'orange' | 'green' | 'purple'> = {
  'High Interest': 'blue',
  'Competitive Choice': 'orange',
  'Course-Friendly': 'green',
  'Safer Option': 'purple',
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <span className="text-sm text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value}</span>
    </div>
  )
}

export default function UniversityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isBookmarked, toggle } = useBookmarks()
  const uni = universities.find(u => u.id === id)

  if (!uni) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500">University not found.</p>
        <button type="button" onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm">Back to search</button>
      </div>
    )
  }

  const bookmarked = isBookmarked(uni.id)
  const totalSeats = uni.seats.s1 + uni.seats.s2

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shrink-0">
              {uni.logoPlaceholder}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{uni.name}</h1>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />{uni.city}, {uni.country}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(uni.id)}
                  aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this university'}
                  className={`p-2 rounded-lg transition-colors ${bookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                >
                  <Bookmark className="h-5 w-5" fill={bookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {uni.tags.map(tag => <Badge key={tag} variant={tagVariant[tag] ?? 'gray'} size="sm">{tag}</Badge>)}
                {uni.ranking && <Badge variant="gray" size="sm">#{uni.ranking} QS</Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Details</h2>
          <Row icon={<Users className="h-4 w-4" />} label="Faculty" value={uni.faculty.join(', ')} />
          <Row icon={<Globe className="h-4 w-4" />} label="Languages" value={uni.languages.join(', ')} />
          <Row icon={<Trophy className="h-4 w-4" />} label="QS Ranking" value={uni.ranking ? `#${uni.ranking}` : '—'} />
          <Row icon={<Users className="h-4 w-4" />} label="Student Demand" value={
            <span className={`font-semibold ${uni.studentDemand === 'High' ? 'text-red-600' : uni.studentDemand === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
              {uni.studentDemand}
            </span>
          } />
          <Row icon={<Calendar className="h-4 w-4" />} label="Application Deadline" value={new Date(uni.applicationDeadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} />
          <Row icon={<Calendar className="h-4 w-4" />} label="Nomination Deadline" value={new Date(uni.nominationDeadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} />
          <Row icon={<DollarSign className="h-4 w-4" />} label="Tuition" value={uni.tuitionFee} />
          <Row icon={<DollarSign className="h-4 w-4" />} label="Est. Monthly Cost" value={`~${uni.estimatedMonthlyCost} ${uni.currency}`} />
          <Row icon={<DollarSign className="h-4 w-4" />} label="Scholarships" value={uni.scholarships ? 'Available' : 'Not available'} />
          <Row icon={<Home className="h-4 w-4" />} label="University Housing" value={uni.housingAvailable ? 'Available' : 'Not available'} />
          <Row icon={<Users className="h-4 w-4" />} label="Allocated Seats" value={`${totalSeats} total — S1: ${uni.seats.s1}, S2: ${uni.seats.s2}`} />
        </div>

        {/* Senior course mappings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Senior Course Mappings</h2>
              <p className="text-xs text-gray-400 mt-0.5">Courses past students successfully mapped at this university</p>
            </div>
            <span className="text-xs text-gray-400">{uni.mappings.length} mapping{uni.mappings.length !== 1 ? 's' : ''}</span>
          </div>
          {uni.mappings.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No mappings recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {uni.mappings.map(m => (
                <div key={m.id} className="flex items-center gap-2 py-2.5 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap text-sm">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">{m.homeCode}</span>
                      <span className="text-gray-800 font-medium truncate">{m.homeName}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="font-mono text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded shrink-0">{m.hostCode}</span>
                      <span className="text-gray-600 truncate">{m.hostName}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{m.units} units · {m.semester}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate(`/courses?uni=${uni.id}`)}
            className="mt-4 w-full text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 rounded-lg py-2 font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <BookOpen className="h-4 w-4" /> Browse all course mappings
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/compare?ids=${uni.id}`)}
            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-3 text-sm font-medium transition-colors"
          >
            Add to Compare
          </button>
          <a
            href={uni.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            Visit Website <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
