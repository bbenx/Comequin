import { addMonths, addWeeks } from 'date-fns'

export function addMonth(d: Date, n: number) {
  return addMonths(d, n)
}

export function addWeek(d: Date, n: number) {
  return addWeeks(d, n)
}
