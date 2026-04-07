import { useState } from 'react'
import { useAppState } from '../context/AppStateContext'
import { CalendarMonth } from '../components/calendar/CalendarMonth'
import { CalendarWeek } from '../components/calendar/CalendarWeek'
import { addMonth, addWeek } from '../lib/calendarNav'
import { EventModal } from '../components/calendar/EventModal'
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

  const openNew = (d?: Date) => {
    setModalKey((k) => k + 1)
    setEditing(null)
    setModalDate(d)
    setModalOpen(true)
  }

  const openEdit = (e: CalendarEvent) => {
    setModalKey((k) => k + 1)
    setEditing(e)
    setModalDate(undefined)
    setModalOpen(true)
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
          style={{ marginLeft: 'auto' }}
          onClick={() => openNew(new Date())}
        >
          + Événement
        </button>
      </div>

      {view === 'month' ? (
        <CalendarMonth
          cursor={cursor}
          events={state.events}
          onPrev={() => setCursor((c) => addMonth(c, -1))}
          onNext={() => setCursor((c) => addMonth(c, 1))}
          onPickDay={(d) => openNew(d)}
          onOpenEvent={openEdit}
        />
      ) : (
        <CalendarWeek
          cursor={cursor}
          events={state.events}
          onPrev={() => setCursor((c) => addWeek(c, -1))}
          onNext={() => setCursor((c) => addWeek(c, 1))}
          onOpenEvent={openEdit}
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
