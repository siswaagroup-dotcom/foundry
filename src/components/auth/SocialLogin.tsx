import { Button } from "@/components/ui/button";
import { SOCIAL_PROVIDERS } from "@/constants/auth";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.43z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.89 6.62-2.41l-3.24-2.51c-.9.6-2.04.95-3.38.95-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.91a6.01 6.01 0 0 1 0-3.82V7.5H3.06a10 10 0 0 0 0 9l3.34-2.59z"
      />
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.79.51 3.82 1.5l2.87-2.87C16.96 3 14.7 2 12 2a10 10 0 0 0-8.94 5.5l3.34 2.59C7.19 7.73 9.4 5.98 12 5.98z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.3 18v-5.44h1.82l.27-2.12H13.3V9.09c0-.61.17-1.03 1.05-1.03h1.12v-1.9c-.19-.03-.86-.08-1.64-.08-1.62 0-2.73.99-2.73 2.81v1.55H9.27v2.12h1.83V18h2.2z"
      />
    </svg>
  );
}

export function SocialLogin() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {SOCIAL_PROVIDERS.map((provider) => (
        <div key={provider.id}>
          <Button
            type="button"
            variant="outline"
            size="social"
            className="h-10 w-full gap-2 text-[13px] font-medium sm:h-11"
          >
            {provider.id === "google" ? <GoogleIcon /> : <FacebookIcon />}
            {provider.label}
          </Button>
        </div>
      ))}
    </div>
  );
}
