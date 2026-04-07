import { useState } from 'react'
import { useAppActions, useAppState } from '../context/AppStateContext'
import { ensureNotificationPermission } from '../lib/notify'
import { requestGoogleAccessToken } from '../lib/googleAuth'

export function SettingsPage() {
  const { state } = useAppState()
  const { updateSettings } = useAppActions()
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ''
  const hour = state.settings.dailyReminderHour
  const hasToken = !!state.settings.googleAccessToken

  const notifPerm =
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'

  const connectGoogle = async () => {
    setErr(null)
    if (!clientId) {
      setErr('Ajoutez VITE_GOOGLE_CLIENT_ID dans .env')
      return
    }
    setBusy(true)
    try {
      const t = await requestGoogleAccessToken(
        clientId,
        state.settings.googleAccessToken,
        true,
      )
      updateSettings({
        googleAccessToken: t.access_token,
        googleTokenExpiry: Date.now() + t.expires_in * 1000,
      })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Connexion Google impossible')
    } finally {
      setBusy(false)
    }
  }

  const disconnectGoogle = () => {
    updateSettings({
      googleAccessToken: undefined,
      googleTokenExpiry: undefined,
    })
  }

  return (
    <div className="page">
      <h1 className="page-title">Paramètres</h1>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1rem', margin: '0 0 12px' }}>Notifications</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
          Les rappels d’événements et la checklist utilisent les notifications du
          navigateur, affichées via le service worker (PWA installée recommandée).
        </p>
        <p style={{ fontSize: '0.85rem' }}>
          État actuel : <strong>{notifPerm}</strong>
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            const p = await ensureNotificationPermission()
            if (p !== 'granted') setErr('Permission refusée')
            else setErr(null)
          }}
        >
          Autoriser les notifications
        </button>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1rem', margin: '0 0 12px' }}>
          Rappel checklist (heure)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
          Si toutes les tâches quotidiennes ne sont pas cochées à cette heure, une
          notification est envoyée : « Tu n’as pas tout checké aujourd’hui ».
        </p>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Heure (0–23)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={23}
            value={hour}
            onChange={(e) => {
              const v = Math.min(23, Math.max(0, Number(e.target.value) || 0))
              updateSettings({ dailyReminderHour: v })
            }}
            style={{ maxWidth: 120 }}
          />
        </div>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1rem', margin: '0 0 12px' }}>
          Google (Gmail)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
          OAuth côté navigateur pour envoyer des mails depuis l’app avec votre
          signature Gmail (scopes : envoi + lecture des paramètres d’envoi).
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
          Si la connexion ne marche que sur le téléphone : Google n’accepte que
          l’URL affichée dans la barre d’adresse. Dans la{' '}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noreferrer"
          >
            console Google Cloud
          </a>
          , ouvrez votre identifiant OAuth (type Web), puis sous{' '}
          <strong>Origines JavaScript autorisées</strong>, ajoutez chaque origine
          utilisée — par ex. <code>http://localhost:5173</code> pour le dev sur
          ordinateur <em>et</em> l’URL HTTPS du site (ex. Vercel) si vous testez
          sur mobile. <code>localhost</code> et <code>127.0.0.1</code> sont deux
          origines différentes.
        </p>
        {hasToken ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--ok)' }}>
              Connecté
            </span>
            <button type="button" className="btn btn-ghost" onClick={disconnectGoogle}>
              Déconnecter
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={connectGoogle}
          >
            {busy ? 'Connexion…' : 'Se connecter avec Google'}
          </button>
        )}
      </section>

      <section className="card">
        <h2 style={{ fontSize: '1rem', margin: '0 0 12px' }}>Clés API</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
          Anthropic et Google sont lues depuis <code>.env</code> (préfixe{' '}
          <code>VITE_</code>). Ne commitez pas vos secrets.
        </p>
      </section>

      {err && (
        <p style={{ color: 'var(--danger)', marginTop: 16 }}>{err}</p>
      )}
    </div>
  )
}
