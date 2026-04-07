import {
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from 'date-fns'
import type { CalendarEvent } from '../types'

/**
 * Le jour calendaire `day` (local) est-il dans l’intervalle
 * [start, end] de l’événement (end = start si non défini) ?
 */
export function eventSpansDay(ev: CalendarEvent, day: Date): boolean {
  try {
    const s = startOfDay(parseISO(ev.start))
    const endRaw = ev.end ? parseISO(ev.end) : parseISO(ev.start)
    const e = startOfDay(endRaw)
    const d = startOfDay(day)
    if (isAfter(s, e)) return isSameDay(s, d)
    return !isBefore(d, s) && !isAfter(d, e)
  } catch {
    return false
  }
}
