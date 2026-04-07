import { useState } from 'react'
import { useAppActions, useAppState } from '../context/AppStateContext'

export function DailyPage() {
  const { state } = useAppState()
  const { toggleDailyCheck, addDailyItem, deleteDailyItem, updateDailyItem } =
    useAppActions()
  const [newLabel, setNewLabel] = useState('')
  const [editList, setEditList] = useState(false)

  const items = [...state.dailyItems].sort((a, b) => a.order - b.order)

  const add = () => {
    const t = newLabel.trim()
    if (!t) return
    const maxO = items.reduce((m, i) => Math.max(m, i.order), -1)
    addDailyItem({
      id: crypto.randomUUID(),
      label: t,
      order: maxO + 1,
    })
    setNewLabel('')
  }

  return (
    <div className="page">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 4,
        }}
      >
        <h1 className="page-title" style={{ margin: 0 }}>
          To-do quotidienne
        </h1>
        <button
          type="button"
          className="btn btn-ghost daily-edit-btn"
          onClick={() => {
            setEditList((v) => {
              if (v) setNewLabel('')
              return !v
            })
          }}
          aria-label={editList ? 'Terminer la modification' : 'Modifier la liste'}
          title={editList ? 'Terminer' : 'Modifier la liste'}
        >
          {editList ? 'Terminer' : '✏️'}
        </button>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 0 }}>
        Les cases se réinitialisent chaque matin. Rappel push si tout n’est pas coché
        à l’heure définie dans Paramètres (via le service worker).
      </p>

      <div className="card" style={{ marginBottom: editList ? 16 : 0 }}>
        {items.length === 0 && (
          <div className="empty-hint" style={{ padding: 16 }}>
            {editList
              ? 'Ajoutez des sites ou tâches à cocher chaque jour.'
              : 'Aucune tâche pour l’instant. Touchez ✏️ pour modifier la liste.'}
          </div>
        )}
        {items.map((item) => {
          const checked = state.dailyCheckedIds.includes(item.id)
          return (
            <div key={item.id} className="list-item">
              <input
                type="checkbox"
                className="check-big"
                checked={checked}
                onChange={() => toggleDailyCheck(item.id)}
                aria-label={item.label}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                {editList ? (
                  <input
                    className="input"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      fontWeight: 600,
                      textDecoration: checked ? 'line-through' : 'none',
                      opacity: checked ? 0.65 : 1,
                    }}
                    value={item.label}
                    onChange={(e) =>
                      updateDailyItem({ ...item, label: e.target.value })
                    }
                  />
                ) : (
                  <span
                    style={{
                      display: 'block',
                      fontWeight: 600,
                      textDecoration: checked ? 'line-through' : 'none',
                      opacity: checked ? 0.65 : 1,
                      paddingTop: 2,
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </div>
              {editList && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  onClick={() => deleteDailyItem(item.id)}
                >
                  Retirer
                </button>
              )}
            </div>
          )
        })}
      </div>

      {editList && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="Nouvelle tâche (ex. Casting.fr)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <button type="button" className="btn btn-primary" onClick={add}>
            Ajouter
          </button>
        </div>
      )}
    </div>
  )
}
