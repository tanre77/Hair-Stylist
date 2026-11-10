import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { VisitsView } from "@/components/visits-view";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/visits")({
  component: VisitsPage,
  head: () => ({
    meta: [{ title: `Visits · ${APP_NAME}` }],
  }),
});

function VisitsPage() {
  return (
    <Shell>
      <VisitsView />
    </Shell>
  );
}
