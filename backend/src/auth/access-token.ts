import { HttpError } from "../lib/http-error.ts"

export function readAccessToken(body: unknown): string {
  if (!body || typeof body !== "object" || !("access_token" in body)) {
    throw new HttpError(400, "access_token is required")
  }

  const accessToken = body.access_token
  if (typeof accessToken !== "string" || accessToken.trim() === "") {
    throw new HttpError(400, "access_token is required")
  }

  return accessToken.trim()
}
