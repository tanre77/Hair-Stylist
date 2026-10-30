import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { ShopBook } from "@/components/shop-book";
import { APP_NAME } from "@/lib/brand";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/stylist/$id")({
  component: StylistPage,
  head: () => ({
    meta: [{ title: `Book · ${APP_NAME}` }],
  }),
});

function StylistPage() {
  const { id } = Route.useParams();
  const store = useStore();
  const member = store.book.staff.find((person) => person.id === id);

  return (
    <Shell>
      {!store.ready ? (
        <p className="text-sm text-stone">Opening the book…</p>
      ) : member ? (
        <ShopBook shopId={member.shopId} initialStaffId={member.id} />
      ) : (
        <div className="py-16 text-center">
          <h1 className="font-display text-4xl">That person isn't on the book.</h1>
          <Link to="/" className="mt-4 inline-flex h-12 items-center text-oxblood">
            Back to shops
          </Link>
        </div>
      )}
    </Shell>
  );
}
