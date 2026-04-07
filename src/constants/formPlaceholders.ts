import { MAX_LOCAL_FILE_BYTES } from '../lib/localFiles'

/** Titre événement = nom projet / casting */
export const PLACEHOLDER_PROJECT_OR_EVENT_TITLE = 'Ex. Martini — selftape'

export const PLACEHOLDER_AGENCY_NAME = 'Ex. Agence Céline'

export const PLACEHOLDER_CONTACT_ROLE = 'Ex. directeur·rice de casting, assistante prod'

/** Champ unique sur la fiche projet (équivalent prénom + nom sur l’événement) */
export const PLACEHOLDER_PROJECT_CONTACT_NAME = 'Prénom et nom du contact'

/** Même esprit que les infos portées sur l’événement (étape, créneau, contact…) */
export const PLACEHOLDER_PROJECT_BRIEF =
  'Étape, dates, rémunération, rôle du contact, téléphone…'

/** Texte d’aide « Documents » partagé événement / fiche projet */
export const DOCUMENTS_FIELD_HINT = `Scénario, fiche de préparation selftape, brief… (max. ${MAX_LOCAL_FILE_BYTES / 1024 / 1024} Mo par fichier, stockage local).`
