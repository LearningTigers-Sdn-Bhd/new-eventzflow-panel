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
		question: "CAN WE TRACK BOOTH INFORMATION AND EXHIBITOR DETAILS?",
		answer:
			"Yes. EventzFlow allows you to manage booth assignments, track exhibitor information, and monitor voucher redemptions at each booth. You can access detailed analytics on exhibitor engagement and generate reports for post-event follow-ups.",
	},
	{
		question:
			"CAN EVENTZFLOW CONNECT WITH OUR EXISTING SYSTEMS?",
		answer:
			"Yes. EventzFlow provides API access and webhook notifications that allow your technical team to integrate event data with your existing systems. This enables automatic data syncing between EventzFlow and your other business tools.",
	},
	{
		question: "IS OUR EVENT DATA SECURE?",
		answer:
			"Yes. EventzFlow is built with security as a priority. Your data is protected with industry-standard encryption, and we follow best practices to keep your attendee information safe and private.",
	},
	{
		question: "WHAT KIND OF ANALYTICS AND REPORTS DO YOU PROVIDE?",
		answer:
			"EventzFlow provides real-time dashboards showing check-in activity, attendance trends, voucher redemptions, and exhibitor engagement. You can export all data to Excel or connect it to your reporting tools for deeper analysis.",
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
		<section id="faq" className="bg-white-background px-6 py-16 md:py-30 md:px-12 border border-black">
			<div className="mx-auto max-w-7xl">
				<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
					{/* Left Side - Title */}
					<div className="lg:col-span-4">
						<div className="lg:sticky lg:top-40">
							<h2 className="font-black text-4xl tracking-tighter text-black sm:text-5xl md:text-7xl">
								COMMON
								<br />
								QUESTIONS.
							</h2>
							<div className="my-4 h-1 w-12 bg-brand-green md:my-6" />
							<p className="text-lg leading-relaxed text-black/70 md:text-xl">
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
								className="border-2 border-black/30 hover:border-black transition-all duration-200"
							>
								<button
									type="button"
									onClick={() => toggleFAQ(i)}
									aria-expanded={openIndex === i}
									aria-controls={`faq-answer-${i}`}
									className="group flex w-full items-start justify-between gap-8 bg-white/60 backdrop-blur-sm px-6 py-8 text-left transition-all duration-200 hover:bg-white/80 border-b-2 border-black/30 hover:border-black"
								>
									<div className="flex items-start gap-6">
										<span className="font-bold text-sm text-brand-green">
											0{i + 1}
										</span>
										<h3
											id={`faq-question-${i}`}
											className="font-bold text-lg leading-tight tracking-tight text-black md:text-xl"
										>
											{faq.question}
										</h3>
									</div>
									<div className="mt-1 flex-shrink-0 text-black/40 transition-colors group-hover:text-black">
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
												<p className="text-left text-base leading-relaxed text-black/70 md:text-lg">
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
