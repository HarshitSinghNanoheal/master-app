import { NavLink, Outlet, useNavigate } from "react-router"
import { AccountMenu } from "@/components/account-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/features/auth/auth-context"

export function AppShell() {
  const { current, signOut } = useAuth()
  const navigate = useNavigate()

  if (!current) {
    return null
  }

  const initial = current.tenant.name.trim().charAt(0).toUpperCase() || "M"

  return (
    <div className="shell">
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <header className="toolbar">
        <div className="toolbar-inner">
          <div className="brand">
            <span className="tenant-mark" aria-hidden="true">
              {initial}
            </span>
            <p className="brand-name">{current.tenant.name}</p>
          </div>
          {current.privilege.isAdmin ? (
            <nav className="segmented toolbar-nav" aria-label="Sections">
              <NavLink to="/" end>
                Applications
              </NavLink>
              <NavLink to="/users">People</NavLink>
              <NavLink to="/invite">Invite</NavLink>
            </nav>
          ) : null}
          <div className="toolbar-end">
            <ThemeToggle />
            <AccountMenu
              name={current.user.name}
              email={current.user.email}
              profileUrl={current.user.profileUrl}
              onSignOut={() => {
                signOut()
                navigate("/sign-in")
              }}
            />
          </div>
        </div>
      </header>
      <main id="content" className="shell-main">
        <Outlet />
      </main>
    </div>
  )
}
