import { createFileRoute } from "@tanstack/react-router";
import { Discover } from "@/components/discover";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: "Hair Stylist" }],
  }),
});

function Home() {
  return (
    <Shell>
      <Discover />
    </Shell>
  );
}
