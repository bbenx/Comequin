import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { useAppState } from '../context/AppStateContext'
import { EVENT_TYPE_LABELS } from '../constants/eventTypes'
import { showLocalNotification } from '../lib/notify'
import { shouldFireEventReminderNow } from '../lib/reminderMath'

/** Réinitialisation matinale + rappels événements + rappel checklist (via service worker). */
export function AppEffects() {
  const { state, dispatch } = useAppState()
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    const run = async () => {
      const s = stateRef.current
      const now = new Date()
      const today = format(now, 'yyyy-MM-dd')

      let dailyCheckedIds = s.dailyCheckedIds
      let incompleteNotifiedDate = s.settings.dailyIncompleteNotifiedDate

      if (s.settings.lastMorningResetDate !== today) {
        dispatch({ type: 'RESET_DAILY_FOR_NEW_DAY', payload: today })
        dailyCheckedIds = []
        incompleteNotifiedDate = undefined
      }

      const hour = now.getHours()
      const items = [...s.dailyItems].sort((a, b) => a.order - b.order)

      for (const ev of s.events) {
        if (shouldFireEventReminderNow(ev, now)) {
          await showLocalNotification(`Rappel : ${ev.title}`, {
            body: EVENT_TYPE_LABELS[ev.type],
            tag: `comequin-event-${ev.id}`,
          })
          dispatch({ type: 'MARK_EVENT_REMINDER_NOTIFIED', payload: ev.id })
        }
      }

      if (items.length > 0) {
        const allChecked = items.every((i) => dailyCheckedIds.includes(i.id))
        if (
          !allChecked &&
          hour >= s.settings.dailyReminderHour &&
          incompleteNotifiedDate !== today
        ) {
          await showLocalNotification('Comequin', {
            body: "Tu n'as pas tout checké aujourd'hui",
            tag: 'comequin-daily-incomplete',
          })
          dispatch({
            type: 'UPDATE_SETTINGS',
            payload: { dailyIncompleteNotifiedDate: today },
          })
        }
      }
    }

    run()
    const id = window.setInterval(run, 60_000)
    return () => clearInterval(id)
  }, [dispatch])

  return null
}
