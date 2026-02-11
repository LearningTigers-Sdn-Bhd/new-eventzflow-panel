import { RegistrationOptionCards } from "@/components/pages/public-registration/RegistrationOptionCards";
import { REGISTRATION_OPTIONS } from "@/lib/constants/public-registration";

export default async function EventRegistrationLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-semibold text-3xl tracking-tight">Event Registration</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a registration type to continue.
        </p>
      </div>

      <RegistrationOptionCards eventSlug={slug} options={REGISTRATION_OPTIONS} />
    </main>
  );
}
