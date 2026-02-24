import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicRegistrationForm } from "@/components/pages/public-registration/PublicRegistrationForm";

export default async function PublicRegistrationTypePage({
  params,
}: {
  params: Promise<{ slug: string; type: string }>;
}) {
  const { slug, type } = await params;

  return (
    <section className="relative min-h-screen overflow-hidden bg-white-background">
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-16 lg:px-16 lg:py-24">
        {/* Back button */}
        <Link
          href={`/events/${encodeURIComponent(slug)}/register`}
          className="mb-8 inline-flex items-center gap-2 font-medium text-black/60 text-sm transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to registration options
        </Link>

        <PublicRegistrationForm
          eventSlug={slug}
          formSlug={type}
        />
      </main>
    </section>
  );
}
