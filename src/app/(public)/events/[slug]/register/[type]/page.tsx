import Link from "next/link";
import { PublicRegistrationForm } from "@/components/pages/public-registration/PublicRegistrationForm";
import { Button } from "@/components/ui/button";

export default async function PublicRegistrationTypePage({
  params,
}: {
  params: Promise<{ slug: string; type: string }>;
}) {
  const { slug, type } = await params;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/events/${encodeURIComponent(slug)}/register`}>Back</Link>
        </Button>
        <h1 className="font-semibold text-2xl tracking-tight">Registration form</h1>
      </div>

      <PublicRegistrationForm
        eventSlug={slug}
        formSlug={type}
      />
    </main>
  );
}
