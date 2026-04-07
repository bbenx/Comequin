import { NavLink, Outlet } from 'react-router-dom'
import { FloatingCapture } from './FloatingCapture'
import { AppEffects } from './AppEffects'

const links = [
  { to: '/calendrier', label: 'Calendrier', icon: '📅' },
  { to: '/projets', label: 'Projets', icon: '📁' },
  { to: '/quotidien', label: 'Quotidien', icon: '✅' },
  { to: '/parametres', label: 'Réglages', icon: '⚙️' },
]

export function Layout() {
  return (
    <>
      <AppEffects />
      <div className="app-shell">
        <Outlet />
      </div>
      <FloatingCapture />
      <nav className="bottom-nav" aria-label="Navigation principale">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <span className="nav-icon" aria-hidden>
              {icon}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
