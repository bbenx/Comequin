export type EventType =
  | 'callback_possible'
  | 'selftape_preparation'
  | 'selftape_envoi'
  | 'attente_retour'
  | 'callback_casting'
  | 'tournage_shooting'
  | 'apprentissage_texte'
  | 'atelier'
  /** Indispo perso, voyage, vie privée (hors pro) */
  | 'perso'

export type ProjectStatus = 'en_attente' | 'confirme' | 'refuse' | 'sans_reponse'

export type ReminderUnit = 'hours' | 'days'

export interface EventReminder {
  value: number
  unit: ReminderUnit
}

/** Contact lié à un événement (casting, prod…) */
export interface EventContact {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  /** Ex. directeur·rice de casting, assistante prod */
  role?: string
  /** Le contact passe par / représente une agence */
  agencyContact?: boolean
  agencyName?: string
}

export interface CalendarEvent {
  id: string
  title: string
  type: EventType
  start: string
  end?: string
  projectId?: string
  /** Projet rémunéré ou non */
  paid?: boolean
  contact?: EventContact
  /** Scénario, fiche selftape, etc. (stockage local) */
  attachments?: ProjectAttachment[]
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

/** Pièce jointe stockée localement (data URL), liée à une fiche projet */
export interface ProjectAttachment {
  id: string
  name: string
  mimeType: string
  dataUrl: string
  addedAt: string
}

export interface Project {
  id: string
  name: string
  contact: ContactInfo
  status: ProjectStatus
  brief: string
  emailHistory: SentEmailRecord[]
  /** Photos et fichiers associés à la fiche */
  attachments: ProjectAttachment[]
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
