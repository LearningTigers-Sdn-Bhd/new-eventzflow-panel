"use client";

import { motion } from "framer-motion";
import { Award, Heart, Shield, Users } from "lucide-react";
import { SMOOTH_EASE } from "@/lib/constants/animation";

const values = [
	{
		icon: Heart,
		title: "Customer success first",
		description:
			"We care about your event outcomes, not just software features. Your success is how we measure our own progress.",
	},
	{
		icon: Users,
		title: "Built with feedback",
		description:
			"We actively listen to organizers, vendors, and attendees. Every conversation helps us build something better.",
	},
	{
		icon: Award,
		title: "Quality & simplicity",
		description:
			"Clean interfaces, reliable performance, and features that actually work. We keep things simple so you can focus on your events.",
	},
	{
		icon: Shield,
		title: "Security by design",
		description:
			"We take data protection seriously from day one. Your attendee information is encrypted and handled with care.",
	},
];

export default function ValuesSection() {
	return (
		<section className="bg-black px-6 py-24 md:py-32">
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
					{/* Left - Header */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					>
						<div className="mb-6 flex items-center gap-4">
							<div className="h-[2px] w-10 bg-white" />
							<p className="text-xs font-bold uppercase tracking-[0.4em] text-white">
								Our Values
							</p>
						</div>
						<h2 className="mb-6 font-black text-3xl uppercase tracking-tighter text-white sm:text-4xl md:text-5xl">
							What we stand for
						</h2>
						<p className="text-lg leading-relaxed text-white/70 md:text-xl">
							These aren't just words on a wall. They guide every decision we
							make, every feature we ship, and every conversation we have with
							our customers.
						</p>
					</motion.div>

					{/* Right - Values Grid */}
					<div className="lg:col-span-2 grid sm:grid-cols-2">
						{values.map((value, index) => {
							const IconComponent = value.icon;
							return (
								<motion.div
									key={value.title}
									initial={{ opacity: 0, y: 40 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{
										duration: 0.6,
										delay: index * 0.1,
										ease: SMOOTH_EASE,
									}}
									className="p-8 border border-black/20 bg-white transition-all duration-300 hover:bg-white/90"
								>
									<div className="mb-4 flex h-12 w-12 items-center justify-center border border-black/30 text-black">
										<IconComponent className="h-5 w-5" />
									</div>
									<h3 className="mb-3 font-bold text-lg text-black">
										{value.title}
									</h3>
									<p className="text-base text-black/70 md:text-lg">{value.description}</p>
								</motion.div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
