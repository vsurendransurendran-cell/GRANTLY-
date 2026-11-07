import { useMemo, useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { scholarships } from '../data/scholarships.js'
import { CATEGORIES, COUNTRIES, FIELDS, INCOME_OPTIONS, LEVELS } from '../data/options.js'
import { DEFAULT_PROFILE, useApp } from '../context/AppContext.jsx'
import { evaluate } from '../lib/matchEngine.js'
import Modal from '../components/ui/Modal.jsx'
import WorkspaceLayout from '../components/layout/WorkspaceLayout.jsx'

export default function Profile() {
  const { state, dispatch, toast } = useApp()
  const [draft, setDraft] = useState({ ...state.profile, categories: [...state.profile.categories] })
  const [error, setError] = useState('')
  const [resetOpen, setResetOpen] = useState(false)
  const eligibleCount = useMemo(() => scholarships.filter((item) => evaluate(item, state.profile).eligible).length, [state.profile])
  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
    if (key !== 'gpa' || (value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 4)) dispatch({ type: 'SET_PROFILE', profile: { [key]: value } })
    setError('')
  }
  function toggleCategory(category) {
    const categories = draft.categories.includes(category) ? draft.categories.filter((item) => item !== category) : [...draft.categories, category]
    setDraft((current) => ({ ...current, categories }))
    dispatch({ type: 'SET_PROFILE', profile: { categories } })
  }
  function submit(event) {
    event.preventDefault()
    const gpa = Number(draft.gpa)
    if (!Number.isFinite(gpa) || gpa < 0 || gpa > 4) { setError('Enter a GPA from 0.0 to 4.0.'); return }
    if (!draft.name.trim()) { setError('Enter a name to personalize your workspace.'); return }
    const profile = { ...draft, name: draft.name.trim(), gpa }
    dispatch({ type: 'SET_PROFILE', profile })
    setDraft(profile)
    setError('')
    toast(`Your matches updated: ${scholarships.filter((item) => evaluate(item, profile).eligible).length} eligible scholarships`)
  }
  function resetDemo() {
    dispatch({ type: 'RESET_ALL' })
    setDraft({ ...DEFAULT_PROFILE, categories: [] })
    setResetOpen(false)
    setError('')
    toast('Demo data reset to the sample profile')
  }
  return <WorkspaceLayout title="Your student profile" eyebrow="A match starts with you" description="Update your details to refresh transparent, rule-based Smart Match scores across the sample catalog.">
    <div className="profile-page-layout"><section className="workspace-panel glass"><form className="profile-form" onSubmit={submit}>
      <label className="form-field">Name<input autoComplete="name" value={draft.name} onChange={(event) => update('name', event.target.value)} required /></label>
      <div className="form-grid-two"><label className="form-field">Study level<select value={draft.level} onChange={(event) => update('level', event.target.value)}>{LEVELS.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field">Field of study<select value={draft.field} onChange={(event) => update('field', event.target.value)}>{FIELDS.map((item) => <option key={item}>{item}</option>)}</select></label></div>
      <div className="form-grid-two"><label className="form-field">Country<select value={draft.country} onChange={(event) => update('country', event.target.value)}>{COUNTRIES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field">GPA (0.0–4.0)<input type="number" min="0" max="4" step="0.1" value={draft.gpa} onChange={(event) => update('gpa', event.target.value)} required /></label></div>
      <label className="form-field">Income band<select value={draft.income} onChange={(event) => update('income', Number(event.target.value))}>{INCOME_OPTIONS.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
      <fieldset className="category-fieldset"><legend>Student categories</legend><div className="category-checks">{CATEGORIES.map((category) => <label className="check-label" key={category}><input type="checkbox" checked={draft.categories.includes(category)} onChange={() => toggleCategory(category)} /><span>{category}</span></label>)}</div></fieldset>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="profile-form-footer"><button className="button button-primary" type="submit">Save profile <Check size={15} aria-hidden="true" /></button><button className="button button-ghost" type="button" onClick={() => setResetOpen(true)}><RotateCcw size={15} aria-hidden="true" /> Reset demo data</button></div>
    </form></section><aside className="profile-insight glass"><span className="profile-monogram" aria-hidden="true">{state.profile.name?.trim()?.[0]?.toUpperCase() || 'S'}</span><span className="section-kicker">Your matches updated</span><strong className="profile-eligible-count">{eligibleCount}</strong><p>eligible scholarships match every current profile criterion.</p><small>Scores are calculated locally using the stated criteria and weights—not AI or a guarantee of award.</small></aside></div>
    <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset demo data?" className="reset-modal"><div className="reset-copy"><p>This restores the sample student profile and clears all saved scholarships, application stages, notes, and document readiness on this browser.</p><p>This change cannot be undone.</p></div><div className="modal-form-actions"><button className="button button-ghost" type="button" onClick={() => setResetOpen(false)}>Keep my data</button><button className="button button-primary" type="button" onClick={resetDemo}>Reset all demo data</button></div></Modal>
  </WorkspaceLayout>
}
