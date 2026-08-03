import Image from "next/image";
import { getTicketRsvpServer } from "@/lib/api/ticket-rsvp";
import TicketRsvpContent from "./ticket-rsvp-content";

export default async function TicketRsvpPage({
	params,
}: {
	params: Promise<{ event_id: string; token: string }>;
}) {
	const { event_id, token } = await params;

	let initialData = null;
	let fetchError = false;

	try {
		const response = await getTicketRsvpServer({ eventId: event_id, token });
		initialData = response.data;
	} catch {
		fetchError = true;
	}

	return (
		<div className="flex min-h-screen w-full flex-col bg-[#FDFCF6] font-sans text-zinc-900 lg:flex-row">
			{/* LEFT PANEL: Hero Branding */}
			<div className="relative flex w-full shrink-0 flex-col justify-between overflow-hidden bg-black p-6 text-white sm:p-12 lg:w-[45%] lg:p-24 xl:w-[40%]">
				<div className="absolute inset-0">
					<Image
						src="/images/homepage/HeroSection.webp"
						alt="Event background"
						fill
						sizes="(max-width: 1023px) 100vw, 45vw"
						priority
						className="object-cover opacity-50"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
				</div>

				<div className="absolute top-0 left-6 hidden h-[40%] w-[3px] bg-brand-green md:left-12 md:block lg:left-16 lg:h-[60%]" />

				<div className="relative z-20 space-y-8 lg:space-y-12">
					<div className="inline-block">
						<Image
							src="/logo/LogoLight.png"
							alt="EventzFlow"
							width={160}
							height={46}
							className="h-8 w-auto object-contain lg:h-10"
						/>
					</div>
					<div className="space-y-4 lg:space-y-6">
						<p className="font-bold text-[10px] text-white/60 uppercase tracking-[0.4em] lg:text-xs">
							Official Invitation
						</p>
						<h1 className="font-medium font-serif text-3xl text-white uppercase leading-[1.05] tracking-tight drop-shadow-2xl sm:text-5xl xl:text-7xl">
							{initialData?.event_title ?? ""}
						</h1>
					</div>
				</div>

				<div className="relative z-20 pt-12 lg:pt-0">
					<div className="mb-4 h-px w-16 bg-brand-green lg:mb-6 lg:w-24" />
					<p className="font-bold text-[10px] text-white/40 uppercase tracking-[0.4em]">
						&copy; {new Date().getFullYear()} EVENTZFLOW
					</p>
				</div>
			</div>

			{/* RIGHT PANEL */}
			<TicketRsvpContent
				initialData={initialData}
				error={fetchError}
				eventId={event_id}
				token={token}
			/>
		</div>
	);
}
