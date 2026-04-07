import type { EventType } from '../types'

/** Anciens types (avant refonte) → nouveau type équivalent */
export const LEGACY_EVENT_TYPE_MAP: Record<string, EventType> = {
  casting_confirme: 'callback_casting',
  callback_confirme: 'callback_casting',
  shooting_confirme: 'tournage_shooting',
  casting_possible: 'selftape_preparation',
  shooting_possible: 'attente_retour',
  en_attente_retour: 'attente_retour',
  mail_sollicitation: 'attente_retour',
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  callback_possible: 'Callback possible',
  selftape_preparation: 'Selftape à préparer',
  selftape_envoi: 'Selftape à envoyer',
  attente_retour: 'En attente de retour',
  callback_casting: 'Callback (casting)',
  tournage_shooting: 'Tournage / shooting',
  apprentissage_texte: 'Apprentissage de textes',
  atelier: 'Atelier',
}

export const EVENT_TYPE_GROUPS: { label: string; types: EventType[] }[] = [
  {
    label: 'Parcours casting & tournage',
    types: [
      'callback_possible',
      'selftape_preparation',
      'selftape_envoi',
      'attente_retour',
      'callback_casting',
      'tournage_shooting',
    ],
  },
  {
    label: 'Préparation & ateliers',
    types: ['apprentissage_texte', 'atelier'],
  },
]

export const EVENT_TYPE_ORDER: EventType[] = EVENT_TYPE_GROUPS.flatMap(
  (g) => g.types,
)

export const DEFAULT_EVENT_TYPE: EventType = 'callback_possible'

export const EVENT_TYPE_COLORS: Record<
  EventType,
  { bg: string; border: string; text: string }
> = {
  callback_possible: { bg: '#2a3540', border: '#457b9d', text: '#a8dadc' },
  selftape_preparation: { bg: '#3d3420', border: '#b08968', text: '#e9c46a' },
  selftape_envoi: { bg: '#2d3a2d', border: '#52796f', text: '#95d5b2' },
  attente_retour: { bg: '#3a3030', border: '#7f6a6a', text: '#d4c5c5' },
  callback_casting: { bg: '#1e3a3a', border: '#2a9d8f', text: '#9ee5dc' },
  tournage_shooting: { bg: '#2a2550', border: '#5a4fcf', text: '#c4b5fd' },
  apprentissage_texte: { bg: '#3a2d40', border: '#9b72cf', text: '#e0c3fc' },
  atelier: { bg: '#283d32', border: '#40916c', text: '#b7e4c7' },
}

const EVENT_TYPE_KEYS = new Set(
  Object.keys(EVENT_TYPE_LABELS) as EventType[],
)

export function migrateEventType(raw: string | undefined): EventType {
  if (!raw) return 'attente_retour'
  if (EVENT_TYPE_KEYS.has(raw as EventType)) return raw as EventType
  return LEGACY_EVENT_TYPE_MAP[raw] ?? 'attente_retour'
}
