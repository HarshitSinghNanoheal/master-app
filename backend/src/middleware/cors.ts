import type { NextFunction, Request, Response } from "express"
import { isAllowedOrigin } from "../auth/tenant.ts"

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.header("origin")
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Vary", "Origin")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Auth-Provider")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(204)
    return
  }

  next()
}
