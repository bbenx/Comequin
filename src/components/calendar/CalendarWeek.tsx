import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import type { CalendarEvent } from '../../types'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../../constants/eventTypes'

type Props = {
  cursor: Date
  events: CalendarEvent[]
  onPrev: () => void
  onNext: () => void
  onOpenEvent: (e: CalendarEvent) => void
}

export function CalendarWeek({
  cursor,
  events,
  onPrev,
  onNext,
  onOpenEvent,
}: Props) {
  const start = startOfWeek(cursor, { weekStartsOn: 1 })
  const end = endOfWeek(cursor, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })

  const eventsForDay = (d: Date) =>
    events
      .filter((ev) => isSameDay(parseISO(ev.start), d))
      .sort((a, b) => +parseISO(a.start) - +parseISO(b.start))

  return (
    <>
      <div className="cal-toolbar">
        <div className="cal-nav">
          <button type="button" className="btn btn-ghost" onClick={onPrev}>
            ← Semaine
          </button>
          <strong style={{ minWidth: 200, textAlign: 'center' }}>
            {format(start, 'd MMM', { locale: fr })} —{' '}
            {format(end, 'd MMM yyyy', { locale: fr })}
          </strong>
          <button type="button" className="btn btn-ghost" onClick={onNext}>
            Semaine →
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
        }}
      >
        {days.map((d) => {
          const list = eventsForDay(d)
          return (
            <div key={d.toISOString()} className="card week-col">
              <div className="week-day-head">
                {format(d, 'EEE d MMM', { locale: fr })}
              </div>
              {list.length === 0 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Rien de prévu
                </span>
              )}
              {list.map((ev) => {
                const c = EVENT_TYPE_COLORS[ev.type]
                return (
                  <button
                    key={ev.id}
                    type="button"
                    className="event-pill"
                    style={{
                      background: c.bg,
                      borderColor: c.border,
                      color: c.text,
                    }}
                    onClick={() => onOpenEvent(ev)}
                  >
                    <span className="t">{ev.title}</span>
                    <span className="sub">
                      {format(parseISO(ev.start), 'HH:mm')} ·{' '}
                      {EVENT_TYPE_LABELS[ev.type]}
                    </span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </>
  )
}
