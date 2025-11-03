"use client";

import type React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, HelpCircle } from "lucide-react";

type FaqItem = {
	question: string;
	answer: string;
};

const faqs: FaqItem[] = [
	{
		question: "How quickly can we get started with EventzFlow?",
		answer:
			"You can launch your first event in as little as 3-5 days. Our team handles data import, branded microsite setup, and WhatsApp automation configuration. Most teams go live with a fully operational system within a week.",
	},
	{
		question: "Does EventzFlow work for both virtual and in-person events?",
		answer:
			"Yes. EventzFlow supports hybrid, virtual, and fully on-ground events. Whether it's a trade show, conference, corporate summit, or government event, our platform adapts to your format with unified dashboards and real-time control.",
	},
	{
		question: "How does the QR check-in and badge printing work?",
		answer:
			"Attendees receive a unique QR code via email or WhatsApp. At the venue, staff scan the code and instantly print a personalized badge in under 3 seconds. Our system includes duplicate detection and real-time capacity monitoring.",
	},
	{
		question: "Can we track which booths attendees visit during the event?",
		answer:
			"Absolutely. EventzFlow provides booth heat maps, dwell time analytics, and visitor tracking. You'll see which booths get the most traffic, how long attendees stay, and can generate automated follow-ups based on their interests.",
	},
	{
		question: "What is AI-powered retargeting and how does it help?",
		answer:
			"Our AI analyzes attendee behavior—booth visits, session attendance, dwell time—and automatically segments them into audiences. You can then send targeted WhatsApp messages, emails, or push notifications with relevant content or offers.",
	},
	{
		question: "Does EventzFlow integrate with our existing CRM or marketing tools?",
		answer:
			"Yes. We offer native integrations with HubSpot, Salesforce, Mailchimp, Stripe, and WhatsApp Business API. For custom systems, our REST API and webhooks ensure seamless data sync across all your platforms.",
	},
	{
		question: "How do you handle data security and compliance?",
		answer:
			"EventzFlow runs on SOC 2-ready infrastructure with encryption at rest and in transit. We follow GDPR and PDPA guidelines, offer regional data residency, provide audit logs, and can sign enterprise-grade Data Processing Agreements (DPAs).",
	},
	{
		question: "Can we customize registration forms and ticket types?",
		answer:
			"Yes. You can create unlimited custom fields, multi-tier ticket types with add-ons, early bird pricing, group discounts, promo codes, and collect attendee-specific data like dietary preferences or session choices.",
	},
	{
		question: "What kind of analytics and reports do you provide?",
		answer:
			"EventzFlow provides real-time dashboards with check-in velocity, booth heat maps, attendance trends, engagement scores, and post-event exports. All data can be exported to Excel or integrated directly into your BI tools via API.",
	},
	{
		question: "Can multiple team members manage the event with different permissions?",
		answer:
			"Absolutely. EventzFlow includes granular role-based access control. You can assign staff to specific events, gates, or tasks with custom permissions—ensuring each team member sees only what they need.",
	},
	{
		question: "What happens if attendees lose their QR code or confirmation email?",
		answer:
			"No problem. We offer self-service kiosks where attendees can look up their registration using email or phone number. Staff can also search and manually check in attendees from the dashboard in seconds.",
	},
	{
		question: "What size events does EventzFlow support?",
		answer:
			"EventzFlow scales from intimate corporate gatherings of 50 people to large-scale conferences and trade shows with 10,000+ attendees. Our infrastructure is built to handle high-volume check-ins and real-time tracking at any scale.",
	},
	{
		question: "Can we white-label the platform with our branding?",
		answer:
			"Yes. EventzFlow allows full white-labeling of registration pages, email templates, WhatsApp messages, and attendee-facing microsites. Everything can match your brand colors, logos, and tone of voice.",
	},
];

const FAQSection: React.FC = () => {
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

	const handleToggle = (index: number) => {
		setExpandedIndex((prev) => (prev === index ? null : index));
	};

	return (
		<section id="faq" className="relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-muted/20 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
			{/* Decorative background elements */}
			<div className="pointer-events-none absolute left-0 top-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
			<div className="pointer-events-none absolute bottom-20 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
			
			<div className="relative mx-auto max-w-4xl">
				{/* Header */}
				<div className="mb-8 text-center sm:mb-12">
					<motion.span
						className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-foreground sm:px-4 sm:py-2 sm:text-xs"
						initial={{ opacity: 0, y: 12 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.4 }}
					>
						<HelpCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
						FAQ
					</motion.span>
					<motion.h2
						className="mt-3 text-2xl font-semibold text-foreground sm:mt-4 sm:text-3xl lg:text-4xl"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.05 }}
					>
						Frequently Asked Questions
					</motion.h2>
					<motion.p
						className="mx-auto mt-3 max-w-2xl px-2 text-sm text-muted-foreground sm:mt-4 sm:text-base"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.08 }}
					>
						Everything you need to know about EventzFlow. Can&apos;t find what
						you&apos;re looking for? Contact our team.
					</motion.p>
				</div>

				{/* FAQ List */}
				<div className="space-y-2.5 sm:space-y-3">
					{faqs.map((faq, index) => {
						const isExpanded = expandedIndex === index;

						return (
							<motion.div
								key={faq.question}
								className="group overflow-hidden rounded-lg border border-border bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 sm:rounded-xl"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{ duration: 0.4, delay: index * 0.03 }}
							>
								<button
									type="button"
									onClick={() => handleToggle(index)}
									className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 sm:gap-4 sm:px-5 sm:py-4 lg:px-6 lg:py-5"
								>
									<h3 className="flex-1 text-xs font-semibold text-foreground sm:text-sm lg:text-base">
										{faq.question}
									</h3>
									<div
										className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 sm:h-6 sm:w-6 ${
											isExpanded
												? "rotate-45 bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground"
										}`}
									>
										<Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
									</div>
								</button>

								<AnimatePresence initial={false}>
									{isExpanded && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.3, ease: "easeInOut" }}
										>
											<div className="border-t border-border/50 bg-muted/20 px-4 pb-4 pt-3 text-xs leading-relaxed text-muted-foreground sm:px-5 sm:pb-5 sm:text-sm lg:px-6 lg:pb-6 lg:pt-4 lg:text-base">
												{faq.answer}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default FAQSection;
