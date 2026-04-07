/* eslint-disable react-refresh/only-export-components -- context + hooks */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  AppState,
  CalendarEvent,
  DailyItem,
  Project,
  QuickNote,
  SentEmailRecord,
} from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { loadState, saveState } from '../lib/storage'

type Action =
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_NOTE'; payload: QuickNote }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_DAILY_ITEM'; payload: DailyItem }
  | { type: 'UPDATE_DAILY_ITEM'; payload: DailyItem }
  | { type: 'DELETE_DAILY_ITEM'; payload: string }
  | { type: 'TOGGLE_DAILY_CHECK'; payload: string }
  | { type: 'SET_DAILY_CHECKS'; payload: string[] }
  | {
      type: 'UPDATE_SETTINGS'
      payload: Partial<AppState['settings']>
    }
  | { type: 'RESET_DAILY_FOR_NEW_DAY'; payload: string }
  | { type: 'APPEND_PROJECT_EMAIL'; payload: { projectId: string; record: SentEmailRecord } }
  | { type: 'MARK_EVENT_REMINDER_NOTIFIED'; payload: string }
  | { type: 'CLEAR_EVENT_REMINDER_NOTIFIED'; payload: string }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] }
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? action.payload : e,
        ),
      }
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.payload),
      }
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p,
        ),
      }
    case 'DELETE_PROJECT':
      return {
        ...state,
        events: state.events.map((e) =>
          e.projectId === action.payload ? { ...e, projectId: undefined } : e,
        ),
        projects: state.projects.filter((p) => p.id !== action.payload),
      }
    case 'ADD_NOTE':
      return { ...state, quickNotes: [action.payload, ...state.quickNotes] }
    case 'DELETE_NOTE':
      return {
        ...state,
        quickNotes: state.quickNotes.filter((n) => n.id !== action.payload),
      }
    case 'ADD_DAILY_ITEM':
      return { ...state, dailyItems: [...state.dailyItems, action.payload] }
    case 'UPDATE_DAILY_ITEM':
      return {
        ...state,
        dailyItems: state.dailyItems.map((d) =>
          d.id === action.payload.id ? action.payload : d,
        ),
      }
    case 'DELETE_DAILY_ITEM':
      return {
        ...state,
        dailyItems: state.dailyItems.filter((d) => d.id !== action.payload),
        dailyCheckedIds: state.dailyCheckedIds.filter(
          (id) => id !== action.payload,
        ),
      }
    case 'TOGGLE_DAILY_CHECK': {
      const id = action.payload
      const has = state.dailyCheckedIds.includes(id)
      return {
        ...state,
        dailyCheckedIds: has
          ? state.dailyCheckedIds.filter((x) => x !== id)
          : [...state.dailyCheckedIds, id],
      }
    }
    case 'SET_DAILY_CHECKS':
      return { ...state, dailyCheckedIds: action.payload }
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      }
    case 'RESET_DAILY_FOR_NEW_DAY':
      return {
        ...state,
        dailyCheckedIds: [],
        settings: {
          ...state.settings,
          lastMorningResetDate: action.payload,
          dailyIncompleteNotifiedDate: undefined,
        },
      }
    case 'APPEND_PROJECT_EMAIL':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projectId
            ? {
                ...p,
                emailHistory: [action.payload.record, ...p.emailHistory],
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      }
    case 'MARK_EVENT_REMINDER_NOTIFIED':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload ? { ...e, reminderNotified: true } : e,
        ),
      }
    case 'CLEAR_EVENT_REMINDER_NOTIFIED':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload ? { ...e, reminderNotified: false } : e,
        ),
      }
    default:
      return state
  }
}

const initial: AppState = {
  events: [],
  projects: [],
  quickNotes: [],
  dailyItems: [],
  dailyCheckedIds: [],
  settings: { ...DEFAULT_SETTINGS },
}

type Ctx = {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppStateContext = createContext<Ctx | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial, () => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch])
  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState outside provider')
  return ctx
}

export function useAppActions() {
  const { dispatch } = useAppState()

  const addEvent = useCallback(
    (e: CalendarEvent) => dispatch({ type: 'ADD_EVENT', payload: e }),
    [dispatch],
  )
  const updateEvent = useCallback(
    (e: CalendarEvent) => dispatch({ type: 'UPDATE_EVENT', payload: e }),
    [dispatch],
  )
  const deleteEvent = useCallback(
    (id: string) => dispatch({ type: 'DELETE_EVENT', payload: id }),
    [dispatch],
  )
  const addProject = useCallback(
    (p: Project) => dispatch({ type: 'ADD_PROJECT', payload: p }),
    [dispatch],
  )
  const updateProject = useCallback(
    (p: Project) => dispatch({ type: 'UPDATE_PROJECT', payload: p }),
    [dispatch],
  )
  const deleteProject = useCallback(
    (id: string) => dispatch({ type: 'DELETE_PROJECT', payload: id }),
    [dispatch],
  )
  const addNote = useCallback(
    (n: QuickNote) => dispatch({ type: 'ADD_NOTE', payload: n }),
    [dispatch],
  )
  const deleteNote = useCallback(
    (id: string) => dispatch({ type: 'DELETE_NOTE', payload: id }),
    [dispatch],
  )
  const addDailyItem = useCallback(
    (d: DailyItem) => dispatch({ type: 'ADD_DAILY_ITEM', payload: d }),
    [dispatch],
  )
  const updateDailyItem = useCallback(
    (d: DailyItem) => dispatch({ type: 'UPDATE_DAILY_ITEM', payload: d }),
    [dispatch],
  )
  const deleteDailyItem = useCallback(
    (id: string) => dispatch({ type: 'DELETE_DAILY_ITEM', payload: id }),
    [dispatch],
  )
  const toggleDailyCheck = useCallback(
    (id: string) => dispatch({ type: 'TOGGLE_DAILY_CHECK', payload: id }),
    [dispatch],
  )
  const updateSettings = useCallback(
    (s: Partial<AppState['settings']>) =>
      dispatch({ type: 'UPDATE_SETTINGS', payload: s }),
    [dispatch],
  )
  const resetDailyForNewDay = useCallback(
    (dateStr: string) =>
      dispatch({ type: 'RESET_DAILY_FOR_NEW_DAY', payload: dateStr }),
    [dispatch],
  )
  const appendProjectEmail = useCallback(
    (projectId: string, record: SentEmailRecord) =>
      dispatch({ type: 'APPEND_PROJECT_EMAIL', payload: { projectId, record } }),
    [dispatch],
  )
  const markEventReminderNotified = useCallback(
    (id: string) =>
      dispatch({ type: 'MARK_EVENT_REMINDER_NOTIFIED', payload: id }),
    [dispatch],
  )
  const clearEventReminderNotified = useCallback(
    (id: string) =>
      dispatch({ type: 'CLEAR_EVENT_REMINDER_NOTIFIED', payload: id }),
    [dispatch],
  )

  return {
    addEvent,
    updateEvent,
    deleteEvent,
    addProject,
    updateProject,
    deleteProject,
    addNote,
    deleteNote,
    addDailyItem,
    updateDailyItem,
    deleteDailyItem,
    toggleDailyCheck,
    updateSettings,
    resetDailyForNewDay,
    appendProjectEmail,
    markEventReminderNotified,
    clearEventReminderNotified,
  }
}
