import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { APPLICATIONS, type ApplicationId } from "@/features/applications/catalog"
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

export function UsersPage() {
  const { current } = useAuth()
  const [users, setUsers] = useState<TenantMember[]>([])
  const [drafts, setDrafts] = useState<Record<number, Draft>>({})
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null)

  async function loadUsers() {
    const result = await fetchTenantUsers()
    setUsers(result.users)
    setDrafts(Object.fromEntries(result.users.map((user) => [user.id, draftFromUser(user)])))
  }

  useEffect(() => {
    void loadUsers().catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : "Could not load users")
    })
  }, [])

  function toggleApplication(userId: number, id: ApplicationId) {
    setDrafts((currentDrafts) => {
      const draft = currentDrafts[userId]
      if (!draft) return currentDrafts
      const applications = draft.applications.includes(id)
        ? draft.applications.filter((item) => item !== id)
        : [...draft.applications, id]
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
      setError(saveError instanceof Error ? saveError.message : "Could not update user")
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
      setError(removeError instanceof Error ? removeError.message : "Could not remove user")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">Users</h1>
        <p className="text-sm text-muted-foreground">
          People in this tenant. Admins can change access or remove someone.
        </p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-col gap-3">
        {users.map((user) => {
          const draft = drafts[user.id] ?? draftFromUser(user)
          const isSelf = current?.user.id === user.id
          return (
            <Card key={user.id} className="flex flex-col gap-4 p-4">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.isAdmin}
                  onChange={(event) =>
                    setDrafts((currentDrafts) => ({
                      ...currentDrafts,
                      [user.id]: { ...draft, isAdmin: event.target.checked },
                    }))
                  }
                />
                Admin
              </label>
              <div className="flex flex-wrap gap-4">
                {APPLICATIONS.map((application) => (
                  <label key={application.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.applications.includes(application.id)}
                      onChange={() => toggleApplication(user.id, application.id)}
                    />
                    {application.name}
                  </label>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => saveUser(user.id)} disabled={pendingId === user.id}>
                  Save
                </Button>
                {isSelf ? null : confirmRemoveId === user.id ? (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => kickUser(user.id)}
                      disabled={pendingId === user.id}
                    >
                      Confirm remove
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmRemoveId(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setConfirmRemoveId(user.id)}>
                    Remove from tenant
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
