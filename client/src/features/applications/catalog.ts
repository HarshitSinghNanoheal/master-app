export const RESOLV_URL = "http://localhost:5174"
export const VAPT_URL = "https://okonomiyaki.haya.cloud/"

export const APPLICATIONS = [
  { id: "RESOLV", name: "Resolv" },
  { id: "USTOR", name: "Ustor" },
  { id: "VAPT", name: "VAPT" },
] as const

export type ApplicationId = (typeof APPLICATIONS)[number]["id"]

const APPLICATION_URLS: Partial<Record<ApplicationId, string>> = {
  RESOLV: RESOLV_URL,
  VAPT: VAPT_URL,
}

export function isApplicationId(value: string): value is ApplicationId {
  return APPLICATIONS.some((application) => application.id === value)
}

export function applicationOpenUrl(
  id: ApplicationId,
  session: { access_token: string; provider: string } | null,
): string | null {
  const base = APPLICATION_URLS[id]
  if (!base || !session) {
    return null
  }

  const url = new URL(base)
  url.searchParams.set("token", session.access_token)
  url.searchParams.set("provider", session.provider)
  return url.toString()
}
