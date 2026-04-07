import type { ProjectAttachment } from '../../types'
import { LocalAttachmentsPicker } from '../shared/LocalAttachmentsPicker'
import { MAX_LOCAL_FILE_BYTES } from '../../lib/localFiles'

type Props = {
  attachments: ProjectAttachment[]
  onChange: (next: ProjectAttachment[]) => void
}

export function ProjectAttachmentsSection({ attachments, onChange }: Props) {
  return (
    <LocalAttachmentsPicker
      label="Fichiers et photos"
      hint={`Ajoutez des visuels ou documents liés au casting (stockés sur cet appareil, max. ${MAX_LOCAL_FILE_BYTES / 1024 / 1024} Mo par fichier).`}
      attachments={attachments}
      onChange={onChange}
    />
  )
}
