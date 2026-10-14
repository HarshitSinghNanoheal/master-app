import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { APPLICATIONS, RESOLV_URL } from "@/features/applications/catalog"
import { useAuth } from "@/features/auth/auth-context"
import { readLocalSession } from "@/features/auth/session"

function resolvRedirectUrl(token: string, provider: string): string {
  const url = new URL(RESOLV_URL)
  url.searchParams.set("token", token)
  url.searchParams.set("provider", provider)
  return url.toString()
}

export function AppsPage() {
  const { current } = useAuth()
  const session = readLocalSession()
  if (!current) {
    return null
  }

  const applications = current.privilege.applications.map((id) => {
    const application = APPLICATIONS.find((item) => item.id === id)
    return { id, name: application?.name ?? id }
  })

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium">Applications</h1>
          <p className="text-sm text-muted-foreground">Applications you can open in this tenant.</p>
        </div>
        {current.privilege.isAdmin ? (
          <Button asChild>
            <Link to="/invite">Invite a user</Link>
          </Button>
        ) : null}
      </div>
      {applications.length === 0 ? (
        <p className="text-sm text-muted-foreground">You do not have access to any applications.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <Card key={application.id} className="flex flex-col gap-3 p-5">
              <div>
                <h2 className="text-base font-medium">{application.name}</h2>
                <p className="text-sm text-muted-foreground">{application.id}</p>
              </div>
              {application.id === "RESOLV" && session ? (
                <Button asChild className="w-fit">
                  <a
                    href={resolvRedirectUrl(session.access_token, session.provider)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Resolv
                  </a>
                </Button>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
