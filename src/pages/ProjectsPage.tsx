import { Link } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { PROJECT_STATUS_LABELS } from '../constants/projectStatus'

export function ProjectsPage() {
  const { state } = useAppState()
  const sorted = [...state.projects].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
  )

  return (
    <div className="page">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h1 className="page-title" style={{ margin: 0 }}>
          Fiches projets
        </h1>
        <Link to="/projets/nouveau" className="btn btn-primary">
          + Nouveau
        </Link>
      </div>

      {sorted.length === 0 && (
        <div className="empty-hint">
          Aucune fiche pour l’instant. Créez-en une pour lier castings, contacts et
          mails.
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {sorted.map((p) => (
          <li key={p.id} className="card" style={{ marginBottom: 10 }}>
            <Link
              to={`/projets/${p.id}`}
              style={{ color: 'inherit', display: 'block' }}
            >
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {p.contact.name}
                {p.contact.agency ? ` · ${p.contact.agency}` : ''}
              </div>
              <span className="chip" style={{ marginTop: 8, display: 'inline-block' }}>
                {PROJECT_STATUS_LABELS[p.status]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
