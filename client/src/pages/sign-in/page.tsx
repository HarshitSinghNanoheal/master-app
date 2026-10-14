import { Navigate } from "react-router"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/auth-context"
import { useProviderSignIn } from "@/features/auth/use-provider-sign-in"

export function SignInPage() {
  const { status } = useAuth()
  const { loading, error, signInWith } = useProviderSignIn()

  if (status === "ready") {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-medium">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Use Google or Microsoft for this tenant.
          </p>
        </div>
        <Button variant="outline" onClick={() => signInWith("google")} disabled={loading !== null}>
          {loading === "google" ? "Signing in with Google..." : "Continue with Google"}
        </Button>
        <Button
          variant="outline"
          onClick={() => signInWith("microsoft")}
          disabled={loading !== null}
        >
          {loading === "microsoft" ? "Signing in with Microsoft..." : "Continue with Microsoft"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  )
}
