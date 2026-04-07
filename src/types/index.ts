export type EventType =
  | 'casting_confirme'
  | 'callback_confirme'
  | 'shooting_confirme'
  | 'casting_possible'
  | 'callback_possible'
  | 'shooting_possible'
  | 'en_attente_retour'

export type ProjectStatus = 'en_attente' | 'confirme' | 'refuse' | 'sans_reponse'

export type ReminderUnit = 'hours' | 'days'

export interface EventReminder {
  value: number
  unit: ReminderUnit
}

export interface CalendarEvent {
  id: string
  title: string
  type: EventType
  start: string
  end?: string
  projectId?: string
  reminder?: EventReminder
  /** Réinitialisé quand la date de rappel ou l’événement change */
  reminderNotified?: boolean
}

export interface ContactInfo {
  name: string
  agency: string
  email: string
}

export interface SentEmailRecord {
  id: string
  sentAt: string
  subject: string
  body: string
}

export interface Project {
  id: string
  name: string
  contact: ContactInfo
  status: ProjectStatus
  brief: string
  emailHistory: SentEmailRecord[]
  createdAt: string
  updatedAt: string
}

export interface QuickNote {
  id: string
  text: string
  createdAt: string
}

export interface DailyItem {
  id: string
  label: string
  order: number
}

export interface AppSettings {
  /** Heure (0–23) pour le rappel checklist non complétée */
  dailyReminderHour: number
  /** Dernière date (YYYY-MM-DD) où la notif checklist a été envoyée */
  dailyIncompleteNotifiedDate?: string
  lastMorningResetDate?: string
  googleAccessToken?: string
  googleTokenExpiry?: number
}

export interface AppState {
  events: CalendarEvent[]
  projects: Project[]
  quickNotes: QuickNote[]
  dailyItems: DailyItem[]
  dailyCheckedIds: string[]
  settings: AppSettings
}

export const DEFAULT_SETTINGS: AppSettings = {
  dailyReminderHour: 20,
}
