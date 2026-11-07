import { useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { scholarships } from '../data/scholarships.js'
import { useApp } from '../context/AppContext.jsx'
import { addDays, daysLeft, formatDate, parseLocalDate, today, urgencyOf } from '../lib/dates.js'
import ScholarshipDrawer from '../components/discover/ScholarshipDrawer.jsx'
import WorkspaceLayout from '../components/layout/WorkspaceLayout.jsx'

function keyFor(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export default function Calendar() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => { const date = parseLocalDate(today()); return new Date(date.getFullYear(), date.getMonth(), 1) })
  const [selectedDay, setSelectedDay] = useState(today())
  const [trackedOnly, setTrackedOnly] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const items = useMemo(() => scholarships.filter((item) => !trackedOnly || state.applications[item.id]), [trackedOnly, state.applications])
  const deadlinesByDay = useMemo(() => items.reduce((map, item) => { (map[item.deadline] ??= []).push(item); return map }, {}), [items])
  const offset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7
  const days = Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - offset + 1))
  const upcoming = items.filter((item) => daysLeft(item.deadline) >= 0 && daysLeft(item.deadline) <= 14).sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline))
  const selectedItems = deadlinesByDay[selectedDay] ?? []
  const monthTitle = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(month)
  function shiftMonth(amount) { setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1)) }
  function showToday() { const date = parseLocalDate(today()); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); setSelectedDay(today()) }
  return <WorkspaceLayout title="Deadline calendar" eyebrow="Make room for every deadline" description="Explore monthly due dates and bring tracked opportunities into sharper focus.">
    <div className="calendar-toolbar"><div className="calendar-month-control"><button className="icon-button glass" type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month"><ChevronLeft size={18} /></button><h2>{monthTitle}</h2><button className="icon-button glass" type="button" onClick={() => shiftMonth(1)} aria-label="Next month"><ChevronRight size={18} /></button><button className="button button-secondary calendar-today" type="button" onClick={showToday}>Today</button></div><label className="filter-check"><input type="checkbox" checked={trackedOnly} onChange={(event) => setTrackedOnly(event.target.checked)} /><span>My tracked only</span></label></div>
    <div className="calendar-layout"><section className="calendar-month glass" aria-label={`${monthTitle} scholarship deadlines`}><div className="calendar-grid">{WEEKDAYS.map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}{days.map((date) => { const key = keyFor(date); const matches = deadlinesByDay[key] ?? []; const sameMonth = date.getMonth() === month.getMonth(); const urgent = matches.some((item) => urgencyOf(item.deadline) === 'urgent'); const hasTracked = matches.some((item) => Boolean(state.applications[item.id])); return <button type="button" key={key} className={`calendar-day${sameMonth ? '' : ' is-outside'}${selectedDay === key ? ' is-selected' : ''}${key === today() ? ' is-today' : ''}${hasTracked ? ' has-tracked' : ''}`} aria-label={`${formatDate(key)}${matches.length ? `, ${matches.length} scholarship deadline${matches.length === 1 ? '' : 's'}${hasTracked ? ', includes tracked scholarships' : ''}` : ''}`} aria-pressed={selectedDay === key} onClick={() => setSelectedDay(key)}><span>{date.getDate()}</span>{matches.length > 0 && <span className={`calendar-dot${urgent ? ' is-urgent' : ''}${hasTracked ? ' is-tracked' : ''}`} aria-label={`${matches.length} deadlines${hasTracked ? ', tracked' : ''}`}>{matches.length}</span>}</button> })}</div><div className="calendar-day-list"><h3>{formatDate(selectedDay)} <span>{selectedItems.length} deadline{selectedItems.length === 1 ? '' : 's'}</span></h3>{selectedItems.length ? selectedItems.map((item) => <button className={`calendar-event${state.applications[item.id] ? ' is-tracked' : ''}`} type="button" key={item.id} onClick={() => setSelectedItem(item)}><span className={`date-marker urgency-${urgencyOf(item.deadline)}`}>{daysLeft(item.deadline) === 0 ? 'Now' : `${daysLeft(item.deadline)}d`}</span><span><strong>{item.name}</strong><small>{item.provider}{state.applications[item.id] ? ' · Tracked' : ''}</small></span><ArrowRight size={15} aria-hidden="true" /></button>) : <p className="muted-copy">No scholarship deadlines on this date.</p>}</div></section>
    <aside className="calendar-upcoming glass"><div className="lower-heading"><span className="lower-icon"><CalendarDays size={17} aria-hidden="true" /></span><div><span className="section-kicker">Plan the next step</span><h2>Due in 14 days</h2></div></div>{upcoming.length ? <ul className="mini-deadline-list">{upcoming.map((item) => <li key={item.id}><button type="button" onClick={() => setSelectedItem(item)}><span className={`date-marker urgency-${urgencyOf(item.deadline)}`}>{daysLeft(item.deadline) === 0 ? 'Now' : `${daysLeft(item.deadline)}d`}</span><span><strong>{item.name}</strong><small>{formatDate(item.deadline)}</small></span><ArrowRight size={14} aria-hidden="true" /></button></li>)}</ul> : <div className="inline-empty"><div><strong>No deadlines in the next 14 days.</strong><p>{trackedOnly ? 'Try showing all scholarships.' : 'Check back for new dates.'}</p></div></div>}</aside></div>
    <ScholarshipDrawer scholarship={selectedItem} onClose={() => setSelectedItem(null)} onNavigate={navigate} />
  </WorkspaceLayout>
}
