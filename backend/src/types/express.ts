import type { AuthContext } from "../auth/authenticate.ts"

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext
    }
  }
}

export {}
