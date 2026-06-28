import { NavLink } from 'react-router-dom'
import { Globe, BookOpen, GitCompare, LayoutList } from 'lucide-react'

const links = [
  { to: '/', label: 'Universities', icon: <Globe className="h-4 w-4" /> },
  { to: '/courses', label: 'Course Mappings', icon: <BookOpen className="h-4 w-4" /> },
  { to: '/seats', label: 'Seat Allocation', icon: <LayoutList className="h-4 w-4" /> },
  { to: '/compare', label: 'Compare', icon: <GitCompare className="h-4 w-4" /> },
]

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-1">
        <div className="flex items-center gap-2 font-bold text-blue-600 text-lg mr-5">
          <Globe className="h-5 w-5" />
          ExchangePlanner
        </div>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            {l.icon}
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
