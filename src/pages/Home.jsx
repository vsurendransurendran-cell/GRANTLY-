import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  FileText,
  Minus,
  PencilLine,
  Search,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import { scholarships } from '../data/scholarships.js'
import { CATEGORIES, COUNTRIES, FIELDS, INCOME_OPTIONS, LEVELS, APPLICATION_STAGES } from '../data/options.js'
import { useApp } from '../context/AppContext.jsx'
import { formatCurrency } from '../lib/format.js'
import { daysLeft, formatDate, urgencyOf } from '../lib/dates.js'
import { evaluate } from '../lib/matchEngine.js'
import Navbar from '../components/layout/Navbar.jsx'
import MobileNav from '../components/layout/MobileNav.jsx'
import Footer from '../components/layout/Footer.jsx'
import Hero from '../components/home/Hero.jsx'
import StatsStrip from '../components/home/StatsStrip.jsx'
import FeatureCards from '../components/home/FeatureCards.jsx'
import Modal from '../components/ui/Modal.jsx'
import Toast from '../components/ui/Toast.jsx'

function deadlineText(scholarship) {
  const remaining = daysLeft(scholarship.deadline)
  if (remaining < 0) return 'Closed'
  if (remaining === 0) return 'Due today'
  return `Due in ${remaining} day${remaining === 1 ? '' : 's'}`
}

function DeadlineBadge({ scholarship }) {
  const urgency = urgencyOf(scholarship.deadline)
  const Icon = urgency === 'closed' ? XCircle : urgency === 'urgent' ? Clock3 : CalendarDays
  return (
    <span className={`deadline-badge deadline-${urgency}`} aria-label={`${deadlineText(scholarship)}, ${formatDate(scholarship.deadline)}`}>
      <Icon size={14} aria-hidden="true" />
      <span>{deadlineText(scholarship)}</span>
      <span className="deadline-date">{formatDate(scholarship.deadline, { year: undefined })}</span>
    </span>
  )
}

function CriterionList({ criteria }) {
  const statusIcon = { met: Check, partial: Minus, unmet: X }
  return (
    <ul className="criterion-list">
      {criteria.map((criterion) => {
        const Icon = statusIcon[criterion.status] ?? CircleHelp
        return (
          <li className={`criterion criterion-${criterion.status}`} key={criterion.key}>
            <span className="criterion-mark"><Icon size={15} aria-hidden="true" /></span>
            <span className="criterion-text">
              <strong>{criterion.label}</strong>
              <small>{criterion.detail}</small>
            </span>
            <span className="criterion-weight">{criterion.weight}%</span>
          </li>
        )
      })}
    </ul>
  )
}

