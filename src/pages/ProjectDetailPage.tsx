import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Project, ProjectStatus } from '../types'
import { PROJECT_STATUS_LABELS } from '../constants/projectStatus'
import { useAppActions, useAppState } from '../context/AppStateContext'
import { MailAssistantModal } from '../components/projects/MailAssistantModal'
import { ProjectAttachmentsSection } from '../components/projects/ProjectAttachmentsSection'

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
        />
      </div>

      <div className="field">
        <label>Contact — nom</label>
        <input
          className="input"
          value={project.contact.name}
          onChange={(e) => setContact('name', e.target.value)}
        />
      </div>
      <div className="field">
        <label>Agence</label>
        <input
          className="input"
          value={project.contact.agency}
          onChange={(e) => setContact('agency', e.target.value)}
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
        />
      </div>

      <ProjectAttachmentsSection
        attachments={project.attachments}
        onChange={(attachments) => setField('attachments', attachments)}
      />

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
