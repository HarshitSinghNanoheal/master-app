import { NavLink, Outlet, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/auth-context"

export function AppShell() {
  const { current, signOut } = useAuth()
  const navigate = useNavigate()

  if (!current) {
    return null
  }

  return (
    <div className="min-h-svh">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <p className="font-medium">{current.tenant.name}</p>
          <nav className="flex items-center gap-3 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "font-medium" : "text-muted-foreground")}
            >
              Applications
            </NavLink>
            {current.privilege.isAdmin ? (
              <>
                <NavLink
                  to="/invite"
                  className={({ isActive }) => (isActive ? "font-medium" : "text-muted-foreground")}
                >
                  Invite
                </NavLink>
                <NavLink
                  to="/users"
                  className={({ isActive }) => (isActive ? "font-medium" : "text-muted-foreground")}
                >
                  Users
                </NavLink>
              </>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{current.user.email}</p>
          <Button
            variant="ghost"
            onClick={() => {
              signOut()
              navigate("/sign-in")
            }}
          >
            Log out
          </Button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <Outlet />
      </main>
    </div>
  )
}
