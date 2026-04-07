import { useState } from 'react'
import type { Project } from '../../types'
import {
  daysSinceLastSentEmail,
  generateRelanceEmail,
} from '../../lib/anthropic'
import { fetchGmailSignature, sendGmailWithSignature } from '../../lib/gmail'
import { useAppActions, useAppState } from '../../context/AppStateContext'

type Props = {
  open: boolean
  onClose: () => void
  project: Project
}

export function MailAssistantModal({ open, onClose, project }: Props) {
  const { state } = useAppState()
  const { appendProjectEmail } = useAppActions()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = state.settings.googleAccessToken

  if (!open) return null

  const generate = async () => {
    setError(null)
    setLoading(true)
    try {
      const days = daysSinceLastSentEmail(project)
      const { subject: s, body: b } = await generateRelanceEmail({
        project,
        daysSinceLastContact: days,
      })
      setSubject(s)
      setBody(b)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const send = async () => {
    if (!project.contact.email?.trim()) {
      setError('Email du contact manquant')
      return
    }
    if (!token) {
      setError('Connectez Google dans Paramètres pour envoyer via Gmail.')
      return
    }
    setError(null)
    setSending(true)
    try {
      const sig = await fetchGmailSignature(token)
      await sendGmailWithSignature(
        token,
        project.contact.email.trim(),
        subject.trim(),
        body.trim(),
        sig,
      )
      appendProjectEmail(project.id, {
        id: crypto.randomUUID(),
        sentAt: new Date().toISOString(),
        subject: subject.trim(),
        body: body.trim(),
      })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Envoi impossible')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 560 }}
        role="dialog"
        aria-labelledby="mail-ai-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="mail-ai-title">Mail de relance (IA)</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Fermer
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
          Généré avec Claude (Anthropic). Vérifiez et adaptez le texte avant envoi.
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={generate}
            disabled={loading}
          >
            {loading ? 'Génération…' : 'Générer un mail de relance'}
          </button>
        </div>

        <div className="field">
          <label>Objet</label>
          <input
            className="input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Corps</label>
          <textarea
            className="textarea"
            style={{ minHeight: 220 }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={send}
            disabled={sending || !subject.trim() || !body.trim()}
          >
            {sending ? 'Envoi…' : 'Envoyer via Gmail'}
          </button>
        </div>
      </div>
    </div>
  )
}
