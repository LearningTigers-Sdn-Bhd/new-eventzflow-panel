"use client";

import { motion } from "framer-motion";
import {
	AlertTriangle,
	CreditCard,
	FileText,
	Globe,
	type LucideIcon,
	Phone,
	Scale,
	Shield,
	UserCheck,
	Users,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { SMOOTH_EASE } from "@/lib/constants/animation";

interface PolicySectionProps {
	id: string;
	sectionNumber: number;
	title: string;
	icon: LucideIcon;
	children: ReactNode;
	isBlack?: boolean;
}

function PolicySection({
	id,
	sectionNumber,
	title,
	icon: Icon,
	children,
	isBlack = false,
}: PolicySectionProps) {
	return (
		<motion.section
			id={id}
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6, ease: SMOOTH_EASE }}
			className={`scroll-mt-24 border p-8 md:p-10 ${
				isBlack
					? "border-white/20 bg-black"
					: "border-black/10 bg-white"
			}`}
		>
			<div className={`mb-6 flex items-start gap-4 border-b pb-6 ${
				isBlack ? "border-white/10" : "border-black/10"
			}`}>
				<div
					className={`flex h-12 w-12 flex-shrink-0 items-center justify-center border ${
						isBlack
							? "border-white/30 text-white"
							: "border-black/30 text-black"
					}`}
				>
					<Icon className="h-5 w-5" />
				</div>
				<div className="flex-1 pt-1">
					<p className={`mb-1 text-xs font-bold uppercase tracking-[0.2em] ${
						isBlack ? "text-white/40" : "text-black/40"
					}`}>
						Section {sectionNumber}
					</p>
					<h2 className={`font-bold text-xl md:text-2xl ${
						isBlack ? "text-white" : "text-black"
					}`}>
						{title}
					</h2>
				</div>
			</div>
			<div className="space-y-4">{children}</div>
		</motion.section>
	);
}

