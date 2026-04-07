const GIS_SRC = 'https://accounts.google.com/gsi/client'

export const GMAIL_SCOPES =
  'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.settings.basic'

let loadPromise: Promise<void> | null = null

export function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (loadPromise) return loadPromise
  loadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = GIS_SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Impossible de charger Google Identity'))
    document.head.appendChild(s)
  })
  return loadPromise
}

export type TokenResult = { access_token: string; expires_in: number }

export async function requestGoogleAccessToken(
  clientId: string,
  existingToken?: string,
  forcePrompt = false,
): Promise<TokenResult> {
  await loadGoogleScript()
  const g = window.google
  if (!g?.accounts?.oauth2) {
    throw new Error('Google Identity non disponible')
  }

  return new Promise((resolve, reject) => {
    const client = g.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GMAIL_SCOPES,
      callback: (resp: { access_token?: string; expires_in?: number; error?: string }) => {
        if (resp.error) {
          reject(new Error(resp.error))
          return
        }
        if (!resp.access_token || resp.expires_in == null) {
          reject(new Error('Token Google invalide'))
          return
        }
        resolve({
          access_token: resp.access_token,
          expires_in: resp.expires_in,
        })
      },
    })
    client.requestAccessToken({
      prompt: forcePrompt ? 'consent' : existingToken ? '' : 'consent',
    })
  })
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string
            scope: string
            callback: (r: {
              access_token?: string
              expires_in?: number
              error?: string
            }) => void
          }) => { requestAccessToken: (o?: { prompt?: string }) => void }
        }
      }
    }
  }
}
