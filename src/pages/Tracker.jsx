import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, FileText, Trash2 } from 'lucide-react'
import { scholarships } from '../data/scholarships.js'
import { APPLICATION_STAGES } from '../data/options.js'
import { useApp } from '../context/AppContext.jsx'
import { daysLeft } from '../lib/dates.js'
import { formatCurrency } from '../lib/format.js'
import ScholarshipDrawer from '../components/discover/ScholarshipDrawer.jsx'
import WorkspaceLayout from '../components/layout/WorkspaceLayout.jsx'

export default function Tracker() {
  const { state, dispatch, results, toast } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState({})
  const tracked = useMemo(() => scholarships.filter((item) => state.applications[item.id]), [state.applications])
  function changeStage(item, stage) { dispatch({ type: 'SET_STAGE', id: item.id, stage }); toast(`Moved to ${stage}`) }
  function saveNotes(item) { if (notes[item.id] !== undefined && notes[item.id] !== state.applications[item.id]?.notes) dispatch({ type: 'SET_NOTES', id: item.id, notes: notes[item.id] }) }
  return <WorkspaceLayout title="Application tracker" eyebrow="Keep momentum visible" description="Move each opportunity through its next step. Notes and progress stay in this browser.">
    {tracked.length === 0 ? <div className="empty-state glass"><FileText size={25} aria-hidden="true" /><h2>Your tracker is ready when you are.</h2><p>Save a scholarship to see it here and plan your next step.</p><button className="button button-primary" type="button" onClick={() => navigate('/discover')}>Explore scholarships <ArrowRight size={15} aria-hidden="true" /></button></div> : <div className="kanban-board">{APPLICATION_STAGES.map((stage) => { const items = tracked.filter((item) => state.applications[item.id]?.stage === stage); const total = items.reduce((sum, item) => sum + item.amount, 0); return <section className="kanban-column" key={stage} aria-label={`${stage} applications`}><header className="kanban-column-head"><div><h2>{stage}</h2><span>{items.length} · {formatCurrency(total)}</span></div><strong>{items.length}</strong></header>{items.length === 0 ? <p className="kanban-empty">Nothing in this stage</p> : <div className="kanban-cards">{items.map((item) => { const application = state.applications[item.id]; const days = daysLeft(item.deadline); return <article className="kanban-card glass" key={item.id}><button type="button" className="kanban-title" onClick={() => setSelected(item)}>{item.name}</button><p>{item.provider}</p><div className="kanban-card-meta"><strong>{formatCurrency(item.amount)}</strong><span>{days < 0 ? 'Closed' : days === 0 ? 'Due today' : `${days} days left`}</span></div><span className="kanban-match">{results[item.id]?.score ?? 0}% rule-based match</span><label className="form-field">Stage<select value={application.stage} onChange={(event) => changeStage(item, event.target.value)}>{APPLICATION_STAGES.map((value) => <option key={value}>{value}</option>)}</select></label><label className="form-field">Notes<textarea rows="3" placeholder="Add a reminder or next step…" value={notes[item.id] ?? application.notes} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} onBlur={() => saveNotes(item)} /></label><div className="kanban-card-actions"><button className="text-button" type="button" onClick={() => setSelected(item)}>View details <ArrowRight size={14} aria-hidden="true" /></button><button className="icon-button quiet-icon" type="button" aria-label={`Remove ${item.name} from tracker`} onClick={() => { dispatch({ type: 'REMOVE_APP', id: item.id }); toast('Removed from your tracker') }}><Trash2 size={15} aria-hidden="true" /></button></div></article> })}</div>}</section> })}</div>}
    <ScholarshipDrawer scholarship={selected} onClose={() => setSelected(null)} onNavigate={navigate} />
  </WorkspaceLayout>
}
