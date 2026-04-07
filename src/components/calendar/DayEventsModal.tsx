import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import type { CalendarEvent } from '../../types'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../../constants/eventTypes'

type Props = {
  date: Date
  events: CalendarEvent[]
  onClose: () => void
  onOpenEvent: (e: CalendarEvent) => void
  onCreateOnDay: () => void
}

export function DayEventsModal({
  date,
  events,
  onClose,
  onOpenEvent,
  onCreateOnDay,
}: Props) {
  const sorted = [...events].sort(
    (a, b) => +parseISO(a.start) - +parseISO(b.start),
  )

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-labelledby="day-events-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="day-events-title">
            {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
          </h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Fermer
          </button>
        </div>

        {sorted.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', margin: '0 0 16px' }}>
            Aucun événement ce jour.
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: '0 0 16px',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {sorted.map((ev) => {
              const c = EVENT_TYPE_COLORS[ev.type]
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    className="event-pill"
                    style={{
                      width: '100%',
                      textAlign: 'left',
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
                </li>
              )
            })}
          </ul>
        )}

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={onCreateOnDay}
        >
          + Nouvel événement ce jour
        </button>
      </div>
    </div>
  )
}
