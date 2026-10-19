import { useEffect, useId, useRef, useState } from "react"
import { PersonMark } from "@/components/person-mark"

type AccountMenuProps = {
  name: string
  email: string
  profileUrl?: string
  onSignOut: () => void
}

export function AccountMenu({
  name,
  email,
  profileUrl,
  onSignOut,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    menuRef.current?.focus()

    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="account-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account for ${name}`}
        onClick={() => setOpen((current) => !current)}
      >
        <PersonMark name={name} profileUrl={profileUrl} size="sm" />
      </button>
      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          className="account-popover"
          role="menu"
          tabIndex={-1}
          aria-label="Account"
        >
          <div className="account-popover-identity">
            <PersonMark name={name} profileUrl={profileUrl} />
            <div>
              <p className="account-name">{name}</p>
              <p className="account-email">{email}</p>
            </div>
          </div>
          <button
            type="button"
            className="account-sign-out"
            role="menuitem"
            onClick={onSignOut}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
