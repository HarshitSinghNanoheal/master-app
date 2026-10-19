import { ThemeToggle } from "@/components/theme-toggle"

export function QuietStage({ label }: { label: string }) {
  return (
    <div className="stage">
      <div className="corner-control">
        <ThemeToggle />
      </div>
      <p>{label}</p>
    </div>
  )
}
