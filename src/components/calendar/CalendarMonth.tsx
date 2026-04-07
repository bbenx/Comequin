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
import { EVENT_TYPE_COLORS } from '../../constants/eventTypes'

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
    events.filter((ev) => isSameDay(parseISO(ev.start), d))

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
        <button type="button" className="btn btn-ghost" onClick={onGoToday}>
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
          return (
            <button
              key={d.toISOString()}
              type="button"
              className={`cal-cell ${muted ? 'muted' : ''} ${todayCell ? 'today' : ''}`}
              onClick={() => onSelectDay(d)}
            >
              <div className="day-num">{format(d, 'd')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {dayEvs.slice(0, 4).map((ev) => {
                  const c = EVENT_TYPE_COLORS[ev.type]
                  return (
                    <span
                      key={ev.id}
                      title={ev.title}
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenEvent(ev)
                      }}
                      role="presentation"
                      style={{
                        cursor: 'pointer',
                        width: 6,
                        height: 6,
                        borderRadius: 2,
                        background: c.border,
                      }}
                    />
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
