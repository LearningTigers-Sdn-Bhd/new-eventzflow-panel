import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicRegistrationForm } from "@/components/pages/public-registration/PublicRegistrationForm";
import { Button } from "@/components/ui/button";
import type { PublicRegistrationMode } from "@/lib/api/public-registration";

const allowedModes: PublicRegistrationMode[] = ["conference", "visitor", "golf"];

export default async function PublicRegistrationModePage({
  params,
}: {
  params: Promise<{ slug: string; mode: string }>;
}) {
  const { slug, mode } = await params;

  if (!allowedModes.includes(mode as PublicRegistrationMode)) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/events/${slug}/register`}>Back</Link>
        </Button>
        <h1 className="font-semibold text-2xl tracking-tight">Registration form</h1>
      </div>

      <PublicRegistrationForm
        eventSlug={slug}
        mode={mode as PublicRegistrationMode}
      />
    </main>
  );
}
