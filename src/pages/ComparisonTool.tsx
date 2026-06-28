import { useMemo, type ReactElement } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, MapPin, Globe, DollarSign, Home, GraduationCap, BookOpen, Users, Calendar, Trophy, AlertCircle, ChevronRight } from 'lucide-react'
import { universities } from '../data/universities'
import { type University } from '../types'
import { Badge } from '../components/Badge'

const tagVariant: Record<string, 'blue' | 'orange' | 'green' | 'purple'> = {
  'High Interest': 'blue',
  'Competitive Choice': 'orange',
  'Course-Friendly': 'green',
  'Safer Option': 'purple',
}

function YesNo({ value }: { value: boolean }) {
  return value
    ? <CheckCircle className="h-5 w-5 text-green-500" />
    : <XCircle className="h-5 w-5 text-red-400" />
}

function DemandBar({ demand }: { demand: University['studentDemand'] }) {
  const levels = { High: 3, Medium: 2, Low: 1 }
  const n = levels[demand]
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-3 w-5 rounded-sm ${i <= n ? demand === 'High' ? 'bg-red-400' : demand === 'Medium' ? 'bg-yellow-400' : 'bg-green-400' : 'bg-gray-200'}`} />
        ))}
      </div>
      <span className="text-sm text-gray-600">{demand}</span>
    </div>
  )
}

function CostBar({ cost, max }: { cost: number; max: number }) {
  const pct = Math.round((cost / max) * 100)
  const tier = pct > 70 ? 'cost-bar--high' : pct > 40 ? 'cost-bar--mid' : 'cost-bar--low'
  return (
    <div className="space-y-1">
      <progress value={cost} max={max} className={`cost-bar ${tier}`} aria-label="Monthly cost" />
      <span className="text-sm font-medium text-gray-700">{cost} <span className="text-xs text-gray-400">/ month</span></span>
    </div>
  )
}

type SectionRow = {
  label: string
  icon: ReactElement
  render: (u: University) => ReactElement | string | null
}

export default function ComparisonTool() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ids = (searchParams.get('ids') ?? '').split(',').filter(Boolean)
  const selected = useMemo(() => ids.map(id => universities.find(u => u.id === id)).filter(Boolean) as University[], [ids])

  const maxCost = useMemo(() => Math.max(...selected.map(u => u.estimatedMonthlyCost), 1), [selected])

  if (selected.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500 text-center">Select at least 2 universities from the search page to compare.</p>
        <button type="button" onClick={() => navigate('/')} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium">
          Back to search
        </button>
      </div>
    )
  }

  const bestCost = selected.reduce((a, b) => a.estimatedMonthlyCost < b.estimatedMonthlyCost ? a : b).id
  const mostSeats = selected.reduce((a, b) => (a.seats.s1 + a.seats.s2) >= (b.seats.s1 + b.seats.s2) ? a : b).id
  const bestRanking = selected.reduce((a, b) => {
    const ar = a.ranking ?? 9999; const br = b.ranking ?? 9999
    return ar < br ? a : b
  }).id
  const mostMappings = selected.reduce((a, b) => a.mappings.length >= b.mappings.length ? a : b).id
  const latestDeadline = selected.reduce((a, b) => a.applicationDeadline > b.applicationDeadline ? a : b).id

  const sections: { title: string; rows: SectionRow[] }[] = [
    {
      title: 'Overview',
      rows: [
        {
          label: 'Location',
          icon: <MapPin className="h-4 w-4" />,
          render: u => `${u.city}, ${u.country}`,
        },
        {
          label: 'QS Ranking',
          icon: <Trophy className="h-4 w-4" />,
          render: u => u.ranking ? (
            <span className={`font-bold ${u.id === bestRanking ? 'text-green-700' : 'text-gray-700'}`}>
              #{u.ranking} {u.id === bestRanking && <span className="text-xs font-normal text-green-600 ml-1">Highest</span>}
            </span>
          ) : <span className="text-gray-400">—</span>,
        },
        {
          label: 'Labels',
          icon: <Globe className="h-4 w-4" />,
          render: u => (
            <div className="flex flex-wrap gap-1">
              {u.tags.map(tag => <Badge key={tag} variant={tagVariant[tag] ?? 'gray'} size="sm">{tag}</Badge>)}
            </div>
          ),
        },
        {
          label: 'Faculty',
          icon: <GraduationCap className="h-4 w-4" />,
          render: u => u.faculty.join(', '),
        },
        {
          label: 'Languages',
          icon: <Globe className="h-4 w-4" />,
          render: u => u.languages.join(', '),
        },
      ],
    },
    {
      title: 'Availability',
      rows: [
        {
          label: 'Seats (S1 / S2)',
          icon: <Users className="h-4 w-4" />,
          render: u => {
            const total = u.seats.s1 + u.seats.s2
            return (
              <div>
                <span className={`font-bold text-lg ${u.id === mostSeats ? 'text-green-700' : 'text-gray-800'}`}>
                  {total}
                </span>
                <span className="text-xs text-gray-400 ml-1">({u.seats.s1} S1 · {u.seats.s2} S2)</span>
                {u.id === mostSeats && <span className="text-xs text-green-600 ml-1">Most</span>}
              </div>
            )
          },
        },
        {
          label: 'Student Demand',
          icon: <Users className="h-4 w-4" />,
          render: u => <DemandBar demand={u.studentDemand} />,
        },
        {
          label: 'Application Deadline',
          icon: <Calendar className="h-4 w-4" />,
          render: u => (
            <span className={u.id === latestDeadline ? 'text-green-700 font-medium' : ''}>
              {new Date(u.applicationDeadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
              {u.id === latestDeadline && <span className="text-xs font-normal text-green-600 ml-1">Latest</span>}
            </span>
          ),
        },
        {
          label: 'Nomination Deadline',
          icon: <Calendar className="h-4 w-4" />,
          render: u => new Date(u.nominationDeadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }),
        },
      ],
    },
    {
      title: 'Cost',
      rows: [
        {
          label: 'Tuition',
          icon: <DollarSign className="h-4 w-4" />,
          render: u => u.tuitionFee,
        },
        {
          label: 'Est. Monthly Cost',
          icon: <DollarSign className="h-4 w-4" />,
          render: u => (
            <div className="w-full max-w-40">
              <CostBar cost={u.estimatedMonthlyCost} max={maxCost} />
              {u.id === bestCost && <span className="text-xs text-green-600 font-medium">Cheapest</span>}
            </div>
          ),
        },
        {
          label: 'Scholarships',
          icon: <DollarSign className="h-4 w-4" />,
          render: u => <YesNo value={u.scholarships} />,
        },
      ],
    },
    {
      title: 'Support',
      rows: [
        {
          label: 'Housing Available',
          icon: <Home className="h-4 w-4" />,
          render: u => <YesNo value={u.housingAvailable} />,
        },
      ],
    },
    {
      title: 'Senior Course Mappings',
      rows: [
        {
          label: 'Total Mappings',
          icon: <BookOpen className="h-4 w-4" />,
          render: u => (
            <span className={`font-bold text-lg ${u.id === mostMappings ? 'text-green-700' : 'text-gray-800'}`}>
              {u.mappings.length}
              {u.id === mostMappings && <span className="text-xs font-normal text-green-600 ml-1">Most</span>}
            </span>
          ),
        },
        {
          label: 'Sample Mappings',
          icon: <BookOpen className="h-4 w-4" />,
          render: u => (
            <div className="space-y-1">
              {u.mappings.slice(0, 3).map(m => (
                <div key={m.id} className="text-xs text-gray-600 flex items-center gap-1">
                  <span className="font-mono text-gray-400">{m.homeCode}</span>
                  <ChevronRight className="h-3 w-3 text-gray-300" />
                  <span className="font-mono text-blue-600">{m.hostCode}</span>
                  <span className="text-gray-400">({m.semester})</span>
                </div>
              ))}
              {u.mappings.length > 3 && (
                <Link
                  to={`/courses?uni=${u.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  +{u.mappings.length - 3} more →
                </Link>
              )}
            </div>
          ),
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">University Comparison</h1>
          <p className="text-gray-500 mt-1">Side-by-side comparison of {selected.length} universities</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Header row */}
          <div className={`grid border-b border-gray-200 compare-grid-${selected.length}`}>
            <div className="p-4 bg-gray-50" />
            {selected.map(u => (
              <div key={u.id} className="p-4 border-l border-gray-200 flex flex-col items-center text-center gap-2">
                <div className="h-14 w-14 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {u.logoPlaceholder}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{u.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3" />{u.city}, {u.country}
                  </p>
                </div>
                <Link
                  to={`/university/${u.id}`}
                  className="mt-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium transition-colors"
                >
                  View details
                </Link>
              </div>
            ))}
          </div>

          {/* Section rows */}
          {sections.map(section => (
            <div key={section.title}>
              <div className={`grid border-b border-gray-200 compare-grid-${selected.length}`}>
                <div className="px-4 py-2 bg-gray-50 col-span-full">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{section.title}</h3>
                </div>
              </div>
              {section.rows.map(row => (
                <div key={row.label} className={`grid border-b border-gray-100 last:border-0 hover:bg-gray-50/50 compare-grid-${selected.length}`}>
                  <div className="px-4 py-3.5 flex items-start gap-2 bg-gray-50/50 border-r border-gray-100">
                    <span className="text-gray-400 mt-0.5 shrink-0">{row.icon}</span>
                    <span className="text-sm text-gray-600 font-medium">{row.label}</span>
                  </div>
                  {selected.map(u => (
                    <div key={u.id} className="px-4 py-3.5 border-l border-gray-100 text-sm text-gray-700">
                      {row.render(u)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Best Ranked', id: bestRanking, icon: <Trophy className="h-4 w-4 text-yellow-500" /> },
            { label: 'Most Seats', id: mostSeats, icon: <Users className="h-4 w-4 text-blue-500" /> },
            { label: 'Lowest Cost', id: bestCost, icon: <DollarSign className="h-4 w-4 text-green-500" /> },
            { label: 'Most Mappings', id: mostMappings, icon: <BookOpen className="h-4 w-4 text-purple-500" /> },
          ].map(({ label, id, icon }) => {
            const u = selected.find(x => x.id === id)!
            return (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">{icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.logoPlaceholder}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
