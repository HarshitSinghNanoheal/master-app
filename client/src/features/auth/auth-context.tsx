import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { fetchCurrentUser, type CurrentUser } from "@/features/auth/api"
import { clearLocalSession, readLocalSession } from "@/features/auth/session"

type AuthStatus = "loading" | "anonymous" | "ready"

type AuthContextValue = {
  status: AuthStatus
  current: CurrentUser | null
  refresh: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [current, setCurrent] = useState<CurrentUser | null>(null)

  const refresh = useCallback(async () => {
    if (!readLocalSession()) {
      setCurrent(null)
      setStatus("anonymous")
      return
    }

    setStatus("loading")
    try {
      const next = await fetchCurrentUser()
      setCurrent(next)
      setStatus("ready")
    } catch (error) {
      clearLocalSession()
      setCurrent(null)
      setStatus("anonymous")
      throw error
    }
  }, [])

  const signOut = useCallback(() => {
    clearLocalSession()
    setCurrent(null)
    setStatus("anonymous")
  }, [])

  useEffect(() => {
    void refresh().catch(() => {
      // An invalid stored session is cleared inside refresh.
    })
  }, [refresh])

  const value = useMemo(
    () => ({ status, current, refresh, signOut }),
    [status, current, refresh, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return value
}
