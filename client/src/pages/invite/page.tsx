import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { APPLICATIONS, type ApplicationId } from "@/features/applications/catalog"
import { inviteTenantUser } from "@/features/auth/api"

export function InvitePage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [applications, setApplications] = useState<ApplicationId[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function toggleApplication(id: ApplicationId) {
    setApplications((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await inviteTenantUser({ email, name, isAdmin, applications })
      navigate("/users")
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Invite failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex max-w-lg flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">Invite a user</h1>
        <p className="text-sm text-muted-foreground">
          Add someone to this tenant and choose the applications they can access.
        </p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-9 rounded-lg border bg-background px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-9 rounded-lg border bg-background px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(event) => setIsAdmin(event.target.checked)}
          />
          Invite as admin
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm">Applications</legend>
          {APPLICATIONS.map((application) => (
            <label key={application.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={applications.includes(application.id)}
                onChange={() => toggleApplication(application.id)}
              />
              {application.name}
            </label>
          ))}
        </fieldset>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Inviting..." : "Send invite"}
        </Button>
      </form>
    </section>
  )
}
