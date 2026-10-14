import type { Request } from "express"
import { prisma } from "../prisma.ts"
import { HttpError } from "../lib/http-error.ts"
import { emailFromAccessToken, type AuthProvider } from "./providers.ts"
import { tenantSlugFromRequest } from "./tenant.ts"

export type AuthContext = {
  provider: AuthProvider
  accessToken: string
  user: {
    id: number
    email: string
    name: string
    profileUrl: string
  }
  tenant: {
    id: number
    name: string
    slug: string
  }
  privilege: {
    isAdmin: boolean
    applications: string[]
  }
}

export async function authenticate(
  provider: AuthProvider,
  accessToken: string,
  req: Request,
): Promise<AuthContext> {
  const slug = tenantSlugFromRequest(req)
  if (!slug) {
    throw new HttpError(400, "Tenant subdomain is required")
  }

  const email = await emailFromAccessToken(provider, accessToken)

  const tenant = await prisma.tenant.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" } },
    select: { id: true, name: true, slug: true },
  })

  if (!tenant) {
    throw new HttpError(404, "Tenant not found")
  }

  const user = await prisma.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      OR: [
        { tenants: { some: { id: tenant.id } } },
        { privileges: { some: { tenantId: tenant.id } } },
      ],
    },
    select: { id: true, email: true, name: true, profileUrl: true },
  })

  if (!user) {
    throw new HttpError(403, "User is not a member of this tenant")
  }

  const privilege = await prisma.privilege.findUnique({
    where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
    select: { isAdmin: true, applications: true },
  })

  return {
    provider,
    accessToken,
    user,
    tenant,
    privilege: {
      isAdmin: privilege?.isAdmin ?? false,
      applications: privilege?.applications ?? [],
    },
  }
}
