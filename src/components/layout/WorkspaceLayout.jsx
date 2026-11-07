import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import Footer from './Footer.jsx'
import MobileNav from './MobileNav.jsx'
import Navbar from './Navbar.jsx'
import Toast from '../ui/Toast.jsx'
import ScholarshipDrawer from '../discover/ScholarshipDrawer.jsx'

export default function WorkspaceLayout({ title, eyebrow, description, children }) {
  const { state, toastMessage, clearToast } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const routeQuery = new URLSearchParams(location.search).get('q') ?? ''
  const [query, setQuery] = useState(routeQuery)
  const [notificationScholarship, setNotificationScholarship] = useState(null)
  useEffect(() => setQuery(routeQuery), [routeQuery])
  function submitSearch(value) {
    const search = new URLSearchParams()
    if (value.trim()) search.set('q', value.trim())
    if (location.pathname === '/discover' && new URLSearchParams(location.search).get('eligible') === '1') search.set('eligible', '1')
    navigate(`/discover${search.size ? `?${search.toString()}` : ''}`)
  }
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar state={state} query={query} onQueryChange={setQuery} onSearch={submitSearch} onOpenScholarship={setNotificationScholarship} />
      <main id="main-content" className="content-width workspace-main">
        <div className="workspace-heading"><div><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><span className="sample-badge">Sample data for demonstration</span></div>
        {children}
      </main>
      <div className="content-width"><Footer /></div>
      <MobileNav />
      <Toast message={toastMessage} onClose={clearToast} />
      <ScholarshipDrawer scholarship={notificationScholarship} onClose={() => setNotificationScholarship(null)} onNavigate={navigate} />
    </div>
  )
}