export default function TermsAndConditionsPageClient() {
	return (
		<main>
			{/* Hero Section */}
			<section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-24">
				{/* Left vertical accent line */}
				<motion.div
					initial={{ scaleY: 0 }}
					animate={{ scaleY: 1 }}
					transition={{ duration: 1.5, ease: SMOOTH_EASE }}
					className="absolute left-6 top-0 hidden h-[70%] w-[2px] origin-top bg-white md:left-12 md:block lg:left-16"
				/>

				{/* Content */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					className="text-center max-w-4xl"
				>
					<p className="mb-4 text-base font-medium uppercase tracking-[0.3em] text-white/60">
						Legal
					</p>
					<h1 className="font-black text-4xl uppercase tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl">
						Terms & Conditions
					</h1>
					<p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
						Please read these terms and conditions carefully before using our services. By accessing or using EventzFlow, you agree to be bound by these terms.
					</p>
					<p className="mt-6 text-sm text-white/40">
						Last Updated:{" "}
						{new Date().toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
				</motion.div>
			</section>

			{/* Introduction Section */}
			<section className="bg-white px-6 py-16 md:py-24">
				<div className="mx-auto max-w-5xl">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
						className="text-center"
					>
						<p className="text-base leading-relaxed text-black/60 md:text-lg max-w-3xl mx-auto">
							These Terms and Conditions constitute a legally binding agreement between you and{" "}
							<strong className="text-black">EventzFlow</strong> governing your access to and use of our event management platform, website, mobile applications, and related services.
						</p>
						<div className="mt-8 inline-flex items-center gap-3 border border-black/20 bg-black/5 px-6 py-4 text-left">
							<AlertTriangle className="h-5 w-5 flex-shrink-0 text-black" />
							<p className="text-base text-black/70">
								We reserve the right to modify these Terms at any time. Your continued use of the Services following any modifications constitutes your acceptance of the revised Terms.
							</p>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Terms Sections */}
			<section className="bg-white px-6 pb-24">
				<div className="mx-auto max-w-5xl space-y-6">
					{/* Section 1: Eligibility and Account Registration */}
					<PolicySection
						id="eligibility"
						sectionNumber={1}
						title="Eligibility and Account Registration"
						icon={UserCheck}
					>
						<div className="space-y-6 text-black/70 text-base md:text-lg">
							<div>
								<h3 className="mb-3 font-bold text-base text-black md:text-lg">
									1.1 Eligibility
								</h3>
								<p className="leading-relaxed">
									You must be at least 18 years of age and have the legal capacity to enter into binding contracts to use our Services. If you are using the Services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
								</p>
							</div>

							<div>
								<h3 className="mb-3 font-bold text-base text-black md:text-lg">
									1.2 Account Registration
								</h3>
								<p className="mb-4 leading-relaxed">
									When registering, you agree to:
								</p>
								<ul className="space-y-2">
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Provide accurate, current, and complete information</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Maintain and promptly update your account information</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Maintain the security and confidentiality of your password</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Accept responsibility for all activities under your account</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Immediately notify us of any unauthorized use</span>
									</li>
								</ul>
							</div>
						</div>
					</PolicySection>

					{/* Section 2: Services Description */}
					<PolicySection
						id="services"
						sectionNumber={2}
						title="Services Description"
						icon={Globe}
						isBlack
					>
						<div className="text-white/70 text-base md:text-lg">
							<p className="mb-4 leading-relaxed">
								EventzFlow provides an event management platform that enables users to:
							</p>
							<ul className="space-y-2">
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Create, manage, and organize events</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Issue and manage tickets and registrations</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Process check-ins and attendee tracking</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Generate analytics and reports</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Manage event staff and team members</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Access API integrations and developer tools</span>
								</li>
							</ul>
							<p className="mt-4 leading-relaxed">
								We reserve the right to modify, suspend, or discontinue any aspect of the Services at any time without prior notice.
							</p>
						</div>
					</PolicySection>

					{/* Section 3: User Obligations */}
					<PolicySection
						id="obligations"
						sectionNumber={3}
						title="User Obligations and Prohibited Conduct"
						icon={Shield}
					>
						<div className="space-y-6 text-black/70 text-base md:text-lg">
							<div>
								<h3 className="mb-3 font-bold text-base text-black md:text-lg">
									3.1 Acceptable Use
								</h3>
								<p className="mb-4 leading-relaxed">
									You agree to use the Services only for lawful purposes. You agree NOT to:
								</p>
								<ul className="space-y-2">
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Use the Services in any way that violates applicable laws</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Impersonate any person or entity</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Upload or transmit viruses, malware, or malicious code</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Attempt to gain unauthorized access to the Services</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Use automated systems without our express permission</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Engage in fraudulent or deceptive practices</span>
									</li>
								</ul>
							</div>

							<div>
								<h3 className="mb-3 font-bold text-base text-black md:text-lg">
									3.2 Content Standards
								</h3>
								<p className="mb-4 leading-relaxed">
									Any content you upload must not:
								</p>
								<ul className="space-y-2">
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Contain defamatory, obscene, or offensive material</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Infringe intellectual property or privacy rights</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Contain unsolicited promotions or spam</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span>Promote discrimination, violence, or illegal activities</span>
									</li>
								</ul>
							</div>
						</div>
					</PolicySection>

					{/* Section 4: Intellectual Property */}
					<PolicySection
						id="intellectual-property"
						sectionNumber={4}
						title="Intellectual Property Rights"
						icon={FileText}
						isBlack
					>
						<div className="space-y-6 text-white/70 text-base md:text-lg">
							<div>
								<h3 className="mb-3 font-bold text-base text-white md:text-lg">
									4.1 Our Intellectual Property
								</h3>
								<p className="leading-relaxed">
									The Services, including all content, features, functionality, software, code, design, graphics, logos, and trademarks, are owned by EventzFlow or its licensors and are protected by international copyright, trademark, patent, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Services.
								</p>
							</div>

							<div>
								<h3 className="mb-3 font-bold text-base text-white md:text-lg">
									4.2 User Content
								</h3>
								<p className="leading-relaxed">
									You retain ownership of any content you submit through the Services. By submitting content, you grant EventzFlow a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content solely for providing and improving the Services.
								</p>
							</div>
						</div>
					</PolicySection>

					{/* Section 5: Payment Terms */}
					<PolicySection
						id="payment"
						sectionNumber={5}
						title="Payment Terms and Billing"
						icon={CreditCard}
					>
						<div className="space-y-6 text-black/70 text-base md:text-lg">
							<div>
								<h3 className="mb-3 font-bold text-base text-black md:text-lg">
									5.1 Fees and Charges
								</h3>
								<p className="leading-relaxed">
									Certain features of the Services may require payment of fees. You agree to pay all applicable fees as described in your selected pricing plan. All fees are non-refundable unless otherwise stated.
								</p>
							</div>

							<div>
								<h3 className="mb-3 font-bold text-base text-black md:text-lg">
									5.2 Subscription and Billing
								</h3>
								<p className="leading-relaxed">
									If you subscribe to a paid plan, you authorize us to charge your payment method on a recurring basis. Subscriptions automatically renew unless cancelled before the renewal date. We reserve the right to modify pricing with 30 days' notice.
								</p>
							</div>

							<div>
								<h3 className="mb-3 font-bold text-base text-black md:text-lg">
									5.3 Taxes
								</h3>
								<p className="leading-relaxed">
									All fees are exclusive of applicable taxes, duties, or similar governmental charges. You are responsible for paying all such taxes or charges.
								</p>
							</div>
						</div>
					</PolicySection>

					{/* Section 6: Cancellation and Termination */}
					<PolicySection
						id="termination"
						sectionNumber={6}
						title="Cancellation and Termination"
						icon={XCircle}
						isBlack
					>
						<div className="space-y-6 text-white/70 text-base md:text-lg">
							<div>
								<h3 className="mb-3 font-bold text-base text-white md:text-lg">
									6.1 Cancellation by User
								</h3>
								<p className="leading-relaxed">
									You may cancel your subscription or close your account at any time through your account settings. Cancellation will take effect at the end of your current billing period.
								</p>
							</div>

							<div>
								<h3 className="mb-3 font-bold text-base text-white md:text-lg">
									6.2 Termination by EventzFlow
								</h3>
								<p className="mb-4 leading-relaxed">
									We reserve the right to suspend or terminate your access to the Services immediately for:
								</p>
								<ul className="space-y-2">
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
										<span>Violation of these Terms</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
										<span>Fraudulent or illegal activity</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
										<span>Non-payment of fees</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
										<span>Actions that may cause harm to the Services or other users</span>
									</li>
								</ul>
							</div>

							<div>
								<h3 className="mb-3 font-bold text-base text-white md:text-lg">
									6.3 Effect of Termination
								</h3>
								<p className="leading-relaxed">
									Upon termination, your right to access the Services will immediately cease. We may delete your account and all associated data.
								</p>
							</div>
						</div>
					</PolicySection>

					{/* Section 7: Disclaimers */}
					<PolicySection
						id="disclaimers"
						sectionNumber={7}
						title="Disclaimers and Warranties"
						icon={AlertTriangle}
					>
						<div className="text-black/70 text-base md:text-lg">
							<p className="mb-4 leading-relaxed uppercase font-bold text-black">
								THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND.
							</p>
							<p className="mb-4 leading-relaxed">
								EventzFlow does not warrant that:
							</p>
							<ul className="space-y-2">
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span>The Services will function uninterrupted, timely, secure, or error-free</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span>The results obtained from using the Services will be accurate or reliable</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span>Any errors in the Services will be corrected</span>
								</li>
							</ul>
							<p className="mt-4 leading-relaxed">
								Your use of the Services is at your sole risk.
							</p>
						</div>
					</PolicySection>

					{/* Section 8: Limitation of Liability */}
					<PolicySection
						id="liability"
						sectionNumber={8}
						title="Limitation of Liability"
						icon={Shield}
						isBlack
					>
						<div className="text-white/70 text-base md:text-lg">
							<p className="mb-4 leading-relaxed">
								TO THE MAXIMUM EXTENT PERMITTED BY LAW, EVENTZFLOW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING:
							</p>
							<ul className="space-y-2">
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Loss of profits, revenue, data, or use</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Business interruption</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Loss of goodwill or reputation</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Cost of procurement of substitute services</span>
								</li>
							</ul>
							<p className="mt-4 leading-relaxed">
								Our total liability shall not exceed the amount you paid to us in the twelve (12) months preceding the claim, or one hundred dollars ($100), whichever is greater.
							</p>
						</div>
					</PolicySection>

					{/* Section 9: Indemnification */}
					<PolicySection
						id="indemnification"
						sectionNumber={9}
						title="Indemnification"
						icon={Shield}
					>
						<div className="text-black/70 text-base md:text-lg">
							<p className="mb-4 leading-relaxed">
								You agree to defend, indemnify, and hold harmless EventzFlow from and against any claims, liabilities, damages, losses, costs, or expenses arising out of:
							</p>
							<ul className="space-y-2">
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span>Your violation of these Terms</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span>Your use or misuse of the Services</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span>Your User Content</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span>Your violation of any rights of another party</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span>Your violation of any applicable laws or regulations</span>
								</li>
							</ul>
						</div>
					</PolicySection>

					{/* Section 10: Dispute Resolution */}
					<PolicySection
						id="dispute-resolution"
						sectionNumber={10}
						title="Dispute Resolution and Governing Law"
						icon={Scale}
						isBlack
					>
						<div className="space-y-6 text-white/70 text-base md:text-lg">
							<div>
								<h3 className="mb-3 font-bold text-base text-white md:text-lg">
									10.1 Governing Law
								</h3>
								<p className="leading-relaxed">
									These Terms shall be governed by and construed in accordance with the laws of Malaysia.
								</p>
							</div>

							<div>
								<h3 className="mb-3 font-bold text-base text-white md:text-lg">
									10.2 Dispute Resolution
								</h3>
								<p className="leading-relaxed">
									In the event of any dispute, the parties agree to first attempt to resolve the matter through good-faith negotiations. If the dispute cannot be resolved within 30 days, either party may initiate mediation or arbitration proceedings.
								</p>
							</div>

							<div>
								<h3 className="mb-3 font-bold text-base text-white md:text-lg">
									10.3 Jurisdiction
								</h3>
								<p className="leading-relaxed">
									You agree to submit to the personal and exclusive jurisdiction of the courts located in Malaysia for the resolution of any disputes.
								</p>
							</div>
						</div>
					</PolicySection>

					{/* Section 11: Data Protection */}
					<PolicySection
						id="data-protection"
						sectionNumber={11}
						title="Data Protection and Privacy"
						icon={Shield}
					>
						<p className="text-black/70 text-base md:text-lg leading-relaxed">
							Your use of the Services is also governed by our Privacy Policy, which is incorporated into these Terms by reference. We are committed to complying with applicable data protection laws, including the General Data Protection Regulation (GDPR) and Personal Data Protection Act (PDPA). Please review our{" "}
							<Link href="/privacy-policy" className="text-black underline hover:no-underline">
								Privacy Policy
							</Link>{" "}
							to understand how we collect, use, and protect your personal data.
						</p>
					</PolicySection>

					{/* Section 12: Third-Party Services */}
					<PolicySection
						id="third-party"
						sectionNumber={12}
						title="Third-Party Services and Links"
						icon={Globe}
						isBlack
					>
						<div className="text-white/70 text-base md:text-lg">
							<p className="mb-4 leading-relaxed">
								The Services may contain links to third-party websites, services, or integrations that are not owned or controlled by EventzFlow. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party services.
							</p>
							<p className="leading-relaxed">
								You acknowledge that EventzFlow shall not be responsible for any damage or loss caused by your use of any third-party services.
							</p>
						</div>
					</PolicySection>

					{/* Section 13: Force Majeure */}
					<PolicySection
						id="force-majeure"
						sectionNumber={13}
						title="Force Majeure"
						icon={AlertTriangle}
					>
						<p className="text-black/70 text-base md:text-lg leading-relaxed">
							EventzFlow shall not be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
						</p>
					</PolicySection>

					{/* Section 14: Severability and Waiver */}
					<PolicySection
						id="severability"
						sectionNumber={14}
						title="Severability and Waiver"
						icon={Scale}
						isBlack
					>
						<div className="space-y-6 text-white/70 text-base md:text-lg">
							<div>
								<h3 className="mb-3 font-bold text-base text-white md:text-lg">
									14.1 Severability
								</h3>
								<p className="leading-relaxed">
									If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision shall be deemed severable and shall not affect the validity of the remaining provisions.
								</p>
							</div>

							<div>
								<h3 className="mb-3 font-bold text-base text-white md:text-lg">
									14.2 Waiver
								</h3>
								<p className="leading-relaxed">
									No waiver by EventzFlow of any term or condition set forth in these Terms shall be deemed a further or continuing waiver of such term or any other term.
								</p>
							</div>
						</div>
					</PolicySection>

					{/* Section 15: Entire Agreement */}
					<PolicySection
						id="entire-agreement"
						sectionNumber={15}
						title="Entire Agreement"
						icon={FileText}
					>
						<p className="text-black/70 text-base md:text-lg leading-relaxed">
							These Terms, together with our Privacy Policy and any other legal notices or agreements published by us on the Services, constitute the entire agreement between you and EventzFlow concerning your use of the Services and supersede all prior or contemporaneous communications and proposals.
						</p>
					</PolicySection>

					{/* Section 16: Assignment */}
					<PolicySection
						id="assignment"
						sectionNumber={16}
						title="Assignment"
						icon={Users}
						isBlack
					>
						<p className="text-white/70 text-base md:text-lg leading-relaxed">
							You may not assign or transfer these Terms or your rights hereunder, in whole or in part, without our prior written consent. EventzFlow may assign these Terms or any rights hereunder without your consent. Any attempted assignment in violation of this section shall be void.
						</p>
					</PolicySection>

					{/* Section 17: Contact Information */}
					<PolicySection
						id="contact"
						sectionNumber={17}
						title="Contact Information"
						icon={Phone}
					>
						<div className="text-black/70 text-base md:text-lg">
							<p className="mb-6 leading-relaxed">
								If you have any questions, concerns, or complaints regarding these Terms, please contact us:
							</p>
							<div className="border border-black/20 bg-black/5 p-6">
								<p className="mb-3 font-bold text-base text-black md:text-lg">
									EventzFlow Legal Department
								</p>
								<div className="space-y-2">
									<p>
										<span className="font-bold text-black">Email:</span>{" "}
										<a
											href="mailto:info@eventzflow.com"
											className="text-black underline hover:no-underline"
										>
											info@eventzflow.com
										</a>
									</p>
									<p>
										<span className="font-bold text-black">Company:</span>{" "}
										Jesselton Pixel Sdn. Bhd.
									</p>
									<p>
										<span className="font-bold text-black">Phone:</span>{" "}
										<a
											href="https://wa.me/60166236511"
											target="_blank"
											rel="noopener noreferrer"
											className="text-black underline hover:no-underline"
										>
											+6016-6236511
										</a>
									</p>
								</div>
							</div>
						</div>
					</PolicySection>
				</div>
			</section>

			{/* Footer Note */}
			<section className="bg-black px-6 py-16 md:py-24">
				<div className="mx-auto max-w-4xl text-center">
					<motion.p
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
						className="text-white/50 text-sm"
					>
						These Terms and Conditions are effective as of the date stated above and apply to all users of our Services.
						<br />
						Please print or save a copy of these Terms for your records.
					</motion.p>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2, ease: SMOOTH_EASE }}
						className="mt-8"
					>
						<Link
							href="/privacy-policy"
							className="border border-white px-8 py-4 text-center text-xs font-bold tracking-widest text-white transition-all duration-300 hover:bg-[#23c460] hover:border-[#23c460]"
						>
							VIEW PRIVACY POLICY
						</Link>
					</motion.div>
				</div>
			</section>
		</main>
	);
}
