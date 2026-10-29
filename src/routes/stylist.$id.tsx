import { createFileRoute, Link } from "@tanstack/react-router";
import { Profile } from "@/components/profile";
import { Shell } from "@/components/shell";
import { getStylist } from "@/lib/catalog";

export const Route = createFileRoute("/stylist/$id")({
  component: StylistPage,
  head: ({ params }) => {
    const stylist = getStylist(params.id);
    return {
      meta: [{ title: stylist ? `${stylist.name} · Hair Stylist` : "Hair Stylist" }],
    };
  },
});

function StylistPage() {
  const { id } = Route.useParams();
  const stylist = getStylist(id);

  return (
    <Shell>
      {stylist ? (
        <Profile stylist={stylist} />
      ) : (
        <div className="py-16 text-center">
          <h1 className="font-display text-4xl">That chair isn't listed.</h1>
          <Link to="/" className="mt-4 inline-flex h-12 items-center text-oxblood">
            Back to discover
          </Link>
        </div>
      )}
    </Shell>
  );
}
