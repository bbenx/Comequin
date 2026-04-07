import type { ProjectAttachment } from '../../types'
import { LocalAttachmentsPicker } from '../shared/LocalAttachmentsPicker'
import { DOCUMENTS_FIELD_HINT } from '../../constants/formPlaceholders'

type Props = {
  attachments: ProjectAttachment[]
  onChange: (next: ProjectAttachment[]) => void
}

export function ProjectAttachmentsSection({ attachments, onChange }: Props) {
  return (
    <LocalAttachmentsPicker
      label="Fichiers et photos"
      hint={DOCUMENTS_FIELD_HINT}
      attachments={attachments}
      onChange={onChange}
    />
  )
}
