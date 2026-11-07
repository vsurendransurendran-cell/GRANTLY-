import { useMemo } from 'react'
import { ArrowRight, Check, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { scholarships } from '../data/scholarships.js'
import { useApp } from '../context/AppContext.jsx'
import { formatCurrency } from '../lib/format.js'
import WorkspaceLayout from '../components/layout/WorkspaceLayout.jsx'

export default function Documents() {
  const { state, dispatch, toast } = useApp()
  const navigate = useNavigate()
  const tracked = useMemo(() => scholarships.filter((item) => state.applications[item.id]), [state.applications])
  const needed = [...new Set(tracked.flatMap((item) => item.requiredDocs))].sort((a, b) => a.localeCompare(b))
  const readyCount = needed.filter((name) => state.documents[name]).length
  const readyAll = needed.length > 0 && readyCount === needed.length
  function toggle(name) { dispatch({ type: 'TOGGLE_DOC', name }); toast(state.documents[name] ? 'Document marked as needed' : 'Document marked ready') }
  return <WorkspaceLayout title="Document checklist" eyebrow="Prepare once, use often" description="See which documents your tracked opportunities need and mark shared items ready as you collect them.">
    {tracked.length === 0 ? <div className="empty-state glass"><FileText size={25} aria-hidden="true" /><h2>No tracked scholarships yet</h2><p>Save a scholarship to build a combined document checklist.</p><button className="button button-primary" type="button" onClick={() => navigate('/discover')}>Browse scholarships <ArrowRight size={15} aria-hidden="true" /></button></div> : <>
      {readyAll && <div className="ready-banner glass"><span><Check size={18} aria-hidden="true" /></span><div><strong>Ready to submit</strong><p>All {needed.length} shared document types are marked ready.</p></div></div>}
      <div className="documents-layout"><section className="workspace-panel glass"><div className="filter-title"><FileText size={17} aria-hidden="true" /><strong>Shared documents</strong><span>{readyCount} of {needed.length} ready</span></div><ul className="document-checklist">{needed.map((name) => { const usedBy = tracked.filter((item) => item.requiredDocs.includes(name)); return <li key={name}><label><input type="checkbox" checked={Boolean(state.documents[name])} onChange={() => toggle(name)} /><span className="document-name">{name}</span></label><span className={`document-status${state.documents[name] ? ' is-ready' : ''}`}>{state.documents[name] ? 'Ready' : 'Needed'}</span><small>Needed for: {usedBy.map((item) => item.name).join(' · ')}</small></li> })}</ul></section>
      <aside className="workspace-panel glass"><div className="filter-title"><Check size={17} aria-hidden="true" /><strong>Application readiness</strong></div><div className="readiness-list">{tracked.map((item) => { const ready = item.requiredDocs.filter((name) => state.documents[name]).length; const complete = ready === item.requiredDocs.length; return <article className="readiness-item" key={item.id}><div className="readiness-heading"><div><strong>{item.name}</strong><small>{formatCurrency(item.amount)} · {ready}/{item.requiredDocs.length} documents ready</small></div><span className={complete ? 'document-status is-ready' : 'document-status'}>{complete ? 'Ready' : 'In progress'}</span></div><div className="readiness-bar" role="progressbar" aria-label={`Document readiness for ${item.name}`} aria-valuenow={ready} aria-valuemin="0" aria-valuemax={item.requiredDocs.length}><span style={{ width: `${Math.round(ready / item.requiredDocs.length * 100)}%` }} /></div></article> })}</div></aside></div>
    </>}
  </WorkspaceLayout>
}
