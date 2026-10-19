import { Navigate } from "react-router"
import { QuietStage } from "@/components/quiet-stage"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/features/auth/auth-context"
import { useProviderSignIn } from "@/features/auth/use-provider-sign-in"

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}

function MicrosoftMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#F25022" d="M1 1h7.2v7.2H1z" />
      <path fill="#7FBA00" d="M9.8 1H17v7.2H9.8z" />
      <path fill="#00A4EF" d="M1 9.8h7.2V17H1z" />
      <path fill="#FFB900" d="M9.8 9.8H17V17H9.8z" />
    </svg>
  )
}

export function SignInPage() {
  const { status } = useAuth()
  const { loading, error, signInWith } = useProviderSignIn()

  if (status === "loading") {
    return <QuietStage label="Checking your session" />
  }

  if (status === "ready") {
    return <Navigate to="/" replace />
  }

  return (
    <div className="sign-in">
      <div className="corner-control">
        <ThemeToggle />
      </div>
      <div className="sign-in-panel">
        <div className="sign-in-copy">
          <h1>Sign in</h1>
          <p>
            Use Google or Microsoft to open the applications for your
            organization.
          </p>
        </div>
        <div className="sign-in-actions">
          <button
            type="button"
            className="provider-button"
            onClick={() => signInWith("google")}
            disabled={loading !== null}
          >
            <GoogleMark />
            {loading === "google"
              ? "Continuing with Google…"
              : "Continue with Google"}
          </button>
          <button
            type="button"
            className="provider-button"
            onClick={() => signInWith("microsoft")}
            disabled={loading !== null}
          >
            <MicrosoftMark />
            {loading === "microsoft"
              ? "Continuing with Microsoft…"
              : "Continue with Microsoft"}
          </button>
        </div>
        {error ? (
          <p className="notice" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
