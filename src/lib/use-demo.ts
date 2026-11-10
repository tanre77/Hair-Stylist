import { useRouterState } from "@tanstack/react-router";
import { hasPublicPaymentKeys, resolveDemoMode } from "./pay-config";

export function useDemoMode() {
  const searchStr = useRouterState({ select: (state) => state.location.searchStr });
  return resolveDemoMode({
    search: searchStr,
    envDemo: import.meta.env.VITE_DEMO_MODE,
    hasPaymentKeys: hasPublicPaymentKeys(import.meta.env),
  });
}

export function publicEnv() {
  return import.meta.env;
}
