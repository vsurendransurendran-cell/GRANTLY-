import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, CalendarDays, Clock3, Filter, Search, SlidersHorizontal, XCircle } from 'lucide-react'
import { scholarships } from '../data/scholarships.js'
import { COUNTRIES, FIELDS, LEVELS } from '../data/options.js'
import { useApp } from '../context/AppContext.jsx'
import { daysLeft, formatDate, urgencyOf } from '../lib/dates.js'
import { formatCurrency } from '../lib/format.js'
import ScholarshipDrawer from '../components/discover/ScholarshipDrawer.jsx'
import WorkspaceLayout from '../components/layout/WorkspaceLayout.jsx'
import Modal from '../components/ui/Modal.jsx'

function Card({ item, match, saved, onOpen, onSave }) {
  const urgency = urgencyOf(item.deadline)
  const days = daysLeft(item.deadline)
  const Icon = urgency === 'closed' ? XCircle : urgency === 'urgent' ? Clock3 : CalendarDays
  const deadline = days < 0 ? 'Closed' : days === 0 ? 'Due today' : `Due in ${days} day${days === 1 ? '' : 's'}`
  return <article className="scholarship-card glass"><div className="scholarship-card-top"><span className="provider-mark" aria-hidden="true">✦</span><span className={`match-state${match.eligible ? ' match-state-eligible' : ' match-state-unmet'}`}>{match.eligible ? 'Eligible' : 'Not eligible'}</span></div><p className="scholarship-provider">{item.provider}</p><h2>{item.name}</h2><p className="scholarship-description">{item.description}</p><div className="scholarship-meta"><span className="scholarship-amount">{formatCurrency(item.amount, item.currency)}</span><span className="match-percent"><span className="match-ring" role="img" aria-label={`${match.score}% match`} style={{ '--match-score': `${match.score * 3.6}deg` }}><strong>{match.score}%</strong></span><span>match</span></span></div><span className={`deadline-badge deadline-${urgency}`}><Icon size={14} aria-hidden="true" /><span>{deadline}</span><span className="deadline-date">{formatDate(item.deadline, { year: undefined })}</span></span><div className="scholarship-card-actions"><button className="text-button" type="button" onClick={() => onOpen(item)}>View details <ArrowRight size={14} aria-hidden="true" /></button><button className={`save-button${saved ? ' is-saved' : ''}`} type="button" aria-label={`${saved ? 'Unsave' : 'Save'} ${item.name}`} onClick={() => onSave(item)}>{saved ? '✓ Saved' : 'Save'}</button></div></article>
}

