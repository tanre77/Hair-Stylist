import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, Scissors } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { requestDeviceLocation } from "@/lib/geo";
import { hydrateStore } from "@/lib/store";

export function Shell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const discoverOn = path === "/" || path.startsWith("/stylist");

  useEffect(() => {
    hydrateStore();
    requestDeviceLocation();
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="font-display text-2xl tracking-tight">
            Hair Stylist
          </Link>
          <p className="hidden text-sm text-stone sm:block">Powell & Columbus</p>
        </div>
      </header>
      <main className="app-pad mx-auto w-full max-w-5xl px-4 pt-6">{children}</main>
      <nav className="dock fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-2">
          <Link
            to="/"
            className={cn(
              "flex h-14 items-center justify-center gap-2 text-sm font-medium",
              discoverOn ? "text-oxblood" : "text-stone",
            )}
          >
            <Scissors className="size-5" aria-hidden="true" />
            Discover
          </Link>
          <Link
            to="/visits"
            className={cn(
              "flex h-14 items-center justify-center gap-2 text-sm font-medium",
              path.startsWith("/visits") ? "text-oxblood" : "text-stone",
            )}
          >
            <CalendarCheck className="size-5" aria-hidden="true" />
            Visits
          </Link>
        </div>
      </nav>
    </div>
  );
}
