import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Project, ProjectNote, ProjectStatus } from '../types'
import { PROJECT_STATUS_LABELS } from '../constants/projectStatus'
import { useAppActions, useAppState } from '../context/AppStateContext'
import { MailAssistantModal } from '../components/projects/MailAssistantModal'
import { ProjectAttachmentsSection } from '../components/projects/ProjectAttachmentsSection'
import {
  PLACEHOLDER_AGENCY_NAME,
  PLACEHOLDER_PROJECT_BRIEF,
  PLACEHOLDER_PROJECT_CONTACT_NAME,
  PLACEHOLDER_PROJECT_OR_EVENT_TITLE,
} from '../constants/formPlaceholders'

function emptyProject(id: string): Project {
  const now = new Date().toISOString()
  return {
    id,
    name: '',
    contact: { name: '', agency: '', email: '' },
    status: 'en_attente',
    brief: '',
    emailHistory: [],
    attachments: [],
    notes: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  return <ProjectDetailInner key={id} id={id} />
}

function ProjectDetailInner({ id }: { id: string }) {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { addProject, updateProject, deleteProject } = useAppActions()
  const isNew = id === 'nouveau'
  const existing = !isNew ? state.projects.find((p) => p.id === id) : undefined

  const [form, setForm] = useState<Project | null>(() => {
    if (isNew) return emptyProject(crypto.randomUUID())
    const ex = state.projects.find((p) => p.id === id)
    return ex ? { ...ex } : null
  })
  const [mailOpen, setMailOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')

  if (!isNew && (!existing || !form)) {
    return (
      <div className="page">
        <p>Fiche introuvable.</p>
        <Link to="/projets">Retour</Link>
      </div>
    )
  }

  if (!form) return null

  const project = form

  const setField = <K extends keyof Project>(key: K, v: Project[K]) => {
    setForm((f) => (f ? { ...f, [key]: v } : f))
  }

  const setContact = (key: keyof Project['contact'], v: string) => {
    setForm((f) => (f ? { ...f, contact: { ...f.contact, [key]: v } } : f))
  }

  const save = () => {
    const now = new Date().toISOString()
    const next = { ...project, updatedAt: now }
    if (isNew) {
      addProject({ ...next, createdAt: now })
    } else {
      updateProject(next)
    }
    navigate('/projets')
  }

  const remove = () => {
    if (confirm('Supprimer cette fiche ? Les événements liés seront détachés.')) {
      deleteProject(project.id)
      navigate('/projets')
    }
  }

  const addNote = () => {
    const text = noteDraft.trim()
    if (!text) return
    const n: ProjectNote = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
    }
    setField('notes', [n, ...project.notes])
    setNoteDraft('')
  }

  const removeNote = (noteId: string) => {
    setField(
      'notes',
      project.notes.filter((x) => x.id !== noteId),
    )
  }

  const notesNewestFirst = [...project.notes].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  )

  return (
    <div className="page">
      <Link
        to="/projets"
        style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}
      >
        ← Projets
      </Link>
      <h1 className="page-title">
        {isNew ? 'Nouvelle fiche' : project.name || 'Fiche projet'}
      </h1>

      <div className="field">
        <label>Nom du projet / casting</label>
        <input
          className="input"
          value={project.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder={PLACEHOLDER_PROJECT_OR_EVENT_TITLE}
        />
      </div>

      <div className="field">
        <label>Contact — nom</label>
        <input
          className="input"
          value={project.contact.name}
          onChange={(e) => setContact('name', e.target.value)}
          placeholder={PLACEHOLDER_PROJECT_CONTACT_NAME}
        />
      </div>
      <div className="field">
        <label>Agence</label>
        <input
          className="input"
          value={project.contact.agency}
          onChange={(e) => setContact('agency', e.target.value)}
          placeholder={PLACEHOLDER_AGENCY_NAME}
        />
      </div>
      <div className="field">
        <label>Email</label>
        <input
          className="input"
          type="email"
          value={project.contact.email}
          onChange={(e) => setContact('email', e.target.value)}
        />
      </div>

      <div className="field">
        <label>Statut</label>
        <select
          className="select"
          value={project.status}
          onChange={(e) =>
            setField('status', e.target.value as ProjectStatus)
          }
        >
          {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((k) => (
            <option key={k} value={k}>
              {PROJECT_STATUS_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Brief / notes</label>
        <textarea
          className="textarea"
          value={project.brief}
          onChange={(e) => setField('brief', e.target.value)}
          placeholder={PLACEHOLDER_PROJECT_BRIEF}
        />
      </div>

      <ProjectAttachmentsSection
        attachments={project.attachments}
        onChange={(attachments) => setField('attachments', attachments)}
      />

      <section className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1rem', margin: '0 0 12px' }}>Notes</h2>
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            margin: '0 0 12px',
          }}
        >
          Ajoute des notes datées (suivi, retours agence, rappels). Elles sont
          enregistrées avec la fiche au moment où tu cliques sur Enregistrer.
        </p>
        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="project-note-draft">Nouvelle note</label>
          <textarea
            id="project-note-draft"
            className="textarea"
            rows={3}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Ex. Relance envoyée — en attente de réponse pour le 12."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                addNote()
              }
            }}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <button type="button" className="btn btn-ghost" onClick={addNote}>
            + Ajouter la note
          </button>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Raccourci : ⌘/Ctrl + Entrée
          </span>
        </div>
        {notesNewestFirst.length > 0 && (
          <ul
            className="project-notes-list"
            style={{ listStyle: 'none', padding: 0, margin: '16px 0 0' }}
          >
            {notesNewestFirst.map((n) => (
              <li
                key={n.id}
                className="card"
                style={{
                  marginBottom: 8,
                  padding: '10px 12px',
                  background: 'var(--bg-elevated)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <time
                    dateTime={n.createdAt}
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  >
                    {new Date(n.createdAt).toLocaleString('fr-FR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </time>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                    onClick={() => removeNote(n.id)}
                  >
                    Retirer
                  </button>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.4,
                  }}
                >
                  {n.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button type="button" className="btn btn-primary" onClick={save}>
          Enregistrer
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setMailOpen(true)}
        >
          Générer un mail de relance
        </button>
        {!isNew && (
          <button type="button" className="btn btn-danger" onClick={remove}>
            Supprimer
          </button>
        )}
      </div>

      {!isNew && project.emailHistory.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: 8 }}>
            Historique des mails (depuis l’app)
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {project.emailHistory.map((m) => (
              <li key={m.id} className="card" style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(m.sentAt).toLocaleString('fr-FR')}
                </div>
                <div style={{ fontWeight: 600 }}>{m.subject}</div>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.8rem',
                    margin: '8px 0 0',
                    fontFamily: 'inherit',
                    color: 'var(--text-muted)',
                  }}
                >
                  {m.body}
                </pre>
              </li>
            ))}
          </ul>
        </section>
      )}

      <MailAssistantModal
        open={mailOpen}
        onClose={() => setMailOpen(false)}
        project={project}
      />
    </div>
  )
}
