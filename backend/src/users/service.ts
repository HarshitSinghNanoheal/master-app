import type { Application } from "../../generated/prisma/enums.ts"
import { HttpError } from "../lib/http-error.ts"
import { sendApplicationAddedMail } from "../mail/sendMail.ts"
import { prisma } from "../prisma.ts"

export type TenantUser = {
  id: number
  email: string
  name: string
  profileUrl: string
  isAdmin: boolean
  applications: Application[]
}

function toTenantUser(user: {
  id: number
  email: string
  name: string
  profileUrl: string
  privileges: { isAdmin: boolean; applications: Application[] }[]
}): TenantUser {
  const privilege = user.privileges[0]
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    profileUrl: user.profileUrl,
    isAdmin: privilege?.isAdmin ?? false,
    applications: privilege?.applications ?? [],
  }
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  profileUrl: true,
} as const

export async function listTenantUsers(tenantId: number): Promise<TenantUser[]> {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { tenants: { some: { id: tenantId } } },
        { privileges: { some: { tenantId } } },
      ],
    },
    select: {
      ...userSelect,
      privileges: {
        where: { tenantId },
        select: { isAdmin: true, applications: true },
      },
    },
    orderBy: { name: "asc" },
  })

  return users.map(toTenantUser)
}

async function isTenantMember(userId: number, tenantId: number): Promise<boolean> {
  const member = await prisma.user.findFirst({
    where: {
      id: userId,
      OR: [
        { tenants: { some: { id: tenantId } } },
        { privileges: { some: { tenantId } } },
      ],
    },
    select: { id: true },
  })

  return member !== null
}

async function notifyAddedApplications(
  tenantId: number,
  user: { email: string; name: string },
  applications: Application[],
): Promise<void> {
  if (applications.length === 0) {
    return
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true },
  })
  const tenantName = tenant?.name ?? "your organization"

  await Promise.all(
    applications.map((application) =>
      sendApplicationAddedMail(user.email, user.name, application, tenantName),
    ),
  )
}

export async function inviteTenantUser(
  tenantId: number,
  input: { email: string; name: string; isAdmin: boolean; applications: Application[] },
): Promise<TenantUser> {
  const existing = await prisma.user.findFirst({
    where: { email: { equals: input.email, mode: "insensitive" } },
    select: { id: true },
  })

  if (existing && (await isTenantMember(existing.id, tenantId))) {
    throw new HttpError(409, "This user is already in the tenant")
  }

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          tenants: { connect: { id: tenantId } },
          privileges: {
            create: {
              tenantId,
              isAdmin: input.isAdmin,
              applications: input.applications,
            },
          },
        },
        select: {
          ...userSelect,
          privileges: {
            where: { tenantId },
            select: { isAdmin: true, applications: true },
          },
        },
      })
    : await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          profileUrl: "",
          tenants: { connect: { id: tenantId } },
          privileges: {
            create: {
              tenantId,
              isAdmin: input.isAdmin,
              applications: input.applications,
            },
          },
        },
        select: {
          ...userSelect,
          privileges: {
            where: { tenantId },
            select: { isAdmin: true, applications: true },
          },
        },
      })

  const tenantUser = toTenantUser(user)
  await notifyAddedApplications(tenantId, tenantUser, tenantUser.applications)
  return tenantUser
}

export async function updateTenantUser(
  tenantId: number,
  userId: number,
  input: { isAdmin: boolean; applications: Application[] },
): Promise<TenantUser> {
  if (!(await isTenantMember(userId, tenantId))) {
    throw new HttpError(404, "User is not in this tenant")
  }

  const previous = await prisma.privilege.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
    select: { applications: true },
  })
  const alreadyGranted = new Set(previous?.applications ?? [])
  const added = input.applications.filter((application) => !alreadyGranted.has(application))

  await prisma.privilege.upsert({
    where: { userId_tenantId: { userId, tenantId } },
    update: { isAdmin: input.isAdmin, applications: input.applications },
    create: {
      userId,
      tenantId,
      isAdmin: input.isAdmin,
      applications: input.applications,
    },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { tenants: { connect: { id: tenantId } } },
  })

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      ...userSelect,
      privileges: {
        where: { tenantId },
        select: { isAdmin: true, applications: true },
      },
    },
  })

  const tenantUser = toTenantUser(user)
  await notifyAddedApplications(tenantId, tenantUser, added)
  return tenantUser
}

export async function removeTenantUser(tenantId: number, userId: number, actorId: number): Promise<void> {
  if (userId === actorId) {
    throw new HttpError(400, "You cannot remove yourself from the tenant")
  }

  if (!(await isTenantMember(userId, tenantId))) {
    throw new HttpError(404, "User is not in this tenant")
  }

  const linked = await prisma.user.findFirst({
    where: { id: userId, tenants: { some: { id: tenantId } } },
    select: { id: true },
  })

  await prisma.$transaction([
    prisma.privilege.deleteMany({ where: { userId, tenantId } }),
    ...(linked
      ? [
          prisma.tenant.update({
            where: { id: tenantId },
            data: { users: { disconnect: { id: userId } } },
          }),
        ]
      : []),
  ])
}
