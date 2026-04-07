import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import type { CalendarEvent } from '../../types'
import {
  colorsForEventType,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_ORDER,
} from '../../constants/eventTypes'
import { eventSpansDay } from '../../lib/eventSpansDay'

const DOW = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

type Props = {
  cursor: Date
  events: CalendarEvent[]
  onPrev: () => void
  onNext: () => void
  /** Clic sur une case jour : afficher les événements du jour */
  onSelectDay: (d: Date) => void
  onGoToday: () => void
  onOpenEvent: (e: CalendarEvent) => void
}

export function CalendarMonth({
  cursor,
  events,
  onPrev,
  onNext,
  onSelectDay,
  onGoToday,
  onOpenEvent,
}: Props) {
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })
  const today = new Date()

  const eventsByDay = (d: Date) =>
    events
      .filter((ev) => eventSpansDay(ev, d))
      .sort((a, b) => +parseISO(a.start) - +parseISO(b.start))

  return (
    <>
      <div className="cal-toolbar">
        <div className="cal-nav">
          <button type="button" className="btn btn-ghost" onClick={onPrev}>
            ←
          </button>
          <strong style={{ minWidth: 160, textAlign: 'center' }}>
            {format(cursor, 'MMMM yyyy', { locale: fr })}
          </strong>
          <button type="button" className="btn btn-ghost" onClick={onNext}>
            →
          </button>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onGoToday}
          title="Revenir au mois qui contient la date du jour (après avoir changé de mois avec les flèches)."
          aria-label="Afficher le mois actuel"
        >
          Aujourd’hui
        </button>
      </div>

      <div className="cal-grid">
        {DOW.map((d) => (
          <div key={d} className="cal-dow">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const dayEvs = eventsByDay(d)
          const muted = !isSameMonth(d, cursor)
          const todayCell = isSameDay(d, today)
          const maxRows = 3
          const visible = dayEvs.slice(0, maxRows)
          const more = dayEvs.length - visible.length
          return (
            <div
              key={d.toISOString()}
              role="button"
              tabIndex={0}
              className={`cal-cell ${muted ? 'muted' : ''} ${todayCell ? 'today' : ''}`}
              onClick={() => onSelectDay(d)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectDay(d)
                }
              }}
            >
              <div className="day-num">{format(d, 'd')}</div>
              <div className="cal-cell-events">
                {visible.map((ev) => {
                  const c = colorsForEventType(ev.type)
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      className="cal-event-row"
                      title={ev.title}
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenEvent(ev)
                      }}
                    >
                      <span
                        className="cal-event-dot"
                        style={{ background: c.border }}
                        aria-hidden
                      />
                      <span className="cal-event-title">{ev.title}</span>
                    </button>
                  )
                })}
                {more > 0 && (
                  <span className="cal-event-more">+{more} autre{more > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="cal-legend" aria-label="Code couleur des types d’étape">
        {EVENT_TYPE_ORDER.map((t) => {
          const c = colorsForEventType(t)
          return (
            <span key={t} className="cal-legend-item">
              <span
                className="cal-legend-dot"
                style={{ background: c.border }}
                aria-hidden
              />
              {EVENT_TYPE_LABELS[t]}
            </span>
          )
        })}
      </div>
    </>
  )
}
