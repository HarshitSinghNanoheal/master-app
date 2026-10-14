import type { Request } from "express"

const LOCAL_DOMAIN = "localhost"

function appDomain(): string {
  return (process.env.APP_DOMAIN ?? "master-app-url.com").toLowerCase()
}

export function tenantSlugFromHostname(hostname: string): string | null {
  const host = hostname.toLowerCase().replace(/\.$/, "")

  for (const base of [appDomain(), LOCAL_DOMAIN]) {
    if (host === base) {
      return null
    }

    const suffix = `.${base}`
    if (!host.endsWith(suffix)) {
      continue
    }

    const slug = host.slice(0, -suffix.length)
    if (!slug || slug.includes(".")) {
      return null
    }

    return slug
  }

  return null
}

export function tenantSlugFromRequest(req: Request): string | null {
  const origin = req.header("origin")
  if (origin) {
    try {
      const slug = tenantSlugFromHostname(new URL(origin).hostname)
      if (slug) {
        return slug
      }
    } catch {
      // Ignore an unparseable Origin and fall back to Host.
    }
  }

  const host = req.header("host")
  if (!host) {
    return null
  }

  return tenantSlugFromHostname(host.split(":")[0] ?? "")
}

export function isAllowedOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname.toLowerCase()
    return hostname === LOCAL_DOMAIN || tenantSlugFromHostname(hostname) !== null
  } catch {
    return false
  }
}
