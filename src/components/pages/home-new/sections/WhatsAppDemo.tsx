"use client";

import { motion } from "framer-motion";
import type React from "react";
import WhatsAppSalesDemo from "@/components/devices/screen/WhatsAppSalesDemo";

const WhatsAppDemo: React.FC = () => {
	return (
		<section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
			<div className="container mx-auto max-w-7xl">
				<div className="grid items-center gap-12 lg:grid-cols-2">
					{/* Content Side */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						<p className="mb-4 font-medium text-green-600 text-sm uppercase tracking-wider">
							WHATSAPP AUTOMATION
						</p>
						<h2 className="mb-6 font-bold text-3xl text-foreground sm:text-4xl lg:text-5xl">
							Registration Through
							<br />
							<span className="text-green-600">WhatsApp Automation</span>
						</h2>
						<p className="mb-8 text-lg text-muted-foreground leading-relaxed">
							Experience how our WhatsApp registration automation handles ticket
							sales and attendee check-in seamlessly. Automated conversations in
							7+ languages with instant payment processing.
						</p>

						{/* Benefits */}
						<div className="space-y-4">
							{[
								{
									title: "24/7 Automated Sales",
									desc: "Handle ticket sales around the clock with automated WhatsApp flows",
								},
								{
									title: "Instant Ticket Delivery",
									desc: "QR code tickets delivered immediately after successful payment",
								},
								{
									title: "Multi-Language Support",
									desc: "Serve global audiences with intelligent language detection",
								},
							].map((benefit) => (
								<div key={benefit.title} className="flex gap-4">
									<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
										<svg
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
									<div>
										<h4 className="font-semibold text-foreground">
											{benefit.title}
										</h4>
										<p className="text-muted-foreground text-sm">
											{benefit.desc}
										</p>
									</div>
								</div>
							))}
						</div>
					</motion.div>

					{/* Demo Side */}
					<motion.div
						className="flex justify-center"
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<div className="relative">
							{/* Simple shadow */}
							<div className="-bottom-8 -translate-x-1/2 absolute left-1/2 h-8 w-3/4 rounded-full bg-black/20 blur-2xl" />
							<WhatsAppSalesDemo />
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default WhatsAppDemo;
