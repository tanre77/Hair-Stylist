import { createFileRoute } from "@tanstack/react-router";
import { ManageView } from "@/components/manage-view";
import { Shell } from "@/components/shell";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/m/$token")({
  component: ManagePage,
  head: () => ({
    meta: [{ title: `Visit · ${APP_NAME}` }],
  }),
});

function ManagePage() {
  const { token } = Route.useParams();
  return (
    <Shell>
      <ManageView token={token} />
    </Shell>
  );
}
