import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Discover from './pages/Discover.jsx'
import Tracker from './pages/Tracker.jsx'
import Calendar from './pages/Calendar.jsx'
import Documents from './pages/Documents.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }) }, [pathname, search])
  return null
}

export default function App() {
  return <BrowserRouter><ScrollToTop /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/discover" element={<Discover />} />
    <Route path="/tracker" element={<Tracker />} />
    <Route path="/calendar" element={<Calendar />} />
    <Route path="/documents" element={<Documents />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="*" element={<NotFound />} />
  </Routes></BrowserRouter>
}
