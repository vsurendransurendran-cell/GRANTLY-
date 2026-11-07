import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Bell, Search, Star } from 'lucide-react'
import { formatDate, daysLeft } from '../../lib/dates.js'
import { scholarships } from '../../data/scholarships.js'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'Tracker', href: '/tracker' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Documents', href: '/documents' },
  { label: 'Profile', href: '/profile' },
]

export default function Navbar({ state, query, onQueryChange, onSearch, onOpenScholarship }) {
  const [bellOpen, setBellOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchRef = useRef(null)
  const urgentTracked = Object.keys(state.applications)
    .map((id) => scholarships.find((item) => item.id === id))
    .filter((item) => item && daysLeft(item.deadline) >= 0 && daysLeft(item.deadline) <= 7)
    .sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline))

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === 'Escape') setMobileSearchOpen(false)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  function submitSearch(event) {
    event.preventDefault()
    setMobileSearchOpen(false)
    onSearch(query)
  }

  function searchButtonAction() {
    if (window.matchMedia('(max-width: 640px)').matches) {
      setMobileSearchOpen(true)
      requestAnimationFrame(() => searchRef.current?.focus())
      return
    }
    onSearch(query)
  }

  return (
    <header className="site-header">
      <NavLink className="brand-lockup" to="/" aria-label="Grantly home">
        <span className="brand-mark"><Star size={26} strokeWidth={1.4} aria-hidden="true" /><i /></span>
        <span>GRANTLY</span>
      </NavLink>
      <nav className="desktop-nav glass" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink end={item.href === '/'} to={item.href} key={item.label} className={({ isActive }) => `nav-link${isActive ? ' is-current' : ''}`}>{item.label}</NavLink>
        ))}
      </nav>
      <div className="header-tools">
        <form className={`nav-search glass${mobileSearchOpen ? ' is-open' : ''}`} role="search" onSubmit={submitSearch}>
          <button type="button" onClick={searchButtonAction} aria-label="Search scholarships"><Search size={17} aria-hidden="true" /></button>
          <input aria-label="Search scholarships" ref={searchRef} type="search" placeholder="Search scholarships..." value={query} onChange={(event) => onQueryChange(event.target.value)} />
          <kbd>⌘ K</kbd>
        </form>
        <div className="notification-wrap">
          <button className="icon-button glass bell-button" type="button" aria-label={`Notifications${urgentTracked.length ? `, ${urgentTracked.length} urgent deadlines` : ''}`} aria-expanded={bellOpen} onClick={() => setBellOpen((current) => !current)}>
            <Bell size={18} aria-hidden="true" />
            {urgentTracked.length > 0 && <span className="notification-dot" aria-hidden="true" />}
          </button>
          {bellOpen && (
            <div className="notification-popover glass" role="status">
              <div className="popover-heading"><strong>Coming up</strong><span>{urgentTracked.length} urgent</span></div>
              {urgentTracked.length === 0 ? <p>Nothing urgent. Your tracked deadlines within 7 days will appear here.</p> : urgentTracked.map((item) => (
                <button className="notification-item" key={item.id} type="button" onClick={() => { setBellOpen(false); onOpenScholarship(item) }}>
                  <span>{item.name}</span><small>{daysLeft(item.deadline) === 0 ? 'Due today' : `${daysLeft(item.deadline)} days left`} · {formatDate(item.deadline)}</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <NavLink className="avatar-link" to="/profile" aria-label={`Open profile for ${state.profile.name}`}><span>{state.profile.name?.trim()?.[0]?.toUpperCase() || 'S'}</span></NavLink>
      </div>
    </header>
  )
}
