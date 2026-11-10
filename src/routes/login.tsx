import { createFileRoute, Navigate } from "@tanstack/react-router";
import { LoginScreen } from "@/components/login-screen";
import { Shell } from "@/components/shell";
import { APP_NAME } from "@/lib/brand";
import { loginSurface } from "@/lib/account-chrome";
import { useDemoMode } from "@/lib/use-demo";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: APP_NAME }],
  }),
});

function LoginPage() {
  const demo = useDemoMode();
  if (loginSurface(demo) === "redirect") return <Navigate to="/" />;
  return (
    <Shell>
      <LoginScreen demo={false} />
    </Shell>
  );
}
