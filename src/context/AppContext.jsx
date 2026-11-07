import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { scholarships } from '../data/scholarships.js'
import { APPLICATION_STAGES } from '../data/options.js'
import { evaluate } from '../lib/matchEngine.js'

export const STORAGE_KEY = 'grantly:v1'

export const DEFAULT_PROFILE = {
  name: 'Student',
  level: 'Undergraduate',
  field: 'Computer Science',
  country: 'India',
  gpa: 3.4,
  income: 2,
  categories: [],
}

export function createDefaultState() {
  return {
    profile: { ...DEFAULT_PROFILE, categories: [] },
    applications: {},
    documents: {},
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function mergeSavedState(saved) {
  const defaults = createDefaultState()
  if (!isRecord(saved)) return defaults

  const savedProfile = isRecord(saved.profile) ? saved.profile : {}
  const profile = {
    ...defaults.profile,
    ...savedProfile,
    categories: Array.isArray(savedProfile.categories) ? savedProfile.categories : [],
  }
  const applications = {}
  if (isRecord(saved.applications)) {
    for (const [id, application] of Object.entries(saved.applications)) {
      if (!id || !isRecord(application)) continue
      applications[id] = {
        stage: APPLICATION_STAGES.includes(application.stage) ? application.stage : 'Saved',
        notes: typeof application.notes === 'string' ? application.notes : '',
        updatedAt: typeof application.updatedAt === 'string' ? application.updatedAt : '',
      }
    }
  }
  const documents = {}
  if (isRecord(saved.documents)) {
    for (const [name, ready] of Object.entries(saved.documents)) {
      if (name && typeof ready === 'boolean') documents[name] = ready
    }
  }

  return { profile, applications, documents }
}

export function loadSavedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultState()
    return mergeSavedState(JSON.parse(raw))
  } catch {
    return createDefaultState()
  }
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'SET_PROFILE': {
      const nextProfile = isRecord(action.profile) ? action.profile : action.payload
      if (!isRecord(nextProfile)) return state
      return {
        ...state,
        profile: {
          ...state.profile,
          ...nextProfile,
          categories: Array.isArray(nextProfile.categories)
            ? nextProfile.categories
            : state.profile.categories,
        },
      }
    }
    case 'TOGGLE_SAVE': {
      const id = action.id ?? action.scholarshipId
      if (!id) return state
      if (state.applications[id]) {
        const applications = { ...state.applications }
        delete applications[id]
        return { ...state, applications }
      }
      return {
        ...state,
        applications: {
          ...state.applications,
          [id]: { stage: 'Saved', notes: '', updatedAt: new Date().toISOString() },
        },
      }
    }
    case 'SET_STAGE': {
      const id = action.id ?? action.scholarshipId
      if (!id || !state.applications[id] || !APPLICATION_STAGES.includes(action.stage)) return state
      return {
        ...state,
        applications: {
          ...state.applications,
          [id]: { ...state.applications[id], stage: action.stage, updatedAt: new Date().toISOString() },
        },
      }
    }
    case 'SET_NOTES': {
      const id = action.id ?? action.scholarshipId
      if (!id || !state.applications[id]) return state
      return {
        ...state,
        applications: {
          ...state.applications,
          [id]: { ...state.applications[id], notes: String(action.notes ?? ''), updatedAt: new Date().toISOString() },
        },
      }
    }
    case 'REMOVE_APP': {
      const id = action.id ?? action.scholarshipId
      if (!id || !state.applications[id]) return state
      const applications = { ...state.applications }
      delete applications[id]
      return { ...state, applications }
    }
    case 'TOGGLE_DOC': {
      const name = action.name ?? action.docName
      if (!name) return state
      return {
        ...state,
        documents: { ...state.documents, [name]: !state.documents[name] },
      }
    }
    case 'RESET_ALL':
      return createDefaultState()
    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadSavedState)
  const [toastMessage, setToastMessage] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        profile: state.profile,
        applications: state.applications,
        documents: state.documents,
      }))
    } catch {
      // Storage can be disabled, full, or unavailable; keep the app usable in memory.
    }
  }, [state])

  const clearToast = useCallback(() => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = null
    setToastMessage(null)
  }, [])

  const toast = useCallback((message) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToastMessage({ id: Date.now(), message: String(message) })
    toastTimer.current = window.setTimeout(() => {
      toastTimer.current = null
      setToastMessage(null)
    }, 3200)
  }, [])

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
  }, [])

  const results = useMemo(() => Object.fromEntries(
    scholarships.map((scholarship) => [scholarship.id, evaluate(scholarship, state.profile)]),
  ), [state.profile])

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    results,
    toast,
    toastMessage,
    clearToast,
  }), [state, results, toast, toastMessage, clearToast])

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
