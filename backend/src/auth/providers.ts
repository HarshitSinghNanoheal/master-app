import { HttpError } from "../lib/http-error.ts"

export const GOOGLE_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
export const MICROSOFT_GRAPH_URL = "https://graph.microsoft.com/v1.0/me"

export type AuthProvider = "google" | "microsoft"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function fetchUserInfo(url: string, token: string): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new HttpError(502, "Unable to verify access token")
  }

  if (!response.ok) {
    throw new HttpError(401, "Access token invalid")
  }

  return response.json() as Promise<unknown>
}

export async function getGoogleEmail(token: string): Promise<string> {
  const data = await fetchUserInfo(GOOGLE_URL, token)
  if (
    !isRecord(data) ||
    typeof data.email !== "string" ||
    data.email.trim() === "" ||
    data.email_verified === false
  ) {
    throw new HttpError(401, "Access token invalid or email not found")
  }

  return data.email.trim()
}

export async function getMicrosoftEmail(token: string): Promise<string> {
  const data = await fetchUserInfo(MICROSOFT_GRAPH_URL, token)
  const email = isRecord(data)
    ? emailFromMicrosoftProfile(data.mail, data.userPrincipalName)
    : null

  if (!email) {
    throw new HttpError(401, "Access token invalid")
  }

  return email
}

function emailFromMicrosoftProfile(mail: unknown, userPrincipalName: unknown): string | null {
  if (typeof mail === "string" && mail.trim() !== "") {
    return mail.trim()
  }

  if (typeof userPrincipalName === "string" && userPrincipalName.includes("@")) {
    return userPrincipalName.trim()
  }

  return null
}

export async function emailFromAccessToken(provider: AuthProvider, token: string): Promise<string> {
  if (provider === "google") {
    return getGoogleEmail(token)
  }

  return getMicrosoftEmail(token)
}
