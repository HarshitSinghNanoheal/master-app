import { Navigate, Outlet } from "react-router"
import { createBrowserRouter } from "react-router"
import { AppShell } from "@/components/app-shell"
import { QuietStage } from "@/components/quiet-stage"
import { useAuth } from "@/features/auth/auth-context"
import { AppsPage } from "@/pages/apps/page"
import { InvitePage } from "@/pages/invite/page"
import { SignInPage } from "@/pages/sign-in/page"
import { UsersPage } from "@/pages/users/page"

function RequireAuth() {
  const { status } = useAuth()
  if (status === "loading") {
    return <QuietStage label="Checking your session" />
  }
  if (status !== "ready") {
    return <Navigate to="/sign-in" replace />
  }
  return <Outlet />
}

function RequireAdmin() {
  const { current } = useAuth()
  if (!current?.privilege.isAdmin) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

export const router = createBrowserRouter([
  { path: "/sign-in", element: <SignInPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <AppsPage /> },
          {
            element: <RequireAdmin />,
            children: [
              { path: "/invite", element: <InvitePage /> },
              { path: "/users", element: <UsersPage /> },
            ],
          },
        ],
      },
    ],
  },
])
