import type { ApplicationId } from "@/features/applications/catalog"
import { apiUrl, authHeaders, type AuthProvider } from "@/features/auth/session"

export type CurrentUser = {
  provider: AuthProvider
  user: {
    id: number
    email: string
    name: string
    profileUrl: string
  }
  tenant: {
    id: number
    name: string
    slug: string
  }
  privilege: {
    isAdmin: boolean
    applications: ApplicationId[]
  }
}

export type TenantMember = {
  id: number
  email: string
  name: string
  profileUrl: string
  isAdmin: boolean
  applications: ApplicationId[]
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message
        : "Request failed"
    throw new Error(message)
  }

  return body as T
}

export function fetchCurrentUser() {
  return request<CurrentUser>("/auth/me")
}

export function fetchTenantUsers() {
  return request<{ users: TenantMember[] }>("/users")
}

export function inviteTenantUser(input: {
  email: string
  name: string
  isAdmin: boolean
  applications: ApplicationId[]
}) {
  return request<{ user: TenantMember }>("/users/invite", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateTenantUser(
  userId: number,
  input: { isAdmin: boolean; applications: ApplicationId[] },
) {
  return request<{ user: TenantMember }>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function removeTenantUser(userId: number) {
  return request<void>(`/users/${userId}`, { method: "DELETE" })
}
