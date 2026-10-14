import type { NextFunction, Request, Response } from "express"
import { authenticate } from "../auth/authenticate.ts"
import type { AuthProvider } from "../auth/providers.ts"
import { HttpError } from "../lib/http-error.ts"

function readProvider(value: string | undefined): AuthProvider | null {
  if (value === "google" || value === "microsoft") {
    return value
  }

  return null
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header("authorization")
    const provider = readProvider(req.header("x-auth-provider"))
    const accessToken = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : ""

    if (!provider || !accessToken) {
      throw new HttpError(401, "Authentication required")
    }

    req.auth = await authenticate(provider, accessToken, req)
    next()
  } catch (error) {
    next(error)
  }
}
