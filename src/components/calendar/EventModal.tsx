import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import type { CalendarEvent, EventType, ReminderUnit } from '../../types'
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_ORDER,
  EVENT_TYPE_COLORS,
} from '../../constants/eventTypes'
import { useAppActions, useAppState } from '../../context/AppStateContext'

function toInputLocal(iso: string) {
  try {
    return format(parseISO(iso), "yyyy-MM-dd'T'HH:mm")
  } catch {
    return format(new Date(), "yyyy-MM-dd'T'HH:mm")
  }
}

function fromInputLocal(s: string) {
  return new Date(s).toISOString()
}

export type EventModalProps = {
  onClose: () => void
  initialDate?: Date
  initialTitle?: string
  editing?: CalendarEvent | null
  onSaved?: () => void
}

export function EventModal({
  onClose,
  initialDate,
  initialTitle,
  editing,
  onSaved,
}: EventModalProps) {
  const { state } = useAppState()
  const {
    addEvent,
    updateEvent,
    deleteEvent,
    clearEventReminderNotified,
  } = useAppActions()

  const lockTitleFromInbox = useState(() => !!initialTitle?.trim())[0]

  const [title, setTitle] = useState(() =>
    editing
      ? editing.title
      : (initialTitle?.trim() ?? EVENT_TYPE_LABELS.casting_confirme),
  )
  const [type, setType] = useState<EventType>(
    () => editing?.type ?? 'casting_confirme',
  )
  const [start, setStart] = useState(() =>
    editing
      ? toInputLocal(editing.start)
      : format((initialDate ?? new Date()), "yyyy-MM-dd'T'HH:mm"),
  )
  const [projectId, setProjectId] = useState(
    () => editing?.projectId ?? '',
  )
  const [reminderOn, setReminderOn] = useState(() => !!editing?.reminder)
  const [reminderValue, setReminderValue] = useState(
    () => editing?.reminder?.value ?? 1,
  )
  const [reminderUnit, setReminderUnit] = useState<ReminderUnit>(
    () => editing?.reminder?.unit ?? 'hours',
  )

  const originalKey = useMemo(() => {
    if (!editing) return ''
    return `${editing.start}|${JSON.stringify(editing.reminder ?? null)}`
  }, [editing])

  const pickType = (t: EventType) => {
    setType(t)
    if (!editing && !lockTitleFromInbox) setTitle(EVENT_TYPE_LABELS[t])
  }

  const save = () => {
    const startIso = fromInputLocal(start)
    const reminder =
      reminderOn && reminderValue > 0
        ? { value: reminderValue, unit: reminderUnit }
        : undefined

    if (editing) {
      const nextKey = `${startIso}|${JSON.stringify(reminder ?? null)}`
      if (nextKey !== originalKey) clearEventReminderNotified(editing.id)
      updateEvent({
        ...editing,
        title: title.trim() || EVENT_TYPE_LABELS[type],
        type,
        start: startIso,
        projectId: projectId || undefined,
        reminder,
        reminderNotified:
          nextKey === originalKey ? editing.reminderNotified : false,
      })
    } else {
      addEvent({
        id: crypto.randomUUID(),
        title: title.trim() || EVENT_TYPE_LABELS[type],
        type,
        start: startIso,
        projectId: projectId || undefined,
        reminder,
        reminderNotified: false,
      })
    }
    onSaved?.()
    onClose()
  }

  const remove = () => {
    if (editing && confirm('Supprimer cet événement ?')) {
      deleteEvent(editing.id)
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-labelledby="event-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="event-modal-title">
            {editing ? 'Modifier l’événement' : 'Nouvel événement'}
          </h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Fermer
          </button>
        </div>

        <div className="field">
          <label>Titre</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Type</label>
          <div className="chip-row">
            {EVENT_TYPE_ORDER.map((t) => {
              const c = EVENT_TYPE_COLORS[t]
              return (
                <button
                  key={t}
                  type="button"
                  className={`chip ${type === t ? 'active' : ''}`}
                  style={
                    type === t
                      ? {
                          background: c.bg,
                          borderColor: c.border,
                          color: c.text,
                        }
                      : undefined
                  }
                  onClick={() => pickType(t)}
                >
                  {EVENT_TYPE_LABELS[t]}
                </button>
              )
            })}
          </div>
        </div>

        <div className="field">
          <label>Date et heure</label>
          <input
            className="input"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Fiche projet (optionnel)</label>
          <select
            className="select"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">— Aucun —</option>
            {state.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={reminderOn}
              onChange={(e) => setReminderOn(e.target.checked)}
            />{' '}
            Rappel avant l’événement
          </label>
          {reminderOn && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 8,
                alignItems: 'center',
              }}
            >
              <input
                className="input"
                type="number"
                min={1}
                style={{ maxWidth: 88 }}
                value={reminderValue}
                onChange={(e) =>
                  setReminderValue(Math.max(1, Number(e.target.value) || 1))
                }
              />
              <select
                className="select"
                style={{ flex: 1 }}
                value={reminderUnit}
                onChange={(e) =>
                  setReminderUnit(e.target.value as ReminderUnit)
                }
              >
                <option value="hours">heure(s)</option>
                <option value="days">jour(s)</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          <button type="button" className="btn btn-primary" onClick={save}>
            Enregistrer
          </button>
          {editing && (
            <button type="button" className="btn btn-danger" onClick={remove}>
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
