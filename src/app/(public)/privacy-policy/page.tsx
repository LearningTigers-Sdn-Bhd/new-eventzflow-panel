"use client";

import { motion } from "framer-motion";
import {
	Baby,
	Clock,
	Cookie,
	Database,
	ExternalLink,
	FileText,
	Globe,
	Info,
	Lock,
	type LucideIcon,
	Mail,
	Shield,
	UserCheck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const smoothEase = [0.25, 0.46, 0.45, 0.94];

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
			transition={{ duration: 0.6, ease: smoothEase }}
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

export default function PrivacyPolicyPage() {
	return (
		<main>
			{/* Hero Section */}
			<section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-24">
				{/* Left vertical accent line */}
				<motion.div
					initial={{ scaleY: 0 }}
					animate={{ scaleY: 1 }}
					transition={{ duration: 1.5, ease: smoothEase }}
					className="absolute left-6 top-0 h-[70%] w-[2px] origin-top bg-white md:left-12 lg:left-16"
				/>

				{/* Content */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: smoothEase }}
					className="text-center max-w-4xl"
				>
					<p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/60">
						Legal
					</p>
					<h1 className="font-black text-5xl uppercase tracking-tighter text-white md:text-6xl lg:text-7xl">
						Privacy Policy
					</h1>
					<p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
						Learn how we collect, use, and protect your personal information. We are committed to maintaining the privacy and security of your data.
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
						transition={{ duration: 0.8, ease: smoothEase }}
						className="text-center"
					>
						<p className="text-base leading-relaxed text-black/60 md:text-lg max-w-3xl mx-auto">
							<strong className="text-black">EventzFlow</strong> ("we," "our," or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our event management platform and services.
						</p>
						<div className="mt-8 inline-flex items-center gap-3 border border-black/20 bg-black/5 px-6 py-4 text-left">
							<Info className="h-5 w-5 flex-shrink-0 text-black" />
							<p className="text-sm text-black/60">
								We comply with <strong className="text-black">GDPR</strong> and{" "}
								<strong className="text-black">PDPA</strong> regulations. By using our Services, you consent to the practices described here.
							</p>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Policy Sections */}
			<section className="bg-white px-6 pb-24">
				<div className="mx-auto max-w-5xl space-y-6">
					{/* Section 1: Information We Collect */}
					<PolicySection
						id="information-collect"
						sectionNumber={1}
						title="Information We Collect"
						icon={Database}
					>
						<div className="space-y-6 text-black/60 text-sm md:text-base">
							<div>
								<h3 className="mb-3 font-bold text-base text-black md:text-lg">
									1.1 Personal Data You Provide
								</h3>
								<p className="mb-4 leading-relaxed">
									We collect information that you voluntarily provide when using our Services, including:
								</p>
								<ul className="space-y-2">
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span><strong className="text-black">Account Information:</strong> Name, email address, phone number, password, and company details</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span><strong className="text-black">Event Information:</strong> Event details, attendee lists, check-in data, ticket information</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span><strong className="text-black">Payment Information:</strong> Billing address and payment details (processed securely through third-party payment processors)</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span><strong className="text-black">Communications:</strong> Information you provide when contacting our support team or through feedback forms</span>
									</li>
								</ul>
							</div>

							<div>
								<h3 className="mb-3 font-bold text-base text-black md:text-lg">
									1.2 Automatically Collected Information
								</h3>
								<p className="mb-4 leading-relaxed">
									When you access our Services, we may automatically collect:
								</p>
								<ul className="space-y-2">
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span><strong className="text-black">Usage Data:</strong> IP address, browser type, device information, operating system, pages viewed</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span><strong className="text-black">Cookies:</strong> We use cookies and similar technologies to enhance user experience</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
										<span><strong className="text-black">Location Data:</strong> Approximate location based on IP address</span>
									</li>
								</ul>
							</div>
						</div>
					</PolicySection>

					{/* Section 2: How We Use Your Information */}
					<PolicySection
						id="how-we-use"
						sectionNumber={2}
						title="How We Use Your Information"
						icon={UserCheck}
						isBlack
					>
						<div className="text-white/60 text-sm md:text-base">
							<p className="mb-4 leading-relaxed">
								We process your personal data for the following purposes:
							</p>
							<ul className="space-y-2">
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Service Delivery:</strong> To provide, maintain, and improve our event management platform</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Account Management:</strong> To create and manage your account, authenticate users, and process registrations</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Event Operations:</strong> To facilitate event creation, ticket management, check-in processes</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Communication:</strong> To send service-related notifications, updates, and security alerts</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Analytics:</strong> To analyze usage patterns, optimize performance, and develop new features</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Legal Compliance:</strong> To comply with legal obligations and protect against fraud</span>
								</li>
							</ul>
						</div>
					</PolicySection>

					{/* Section 3: Legal Basis */}
					<PolicySection
						id="legal-basis"
						sectionNumber={3}
						title="Legal Basis for Processing (GDPR)"
						icon={FileText}
					>
						<div className="text-black/60 text-sm md:text-base">
							<p className="mb-4 leading-relaxed">
								Under GDPR, we process your personal data based on:
							</p>
							<ul className="space-y-2">
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span><strong className="text-black">Contractual Necessity:</strong> Processing is necessary to perform our contract with you</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span><strong className="text-black">Legitimate Interests:</strong> Processing is necessary for our legitimate business interests</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span><strong className="text-black">Legal Obligation:</strong> Processing is required to comply with applicable laws</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span><strong className="text-black">Consent:</strong> You have provided explicit consent for specific processing activities</span>
								</li>
							</ul>
						</div>
					</PolicySection>

					{/* Section 4: Data Sharing */}
					<PolicySection
						id="data-sharing"
						sectionNumber={4}
						title="Data Sharing and Disclosure"
						icon={Globe}
						isBlack
					>
						<div className="text-white/60 text-sm md:text-base">
							<p className="mb-4 leading-relaxed">
								We may share your personal information in the following circumstances:
							</p>
							<ul className="space-y-2">
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Service Providers:</strong> With trusted third-party vendors who assist in providing our Services</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Event Organizers:</strong> With event organizers for events you attend or register for</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Legal Requirements:</strong> When required by law, legal process, or governmental request</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Business Transfers:</strong> In connection with mergers, acquisitions, or sale of assets</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">With Your Consent:</strong> When you explicitly authorize us to share your information</span>
								</li>
							</ul>
						</div>
					</PolicySection>

					{/* Section 5: International Transfers */}
					<PolicySection
						id="international-transfers"
						sectionNumber={5}
						title="International Data Transfers"
						icon={Globe}
					>
						<p className="text-black/60 text-sm md:text-base leading-relaxed">
							Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. When we transfer personal data internationally, we implement appropriate safeguards such as Standard Contractual Clauses (SCCs) approved by the European Commission to ensure your data receives adequate protection.
						</p>
					</PolicySection>

					{/* Section 6: Data Security */}
					<PolicySection
						id="data-security"
						sectionNumber={6}
						title="Data Security"
						icon={Lock}
						isBlack
					>
						<div className="text-white/60 text-sm md:text-base">
							<p className="mb-4 leading-relaxed">
								We implement industry-standard security measures to protect your personal data:
							</p>
							<ul className="space-y-2">
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Encryption of data in transit and at rest using SSL/TLS protocols</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Regular security assessments and vulnerability testing</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Access controls and authentication mechanisms</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Employee training on data protection practices</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span>Incident response and breach notification procedures</span>
								</li>
							</ul>
						</div>
					</PolicySection>

					{/* Section 7: Data Retention */}
					<PolicySection
						id="data-retention"
						sectionNumber={7}
						title="Data Retention"
						icon={Clock}
					>
						<p className="text-black/60 text-sm md:text-base leading-relaxed">
							We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. When personal data is no longer required, we will securely delete or anonymize it. Specific retention periods vary based on data type and legal requirements, typically ranging from 3 to 7 years for transactional and financial records.
						</p>
					</PolicySection>

					{/* Section 8: Your Rights */}
					<PolicySection
						id="your-rights"
						sectionNumber={8}
						title="Your Rights and Choices"
						icon={Shield}
						isBlack
					>
						<div className="text-white/60 text-sm md:text-base">
							<p className="mb-4 leading-relaxed">
								Under GDPR and PDPA, you have the following rights:
							</p>
							<ul className="space-y-2">
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Right of Access:</strong> Request copies of your personal data</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Right to Rectification:</strong> Request correction of inaccurate data</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Right to Erasure:</strong> Request deletion of your personal data</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Right to Restrict Processing:</strong> Request limitation on how we use your data</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Right to Data Portability:</strong> Request transfer of your data</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Right to Object:</strong> Object to processing based on legitimate interests</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-white" />
									<span><strong className="text-white">Right to Withdraw Consent:</strong> Withdraw consent at any time</span>
								</li>
							</ul>
							<p className="mt-4 leading-relaxed">
								To exercise these rights, please contact us. We will respond within 30 days.
							</p>
						</div>
					</PolicySection>

					{/* Section 9: Cookies */}
					<PolicySection
						id="cookies"
						sectionNumber={9}
						title="Cookies and Tracking Technologies"
						icon={Cookie}
					>
						<div className="text-black/60 text-sm md:text-base">
							<p className="mb-4 leading-relaxed">
								We use cookies and similar technologies to enhance your experience:
							</p>
							<ul className="space-y-2">
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span><strong className="text-black">Essential Cookies:</strong> Required for the Services to function properly</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span><strong className="text-black">Performance Cookies:</strong> Help us understand how visitors interact with our Services</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span><strong className="text-black">Functional Cookies:</strong> Enable enhanced functionality and personalization</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-2 h-1 w-1 flex-shrink-0 bg-black" />
									<span><strong className="text-black">Targeting Cookies:</strong> Used for marketing purposes (with your consent)</span>
								</li>
							</ul>
							<p className="mt-4 leading-relaxed">
								You can control cookies through your browser settings.
							</p>
						</div>
					</PolicySection>

					{/* Section 10: Children's Privacy */}
					<PolicySection
						id="children"
						sectionNumber={10}
						title="Children's Privacy"
						icon={Baby}
						isBlack
					>
						<p className="text-white/60 text-sm md:text-base leading-relaxed">
							Our Services are not intended for individuals under the age of 16. We do not knowingly collect personal data from children under 16. If you believe we have inadvertently collected information from a child under 16, please contact us immediately, and we will take steps to delete such information.
						</p>
					</PolicySection>

					{/* Section 11: Third-Party Websites */}
					<PolicySection
						id="third-party"
						sectionNumber={11}
						title="Third-Party Websites and Services"
						icon={ExternalLink}
					>
						<p className="text-black/60 text-sm md:text-base leading-relaxed">
							Our Services may contain links to third-party websites or services that are not operated by us. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.
						</p>
					</PolicySection>

					{/* Section 12: Changes to Privacy Policy */}
					<PolicySection
						id="changes"
						sectionNumber={12}
						title="Changes to This Privacy Policy"
						icon={FileText}
						isBlack
					>
						<p className="text-white/60 text-sm md:text-base leading-relaxed">
							We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by posting the updated policy on our website and updating the "Last Updated" date. Your continued use of the Services after such modifications constitutes your acceptance of the updated Privacy Policy.
						</p>
					</PolicySection>

					{/* Section 13: Contact Us */}
					<PolicySection
						id="contact"
						sectionNumber={13}
						title="Contact Us"
						icon={Mail}
					>
						<div className="text-black/60 text-sm md:text-base">
							<p className="mb-6 leading-relaxed">
								If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
							</p>
							<div className="border border-black/20 bg-black/5 p-6">
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
											href="https://wa.me/60177268130"
											target="_blank"
											rel="noopener noreferrer"
											className="text-black underline hover:no-underline"
										>
											+6017-7268130
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
						transition={{ duration: 0.8, ease: smoothEase }}
						className="text-white/50 text-sm"
					>
						This Privacy Policy is effective as of the date stated above and applies to all users of our Services.
					</motion.p>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2, ease: smoothEase }}
						className="mt-8"
					>
						<Link
							href="/terms-and-conditions"
							className="border border-white px-8 py-4 text-center text-xs font-bold tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-black"
						>
							VIEW TERMS & CONDITIONS
						</Link>
					</motion.div>
				</div>
			</section>
		</main>
	);
}
