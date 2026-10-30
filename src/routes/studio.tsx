import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Studio } from "@/components/studio-view";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/studio")({
  component: StudioPage,
  head: () => ({
    meta: [{ title: `Studio · ${APP_NAME}` }],
  }),
});

function StudioPage() {
  return (
    <Shell>
      <Studio />
    </Shell>
  );
}
