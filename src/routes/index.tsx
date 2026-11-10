import { createFileRoute } from "@tanstack/react-router";
import { Discover } from "@/components/discover";
import { Shell } from "@/components/shell";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: APP_NAME }],
  }),
});

function Home() {
  return (
    <Shell>
      <Discover />
    </Shell>
  );
}
