import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAppActions, useAppState } from '../context/AppStateContext'
import { EventModal } from './calendar/EventModal'

export function FloatingCapture() {
  const { state } = useAppState()
  const { addNote, deleteNote, addProject } = useAppActions()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [eventOpen, setEventOpen] = useState(false)
  const [eventKey, setEventKey] = useState(0)
  const [eventTitle, setEventTitle] = useState<string | undefined>()
  const [convertNoteId, setConvertNoteId] = useState<string | null>(null)

  const submitNote = () => {
    const t = draft.trim()
    if (!t) return
    addNote({
      id: crypto.randomUUID(),
      text: t,
      createdAt: new Date().toISOString(),
    })
    setDraft('')
  }

  const firstLine = (text: string) => {
    const line = text.split('\n')[0]?.trim() || 'Sans titre'
    return line.slice(0, 120)
  }

  const toProject = (noteId: string, text: string) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    addProject({
      id,
      name: firstLine(text),
      contact: { name: '', agency: '', email: '' },
      status: 'en_attente',
      brief: text,
      emailHistory: [],
      createdAt: now,
      updatedAt: now,
    })
    deleteNote(noteId)
    setOpen(false)
    navigate(`/projets/${id}`)
  }

  const toEvent = (noteId: string, text: string) => {
    setEventKey((k) => k + 1)
    setConvertNoteId(noteId)
    setEventTitle(firstLine(text))
    setEventOpen(true)
  }

  const closeEventModal = () => {
    setEventOpen(false)
    setConvertNoteId(null)
    setEventTitle(undefined)
  }

  return (
    <>
      <button
        type="button"
        className="fab"
        aria-label="Capture rapide"
        onClick={() => setOpen(true)}
      >
        +
      </button>

      {open && (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="modal-panel"
            style={{ maxWidth: 520 }}
            role="dialog"
            aria-labelledby="inbox-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2 id="inbox-title">Inbox</h2>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Fermer
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Saisie rapide — à traiter plus tard. Convertir en événement ou fiche projet.
            </p>

            <div className="field">
              <label>Nouvelle note</label>
              <textarea
                className="textarea"
                style={{ minHeight: 72 }}
                placeholder="Idée, rappel, lien…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-primary" onClick={submitNote}>
              Empiler dans l’inbox
            </button>

            <h3 style={{ fontSize: '0.95rem', margin: '24px 0 8px' }}>À traiter</h3>
            {state.quickNotes.length === 0 && (
              <div className="empty-hint" style={{ padding: 16 }}>
                Rien pour le moment.
              </div>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {state.quickNotes.map((n) => (
                <li
                  key={n.id}
                  className="card"
                  style={{ marginBottom: 10, padding: '12px 14px' }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm')}
                  </div>
                  <p style={{ margin: '6px 0 10px', whiteSpace: 'pre-wrap' }}>{n.text}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      onClick={() => toEvent(n.id, n.text)}
                    >
                      → Événement
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      onClick={() => toProject(n.id, n.text)}
                    >
                      → Fiche projet
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      onClick={() => deleteNote(n.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {eventOpen && (
        <EventModal
          key={eventKey}
          onClose={closeEventModal}
          initialDate={new Date()}
          initialTitle={eventTitle}
          editing={null}
          onSaved={() => {
            if (convertNoteId) deleteNote(convertNoteId)
            setConvertNoteId(null)
          }}
        />
      )}
    </>
  )
}