export default function Discover() {
  const { state, dispatch, results, toast } = useApp()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [field, setField] = useState('')
  const [level, setLevel] = useState('')
  const [country, setCountry] = useState('')
  const [deadline, setDeadline] = useState('any')
  const [sort, setSort] = useState('match')
  const query = (searchParams.get('q') ?? '').trim().toLocaleLowerCase()
  const eligibleOnly = searchParams.get('eligible') === '1'
  function setEligible(value) {
    const next = new URLSearchParams(location.search)
    if (value) next.set('eligible', '1')
    else next.delete('eligible')
    navigate(`/discover${next.size ? `?${next.toString()}` : ''}`, { replace: true })
  }
  function save(item) {
    const saved = Boolean(state.applications[item.id])
    dispatch({ type: 'TOGGLE_SAVE', id: item.id })
    toast(saved ? 'Removed from your tracker' : 'Saved to your tracker')
  }
  function clearFilters() {
    setField(''); setLevel(''); setCountry(''); setDeadline('any'); setSort('match')
    navigate('/discover', { replace: true })
  }
  const filtered = useMemo(() => {
    const list = scholarships.filter((item) => {
      const match = results[item.id]
      const matchesQuery = !query || `${item.name} ${item.provider} ${item.description}`.toLocaleLowerCase().includes(query)
      const matchesDeadline = deadline === 'any' || (daysLeft(item.deadline) >= 0 && daysLeft(item.deadline) <= Number(deadline))
      return matchesQuery && (!eligibleOnly || match.eligible) && (!field || item.fields.includes('Any') || item.fields.includes(field)) && (!level || item.level.includes('Any') || item.level.includes(level)) && (!country || item.countries.includes('Any') || item.countries.includes(country)) && matchesDeadline
    })
    return list.sort((a, b) => sort === 'deadline' ? daysLeft(a.deadline) - daysLeft(b.deadline) : sort === 'amount' ? b.amount - a.amount : results[b.id].score - results[a.id].score)
  }, [query, eligibleOnly, field, level, country, deadline, sort, results])
  const hasFilters = Boolean(query || eligibleOnly || field || level || country || deadline !== 'any')
  return <WorkspaceLayout title="Discover scholarships" eyebrow="Find your next opportunity" description="Search a sample catalog, check your fit, and keep the criteria behind every match in view.">
    <section className="workspace-panel glass" aria-label="Scholarship filters">
      <div className="filter-title"><SlidersHorizontal size={17} aria-hidden="true" /><strong>Refine results</strong><span>{filtered.length} of {scholarships.length} opportunities</span></div>
      <div className="filter-controls">
        <label className="form-field">Study level<select value={level} onChange={(event) => setLevel(event.target.value)}><option value="">All levels</option>{LEVELS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="form-field">Field<select value={field} onChange={(event) => setField(event.target.value)}><option value="">All fields</option>{FIELDS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="form-field">Country<select value={country} onChange={(event) => setCountry(event.target.value)}><option value="">All countries</option>{COUNTRIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="form-field">Deadline<select value={deadline} onChange={(event) => setDeadline(event.target.value)}><option value="any">Any time</option><option value="7">Next 7 days</option><option value="30">Next 30 days</option></select></label>
        <label className="form-field">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="match">Best match</option><option value="deadline">Deadline soonest</option><option value="amount">Amount high to low</option></select></label>
      </div>
      <div className="filter-footer"><label className="filter-check"><input type="checkbox" checked={eligibleOnly} onChange={(event) => setEligible(event.target.checked)} /><span>Eligible only</span></label><button className="button button-secondary filters-mobile-trigger" type="button" onClick={() => setMobileFiltersOpen(true)}><Filter size={15} aria-hidden="true" /> Filters</button>{hasFilters && <button className="text-button" type="button" onClick={clearFilters}>Clear filters</button>}</div>
    </section>
    <Modal open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title="Filter scholarships" className="filters-mobile-modal"><div className="filters-mobile-controls"><label className="form-field">Study level<select value={level} onChange={(event) => setLevel(event.target.value)}><option value="">All levels</option>{LEVELS.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field">Field<select value={field} onChange={(event) => setField(event.target.value)}><option value="">All fields</option>{FIELDS.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field">Country<select value={country} onChange={(event) => setCountry(event.target.value)}><option value="">All countries</option>{COUNTRIES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field">Deadline<select value={deadline} onChange={(event) => setDeadline(event.target.value)}><option value="any">Any time</option><option value="7">Next 7 days</option><option value="30">Next 30 days</option></select></label><label className="form-field">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="match">Best match</option><option value="deadline">Deadline soonest</option><option value="amount">Amount high to low</option></select></label><label className="filter-check"><input type="checkbox" checked={eligibleOnly} onChange={(event) => setEligible(event.target.checked)} /><span>Eligible only</span></label><div className="filters-sheet-actions"><button className="button button-ghost" type="button" onClick={clearFilters}>Clear filters</button><button className="button button-primary" type="button" onClick={() => setMobileFiltersOpen(false)}>Show {filtered.length} results</button></div></div></Modal>
    <div className="workspace-result-heading"><h2>{query ? `Results for “${searchParams.get('q')}”` : 'Scholarship opportunities'}</h2><span>{filtered.length} result{filtered.length === 1 ? '' : 's'}</span></div>
    {filtered.length ? <div className="scholarship-grid">{filtered.map((item) => <Card key={item.id} item={item} match={results[item.id]} saved={Boolean(state.applications[item.id])} onOpen={setSelected} onSave={save} />)}</div> : <div className="empty-state glass"><Search size={24} aria-hidden="true" /><h2>No scholarships found</h2><p>Try changing your search or clearing one or more filters.</p><button className="button button-secondary" type="button" onClick={clearFilters}>Clear filters</button></div>}
    <ScholarshipDrawer scholarship={selected} onClose={() => setSelected(null)} onNavigate={navigate} />
  </WorkspaceLayout>
}
