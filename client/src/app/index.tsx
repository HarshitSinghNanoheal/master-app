import { RouterProvider } from "react-router"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/features/auth/auth-context"
import { router } from "@/routes"

export function App() {
  return (
    <ThemeProvider disableTransitionOnChange={false}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}
