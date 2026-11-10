import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { ShopBook } from "@/components/shop-book";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/shop/$shopId")({
  component: ShopPage,
  head: () => ({
    meta: [{ title: `Book · ${APP_NAME}` }],
  }),
});

function ShopPage() {
  const { shopId } = Route.useParams();
  return (
    <Shell>
      <ShopBook shopId={shopId} />
    </Shell>
  );
}
