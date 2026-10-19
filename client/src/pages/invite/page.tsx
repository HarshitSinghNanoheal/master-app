import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { SwitchRow } from "@/components/switch-row"
import {
  APPLICATIONS,
  type ApplicationId,
} from "@/features/applications/catalog"
import { inviteTenantUser } from "@/features/auth/api"
import { useAuth } from "@/features/auth/auth-context"

export function InvitePage() {
  const navigate = useNavigate()
  const { current } = useAuth()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [applications, setApplications] = useState<ApplicationId[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function toggleApplication(id: ApplicationId, checked: boolean) {
    setApplications((currentApplications) =>
      checked
        ? [...currentApplications, id]
        : currentApplications.filter((item) => item !== id)
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
      setError(
        inviteError instanceof Error ? inviteError.message : "Invite failed"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const organization = current?.tenant.name ?? "this organization"

  return (
    <section className="page-narrow">
      <div className="page-intro">
        <h1>Invite</h1>
        <p>
          Add someone to {organization}. They sign in with Google or Microsoft
          using this email, and only see the applications you turn on.
        </p>
      </div>
      <form className="panel" onSubmit={onSubmit}>
        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Name</span>
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <div className="option-list">
          <SwitchRow
            label="Admin"
            description="Can invite people and change what they can open."
            checked={isAdmin}
            disabled={submitting}
            onChange={setIsAdmin}
          />
        </div>
        <fieldset className="field-group">
          <legend>Applications</legend>
          <div className="option-list">
            {APPLICATIONS.map((application) => (
              <SwitchRow
                key={application.id}
                label={application.name}
                checked={applications.includes(application.id)}
                disabled={submitting}
                onChange={(checked) =>
                  toggleApplication(application.id, checked)
                }
              />
            ))}
          </div>
        </fieldset>
        {error ? (
          <p className="notice" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add person"}
        </Button>
      </form>
    </section>
  )
}
