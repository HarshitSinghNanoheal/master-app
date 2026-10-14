import { Router } from "express"
import type { NextFunction, Request, Response } from "express"
import { HttpError } from "../lib/http-error.ts"
import { requireAdmin } from "../middleware/require-admin.ts"
import { requireAuth } from "../middleware/require-auth.ts"
import { readApplications, readEmail, readIsAdmin, readName } from "./applications.ts"
import { inviteTenantUser, listTenantUsers, removeTenantUser, updateTenantUser } from "./service.ts"

export const usersRouter = Router()

usersRouter.use(requireAuth, requireAdmin)

function readBody(req: Request): Record<string, unknown> {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new HttpError(400, "Invalid JSON")
  }

  return req.body as Record<string, unknown>
}

function tenantId(req: Request): number {
  if (!req.auth) {
    throw new HttpError(401, "Authentication required")
  }

  return req.auth.tenant.id
}

function userIdParam(req: Request): number {
  const raw = req.params.userId
  const value = Array.isArray(raw) ? raw[0] : raw
  const userId = Number(value)
  if (!Number.isInteger(userId)) {
    throw new HttpError(400, "Invalid user id")
  }

  return userId
}

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await listTenantUsers(tenantId(req))
    res.json({ users })
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/invite", async (req, res, next) => {
  try {
    const body = readBody(req)
    const user = await inviteTenantUser(tenantId(req), {
      email: readEmail(body.email),
      name: readName(body.name),
      isAdmin: readIsAdmin(body.isAdmin),
      applications: readApplications(body.applications),
    })
    res.status(201).json({ user })
  } catch (error) {
    next(error)
  }
})

usersRouter.patch("/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = readBody(req)
    const user = await updateTenantUser(tenantId(req), userIdParam(req), {
      isAdmin: readIsAdmin(body.isAdmin),
      applications: readApplications(body.applications),
    })
    res.json({ user })
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new HttpError(401, "Authentication required")
    }

    await removeTenantUser(tenantId(req), userIdParam(req), req.auth.user.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
