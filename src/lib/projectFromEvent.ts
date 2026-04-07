import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import type { Project, ProjectAttachment } from '../types'

export type EventContactForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  agencyContact: boolean
  agencyName: string
}

function formatFrDateTime(iso: string) {
  try {
    return format(parseISO(iso), "EEEE d MMM yyyy 'à' HH:mm", { locale: fr })
  } catch {
    return iso
  }
}

/** Construit une fiche projet à partir du contexte saisi dans la modale événement. */
export function createProjectPayloadFromEvent(opts: {
  title: string
  typeLabel: string
  startIso: string
  endIso?: string
  paid: boolean
  contactForm: EventContactForm
  attachments: ProjectAttachment[]
}): Project {
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const name = opts.title.trim() || 'Sans titre'

  const fullName = [opts.contactForm.firstName, opts.contactForm.lastName]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ')

  const briefLines: string[] = [
    `Étape : ${opts.typeLabel}`,
    `Début : ${formatFrDateTime(opts.startIso)}`,
  ]
  if (opts.endIso) {
    briefLines.push(`Fin : ${formatFrDateTime(opts.endIso)}`)
  }
  if (opts.paid) briefLines.push('Rémunéré : oui')
  const role = opts.contactForm.role.trim()
  if (role) briefLines.push(`Rôle du contact : ${role}`)
  const phone = opts.contactForm.phone.trim()
  if (phone) briefLines.push(`Téléphone : ${phone}`)
  briefLines.push('', '— Fiche créée depuis un événement du calendrier —')

  const projectAttachments = opts.attachments.map((a) => ({
    ...a,
    id: crypto.randomUUID(),
  }))

  const agency = opts.contactForm.agencyContact
    ? opts.contactForm.agencyName.trim()
    : ''

  return {
    id,
    name,
    contact: {
      name: fullName,
      agency,
      email: opts.contactForm.email.trim(),
    },
    status: 'en_attente',
    brief: briefLines.join('\n'),
    emailHistory: [],
    attachments: projectAttachments,
    createdAt: now,
    updatedAt: now,
  }
}
