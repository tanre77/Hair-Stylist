import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Visits } from "@/components/visits-view";

export const Route = createFileRoute("/visits")({
  component: VisitsPage,
  head: () => ({
    meta: [{ title: "Visits · Hair Stylist" }],
  }),
});

function VisitsPage() {
  return (
    <Shell>
      <Visits />
    </Shell>
  );
}
