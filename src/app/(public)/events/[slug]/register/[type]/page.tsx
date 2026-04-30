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
    <section className="relative min-h-screen overflow-hidden bg-slate-50/50">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-green/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-12 lg:px-8 lg:py-20">
        {/* Back button */}
        <div className="mb-8">
          <Link
            href={`/events/${encodeURIComponent(slug)}/register`}
            className="inline-flex items-center gap-2 font-medium text-slate-500 text-sm transition-all hover:text-black group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 transition-transform group-hover:-translate-x-1">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Back to registration options
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-1 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
          <div className="rounded-[22px] bg-white px-4 py-10 sm:px-8 md:p-12">
            <PublicRegistrationForm
              eventSlug={slug}
              formSlug={type}
            />
          </div>
        </div>
      </main>
    </section>
  );
}