function ScholarshipDetail({ scholarship, match, saved, documents, onSave, onStart, onClose }) {
  const closed = urgencyOf(scholarship.deadline) === 'closed'
  return (
    <Modal open={Boolean(scholarship)} onClose={onClose} title={scholarship.name} className="detail-modal">
      {scholarship && (
        <>
          <div className="detail-provider">{scholarship.provider}</div>
          <div className="detail-amount-row">
            <strong>{formatCurrency(scholarship.amount, scholarship.currency)}</strong>
            <DeadlineBadge scholarship={scholarship} />
          </div>
          <p className="detail-description">{scholarship.description}</p>
          <section className="detail-section" aria-labelledby="detail-match-title">
            <div className="detail-section-title">
              <div><span className="section-kicker">Transparent Smart Match</span><h3 id="detail-match-title">{match.score}% match</h3></div>
              <span className={`match-state${match.eligible ? ' match-state-eligible' : ' match-state-unmet'}`}>
                {match.eligible ? 'Eligible' : 'Not eligible'}
              </span>
            </div>
            <CriterionList criteria={match.criteria} />
          </section>
          <section className="detail-section" aria-labelledby="detail-docs-title">
            <div className="detail-section-title"><div><span className="section-kicker">Get ready</span><h3 id="detail-docs-title">Required documents</h3></div></div>
            <ul className="detail-doc-list">
              {scholarship.requiredDocs.map((name) => (
                <li key={name} className={documents[name] ? 'doc-ready' : 'doc-missing'}>
                  {documents[name] ? <Check size={15} aria-hidden="true" /> : <FileText size={15} aria-hidden="true" />}
                  <span>{name}</span><small>{documents[name] ? 'Ready' : 'Needed'}</small>
                </li>
              ))}
            </ul>
          </section>
          <div className="detail-actions">
            <button className="button button-secondary" type="button" onClick={() => onSave(scholarship)}>
              {saved ? 'Remove from tracker' : 'Save to tracker'}
            </button>
            <button className="button button-primary" type="button" disabled={closed} onClick={() => onStart(scholarship)}>
              {closed ? 'Application closed' : 'Start application'} <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

function ScholarshipCard({ scholarship, match, saved, onSave, onOpen }) {
  return (
    <article className="scholarship-card glass">
      <div className="scholarship-card-top">
        <span className="provider-mark" aria-hidden="true">✦</span>
        <span className={`match-state${match.eligible ? ' match-state-eligible' : ' match-state-unmet'}`}>
          {match.eligible ? 'Eligible' : 'Not eligible'}
        </span>
      </div>
      <p className="scholarship-provider">{scholarship.provider}</p>
      <h3>{scholarship.name}</h3>
      <p className="scholarship-description">{scholarship.description}</p>
      <div className="scholarship-meta">
        <span className="scholarship-amount">{formatCurrency(scholarship.amount, scholarship.currency)}</span>
        <span className="match-percent"><strong>{match.score}%</strong> match</span>
      </div>
      <DeadlineBadge scholarship={scholarship} />
      <div className="scholarship-card-actions">
        <button className="text-button" type="button" onClick={() => onOpen(scholarship)}>View details <ArrowRight size={14} aria-hidden="true" /></button>
        <button className={`save-button${saved ? ' is-saved' : ''}`} type="button" onClick={() => onSave(scholarship)} aria-label={saved ? `Unsave ${scholarship.name}` : `Save ${scholarship.name}`}>
          {saved ? <><Check size={14} aria-hidden="true" /> Saved</> : 'Save'}
        </button>
      </div>
    </article>
  )
}

function DemoContent({ step, setStep, onClose }) {
  const steps = [
    {
      label: 'Discover',
      title: 'Find opportunities that fit your path.',
      copy: 'Search a curated sample and narrow it by the details that matter to you.',
      number: '01',
    },
    {
      label: 'Check eligibility',
      title: 'See how each match is calculated.',
      copy: 'Field, level, country, GPA, income, and categories are scored with clear weights and explanations.',
      number: '02',
    },
    {
      label: 'Track',
      title: 'Keep the next step in view.',
      copy: 'Save an opportunity, move it through your application stages, and prepare required documents.',
      number: '03',
    },
  ]
  const current = steps[step]
  return (
    <div className="demo-content">
      <div className="demo-rail" aria-label={`Step ${step + 1} of ${steps.length}`}>
        {steps.map((item, index) => <span className={index <= step ? 'demo-rail-step is-active' : 'demo-rail-step'} key={item.number}>{item.number}</span>)}
      </div>
      <span className="section-kicker">{current.label}</span>
      <h3>{current.title}</h3>
      <p>{current.copy}</p>
      <div className="demo-actions">
        <button className="button button-ghost" type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>Back</button>
        {step < steps.length - 1
          ? <button className="button button-primary" type="button" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>Next <ArrowRight size={15} aria-hidden="true" /></button>
          : <button className="button button-primary" type="button" onClick={onClose}>Explore opportunities <ArrowRight size={15} aria-hidden="true" /></button>}
      </div>
    </div>
  )
}

function ProfileForm({ profile, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...profile, categories: [...profile.categories] })
  const [error, setError] = useState('')
  const setField = (key, value) => setDraft((current) => ({ ...current, [key]: value }))
  const toggleCategory = (category) => setDraft((current) => ({
    ...current,
    categories: current.categories.includes(category)
      ? current.categories.filter((item) => item !== category)
      : [...current.categories, category],
  }))

  function submit(event) {
    event.preventDefault()
    const gpa = Number(draft.gpa)
    if (!Number.isFinite(gpa) || gpa < 0 || gpa > 4) {
      setError('Enter a GPA from 0.0 to 4.0.')
      return
    }
    onSave({ ...draft, gpa })
  }

  return (
    <form className="profile-form" onSubmit={submit}>
      <label className="form-field">Name<input autoComplete="name" value={draft.name} onChange={(event) => setField('name', event.target.value)} required /></label>
      <div className="form-grid-two">
        <label className="form-field">Study level<select value={draft.level} onChange={(event) => setField('level', event.target.value)}>{LEVELS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="form-field">Field<select value={draft.field} onChange={(event) => setField('field', event.target.value)}>{FIELDS.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="form-grid-two">
        <label className="form-field">Country<select value={draft.country} onChange={(event) => setField('country', event.target.value)}>{COUNTRIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="form-field">GPA (0.0–4.0)<input type="number" min="0" max="4" step="0.1" value={draft.gpa} onChange={(event) => setField('gpa', event.target.value)} /></label>
      </div>
      <label className="form-field">Income band<select value={draft.income} onChange={(event) => setField('income', Number(event.target.value))}>{INCOME_OPTIONS.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
      <fieldset className="category-fieldset">
        <legend>Student categories</legend>
        <div className="category-checks">
          {CATEGORIES.map((category) => <label className="check-label" key={category}><input type="checkbox" checked={draft.categories.includes(category)} onChange={() => toggleCategory(category)} /> <span>{category}</span></label>)}
        </div>
      </fieldset>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-form-actions">
        <button className="button button-ghost" type="button" onClick={onClose}>Cancel</button>
        <button className="button button-primary" type="submit">Save profile <Check size={15} aria-hidden="true" /></button>
      </div>
    </form>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { state, dispatch, results, toast, toastMessage, clearToast } = useApp()
  const [searchText, setSearchText] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [demoOpen, setDemoOpen] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const [selectedScholarship, setSelectedScholarship] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)

  const trackedIds = useMemo(() => Object.keys(state.applications), [state.applications])
  const topMatch = Math.max(0, ...scholarships.map((item) => results[item.id]?.score ?? 0))
  const eligibleCount = scholarships.filter((item) => results[item.id]?.eligible).length
  const activeStages = ['Drafting', 'Submitted', 'Interview']
  const activeCount = Object.values(state.applications).filter((application) => activeStages.includes(application.stage)).length
  const securedCapital = Object.entries(state.applications)
    .filter(([, application]) => application.stage === 'Awarded')
    .reduce((sum, [id]) => sum + (scholarships.find((item) => item.id === id)?.amount ?? 0), 0)
  const matchedFunding = scholarships
    .filter((item) => urgencyOf(item.deadline) !== 'closed' && results[item.id]?.eligible)
    .reduce((sum, item) => sum + item.amount, 0)

  const stats = [
    { key: 'funding', value: formatCurrency(matchedFunding), label: 'Matched funding' },
    { key: 'secured', value: formatCurrency(securedCapital), label: 'Secured capital' },
    { key: 'active', value: String(activeCount), label: 'Active applications' },
    { key: 'match', value: `${topMatch}%`, label: 'Top match' },
  ]

  const visibleScholarships = useMemo(() => {
    const query = activeQuery.trim().toLocaleLowerCase()
    if (!query) return scholarships
    return scholarships.filter((item) => `${item.name} ${item.provider} ${item.description}`.toLocaleLowerCase().includes(query))
  }, [activeQuery])

  const nearestScholarships = useMemo(() => {
    const trackedOpen = scholarships.filter((item) => trackedIds.includes(item.id) && daysLeft(item.deadline) >= 0)
    const best = scholarships
      .filter((item) => daysLeft(item.deadline) >= 0)
      .sort((a, b) => (results[b.id]?.score ?? 0) - (results[a.id]?.score ?? 0))
      .slice(0, 5)
    const union = new Map([...trackedOpen, ...best].map((item) => [item.id, item]))
    return [...union.values()].sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline)).slice(0, 3)
  }, [trackedIds, results])

  const nextFourteenDays = useMemo(() => scholarships
    .filter((item) => daysLeft(item.deadline) >= 0 && daysLeft(item.deadline) <= 14)
    .sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline)), [])

  const trackedScholarships = scholarships.filter((item) => state.applications[item.id])
  const documentsNeeded = [...new Set(trackedScholarships.flatMap((item) => item.requiredDocs))]
  const topScholarship = [...scholarships].sort((a, b) => (results[b.id]?.score ?? 0) - (results[a.id]?.score ?? 0))[0]

  function handleSearch(query) {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    navigate(`/discover${params.size ? `?${params.toString()}` : ''}`)
  }

  function toggleSave(scholarship) {
    const alreadySaved = Boolean(state.applications[scholarship.id])
    dispatch({ type: 'TOGGLE_SAVE', id: scholarship.id })
    toast(alreadySaved ? 'Removed from your tracker' : 'Saved to your tracker')
  }

  function startApplication(scholarship) {
    const existing = state.applications[scholarship.id]
    if (existing) {
      dispatch({ type: 'SET_STAGE', id: scholarship.id, stage: 'Drafting' })
    } else {
      dispatch({ type: 'TOGGLE_SAVE', id: scholarship.id })
      dispatch({ type: 'SET_STAGE', id: scholarship.id, stage: 'Drafting' })
    }
    setSelectedScholarship(null)
    toast('Moved to Drafting')
    navigate('/tracker')
  }

  function saveProfile(profile) {
    dispatch({ type: 'SET_PROFILE', profile })
    setProfileOpen(false)
    const count = scholarships.filter((item) => evaluate(item, profile).eligible).length
    toast(`Your matches updated: ${count} eligible scholarships`)
  }

  const openDemo = () => { setDemoStep(0); setDemoOpen(true) }
  const topEligibility = topScholarship ? results[topScholarship.id] : null

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar
        state={state}
        query={searchText}
        onQueryChange={setSearchText}
        onSearch={handleSearch}
        onOpenScholarship={setSelectedScholarship}
      />
      <main id="main-content">
        <Hero onWatchDemo={openDemo} />
        <div className="content-width stats-wrap"><StatsStrip stats={stats} /></div>
        <div className="content-width">
          <FeatureCards />

          <section className="closing-section" id="deadlines" aria-labelledby="closing-title">
            <div className="section-heading-row">
              <div><span className="section-kicker">A gentle nudge, right on time</span><h2 id="closing-title">Closing soon</h2></div>
              <a className="subtle-link" href="#calendar">See the next 14 days <ArrowRight size={15} aria-hidden="true" /></a>
            </div>
            <div className="closing-grid">
              {nearestScholarships.map((item) => (
                <button className="closing-card glass" key={item.id} type="button" onClick={() => setSelectedScholarship(item)}>
                  <span className="closing-day"><strong>{daysLeft(item.deadline) === 0 ? 'Today' : daysLeft(item.deadline)}</strong><small>{daysLeft(item.deadline) === 0 ? 'due' : 'days left'}</small></span>
                  <span className="closing-info"><strong>{item.name}</strong><small>{item.provider}</small></span>
                  <span className="closing-amount">{formatCurrency(item.amount)}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <section className="opportunities-section" id="opportunities" aria-labelledby="opportunities-title">
            <div className="section-heading-row opportunities-heading">
              <div><span className="section-kicker">A thoughtful place to begin</span><h2 id="opportunities-title">Scholarships for your next step</h2><p className="section-subcopy">{eligibleCount} of {scholarships.length} sample opportunities currently meet every profile criterion.</p></div>
              <label className="section-search glass">
                <Search size={16} aria-hidden="true" />
                <span className="sr-only">Filter opportunities</span>
                <input value={searchText} onChange={(event) => { setSearchText(event.target.value); setActiveQuery(event.target.value) }} placeholder="Search opportunities" />
                {activeQuery && <button type="button" aria-label="Clear search" onClick={() => { setSearchText(''); setActiveQuery('') }}><X size={14} aria-hidden="true" /></button>}
              </label>
            </div>
            {visibleScholarships.length === 0 ? (
              <div className="empty-state glass"><Search size={24} aria-hidden="true" /><h3>No scholarships found</h3><p>Try another name, provider, or keyword.</p><button className="text-button" type="button" onClick={() => { setSearchText(''); setActiveQuery('') }}>Clear search</button></div>
            ) : (
              <div className="scholarship-grid">
                {visibleScholarships.map((item) => (
                  <ScholarshipCard
                    key={item.id}
                    scholarship={item}
                    match={results[item.id]}
                    saved={Boolean(state.applications[item.id])}
                    onSave={toggleSave}
                    onOpen={setSelectedScholarship}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="eligibility-preview glass" id="eligibility" aria-labelledby="eligibility-title">
            <div className="eligibility-intro">
              <span className="section-kicker">No mystery behind the match</span>
              <h2 id="eligibility-title">Your profile, translated into clear criteria.</h2>
              <p>Every score is calculated from your profile with visible weights. Update your details any time to refresh the results.</p>
              <button className="button button-secondary" type="button" onClick={() => setProfileOpen(true)}><PencilLine size={15} aria-hidden="true" /> Edit profile</button>
            </div>
            <div className="eligibility-example">
              {topScholarship && topEligibility && <>
                <div className="eligibility-example-head"><div><span className="section-kicker">Top current match</span><h3>{topScholarship.name}</h3></div><strong className="large-match">{topEligibility.score}%</strong></div>
                <CriterionList criteria={topEligibility.criteria} />
              </>}
            </div>
          </section>

          <section className="journey-section" id="tracker" aria-labelledby="tracker-title">
            <div className="section-heading-row">
              <div><span className="section-kicker">A place for every next step</span><h2 id="tracker-title">Your journey</h2><p className="section-subcopy">Saved opportunities stay with you as your applications move forward.</p></div>
              <a className="subtle-link" href="#opportunities">Find an opportunity <ArrowRight size={15} aria-hidden="true" /></a>
            </div>
            <div className="journey-panel glass">
              <div className="stage-summary">
                {APPLICATION_STAGES.map((stage) => {
                  const count = Object.values(state.applications).filter((application) => application.stage === stage).length
                  return <div className="stage-chip" key={stage}><span>{stage}</span><strong>{count}</strong></div>
                })}
              </div>
              {trackedScholarships.length === 0 ? (
                <div className="inline-empty"><span className="empty-orbit"><ShieldCheck size={21} aria-hidden="true" /></span><div><strong>Your tracker is ready when you are.</strong><p>Save a scholarship to keep its details and next step close.</p></div><a className="text-button" href="#opportunities">Explore scholarships <ArrowRight size={14} aria-hidden="true" /></a></div>
              ) : (
                <div className="tracked-list">
                  {trackedScholarships.map((item) => {
                    const application = state.applications[item.id]
                    return <article className="tracked-row" key={item.id}>
                      <div><strong>{item.name}</strong><small>{formatCurrency(item.amount)} · {deadlineText(item)}</small></div>
                      <label className="stage-select-label"><span className="sr-only">Stage for {item.name}</span><select value={application.stage} onChange={(event) => { dispatch({ type: 'SET_STAGE', id: item.id, stage: event.target.value }); toast(`Moved to ${event.target.value}`) }}>{APPLICATION_STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
                      <button className="icon-button quiet-icon" type="button" onClick={() => { dispatch({ type: 'REMOVE_APP', id: item.id }); toast('Removed from your tracker') }} aria-label={`Remove ${item.name}`}><Trash2 size={16} aria-hidden="true" /></button>
                    </article>
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="lower-grid">
            <div className="lower-panel glass" id="calendar" aria-labelledby="calendar-title">
              <div className="lower-heading"><span className="lower-icon"><CalendarDays size={17} aria-hidden="true" /></span><div><span className="section-kicker">Keep the important dates close</span><h2 id="calendar-title">Next 14 days</h2></div></div>
              {nextFourteenDays.length === 0 ? <p className="muted-copy">No upcoming deadlines in this sample.</p> : <ul className="mini-deadline-list">{nextFourteenDays.map((item) => <li key={item.id}><button type="button" onClick={() => setSelectedScholarship(item)}><span className={`date-marker urgency-${urgencyOf(item.deadline)}`}>{daysLeft(item.deadline) === 0 ? 'Now' : `${daysLeft(item.deadline)}d`}</span><span><strong>{item.name}</strong><small>{formatDate(item.deadline)}</small></span><ArrowRight size={14} aria-hidden="true" /></button></li>)}</ul>}
            </div>
            <div className="lower-panel glass" id="documents" aria-labelledby="documents-title">
              <div className="lower-heading"><span className="lower-icon"><FileText size={17} aria-hidden="true" /></span><div><span className="section-kicker">Get application-ready</span><h2 id="documents-title">Your documents</h2></div></div>
              {documentsNeeded.length === 0 ? <div className="documents-empty"><p>Save a scholarship and its document checklist will appear here.</p><a className="text-button" href="#opportunities">Browse opportunities <ArrowRight size={14} aria-hidden="true" /></a></div> : <ul className="document-checklist">{documentsNeeded.map((name) => <li key={name}><label><input type="checkbox" checked={Boolean(state.documents[name])} onChange={() => { dispatch({ type: 'TOGGLE_DOC', name }); toast(state.documents[name] ? 'Document marked as needed' : 'Document marked ready') }} /><span>{name}</span></label><small>{trackedScholarships.filter((item) => item.requiredDocs.includes(name)).map((item) => item.name).join(' · ')}</small></li>)}</ul>}
            </div>
          </section>

          <section className="profile-summary glass" id="profile" aria-labelledby="profile-title">
            <div className="profile-monogram" aria-hidden="true">{state.profile.name?.trim()?.[0]?.toUpperCase() || 'S'}</div>
            <div className="profile-summary-copy"><span className="section-kicker">Your starting point</span><h2 id="profile-title">{state.profile.name || 'Student'}’s profile</h2><p>{state.profile.level} · {state.profile.field} · {state.profile.country} · GPA {Number(state.profile.gpa).toFixed(1)} · {INCOME_OPTIONS.find((option) => option.value === Number(state.profile.income))?.label} income</p><small>{eligibleCount} eligible sample opportunities · {state.profile.categories.length ? state.profile.categories.join(' · ') : 'No categories selected'}</small></div>
            <button className="button button-secondary" type="button" onClick={() => setProfileOpen(true)}><PencilLine size={15} aria-hidden="true" /> Edit profile</button>
          </section>
        </div>
      </main>
      <div className="content-width"><Footer /></div>
      <MobileNav />
      <Toast message={toastMessage} onClose={clearToast} />

      <Modal open={demoOpen} onClose={() => setDemoOpen(false)} title="A three-step tour" className="demo-modal">
        <DemoContent step={demoStep} setStep={setDemoStep} onClose={() => { setDemoOpen(false); window.setTimeout(() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' }), 80) }} />
      </Modal>
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="Your student profile" className="profile-modal">
        <ProfileForm profile={state.profile} onSave={saveProfile} onClose={() => setProfileOpen(false)} />
      </Modal>
      <AnimatePresence>
        {selectedScholarship && (
          <ScholarshipDetail
            scholarship={selectedScholarship}
            match={evaluate(selectedScholarship, state.profile)}
            saved={Boolean(state.applications[selectedScholarship.id])}
            documents={state.documents}
            onSave={toggleSave}
            onStart={startApplication}
            onClose={() => setSelectedScholarship(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
