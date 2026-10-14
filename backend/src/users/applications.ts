import { Application } from "../../generated/prisma/enums.ts"
import { HttpError } from "../lib/http-error.ts"

const APPLICATION_VALUES = new Set<string>(Object.values(Application))

export function readApplications(value: unknown): Application[] {
  if (!Array.isArray(value)) {
    throw new HttpError(400, "applications must be a list")
  }

  const applications: Application[] = []
  for (const item of value) {
    if (typeof item !== "string" || !APPLICATION_VALUES.has(item)) {
      throw new HttpError(400, "Unknown application")
    }

    const application = item as Application
    if (!applications.includes(application)) {
      applications.push(application)
    }
  }

  return applications
}

export function readName(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, "name is required")
  }

  return value.trim()
}

export function readEmail(value: unknown): string {
  if (typeof value !== "string") {
    throw new HttpError(400, "email is required")
  }

  const email = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "email is invalid")
  }

  return email
}

export function readIsAdmin(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new HttpError(400, "isAdmin must be a boolean")
  }

  return value
}
