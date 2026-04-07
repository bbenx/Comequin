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
import { useMediaQuery } from '../../hooks/useMediaQuery'

const DOW = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function EventTypeLegendItems() {
  return (
    <>
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
    </>
  )
}

function TodayCalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden
      focusable="false"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M3 10h18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M8 3v4M16 3v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="2.25" fill="currentColor" />
    </svg>
  )
}

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
  const compactMonth = useMediaQuery('(max-width: 560px)')
  const maxEventRows = compactMonth ? 1 : 3

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
          <span className="cal-month-title">
            {format(cursor, 'MMMM yyyy', { locale: fr })}
          </span>
          <button type="button" className="btn btn-ghost" onClick={onNext}>
            →
          </button>
        </div>
        <button
          type="button"
          className="cal-today-icon-btn"
          onClick={onGoToday}
          title="Aujourd’hui — afficher le mois en cours"
          aria-label="Aujourd’hui — afficher le mois en cours"
        >
          <TodayCalendarIcon />
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
          const visible = dayEvs.slice(0, maxEventRows)
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

      {compactMonth ? (
        <details className="cal-legend-details">
          <summary className="cal-legend-summary">
            Types d’étape (couleurs)
          </summary>
          <div className="cal-legend" aria-label="Code couleur des types d’étape">
            <EventTypeLegendItems />
          </div>
        </details>
      ) : (
        <div className="cal-legend" aria-label="Code couleur des types d’étape">
          <EventTypeLegendItems />
        </div>
      )}
    </>
  )
}
