import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, CalendarDays, Scissors } from "lucide-react";
import { useEffect } from "react";
import { accountChrome } from "@/lib/account-chrome";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { requestDeviceLocation } from "@/lib/geo";
import { clearOwner, hydrateStore, useStore } from "@/lib/store";
import { useDemoMode } from "@/lib/use-demo";

export function Shell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const demo = useDemoMode();
  const store = useStore();
  const bookOn = path === "/" || path.startsWith("/shop") || path.startsWith("/stylist");
  const chrome = accountChrome({ demo, ownerName: demo ? null : store.owner?.name });

  useEffect(() => {
    hydrateStore();
    requestDeviceLocation();
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to="/" className="min-w-0">
            <span className="block font-display text-2xl leading-none tracking-tight">{APP_NAME}</span>
            <span className="block text-xs text-stone">{APP_TAGLINE}</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-right">
              <span className="block font-medium">{chrome.label}</span>
              {chrome.kind === "guest" && <span className="hidden text-xs text-stone sm:block">{chrome.hint}</span>}
            </span>
            {chrome.prompt ? (
              <Link to="/login" className="inline-flex h-10 items-center rounded-full bg-ink px-3 text-foam">
                {chrome.prompt}
              </Link>
            ) : null}
            {!demo && store.owner ? (
              <button type="button" onClick={() => clearOwner()} className="text-stone">
                Sign out
              </button>
            ) : null}
          </div>
        </div>
        {demo && (
          <p className="border-t border-line bg-foam px-4 py-2 text-center text-xs text-stone">
            Demo · sample chairs and payments stay on this device. Card numbers are tokenized and never saved.
          </p>
        )}
      </header>
      <main className="app-pad mx-auto w-full max-w-5xl px-4 pt-6">{children}</main>
      <nav className="dock fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-3">
          <Link
            to="/"
            className={cn(
              "flex h-14 items-center justify-center gap-2 text-sm font-medium",
              bookOn ? "text-oxblood" : "text-stone",
            )}
          >
            <Scissors className="size-5" aria-hidden="true" />
            Book
          </Link>
          <Link
            to="/visits"
            className={cn(
              "flex h-14 items-center justify-center gap-2 text-sm font-medium",
              path.startsWith("/visits") || path.startsWith("/m/") ? "text-oxblood" : "text-stone",
            )}
          >
            <CalendarCheck className="size-5" aria-hidden="true" />
            Visits
          </Link>
          <Link
            to="/studio"
            className={cn(
              "flex h-14 items-center justify-center gap-2 text-sm font-medium",
              path.startsWith("/studio") ? "text-oxblood" : "text-stone",
            )}
          >
            <CalendarDays className="size-5" aria-hidden="true" />
            Studio
          </Link>
        </div>
      </nav>
    </div>
  );
}
