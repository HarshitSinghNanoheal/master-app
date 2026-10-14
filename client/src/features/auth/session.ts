export type AuthProvider = "google" | "microsoft"

export type LocalSession = {
  access_token: string
  provider: AuthProvider
}

const LOCAL_SESSION_KEY = "local_session"

export function apiUrl(): string {
  const configured = import.meta.env.VITE_API_URL
  return typeof configured === "string" && configured !== "" ? configured : "http://localhost:3000"
}

export function readLocalSession(): LocalSession | null {
  const raw = localStorage.getItem(LOCAL_SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") {
      return null
    }

    const session = parsed as Partial<LocalSession>
    if (
      typeof session.access_token !== "string" ||
      session.access_token === "" ||
      (session.provider !== "google" && session.provider !== "microsoft")
    ) {
      return null
    }

    return {
      access_token: session.access_token,
      provider: session.provider,
    }
  } catch {
    return null
  }
}

export function writeLocalSession(session: LocalSession) {
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session))
}

export function clearLocalSession() {
  localStorage.removeItem(LOCAL_SESSION_KEY)
}

export function authHeaders(): HeadersInit {
  const session = readLocalSession()
  if (!session) {
    return {}
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "X-Auth-Provider": session.provider,
  }
}

export async function signIn(provider: AuthProvider, accessToken: string): Promise<LocalSession> {
  const response = await fetch(`${apiUrl()}/auth/${provider}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken }),
  })

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message
        : "Sign in failed"
    throw new Error(message)
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("access_token" in body) ||
    typeof body.access_token !== "string"
  ) {
    throw new Error("Sign in failed")
  }

  const session: LocalSession = {
    access_token: body.access_token,
    provider,
  }
  writeLocalSession(session)
  return session
}
