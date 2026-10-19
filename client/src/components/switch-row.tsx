import type { ChangeEvent } from "react"

type SwitchRowProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

export function SwitchRow({
  checked,
  onChange,
  label,
  description,
  disabled,
}: SwitchRowProps) {
  return (
    <label className="option-row">
      <span className="option-copy">
        <span className="option-label">{label}</span>
        {description ? (
          <span className="option-detail">{description}</span>
        ) : null}
      </span>
      <input
        type="checkbox"
        role="switch"
        className="switch"
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.checked)
        }
      />
    </label>
  )
}
