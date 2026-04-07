import type { ProjectStatus } from '../types'

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  refuse: 'Refusé',
  sans_reponse: 'Sans réponse',
}
