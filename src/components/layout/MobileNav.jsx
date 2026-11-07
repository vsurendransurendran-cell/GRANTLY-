import { CalendarDays, Compass, FileText, House, KanbanSquare, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const ITEMS = [
  { label: 'Home', href: '/', Icon: House },
  { label: 'Discover', href: '/discover', Icon: Compass },
  { label: 'Tracker', href: '/tracker', Icon: KanbanSquare },
  { label: 'Calendar', href: '/calendar', Icon: CalendarDays },
  { label: 'Documents', href: '/documents', Icon: FileText },
  { label: 'Profile', href: '/profile', Icon: UserRound },
]

export default function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {ITEMS.map(({ label, href, Icon }) => (
        <NavLink to={href} end={href === '/'} key={label} aria-label={label} className={({ isActive }) => isActive ? 'is-current' : ''}><Icon size={18} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span></NavLink>
      ))}
    </nav>
  )
}
