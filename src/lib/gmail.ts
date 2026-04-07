function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach((c) => (bin += String.fromCharCode(c)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function utf8SubjectB64(subject: string): string {
  const bytes = new TextEncoder().encode(subject)
  let bin = ''
  bytes.forEach((c) => (bin += String.fromCharCode(c)))
  return btoa(bin)
}

export async function fetchGmailSignature(
  accessToken: string,
): Promise<string> {
  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/settings/sendAs',
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Gmail sendAs : ${res.status} ${t}`)
  }
  const data = (await res.json()) as {
    sendAs?: Array<{ isDefault?: boolean; signature?: string }>
  }
  const list = data.sendAs ?? []
  const def = list.find((s) => s.isDefault) ?? list[0]
  return def?.signature?.trim() ?? ''
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function sendGmailWithSignature(
  accessToken: string,
  to: string,
  subject: string,
  bodyPlain: string,
  signatureHtml: string,
): Promise<void> {
  const sigPlain = signatureHtml
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim()

  const fullPlain = [bodyPlain.trim(), sigPlain ? `\n\n--\n${sigPlain}` : '']
    .filter(Boolean)
    .join('')

  const boundary = 'comequin_' + Math.random().toString(36).slice(2)
  const htmlBody = `<div>${escapeHtml(bodyPlain).replace(/\n/g, '<br/>')}</div>`
  const htmlSig = signatureHtml
    ? `<div style="margin-top:1em;border-top:1px solid #ccc;padding-top:1em">${signatureHtml}</div>`
    : ''

  const mime = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${utf8SubjectB64(subject)}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    utf8ToBase64Url(fullPlain),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    utf8ToBase64Url(
      `<!DOCTYPE html><html><body>${htmlBody}${htmlSig}</body></html>`,
    ),
    '',
    `--${boundary}--`,
  ].join('\r\n')

  const raw = utf8ToBase64Url(mime)

  const sendRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    },
  )

  if (!sendRes.ok) {
    const t = await sendRes.text()
    throw new Error(`Gmail envoi : ${sendRes.status} ${t}`)
  }
}
