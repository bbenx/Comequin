import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import type {
  CalendarEvent,
  EventContact,
  EventType,
  ProjectAttachment,
  ReminderUnit,
} from '../../types'
import { EVENT_TYPE_GROUPS, EVENT_TYPE_LABELS } from '../../constants/eventTypes'
import { useAppActions, useAppState } from '../../context/AppStateContext'
import { LocalAttachmentsPicker } from '../shared/LocalAttachmentsPicker'
import { MAX_LOCAL_FILE_BYTES } from '../../lib/localFiles'
import { createProjectPayloadFromEvent } from '../../lib/projectFromEvent'

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

type ContactForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  agencyContact: boolean
  agencyName: string
}

function contactFromEvent(ev: CalendarEvent | null | undefined): ContactForm {
  const c = ev?.contact
  return {
    firstName: c?.firstName ?? '',
    lastName: c?.lastName ?? '',
    email: c?.email ?? '',
    phone: c?.phone ?? '',
    role: c?.role ?? '',
    agencyContact: !!c?.agencyContact,
    agencyName: c?.agencyName ?? '',
  }
}

function contactFormToContact(f: ContactForm): EventContact | undefined {
  const out: EventContact = {}
  if (f.firstName.trim()) out.firstName = f.firstName.trim()
  if (f.lastName.trim()) out.lastName = f.lastName.trim()
  if (f.email.trim()) out.email = f.email.trim()
  if (f.phone.trim()) out.phone = f.phone.trim()
  if (f.role.trim()) out.role = f.role.trim()
  if (f.agencyContact) {
    out.agencyContact = true
    if (f.agencyName.trim()) out.agencyName = f.agencyName.trim()
  }
  return Object.keys(out).length ? out : undefined
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
    addProject,
    updateEvent,
    deleteEvent,
    clearEventReminderNotified,
  } = useAppActions()

  const [title, setTitle] = useState(() =>
    editing ? editing.title : (initialTitle?.trim() ?? ''),
  )
  const [type, setType] = useState<EventType | ''>(() =>
    editing ? editing.type : '',
  )
  const [start, setStart] = useState(() =>
    editing
      ? toInputLocal(editing.start)
      : format((initialDate ?? new Date()), "yyyy-MM-dd'T'HH:mm"),
  )
  const [end, setEnd] = useState(() =>
    editing?.end ? toInputLocal(editing.end) : '',
  )
  const [projectId, setProjectId] = useState(
    () => editing?.projectId ?? '',
  )
  /** Nouvelle fiche auto : seulement si l’événement n’est pas déjà lié */
  const [createLinkedProject, setCreateLinkedProject] = useState(
    () => !editing?.projectId,
  )
  const [paid, setPaid] = useState(() => !!editing?.paid)
  const [contactForm, setContactForm] = useState<ContactForm>(() =>
    contactFromEvent(editing),
  )
  const [attachments, setAttachments] = useState<ProjectAttachment[]>(
    () => editing?.attachments ?? [],
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

  const setContact = (patch: Partial<ContactForm>) => {
    setContactForm((f) => ({ ...f, ...patch }))
  }

  const save = () => {
    if (!type) {
      window.alert('Sélectionnez une étape.')
      return
    }
    const startIso = fromInputLocal(start)
    let endIso: string | undefined
    if (end.trim()) {
      endIso = fromInputLocal(end)
      if (new Date(endIso) <= new Date(startIso)) {
        window.alert(
          'La date et heure de fin doivent être strictement après le début.',
        )
        return
      }
    }
    const reminder =
      reminderOn && reminderValue > 0
        ? { value: reminderValue, unit: reminderUnit }
        : undefined
    const contact = contactFormToContact(contactForm)
    const atts = attachments.length > 0 ? attachments : undefined
    const finalTitle = title.trim() || EVENT_TYPE_LABELS[type]

    let resolvedProjectId = projectId.trim() || undefined
    if (createLinkedProject && !resolvedProjectId) {
      const proj = createProjectPayloadFromEvent({
        title: finalTitle,
        typeLabel: EVENT_TYPE_LABELS[type],
        startIso,
        endIso,
        paid,
        contactForm,
        attachments,
      })
      addProject(proj)
      resolvedProjectId = proj.id
    }

    if (editing) {
      const nextKey = `${startIso}|${JSON.stringify(reminder ?? null)}`
      if (nextKey !== originalKey) clearEventReminderNotified(editing.id)
      updateEvent({
        ...editing,
        title: finalTitle,
        type,
        start: startIso,
        end: endIso,
        projectId: resolvedProjectId,
        paid,
        contact,
        attachments: atts,
        reminder,
        reminderNotified:
          nextKey === originalKey ? editing.reminderNotified : false,
      })
    } else {
      addEvent({
        id: crypto.randomUUID(),
        title: finalTitle,
        type,
        start: startIso,
        end: endIso,
        projectId: resolvedProjectId,
        paid,
        contact,
        attachments: atts,
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
        className="modal-panel event-modal-panel"
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
            placeholder="Ex. Martini — selftape"
          />
        </div>

        <div className="field">
          <label htmlFor="event-type-select">Type d’étape</label>
          <select
            id="event-type-select"
            className="select"
            value={type}
            required={!editing}
            aria-required={!editing}
            onChange={(e) => {
              const v = e.target.value
              const next = v === '' ? '' : (v as EventType)
              setType(next)
              if (next === 'perso') setCreateLinkedProject(false)
            }}
          >
            <option value="" disabled>
              Sélectionner l’étape
            </option>
            {EVENT_TYPE_GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.types.map((t) => (
                  <option key={t} value={t}>
                    {EVENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
            />{' '}
            Projet rémunéré
          </label>
        </div>

        <div className="field">
          <label>Début</label>
          <input
            className="input"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Fin (optionnel)</label>
          <input
            className="input"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              margin: '6px 0 0',
            }}
          >
            Laisse vide pour un créneau ponctuel. Avec une date de fin, l’événement
            apparaît sur chaque jour de la plage (ex. voyage perso du 24 au 26).
          </p>
        </div>

        {editing && projectId ? (
          <div className="field">
            <label htmlFor="event-project-select">Fiche projet</label>
            <select
              id="event-project-select"
              className="select"
              value={projectId}
              onChange={(e) => {
                const v = e.target.value
                setProjectId(v)
                if (!v) setCreateLinkedProject(true)
              }}
            >
              <option value="">— Aucune —</option>
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  checked={createLinkedProject}
                  onChange={(e) => {
                    const on = e.target.checked
                    setCreateLinkedProject(on)
                    if (on) setProjectId('')
                  }}
                />{' '}
                Créer une fiche projet avec ces infos et lier cet événement
              </label>
            </div>
            <div className="field">
              <label htmlFor="event-project-select">
                {createLinkedProject
                  ? 'Fiche existante (désactivée)'
                  : 'Ou lier à une fiche existante'}
              </label>
              <select
                id="event-project-select"
                className="select"
                disabled={createLinkedProject}
                value={createLinkedProject ? '' : projectId}
                onChange={(e) => {
                  const v = e.target.value
                  setProjectId(v)
                  if (v) setCreateLinkedProject(false)
                }}
              >
                <option value="">— Aucune —</option>
                {state.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="event-modal-section">
          <div className="event-modal-section-title">Contact sur cet événement</div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>
              <input
                type="checkbox"
                checked={contactForm.agencyContact}
                onChange={(e) =>
                  setContact({
                    agencyContact: e.target.checked,
                    agencyName: e.target.checked
                      ? contactForm.agencyName
                      : '',
                  })
                }
              />{' '}
              Agence
            </label>
          </div>
          {contactForm.agencyContact && (
            <div className="field event-contact-full" style={{ marginBottom: 12 }}>
              <label>Nom de l’agence</label>
              <input
                className="input"
                value={contactForm.agencyName}
                onChange={(e) => setContact({ agencyName: e.target.value })}
                placeholder="Ex. Agence Céline"
              />
            </div>
          )}
          <div className="event-contact-grid">
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Prénom</label>
              <input
                className="input"
                value={contactForm.firstName}
                onChange={(e) => setContact({ firstName: e.target.value })}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Nom</label>
              <input
                className="input"
                value={contactForm.lastName}
                onChange={(e) => setContact({ lastName: e.target.value })}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Rôle</label>
              <input
                className="input"
                placeholder="Ex. directeur·rice de casting, assistante prod"
                value={contactForm.role}
                onChange={(e) => setContact({ role: e.target.value })}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Email</label>
              <input
                className="input"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContact({ email: e.target.value })}
              />
            </div>
            <div className="field event-contact-full">
              <label>Téléphone</label>
              <input
                className="input"
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContact({ phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <LocalAttachmentsPicker
          label="Documents"
          hint={`Scénario, fiche de préparation selftape, brief… (max. ${MAX_LOCAL_FILE_BYTES / 1024 / 1024} Mo par fichier, stockage local).`}
          attachments={attachments}
          onChange={setAttachments}
        />

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
