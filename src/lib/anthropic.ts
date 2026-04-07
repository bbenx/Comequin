import { PROJECT_STATUS_LABELS } from '../constants/projectStatus'
import type { Project } from '../types'

const MODEL = 'claude-sonnet-4-20250514'

export interface RelanceContext {
  project: Project
  daysSinceLastContact: number | null
}

function buildPrompt({ project, daysSinceLastContact }: RelanceContext): string {
  const statusLabel = PROJECT_STATUS_LABELS[project.status]
  const last =
    daysSinceLastContact == null
      ? 'aucun envoi enregistré depuis l’app'
      : `${daysSinceLastContact} jour(s) depuis le dernier mail enregistré dans l’app`

  return `Tu es un assistant pour un·e comédien·ne ou mannequin professionnel·le en France.

Rédige un email de relance professionnel, poli et concis, en français.

Contexte :
- Projet / casting : ${project.name}
- Contact : ${project.contact.name}${project.contact.agency ? ` (${project.contact.agency})` : ''}
- Email du destinataire : ${project.contact.email}
- Statut du dossier : ${statusLabel}
- Délai : ${last}
${project.brief ? `- Notes / brief : ${project.brief.slice(0, 2000)}` : ''}

Exigences :
- Objet sur une ligne, puis corps de mail (pas de "Objet:" dans le corps)
- Ton adapté au statut (ex. plus insistant si "sans réponse" depuis longtemps)
- Pas de flatterie excessive, rester pro
- Signe avec un placeholder [Ton prénom] à la fin (l’utilisateur remplacera)

Réponds UNIQUEMENT avec ce format exact :
OBJET: ...
CORPS:
...`
}

export async function generateRelanceEmail(
  ctx: RelanceContext,
): Promise<{ subject: string; body: string }> {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key?.trim()) {
    throw new Error(
      'Clé Anthropic manquante. Ajoutez VITE_ANTHROPIC_API_KEY dans .env',
    )
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: buildPrompt(ctx) }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic : ${res.status} ${err}`)
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>
  }
  const text =
    data.content?.find((b) => b.type === 'text')?.text?.trim() ?? ''

  const objMatch = text.match(/OBJET:\s*(.+?)(?:\n|$)/i)
  const bodyMatch = text.match(/CORPS:\s*([\s\S]+)/i)
  const subject = objMatch?.[1]?.trim() || 'Relance — ' + ctx.project.name
  const body = bodyMatch?.[1]?.trim() || text

  return { subject, body }
}

export function daysSinceLastSentEmail(project: Project): number | null {
  if (!project.emailHistory.length) return null
  const last = project.emailHistory[0]?.sentAt
  if (!last) return null
  const d = new Date(last)
  const now = new Date()
  return Math.max(
    0,
    Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)),
  )
}
