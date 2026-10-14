import type { NextFunction, Request, Response } from "express"
import { HttpError } from "../lib/http-error.ts"

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message })
    return
  }

  if (err instanceof SyntaxError && "status" in err && err.status === 400) {
    res.status(400).json({ message: "Invalid JSON" })
    return
  }

  console.error(err)
  res.status(500).json({ message: "Internal server error" })
}
