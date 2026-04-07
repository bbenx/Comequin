import type { AppState, Project } from '../types'
import { DEFAULT_SETTINGS } from '../types'

const STORAGE_KEY = 'comequin-app-v1'

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
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

function normalizeProject(raw: unknown): Project {
  const p = raw as Project
  const attachments = Array.isArray(p.attachments) ? p.attachments : []
  return { ...p, attachments }
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
