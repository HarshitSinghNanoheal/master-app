import { Router } from "express"
import type { NextFunction, Request, Response } from "express"
import { HttpError } from "../lib/http-error.ts"
import { requireAuth } from "../middleware/require-auth.ts"
import { readAccessToken } from "./access-token.ts"
import { authenticate } from "./authenticate.ts"
import type { AuthProvider } from "./providers.ts"

export const authRouter = Router()

function signIn(provider: AuthProvider) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = readAccessToken(req.body)
      const auth = await authenticate(provider, accessToken, req)
      res.json({
        access_token: auth.accessToken,
        provider: auth.provider,
        user: auth.user,
        tenant: auth.tenant,
        privilege: auth.privilege,
      })
    } catch (error) {
      next(error)
    }
  }
}

authRouter.post("/google", signIn("google"))
authRouter.post("/microsoft", signIn("microsoft"))

authRouter.get("/me", requireAuth, (req, res) => {
  if (!req.auth) {
    throw new HttpError(401, "Authentication required")
  }

  res.json({
    provider: req.auth.provider,
    user: req.auth.user,
    tenant: req.auth.tenant,
    privilege: req.auth.privilege,
  })
})
