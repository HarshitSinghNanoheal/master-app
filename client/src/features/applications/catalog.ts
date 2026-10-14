export const RESOLV_URL = "http://localhost:5174"

export const APPLICATIONS = [
  { id: "RESOLV", name: "Resolv" },
  { id: "USTOR", name: "Ustor" },
  { id: "VAPT", name: "VAPT" },
] as const

export type ApplicationId = (typeof APPLICATIONS)[number]["id"]

export function isApplicationId(value: string): value is ApplicationId {
  return APPLICATIONS.some((application) => application.id === value)
}
