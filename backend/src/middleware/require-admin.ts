import type { NextFunction, Request, Response } from "express"
import { HttpError } from "../lib/http-error.ts"

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth?.privilege.isAdmin) {
    next(new HttpError(403, "Admin access required"))
    return
  }

  next()
}
