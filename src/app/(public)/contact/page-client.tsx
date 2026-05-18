"use client";

import { motion } from "framer-motion";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const contactMethods = [
	{
		icon: MessageCircle,
		label: "WhatsApp",
		value: "+60 16-623 6511",
		href: "https://wa.me/60166236511",
		description: "Chat with us directly",
	},
	{
		icon: Mail,
		label: "Email",
		value: "info@eventzflow.com",
		href: "mailto:info@eventzflow.com",
		description: "Send us a message",
	},
	{
		icon: Phone,
		label: "Phone",
		value: "+60 16-623 6511",
		href: "tel:+60166236511",
		description: "Give us a call",
	},
	{
		icon: MapPin,
		label: "Office",
		value: "Kota Kinabalu, Sabah",
		href: "https://maps.google.com/?q=Kota+Kinabalu+Sabah",
		description: "Visit our office",
	},
	{
		icon: Clock,
		label: "Office Hours",
		value: "8AM - 5PM",
		href: null,
		description: "Monday to Friday",
	},
];

const steps = [
	{
		number: "01",
		title: "Connect",
		description:
			"Reach out via WhatsApp or Email. Our team typically responds within 30 minutes during business hours.",
	},
	{
		number: "02",
		title: "Consult",
		description:
			"We'll have a quick 10-minute chat to understand your event's scale, attendee count, and specific requirements.",
	},
	{
		number: "03",
		title: "Go Live",
		description:
			"We'll set up your personalized event environment and help you go live with confidence.",
	},
];

export default function ContactPageClient() {
	return (
		<main>
			{/* Hero Section */}
			<section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-24">
				{/* Left vertical accent line */}
				<motion.div
					initial={{ scaleY: 0 }}
					animate={{ scaleY: 1 }}
					transition={{ duration: 1.5, ease: SMOOTH_EASE }}
					className="absolute top-0 left-6 hidden h-[70%] w-[2px] origin-top bg-white md:left-12 md:block lg:left-16"
				/>

				{/* Content */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					className="text-center"
				>
					<p className="mb-4 font-medium text-base text-white/60 uppercase tracking-[0.3em]">
						Get In Touch
					</p>
					<h1 className="font-black text-4xl text-white uppercase tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
						Contact Us
					</h1>
				</motion.div>
			</section>

			{/* Contact Methods Section */}
			<section className="border border-black bg-white-background px-6 py-12 md:py-20">
				<div className="mx-auto max-w-7xl">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
						className="mb-16 max-w-2xl"
					>
						<div className="mb-6 flex items-center gap-4">
							<div className="h-[2px] w-10 bg-black" />
							<p className="font-bold text-black text-xs uppercase tracking-[0.4em]">
								Reach Out
							</p>
						</div>
						<h2 className="mb-6 font-black text-3xl text-black uppercase tracking-tighter sm:text-4xl md:text-5xl">
							Let's talk about your event
						</h2>
						<p className="text-base text-black/60 leading-relaxed md:text-lg">
							Whether you're planning your first event or managing hundreds,
							we'd love to hear from you. No pressure, no sales pitch — just
							real conversation.
						</p>
					</motion.div>

					{/* Contact - Neubrutalist / Hard-Edge Style */}
					<div className="flex flex-wrap justify-center gap-4 md:gap-6">
						{contactMethods.map((method, index) => {
							const IconComponent = method.icon;
							const CardWrapper = method.href ? motion.a : motion.div;
							const linkProps = method.href
								? {
										href: method.href,
										target: method.href.startsWith("http")
											? "_blank"
											: undefined,
										rel: method.href.startsWith("http")
											? "noopener noreferrer"
											: undefined,
									}
								: {};

							// Make the first two items (WhatsApp/Email) larger
							const isLarge = index < 2;

							return (
								<CardWrapper
									key={method.label}
									{...linkProps}
									initial={{ opacity: 0, scale: 0.9 }}
									whileInView={{
										opacity: 1,
										scale: 1,
										transition: { duration: 0.4, delay: index * 0.1 },
									}}
									viewport={{ once: true }}
									whileHover={{
										x: -4,
										y: -4,
										boxShadow: "8px 8px 0px 0px #000",
										transition: { duration: 0.2, ease: "easeOut" },
									}}
									className={`relative flex flex-col justify-between border-2 border-black bg-white p-6 md:p-8 ${
										isLarge
											? "w-full md:w-[calc(50%-12px)]"
											: "w-full md:w-[calc(33.33%-16px)]"
									}`}
								>
									<div className="mb-6 flex items-start justify-between md:mb-8">
										<div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-brand-green text-black transition-transform duration-300 group-hover:rotate-12 md:h-12 md:w-12">
											<IconComponent className="h-5 w-5 md:h-6 md:w-6" />
										</div>
									</div>

									<div>
										<h3 className="mb-2 font-black text-2xl text-black uppercase tracking-tighter md:text-3xl">
											{method.label}
										</h3>
										<p className="mb-4 font-medium text-black/60 text-sm">
											{method.description}
										</p>
										<div className="w-full border-black/10 border-b-2" />
										<p className="mt-4 font-bold text-black text-lg">
											{method.value}
										</p>
									</div>
								</CardWrapper>
							);
						})}
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.4, ease: SMOOTH_EASE }}
						className="mt-16 flex flex-wrap items-center justify-center gap-6 text-base text-black/50 md:gap-8"
					>
						<span className="flex items-center gap-2">
							<span className="text-black">✓</span> Real humans respond
						</span>
						<span className="hidden h-1 w-1 rounded-full bg-black/30 md:block" />
						<span className="flex items-center gap-2">
							<span className="text-black">✓</span> No pushy sales tactics
						</span>
						<span className="hidden h-1 w-1 rounded-full bg-black/30 md:block" />
						<span className="flex items-center gap-2">
							<span className="text-black">✓</span> Quick & friendly replies
						</span>
					</motion.div>
				</div>
			</section>

			{/* What Happens Next Section */}
			<section className="border border-black bg-green-background px-6 py-16 md:py-24">
				<div className="mx-auto max-w-7xl">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
						className="mb-16"
					>
						<div className="mb-4 flex items-center gap-4">
							<div className="h-[2px] w-10 bg-black" />
							<p className="font-bold text-black text-xs uppercase tracking-[0.4em]">
								The Process
							</p>
						</div>
						<h2 className="font-black text-3xl text-black uppercase tracking-tighter md:text-4xl">
							What Happens Next?
						</h2>
					</motion.div>

					<div className="grid gap-8 md:grid-cols-3">
						{steps.map((step, index) => (
							<motion.div
								key={step.number}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								className="group relative border-2 border-black bg-white p-8 transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000]"
							>
								<span className="mb-6 block font-black text-5xl text-black/10 transition-colors group-hover:text-brand-green/30">
									{step.number}
								</span>
								<h3 className="mb-4 font-black text-2xl text-black uppercase tracking-tighter">
									{step.title}
								</h3>
								<p className="text-base text-black/60 leading-relaxed">
									{step.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
