import { useEffect, useState } from "react"
import { Link } from "react-router"
import { PersonMark } from "@/components/person-mark"
import { SwitchRow } from "@/components/switch-row"
import { Button } from "@/components/ui/button"
import {
  APPLICATIONS,
  type ApplicationId,
} from "@/features/applications/catalog"
import {
  fetchTenantUsers,
  removeTenantUser,
  updateTenantUser,
  type TenantMember,
} from "@/features/auth/api"
import { useAuth } from "@/features/auth/auth-context"

type Draft = {
  isAdmin: boolean
  applications: ApplicationId[]
}

function draftFromUser(user: TenantMember): Draft {
  return { isAdmin: user.isAdmin, applications: user.applications }
}

function sameDraft(left: Draft, right: Draft) {
  if (left.isAdmin !== right.isAdmin) return false
  if (left.applications.length !== right.applications.length) return false
  return left.applications.every((id) => right.applications.includes(id))
}

export function UsersPage() {
  const { current } = useAuth()
  const [users, setUsers] = useState<TenantMember[]>([])
  const [drafts, setDrafts] = useState<Record<number, Draft>>({})
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)

  async function loadUsers() {
    const result = await fetchTenantUsers()
    setUsers(result.users)
    setDrafts(
      Object.fromEntries(
        result.users.map((user) => [user.id, draftFromUser(user)])
      )
    )
  }

  useEffect(() => {
    void loadUsers()
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load users"
        )
      })
      .finally(() => setLoaded(true))
  }, [])

  function toggleApplication(
    userId: number,
    id: ApplicationId,
    checked: boolean
  ) {
    setDrafts((currentDrafts) => {
      const draft = currentDrafts[userId]
      if (!draft) return currentDrafts
      const applications = checked
        ? [...draft.applications, id]
        : draft.applications.filter((item) => item !== id)
      return { ...currentDrafts, [userId]: { ...draft, applications } }
    })
  }

  async function saveUser(userId: number) {
    const draft = drafts[userId]
    if (!draft) return
    setPendingId(userId)
    setError(null)
    try {
      await updateTenantUser(userId, draft)
      await loadUsers()
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not update user"
      )
    } finally {
      setPendingId(null)
    }
  }

  async function kickUser(userId: number) {
    setPendingId(userId)
    setError(null)
    try {
      await removeTenantUser(userId)
      setConfirmRemoveId(null)
      await loadUsers()
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Could not remove user"
      )
    } finally {
      setPendingId(null)
    }
  }

  const organization = current?.tenant.name ?? "this organization"

  return (
    <section className="page-narrow">
      <div className="page-intro">
        <h1>People</h1>
        <p>
          Everyone in {organization}. Admins can change access or remove
          someone.
        </p>
      </div>
      <div className="stack">
        {error ? (
          <p className="notice" role="alert">
            {error}
          </p>
        ) : null}
        {!loaded && !error ? (
          <p className="status-line">Loading people…</p>
        ) : null}
        {loaded && !error && users.length === 0 ? (
          <div className="empty">
            <p>No one is in this organization yet.</p>
            <Link className="text-link" to="/invite">
              Invite someone
            </Link>
          </div>
        ) : null}
        {users.map((user) => {
          const draft = drafts[user.id] ?? draftFromUser(user)
          const saved = draftFromUser(user)
          const dirty = !sameDraft(draft, saved)
          const isSelf = current?.user.id === user.id
          const pending = pendingId === user.id
          const busy = pendingId !== null
          return (
            <article key={user.id} className="person-card">
              <header className="person-head">
                <PersonMark name={user.name} profileUrl={user.profileUrl} />
                <div>
                  <h2>{user.name}</h2>
                  <p>{user.email}</p>
                </div>
                {isSelf ? <span className="pill">You</span> : null}
              </header>
              <div className="option-list">
                <SwitchRow
                  label="Admin"
                  checked={draft.isAdmin}
                  disabled={busy}
                  onChange={(checked) =>
                    setDrafts((currentDrafts) => ({
                      ...currentDrafts,
                      [user.id]: { ...draft, isAdmin: checked },
                    }))
                  }
                />
                {APPLICATIONS.map((application) => (
                  <SwitchRow
                    key={application.id}
                    label={application.name}
                    checked={draft.applications.includes(application.id)}
                    disabled={busy}
                    onChange={(checked) =>
                      toggleApplication(user.id, application.id, checked)
                    }
                  />
                ))}
              </div>
              {confirmRemoveId === user.id ? (
                <div
                  className="confirm"
                  role="group"
                  aria-label={`Remove ${user.name}`}
                >
                  <p>
                    Remove {user.name} from {organization}? They lose access
                    until someone adds them again.
                  </p>
                  <div className="actions">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => kickUser(user.id)}
                      disabled={pending}
                    >
                      {pending ? "Removing…" : "Remove"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfirmRemoveId(null)}
                      disabled={pending}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="actions">
                  <Button
                    type="button"
                    onClick={() => saveUser(user.id)}
                    disabled={!dirty || busy}
                  >
                    {pending ? "Saving…" : "Save"}
                  </Button>
                  {isSelf ? null : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmRemoveId(user.id)}
                      disabled={busy}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
