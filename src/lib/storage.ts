import type { AppState, CalendarEvent, Project } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { migrateEventType } from '../constants/eventTypes'

const STORAGE_KEY = 'comequin-app-v1'

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      events: Array.isArray(parsed.events)
        ? parsed.events.map(normalizeEvent)
        : [],
      projects: Array.isArray(parsed.projects)
        ? parsed.projects.map(normalizeProject)
        : [],
      quickNotes: Array.isArray(parsed.quickNotes) ? parsed.quickNotes : [],
      dailyItems: Array.isArray(parsed.dailyItems) ? parsed.dailyItems : [],
      dailyCheckedIds: Array.isArray(parsed.dailyCheckedIds)
        ? parsed.dailyCheckedIds
        : [],
      settings: {
        ...DEFAULT_SETTINGS,
        ...parsed.settings,
      },
    }
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota / private mode */
  }
}

function normalizeEvent(raw: unknown): CalendarEvent {
  const e = raw as CalendarEvent
  const attachments = Array.isArray(e.attachments) ? e.attachments : []
  const paid = typeof e.paid === 'boolean' ? e.paid : false
  const contact =
    e.contact && typeof e.contact === 'object' ? e.contact : undefined
  return {
    ...e,
    type: migrateEventType(e.type as string),
    paid,
    attachments,
    contact,
  }
}

function normalizeProject(raw: unknown): Project {
  const p = raw as Project
  const attachments = Array.isArray(p.attachments) ? p.attachments : []
  const notes = Array.isArray(p.notes) ? p.notes : []
  return { ...p, attachments, notes }
}

function defaultState(): AppState {
  return {
    events: [],
    projects: [],
    quickNotes: [],
    dailyItems: [
      { id: crypto.randomUUID(), label: 'Casting.fr', order: 0 },
      { id: crypto.randomUUID(), label: 'Instagram / réseaux', order: 1 },
      { id: crypto.randomUUID(), label: 'Mails agence', order: 2 },
    ],
    dailyCheckedIds: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}
