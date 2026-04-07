import type { EventType } from '../types'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  casting_confirme: 'Casting confirmé',
  callback_confirme: 'Callback confirmé',
  shooting_confirme: 'Shooting confirmé',
  casting_possible: 'Casting possible',
  callback_possible: 'Callback possible',
  shooting_possible: 'Shooting possible',
  en_attente_retour: 'En attente de retour',
}

/** Couleurs dédiées (fond / bordure) */
export const EVENT_TYPE_COLORS: Record<
  EventType,
  { bg: string; border: string; text: string }
> = {
  casting_confirme: { bg: '#1e3a2f', border: '#2d6a4f', text: '#95d5b2' },
  callback_confirme: { bg: '#1e3a3a', border: '#2a9d8f', text: '#9ee5dc' },
  shooting_confirme: { bg: '#2a2550', border: '#5a4fcf', text: '#c4b5fd' },
  casting_possible: { bg: '#3d3420', border: '#b08968', text: '#e9c46a' },
  callback_possible: { bg: '#3a3028', border: '#bc6c25', text: '#f4a261' },
  shooting_possible: { bg: '#352840', border: '#9b59b6', text: '#e8b4f8' },
  en_attente_retour: { bg: '#3a3030', border: '#7f6a6a', text: '#d4c5c5' },
}

export const EVENT_TYPE_ORDER: EventType[] = [
  'casting_confirme',
  'callback_confirme',
  'shooting_confirme',
  'casting_possible',
  'callback_possible',
  'shooting_possible',
  'en_attente_retour',
]
