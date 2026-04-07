import { useMemo, useState } from 'react'
import { useAppState } from '../context/AppStateContext'
import { CalendarMonth } from '../components/calendar/CalendarMonth'
import { CalendarWeek } from '../components/calendar/CalendarWeek'
import { DayEventsModal } from '../components/calendar/DayEventsModal'
import { addMonth, addWeek } from '../lib/calendarNav'
import { eventSpansDay } from '../lib/eventSpansDay'
import { EventModal } from '../components/calendar/EventModal'
import { EventDetailModal } from '../components/calendar/EventDetailModal'
import type { CalendarEvent } from '../types'

type View = 'month' | 'week'

export function CalendarPage() {
  const { state } = useAppState()
  const [view, setView] = useState<View>('month')
  const [cursor, setCursor] = useState(() => new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [modalKey, setModalKey] = useState(0)
  const [modalDate, setModalDate] = useState<Date | undefined>()
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null)
  const [dayPanel, setDayPanel] = useState<Date | null>(null)

  const eventsForDayPanel = useMemo(() => {
    if (!dayPanel) return []
    return state.events.filter((ev) =>
      dayPanel ? eventSpansDay(ev, dayPanel) : false,
    )
  }, [dayPanel, state.events])

  const openNew = (d?: Date) => {
    setModalKey((k) => k + 1)
    setEditing(null)
    setModalDate(d)
    setModalOpen(true)
  }

  const openDetail = (e: CalendarEvent) => {
    setDayPanel(null)
    setDetailEvent(e)
  }

  const openEdit = (e: CalendarEvent) => {
    setDayPanel(null)
    setDetailEvent(null)
    setModalKey((k) => k + 1)
    setEditing(e)
    setModalDate(undefined)
    setModalOpen(true)
  }

  const openEditFromDetail = () => {
    if (!detailEvent) return
    const fresh =
      state.events.find((x) => x.id === detailEvent.id) ?? detailEvent
    setDetailEvent(null)
    openEdit(fresh)
  }

  const openNewForDay = (d: Date) => {
    const start = new Date(d)
    start.setHours(9, 0, 0, 0)
    setDayPanel(null)
    openNew(start)
  }

  return (
    <div className="page">
      <h1 className="page-title">Calendrier</h1>

      <div className="chip-row" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={`chip ${view === 'month' ? 'active' : ''}`}
          onClick={() => setView('month')}
        >
          Mois
        </button>
        <button
          type="button"
          className={`chip ${view === 'week' ? 'active' : ''}`}
          onClick={() => setView('week')}
        >
          Semaine
        </button>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginLeft: 'auto', minWidth: 44 }}
          onClick={() => openNew(new Date())}
          aria-label="Nouvel événement"
          title="Nouvel événement"
        >
          +
        </button>
      </div>

      {view === 'month' ? (
        <CalendarMonth
          cursor={cursor}
          events={state.events}
          onPrev={() => setCursor((c) => addMonth(c, -1))}
          onNext={() => setCursor((c) => addMonth(c, 1))}
          onSelectDay={(d) => setDayPanel(d)}
          onGoToday={() => setCursor(new Date())}
          onOpenEvent={openDetail}
        />
      ) : (
        <CalendarWeek
          cursor={cursor}
          events={state.events}
          onPrev={() => setCursor((c) => addWeek(c, -1))}
          onNext={() => setCursor((c) => addWeek(c, 1))}
          onOpenEvent={openDetail}
        />
      )}

      {dayPanel && (
        <DayEventsModal
          date={dayPanel}
          events={eventsForDayPanel}
          onClose={() => setDayPanel(null)}
          onOpenEvent={openDetail}
          onCreateOnDay={() => openNewForDay(dayPanel)}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onEdit={openEditFromDetail}
        />
      )}

      {modalOpen && (
        <EventModal
          key={modalKey}
          onClose={() => setModalOpen(false)}
          initialDate={modalDate}
          editing={editing}
        />
      )}
    </div>
  )
}
