import { ArrowRight, CalendarDays, Check, Clock3, FileText, Minus, X, XCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { daysLeft, formatDate, urgencyOf } from '../../lib/dates.js'
import { formatCurrency } from '../../lib/format.js'
import { evaluate } from '../../lib/matchEngine.js'
import Modal from '../ui/Modal.jsx'

function Deadline({ scholarship }) {
  const days = daysLeft(scholarship.deadline)
  const urgency = urgencyOf(scholarship.deadline)
  const Icon = urgency === 'closed' ? XCircle : urgency === 'urgent' ? Clock3 : CalendarDays
  const label = days < 0 ? 'Closed' : days === 0 ? 'Due today' : `Due in ${days} day${days === 1 ? '' : 's'}`
  return <span className={`deadline-badge deadline-${urgency}`}><Icon size={14} aria-hidden="true" /><span>{label}</span><span className="deadline-date">{formatDate(scholarship.deadline, { year: undefined })}</span></span>
}

export default function ScholarshipDrawer({ scholarship, onClose, onNavigate }) {
  const { state, dispatch, toast } = useApp()
  if (!scholarship) return null
  const match = evaluate(scholarship, state.profile)
  const saved = Boolean(state.applications[scholarship.id])
  const closed = urgencyOf(scholarship.deadline) === 'closed'
  function toggleSave() {
    dispatch({ type: 'TOGGLE_SAVE', id: scholarship.id })
    toast(saved ? 'Removed from your tracker' : 'Saved to your tracker')
  }
  function startApplication() {
    if (!saved) dispatch({ type: 'TOGGLE_SAVE', id: scholarship.id })
    dispatch({ type: 'SET_STAGE', id: scholarship.id, stage: 'Drafting' })
    toast('Moved to Drafting')
    onClose()
    onNavigate?.('/tracker')
  }
  const iconFor = { met: Check, partial: Minus, unmet: X }
  return (
    <Modal open onClose={onClose} title={scholarship.name} className="detail-modal">
      <div className="detail-provider">{scholarship.provider}</div>
      <div className="detail-amount-row"><strong>{formatCurrency(scholarship.amount, scholarship.currency)}</strong><Deadline scholarship={scholarship} /></div>
      <p className="detail-description">{scholarship.description}</p>
      <section className="detail-section" aria-labelledby="drawer-match-title">
        <div className="detail-section-title"><div><span className="section-kicker">Transparent rule-based Smart Match</span><h3 id="drawer-match-title">{match.score}% match</h3></div><span className={`match-state${match.eligible ? ' match-state-eligible' : ' match-state-unmet'}`}>{match.eligible ? 'Eligible' : 'Not eligible'}</span></div>
        <ul className="criterion-list">{match.criteria.map((criterion) => { const Icon = iconFor[criterion.status]; return <li className={`criterion criterion-${criterion.status}`} key={criterion.key}><span className="criterion-mark"><Icon size={15} aria-hidden="true" /></span><span className="criterion-text"><strong>{criterion.label}</strong><small>{criterion.detail}</small></span><span className="criterion-weight">{criterion.weight}%</span></li> })}</ul>
      </section>
      <section className="detail-section" aria-labelledby="drawer-doc-title">
        <div className="detail-section-title"><div><span className="section-kicker">Get ready</span><h3 id="drawer-doc-title">Required documents</h3></div></div>
        <ul className="detail-doc-list">{scholarship.requiredDocs.map((name) => <li key={name} className={state.documents[name] ? 'doc-ready' : 'doc-missing'}>{state.documents[name] ? <Check size={15} aria-hidden="true" /> : <FileText size={15} aria-hidden="true" />}<span>{name}</span><small>{state.documents[name] ? 'Ready' : 'Needed'}</small></li>)}</ul>
      </section>
      <div className="detail-actions"><button className="button button-secondary" type="button" onClick={toggleSave}>{saved ? 'Remove from tracker' : 'Save to tracker'}</button><button className="button button-primary" type="button" disabled={closed} onClick={startApplication}>{closed ? 'Application closed' : 'Start application'} <ArrowRight size={16} aria-hidden="true" /></button></div>
    </Modal>
  )
}
