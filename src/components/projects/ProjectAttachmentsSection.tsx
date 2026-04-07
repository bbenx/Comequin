import { useRef } from 'react'
import type { ProjectAttachment } from '../../types'

const MAX_FILE_BYTES = 5 * 1024 * 1024

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

type Props = {
  attachments: ProjectAttachment[]
  onChange: (next: ProjectAttachment[]) => void
}

export function ProjectAttachmentsSection({ attachments, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const pickFiles = () => inputRef.current?.click()

  const onFilesSelected = async (list: FileList | null) => {
    if (!list?.length) return
    const next = [...attachments]
    for (const file of Array.from(list)) {
      if (file.size > MAX_FILE_BYTES) {
        window.alert(
          `« ${file.name} » dépasse ${MAX_FILE_BYTES / 1024 / 1024} Mo (stockage local limité).`,
        )
        continue
      }
      try {
        const dataUrl = await readFileAsDataUrl(file)
        next.push({
          id: crypto.randomUUID(),
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          dataUrl,
          addedAt: new Date().toISOString(),
        })
      } catch {
        window.alert(`Impossible de lire « ${file.name} ».`)
      }
    }
    onChange(next)
    if (inputRef.current) inputRef.current.value = ''
  }

  const remove = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id))
  }

  const isImage = (mime: string) => mime.startsWith('image/')

  return (
    <div className="field">
      <label>Fichiers et photos</label>
      <p
        style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          margin: '0 0 10px',
        }}
      >
        Ajoutez des visuels ou documents liés au casting (stockés sur cet
        appareil, max. {MAX_FILE_BYTES / 1024 / 1024} Mo par fichier).
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.heic,.heif"
        style={{ display: 'none' }}
        onChange={(e) => onFilesSelected(e.target.files)}
      />
      <button type="button" className="btn btn-ghost" onClick={pickFiles}>
        + Ajouter des fichiers ou photos
      </button>

      {attachments.length > 0 && (
        <ul className="project-attachments-list">
          {attachments.map((a) => (
            <li key={a.id} className="project-attachment-card">
              {isImage(a.mimeType) ? (
                <a
                  href={a.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="project-attachment-thumb"
                >
                  <img src={a.dataUrl} alt="" />
                </a>
              ) : (
                <a
                  href={a.dataUrl}
                  download={a.name}
                  className="project-attachment-file"
                >
                  <span className="project-attachment-icon" aria-hidden>
                    📎
                  </span>
                  <span className="project-attachment-name">{a.name}</span>
                </a>
              )}
              <div className="project-attachment-meta">
                <span className="project-attachment-title" title={a.name}>
                  {a.name}
                </span>
                <div className="project-attachment-actions">
                  <a
                    href={a.dataUrl}
                    download={a.name}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    Télécharger
                  </a>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    onClick={() => remove(a.id)}
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
