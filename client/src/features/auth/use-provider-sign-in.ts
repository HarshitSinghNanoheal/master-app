import { useCallback, useState } from "react"
import { useNavigate } from "react-router"
import { loginWithLamauth } from "llamauth"
import { LAMAUTH_KEY, LAMAUTH_TOOLS } from "@/features/auth/config"
import { useAuth } from "@/features/auth/auth-context"
import { signIn, type AuthProvider } from "@/features/auth/session"

type LamauthToken = {
  access_token?: unknown
}

function requireAccessToken(token: LamauthToken): string {
  if (typeof token.access_token !== "string" || token.access_token === "") {
    throw new Error("Sign in did not return an access token")
  }

  return token.access_token
}

export function useProviderSignIn() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [loading, setLoading] = useState<AuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const signInWith = useCallback(
    (provider: AuthProvider) => {
      if (loading) return

      setError(null)
      loginWithLamauth({
        key: LAMAUTH_KEY,
        uuid: LAMAUTH_TOOLS[provider],
        callback: async (token: LamauthToken) => {
          try {
            await signIn(provider, requireAccessToken(token))
            await refresh()
            navigate("/")
          } catch (signInError) {
            setError(signInError instanceof Error ? signInError.message : "Sign in failed")
          } finally {
            setLoading(null)
          }
        },
        startCallback: () => {
          setLoading(provider)
          window.setTimeout(() => setLoading(null), 10_000)
        },
      })
    },
    [loading, navigate, refresh],
  )

  return { loading, error, signInWith }
}
