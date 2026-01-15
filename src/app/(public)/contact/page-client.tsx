"use client";

import { motion } from "framer-motion";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const contactMethods = [
	{
		icon: MessageCircle,
		label: "WhatsApp",
		value: "+60 17-726 8130",
		href: "https://wa.me/60177268130",
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
		value: "+60 17-726 8130",
		href: "tel:+60177268130",
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
			<section className="bg-white-background px-6 py-12 md:py-20 border border-black">
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

			{/* Location Section */}
			<section className="border border-black bg-green-background px-6 py-16 md:py-24">
				<div className="mx-auto max-w-7xl">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
						className="mb-8"
					>
						<div className="mb-4 flex items-center gap-4">
							<div className="h-[2px] w-10 bg-black" />
							<p className="font-bold text-black text-xs uppercase tracking-[0.4em]">
								Find Us
							</p>
						</div>
						<h2 className="font-black text-3xl text-black uppercase tracking-tighter md:text-4xl">
							Our Location
						</h2>
						<p className="mt-4 max-w-xl text-base text-black/50 leading-relaxed md:text-lg">
							Lot 9, 1st Floor, Blok B, Damai Plaza Phase 4, Jalan Pokok Kayu
							Manis 2, 88200 Kota Kinabalu, Sabah (Above Aroma Italy Restaurant)
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2, ease: SMOOTH_EASE }}
						className="relative aspect-[4/3] w-full overflow-hidden border border-2 border-black md:aspect-[21/9] md:min-h-[500px]"
					>
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3968.2301173092237!2d116.08780927599177!3d5.963007229420742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x323b69190b59313b%3A0x3af9da7fef01d207!2sAroma%20Italy%20%40Kimbins!5e0!3m2!1sen!2smy!4v1767763606188!5m2!1sen!2smy"
							width="100%"
							height="100%"
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
							title="EventzFlow Office Location"
							className="absolute inset-0"
						/>
					</motion.div>
				</div>
			</section>
		</main>
	);
}
