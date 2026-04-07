import type { ReactNode } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import type { CalendarEvent, EventContact } from '../../types'
import { EVENT_TYPE_LABELS, colorsForEventType } from '../../constants/eventTypes'
import { useAppState } from '../../context/AppStateContext'

type Props = {
  event: CalendarEvent
  onClose: () => void
  onEdit: () => void
}

function formatDateTimeLong(iso: string) {
  try {
    return format(parseISO(iso), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })
  } catch {
    return iso
  }
}

function contactLines(c: EventContact): string[] {
  const out: string[] = []
  if (c.agencyContact && c.agencyName?.trim()) {
    out.push(`Agence : ${c.agencyName.trim()}`)
  }
  const name = [c.firstName, c.lastName].map((s) => s?.trim()).filter(Boolean).join(' ')
  if (name) out.push(`Nom : ${name}`)
  if (c.role?.trim()) out.push(`Rôle : ${c.role.trim()}`)
  if (c.email?.trim()) out.push(`Email : ${c.email.trim()}`)
  if (c.phone?.trim()) out.push(`Téléphone : ${c.phone.trim()}`)
  return out
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="event-detail-row">
      <dt className="event-detail-label">{label}</dt>
      <dd className="event-detail-value">{children}</dd>
    </div>
  )
}

export function EventDetailModal({ event: ev, onClose, onEdit }: Props) {
  const { state } = useAppState()
  const project = ev.projectId
    ? state.projects.find((p) => p.id === ev.projectId)
    : undefined
  const colors = colorsForEventType(ev.type)
  const contact = ev.contact ? contactLines(ev.contact) : []

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel event-modal-panel"
        role="dialog"
        aria-labelledby="event-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="event-detail-title" style={{ margin: 0, fontSize: '1.05rem' }}>
            {ev.title}
          </h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Fermer
          </button>
        </div>

        <dl className="event-detail-list">
          <DetailRow label="Type d’étape">
            <span
              className="event-detail-type-pill"
              style={{
                background: colors.bg,
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              {EVENT_TYPE_LABELS[ev.type]}
            </span>
            {ev.paid ? (
              <span style={{ marginLeft: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                · Rémunéré
              </span>
            ) : null}
          </DetailRow>
          <DetailRow label="Début">{formatDateTimeLong(ev.start)}</DetailRow>
          {ev.end ? (
            <DetailRow label="Fin">{formatDateTimeLong(ev.end)}</DetailRow>
          ) : null}
          {project ? (
            <DetailRow label="Fiche projet">{project.name}</DetailRow>
          ) : null}
          {contact.length > 0 ? (
            <DetailRow label="Contact">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {contact.map((line) => (
                  <li key={line} style={{ marginBottom: 4 }}>
                    {line}
                  </li>
                ))}
              </ul>
            </DetailRow>
          ) : null}
          {ev.attachments && ev.attachments.length > 0 ? (
            <DetailRow label="Documents">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {ev.attachments.map((a) => (
                  <li key={a.id}>{a.name}</li>
                ))}
              </ul>
            </DetailRow>
          ) : null}
          {ev.reminder ? (
            <DetailRow label="Rappel">
              {ev.reminder.value}{' '}
              {ev.reminder.unit === 'days' ? 'jour(s)' : 'heure(s)'} avant
            </DetailRow>
          ) : null}
        </dl>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          <button type="button" className="btn btn-primary" onClick={onEdit}>
            Modifier
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
