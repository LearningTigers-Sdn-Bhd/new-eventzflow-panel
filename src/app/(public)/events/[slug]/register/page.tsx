"use client";

import { useQuery } from "@tanstack/react-query";
import { RegistrationOptionCards } from "@/components/pages/public-registration/RegistrationOptionCards";
import { getPublicRegistrationForms } from "@/lib/api/public-registration";
import { use } from "react";

export default function EventRegistrationLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const formsQuery = useQuery({
    queryKey: ["public-registration-forms", slug],
    queryFn: () => getPublicRegistrationForms(slug),
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-semibold text-3xl tracking-tight">Event Registration</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a registration type to continue.
        </p>
      </div>

      {formsQuery.isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Loading registration options...
        </div>
      ) : formsQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          Unable to load registration options for this event.
        </div>
      ) : formsQuery.data && formsQuery.data.length > 0 ? (
        <RegistrationOptionCards eventSlug={slug} forms={formsQuery.data} />
      ) : (
        <div className="py-10 text-center text-sm text-muted-foreground">
          No registration forms are available for this event.
        </div>
      )}
    </main>
  );
}
