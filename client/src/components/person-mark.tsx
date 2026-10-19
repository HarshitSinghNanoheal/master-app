import { useState } from "react"

type PersonMarkProps = {
  name: string
  profileUrl?: string
  size?: "sm" | "md"
}

export function PersonMark({ name, profileUrl, size = "md" }: PersonMarkProps) {
  const [failed, setFailed] = useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || "?"
  const sizeClass = size === "sm" ? "avatar avatar-sm" : "avatar"

  if (profileUrl && !failed) {
    return (
      <img
        className={sizeClass}
        src={profileUrl}
        alt=""
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span className={`${sizeClass} avatar-fallback`} aria-hidden="true">
      {initial}
    </span>
  )
}
