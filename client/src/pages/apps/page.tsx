import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router"
import okonomiyakiLogo from "@/assets/okonomiyaki-logo.png"
import resolvLogo from "@/assets/resolv-logo.png"
import {
  APPLICATIONS,
  applicationOpenUrl,
} from "@/features/applications/catalog"
import { useAuth } from "@/features/auth/auth-context"
import { readLocalSession } from "@/features/auth/session"

const LOGOS: Partial<Record<(typeof APPLICATIONS)[number]["id"], string>> = {
  RESOLV: resolvLogo,
  VAPT: okonomiyakiLogo,
}

const SUMMARIES: Partial<Record<(typeof APPLICATIONS)[number]["id"], string>> =
  {
    RESOLV: "Issues, tickets, and releases",
    VAPT: "Automated security testing",
  }

function ApplicationTile({
  id,
  name,
  summary,
  href,
}: {
  id: string
  name: string
  summary?: string
  href: string | null
}) {
  const logo = LOGOS[id as keyof typeof LOGOS]
  const body = (
    <>
      <span
        className="app-mark"
        data-app={id}
        data-logo={logo ? "" : undefined}
        aria-hidden="true"
      >
        {logo ? <img src={logo} alt="" /> : name.charAt(0)}
      </span>
      <span className="app-copy">
        <h2 className="app-name">{name}</h2>
        {summary ? <p className="app-summary">{summary}</p> : null}
      </span>
    </>
  )

  if (!href) {
    return (
      <div className="app-tile">
        {body}
        <span className="app-foot">Not linked yet</span>
      </div>
    )
  }

  return (
    <a
      className="app-tile"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {body}
      <span className="app-foot">
        Open
        <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className="sr-only"> in a new tab</span>
      </span>
    </a>
  )
}

export function AppsPage() {
  const { current } = useAuth()
  const session = readLocalSession()
  if (!current) {
    return null
  }

  const applications = current.privilege.applications.map((id) => {
    const application = APPLICATIONS.find((item) => item.id === id)
    return {
      id,
      name: application?.name ?? id,
      summary: SUMMARIES[id],
      href: applicationOpenUrl(id, session),
    }
  })

  return (
    <section>
      <div className="page-intro">
        <h1>Applications</h1>
        <p>
          Choose a workspace. Linked applications open in a new tab, already
          signed in.
        </p>
      </div>
      {applications.length === 0 ? (
        <div className="empty">
          {current.privilege.isAdmin ? (
            <p>
              No applications are available for this account yet. You can grant
              access from{" "}
              <Link className="text-link" to="/users">
                People
              </Link>
              .
            </p>
          ) : (
            <p>No applications are available for this account yet.</p>
          )}
        </div>
      ) : (
        <div className="app-grid">
          {applications.map((application) => (
            <ApplicationTile key={application.id} {...application} />
          ))}
        </div>
      )}
    </section>
  )
}
