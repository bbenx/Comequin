import { addHours, addDays, parseISO, isBefore } from 'date-fns'
import type { CalendarEvent } from '../types'

export function getReminderFireAt(event: CalendarEvent): Date | null {
  if (!event.reminder || !event.reminder.value) return null
  const start = parseISO(event.start)
  const { value, unit } = event.reminder
  if (unit === 'days') return addDays(start, -value)
  return addHours(start, -value)
}

/** Après l’heure du rappel et avant le début de l’événement. */
export function shouldFireEventReminderNow(event: CalendarEvent, now: Date): boolean {
  if (!event.reminder || event.reminderNotified) return false
  const fireAt = getReminderFireAt(event)
  if (!fireAt) return false
  const start = parseISO(event.start)
  if (isBefore(now, fireAt)) return false
  if (!isBefore(now, start)) return false
  return true
}
