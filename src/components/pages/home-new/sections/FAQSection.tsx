"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";

const faqs = [
	{
		question: "HOW QUICKLY CAN WE GET STARTED WITH EVENTZFLOW?",
		answer:
			"You can launch your first event in as little as 3-5 days. Our team handles data import, branded microsite setup, and WhatsApp automation configuration. Most teams go live with a fully operational system within a week.",
	},
	{
		question: "HOW DOES THE QR CHECK-IN AND BADGE PRINTING WORK?",
		answer:
			"Attendees receive a unique QR code via email or WhatsApp. At the venue, staff scan the code and instantly print a personalized badge in under 3 seconds. Our system includes duplicate detection and real-time capacity monitoring.",
	},
	{
		question: "CAN WE TRACK WHICH BOOTHS ATTENDEES VISIT DURING THE EVENT?",
		answer:
			"Absolutely. EventzFlow provides booth heat maps, dwell time analytics, and visitor tracking. You'll see which booths get the most traffic, how long attendees stay, and can generate automated follow-ups based on their interests.",
	},
	{
		question:
			"DOES EVENTZFLOW INTEGRATE WITH OUR EXISTING CRM OR MARKETING TOOLS?",
		answer:
			"Yes. We offer native integrations with HubSpot, Salesforce, Mailchimp, Stripe, and WhatsApp Business API. For custom systems, our REST API and webhooks ensure seamless data sync across all your platforms.",
	},
	{
		question: "HOW DO YOU HANDLE DATA SECURITY AND COMPLIANCE?",
		answer:
			"EventzFlow runs on SOC 2-ready infrastructure with encryption at rest and in transit. We follow GDPR and PDPA guidelines, offer regional data residency, provide audit logs, and can sign enterprise-grade Data Processing Agreements (DPAs).",
	},
	{
		question: "WHAT KIND OF ANALYTICS AND REPORTS DO YOU PROVIDE?",
		answer:
			"EventzFlow provides real-time dashboards with check-in velocity, booth heat maps, attendance trends, engagement scores, and post-event exports. All data can be exported to Excel or integrated directly into your BI tools via API.",
	},
	{
		question:
			"CAN MULTIPLE TEAM MEMBERS MANAGE THE EVENT WITH DIFFERENT PERMISSIONS?",
		answer:
			"Absolutely. EventzFlow includes granular role-based access control. You can assign staff to specific events, gates, or tasks with custom permissions—ensuring each team member sees only what they need.",
	},
	{
		question: "WHAT SIZE EVENTS DOES EVENTZFLOW SUPPORT?",
		answer:
			"EventzFlow scales from intimate corporate gatherings of 50 people to large-scale conferences and trade shows with 10,000+ attendees. Our infrastructure is built to handle high-volume check-ins and real-time tracking at any scale.",
	},
];

const FAQSection: React.FC = () => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggleFAQ = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section id="faq" className="bg-black px-6 py-16 md:py-30 md:px-12">
			<div className="mx-auto max-w-7xl">
				<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
					{/* Left Side - Title */}
					<div className="lg:col-span-4">
						<div className="lg:sticky lg:top-40">
							<h2 className="font-black text-4xl tracking-tighter text-white sm:text-5xl md:text-7xl">
								COMMON
								<br />
								QUESTIONS.
							</h2>
							<div className="my-4 h-1 w-12 bg-white/20 md:my-6" />
							<p className="text-sm leading-relaxed text-white/50">
								Everything you need to know about EventzFlow. Can't find your
								answer? Reach out to our team.
							</p>
						</div>
					</div>

					{/* Right Side - FAQ Items */}
					<div className="lg:col-span-8">
						{faqs.map((faq, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{
									duration: 0.5,
									delay: i * 0.05,
									ease: [0.16, 1, 0.3, 1],
								}}
								className={`border border-white/10 ${openIndex === i ? "border-white" : "border-b border-white/10"}`}
							>
								<button
									type="button"
									onClick={() => toggleFAQ(i)}
									aria-expanded={openIndex === i}
									aria-controls={`faq-answer-${i}`}
									className="group flex w-full items-start justify-between gap-8 px-6 py-8 text-left transition-colors hover:bg-white/5"
								>
									<div className="flex items-start gap-6">
										<span className="font-bold text-sm text-white/30">
											0{i + 1}
										</span>
										<h3 id={`faq-question-${i}`} className="font-bold text-lg leading-tight tracking-tight text-white md:text-xl">
											{faq.question}
										</h3>
									</div>
									<div className="mt-1 flex-shrink-0 text-white/50 transition-colors group-hover:text-white">
										{openIndex === i ? (
											<Minus className="h-5 w-5" />
										) : (
											<Plus className="h-5 w-5" />
										)}
									</div>
								</button>
								<AnimatePresence>
									{openIndex === i && (
										<motion.div
											id={`faq-answer-${i}`}
											role="region"
											aria-labelledby={`faq-question-${i}`}
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
											className="overflow-hidden"
										>
											<div className="bg-white px-6 py-6">
												<p className="text-justify text-black/70">
													{faq.answer}
												</p>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default FAQSection;
