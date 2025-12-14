"use client";

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
import type { ReactNode } from "react";

interface PolicySectionProps {
	id: string;
	sectionNumber: number;
	title: string;
	icon: LucideIcon;
	children: ReactNode;
	highlight?: boolean;
}

function PolicySection({
	id,
	sectionNumber,
	title,
	icon: Icon,
	children,
	highlight = false,
}: PolicySectionProps) {
	return (
		<section
			id={id}
			className={`scroll-mt-24 rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 ${
				highlight
					? "border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5 shadow-md"
					: "bg-card"
			}`}
		>
			<div className="mb-6 flex items-start gap-4 border-primary/20 border-b pb-4">
				<div
					className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 ${
						highlight
							? "border-primary/30 bg-primary/10"
							: "border-primary/20 bg-primary/5"
					}`}
				>
					<Icon className="h-6 w-6 text-primary" />
				</div>
				<div className="flex-1 pt-1">
					<p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wider">
						Section {sectionNumber}
					</p>
					<h2 className="font-semibold text-foreground text-xl sm:text-2xl">
						{title}
					</h2>
				</div>
			</div>
			<div className="space-y-4">{children}</div>
		</section>
	);
}

export default function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-background via-background to-muted/30">
			<div className="container mx-auto max-w-7xl px-4 py-26 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-12 text-center">
					<div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4">
						<Shield className="h-8 w-8 text-primary sm:h-12 sm:w-12" />
					</div>
					<h1 className="mb-6 font-bold text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
						Privacy Policy
					</h1>

					{/* Introduction */}
					<div className="mx-auto mb-6 max-w-4xl space-y-4 text-muted-foreground text-sm sm:text-base">
						<p className="leading-relaxed">
							<strong className="text-foreground">EventzFlow</strong> ("we,"
							"our," or "us") is committed to protecting your privacy and
							personal data. This Privacy Policy explains how we collect, use,
							disclose, and safeguard your information when you use our event
							management platform and services (the "Services").
						</p>
						<div className="mx-auto flex max-w-5xl gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-left">
							<Info className="h-5 w-5 flex-shrink-0 text-primary" />
							<p className="text-sm leading-relaxed">
								We comply with <strong className="text-foreground">GDPR</strong>{" "}
								and <strong className="text-foreground">PDPA</strong>{" "}
								regulations. By using our Services, you consent to the practices
								described here.
							</p>
						</div>
					</div>

					<p className="text-muted-foreground text-sm">
						Last Updated:{" "}
						{new Date().toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
				</div>

				{/* Content */}
				<div className="mx-auto max-w-5xl">
					<div className="space-y-8">
						{/* Section 1: Information We Collect */}
						<PolicySection
							id="information-collect"
							sectionNumber={1}
							title="Information We Collect"
							icon={Database}
						>
							<div className="space-y-6 text-muted-foreground text-sm sm:text-base">
								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										1.1 Personal Data You Provide
									</h3>
									<p className="mb-4 leading-relaxed">
										We collect information that you voluntarily provide when
										using our Services, including:
									</p>
									<ul className="space-y-3">
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												<strong className="text-foreground">
													Account Information:
												</strong>{" "}
												Name, email address, phone number, password, and company
												details
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												<strong className="text-foreground">
													Event Information:
												</strong>{" "}
												Event details, attendee lists, check-in data, ticket
												information
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												<strong className="text-foreground">
													Payment Information:
												</strong>{" "}
												Billing address and payment details (processed securely
												through third-party payment processors)
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												<strong className="text-foreground">
													Communications:
												</strong>{" "}
												Information you provide when contacting our support team
												or through feedback forms
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												<strong className="text-foreground">
													Profile Data:
												</strong>{" "}
												User preferences, settings, and customization choices
											</span>
										</li>
									</ul>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										1.2 Automatically Collected Information
									</h3>
									<p className="mb-4 leading-relaxed">
										When you access our Services, we may automatically collect:
									</p>
									<ul className="space-y-3">
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												<strong className="text-foreground">Usage Data:</strong>{" "}
												IP address, browser type, device information, operating
												system, pages viewed, time spent on pages
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												<strong className="text-foreground">
													Cookies and Tracking Technologies:
												</strong>{" "}
												We use cookies, web beacons, and similar technologies to
												enhance user experience
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												<strong className="text-foreground">
													Location Data:
												</strong>{" "}
												Approximate location based on IP address (with your
												consent for precise location)
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												<strong className="text-foreground">Log Files:</strong>{" "}
												Server logs, error reports, and system diagnostics
											</span>
										</li>
									</ul>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										1.3 Information from Third Parties
									</h3>
									<p className="leading-relaxed">
										We may receive information about you from third-party
										services, authentication providers, and publicly available
										sources when you integrate them with our Services.
									</p>
								</div>
							</div>
						</PolicySection>

						{/* Section 2: How We Use Your Information */}
						<PolicySection
							id="how-we-use"
							sectionNumber={2}
							title="How We Use Your Information"
							icon={UserCheck}
						>
							<p className="mb-4 text-muted-foreground text-sm leading-relaxed sm:text-base">
								We process your personal data for the following purposes under
								lawful bases:
							</p>
							<ul className="space-y-3 text-muted-foreground text-sm sm:text-base">
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Service Delivery:
										</strong>{" "}
										To provide, maintain, and improve our event management
										platform and Services
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Account Management:
										</strong>{" "}
										To create and manage your account, authenticate users, and
										process registrations
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Event Operations:
										</strong>{" "}
										To facilitate event creation, ticket management, check-in
										processes, and attendee tracking
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">Communication:</strong>{" "}
										To send service-related notifications, updates, security
										alerts, and customer support responses
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Analytics and Improvement:
										</strong>{" "}
										To analyze usage patterns, optimize performance, and develop
										new features
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Legal Compliance:
										</strong>{" "}
										To comply with legal obligations, enforce our terms, and
										protect against fraudulent activities
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">Marketing:</strong> With
										your consent, to send promotional materials and newsletters
										(you may opt-out at any time)
									</span>
								</li>
							</ul>
						</PolicySection>

						{/* Section 3: Legal Basis for Processing */}
						<PolicySection
							id="legal-basis"
							sectionNumber={3}
							title="Legal Basis for Processing (GDPR)"
							icon={FileText}
						>
							<p className="mb-4 text-muted-foreground text-sm leading-relaxed sm:text-base">
								Under GDPR, we process your personal data based on the following
								legal grounds:
							</p>
							<ul className="space-y-3 text-muted-foreground text-sm sm:text-base">
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Contractual Necessity:
										</strong>{" "}
										Processing is necessary to perform our contract with you
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Legitimate Interests:
										</strong>{" "}
										Processing is necessary for our legitimate business
										interests
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Legal Obligation:
										</strong>{" "}
										Processing is required to comply with applicable laws
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">Consent:</strong> You
										have provided explicit consent for specific processing
										activities
									</span>
								</li>
							</ul>
						</PolicySection>

						{/* Section 4: Data Sharing and Disclosure */}
						<PolicySection
							id="data-sharing"
							sectionNumber={4}
							title="Data Sharing and Disclosure"
							icon={Globe}
						>
							<p className="mb-4 text-muted-foreground text-sm leading-relaxed sm:text-base">
								We may share your personal information in the following
								circumstances:
							</p>
							<ul className="mb-6 space-y-3 text-muted-foreground text-sm sm:text-base">
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Service Providers:
										</strong>{" "}
										With trusted third-party vendors who assist in providing our
										Services (e.g., hosting, analytics, payment processing)
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Event Organizers:
										</strong>{" "}
										With event organizers for events you attend or register for
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Legal Requirements:
										</strong>{" "}
										When required by law, legal process, or governmental request
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Business Transfers:
										</strong>{" "}
										In connection with mergers, acquisitions, or sale of assets
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Protection of Rights:
										</strong>{" "}
										To protect our rights, property, safety, or that of our
										users
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											With Your Consent:
										</strong>{" "}
										When you explicitly authorize us to share your information
									</span>
								</li>
							</ul>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								We ensure all third parties are contractually bound to protect
								your data and use it only for specified purposes.
							</p>
						</PolicySection>

						{/* Section 5: International Data Transfers */}
						<PolicySection
							id="international-transfers"
							sectionNumber={5}
							title="International Data Transfers"
							icon={Globe}
						>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Your information may be transferred to and processed in
								countries other than your country of residence. These countries
								may have different data protection laws. When we transfer
								personal data internationally, we implement appropriate
								safeguards such as Standard Contractual Clauses (SCCs) approved
								by the European Commission or other legally compliant transfer
								mechanisms to ensure your data receives adequate protection.
							</p>
						</PolicySection>

						{/* Section 6: Data Security */}
						<PolicySection
							id="data-security"
							sectionNumber={6}
							title="Data Security"
							icon={Lock}
						>
							<p className="mb-4 text-muted-foreground text-sm leading-relaxed sm:text-base">
								We implement industry-standard security measures to protect your
								personal data:
							</p>
							<ul className="mb-6 space-y-3 text-muted-foreground text-sm sm:text-base">
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										Encryption of data in transit and at rest using SSL/TLS
										protocols
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										Regular security assessments and vulnerability testing
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>Access controls and authentication mechanisms</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>Employee training on data protection practices</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										Incident response and breach notification procedures
									</span>
								</li>
							</ul>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								However, no method of transmission over the internet or
								electronic storage is 100% secure. While we strive to protect
								your data, we cannot guarantee absolute security.
							</p>
						</PolicySection>

						{/* Section 7: Data Retention */}
						<PolicySection
							id="data-retention"
							sectionNumber={7}
							title="Data Retention"
							icon={Clock}
						>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								We retain your personal data only for as long as necessary to
								fulfill the purposes outlined in this Privacy Policy, comply
								with legal obligations, resolve disputes, and enforce our
								agreements. When personal data is no longer required, we will
								securely delete or anonymize it. Specific retention periods vary
								based on data type and legal requirements, typically ranging
								from 3 to 7 years for transactional and financial records.
							</p>
						</PolicySection>

						{/* Section 8: Your Rights */}
						<PolicySection
							id="your-rights"
							sectionNumber={8}
							title="Your Rights and Choices"
							icon={Shield}
						>
							<p className="mb-4 text-muted-foreground text-sm leading-relaxed sm:text-base">
								Under GDPR and PDPA, you have the following rights regarding
								your personal data:
							</p>
							<ul className="mb-6 space-y-3 text-muted-foreground text-sm sm:text-base">
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Right of Access:
										</strong>{" "}
										Request copies of your personal data
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Right to Rectification:
										</strong>{" "}
										Request correction of inaccurate or incomplete data
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Right to Erasure:
										</strong>{" "}
										Request deletion of your personal data ("right to be
										forgotten")
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Right to Restrict Processing:
										</strong>{" "}
										Request limitation on how we use your data
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Right to Data Portability:
										</strong>{" "}
										Request transfer of your data in a machine-readable format
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Right to Object:
										</strong>{" "}
										Object to processing based on legitimate interests or direct
										marketing
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Right to Withdraw Consent:
										</strong>{" "}
										Withdraw consent at any time where processing is based on
										consent
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Right to Lodge a Complaint:
										</strong>{" "}
										File a complaint with a supervisory authority
									</span>
								</li>
							</ul>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								To exercise these rights, please contact us at the details
								provided in Section 13. We will respond to your request within
								30 days as required by applicable law.
							</p>
						</PolicySection>

						{/* Section 9: Cookies */}
						<PolicySection
							id="cookies"
							sectionNumber={9}
							title="Cookies and Tracking Technologies"
							icon={Cookie}
						>
							<p className="mb-4 text-muted-foreground text-sm leading-relaxed sm:text-base">
								We use cookies and similar technologies to enhance your
								experience. Types of cookies we use include:
							</p>
							<ul className="mb-6 space-y-3 text-muted-foreground text-sm sm:text-base">
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Essential Cookies:
										</strong>{" "}
										Required for the Services to function properly
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Performance Cookies:
										</strong>{" "}
										Help us understand how visitors interact with our Services
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Functional Cookies:
										</strong>{" "}
										Enable enhanced functionality and personalization
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										<strong className="text-foreground">
											Targeting Cookies:
										</strong>{" "}
										Used for marketing and advertising purposes (with your
										consent)
									</span>
								</li>
							</ul>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								You can control cookies through your browser settings. However,
								disabling certain cookies may limit your ability to use some
								features of our Services.
							</p>
						</PolicySection>

						{/* Section 10: Children's Privacy */}
						<PolicySection
							id="children"
							sectionNumber={10}
							title="Children's Privacy"
							icon={Baby}
						>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Our Services are not intended for individuals under the age of
								16. We do not knowingly collect personal data from children
								under 16. If you believe we have inadvertently collected
								information from a child under 16, please contact us
								immediately, and we will take steps to delete such information.
							</p>
						</PolicySection>

						{/* Section 11: Third-Party Websites */}
						<PolicySection
							id="third-party"
							sectionNumber={11}
							title="Third-Party Websites and Services"
							icon={ExternalLink}
						>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Our Services may contain links to third-party websites or
								services that are not operated by us. We are not responsible for
								the privacy practices of these third parties. We encourage you
								to review the privacy policies of any third-party sites you
								visit.
							</p>
						</PolicySection>

						{/* Section 12: Changes to Privacy Policy */}
						<PolicySection
							id="changes"
							sectionNumber={12}
							title="Changes to This Privacy Policy"
							icon={FileText}
						>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								We may update this Privacy Policy from time to time to reflect
								changes in our practices, technology, legal requirements, or
								other factors. We will notify you of material changes by posting
								the updated policy on our website and updating the "Last
								Updated" date. Your continued use of the Services after such
								modifications constitutes your acceptance of the updated Privacy
								Policy.
							</p>
						</PolicySection>

						{/* Section 13: Contact Us */}
						<PolicySection
							id="contact"
							sectionNumber={13}
							title="Contact Us"
							icon={Mail}
							highlight
						>
							<p className="mb-6 text-muted-foreground text-sm leading-relaxed sm:text-base">
								If you have any questions, concerns, or requests regarding this
								Privacy Policy or our data practices, please contact us:
							</p>
							<div className="rounded-lg border-2 border-primary/20 bg-background/80 p-6">
								<div className="space-y-2 text-muted-foreground text-sm sm:text-base">
									<p>
										<span className="font-medium text-foreground">Email:</span>{" "}
										<a
											href="mailto:info@eventzflow.com"
											className="text-primary hover:underline"
										>
											info@eventzflow.com
										</a>
									</p>
									<p>
										<span className="font-medium text-foreground">
											Company Name:
										</span>{" "}
										Jesselton Pixel Sdn. Bhd.
									</p>
									<p>
										<span className="font-medium text-foreground">Phone:</span>{" "}
										<a
											href="https://wa.me/60177268130"
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											+6017-7268130
										</a>
									</p>
								</div>
							</div>
						</PolicySection>
					</div>
				</div>

				{/* Footer Note */}
				<div className="mt-12 rounded-2xl border-2 bg-gradient-to-r from-muted/50 to-muted/30 p-8 text-center backdrop-blur-sm">
					<p className="text-muted-foreground text-sm">
						This Privacy Policy is effective as of the date stated above and
						applies to all users of our Services.
					</p>
				</div>
			</div>
		</div>
	);
}
