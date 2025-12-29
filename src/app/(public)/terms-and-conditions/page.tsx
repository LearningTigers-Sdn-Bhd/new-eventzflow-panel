"use client";

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
import Head from "next/head";
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

export default function TermsAndConditionsPage() {
	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-background via-background to-muted/30">
			<Head>
				<title>EventzFlow - Terms and Conditions</title>
				<meta
					name="description"
					content="Terms and Conditions for EventzFlow"
				/>
			</Head>
			<div className="container mx-auto max-w-7xl px-4 py-26 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-12 text-center">
					<div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4">
						<FileText className="h-8 w-8 text-primary sm:h-12 sm:w-12" />
					</div>
					<h1 className="mb-6 font-bold text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
						Terms and Conditions
					</h1>

					{/* Introduction */}
					<div className="mx-auto mb-6 max-w-4xl space-y-4 text-muted-foreground text-sm sm:text-base">
						<p className="leading-relaxed">
							These Terms and Conditions ("Terms", "Agreement") constitute a
							legally binding agreement between you ("User", "you", or "your")
							and <strong className="text-foreground">EventzFlow</strong>{" "}
							("Company", "we", "us", or "our") governing your access to and use
							of our event management platform, website, mobile applications,
							and related services (collectively, the "Services").
						</p>
						<p className="leading-relaxed">
							By accessing or using our Services, you acknowledge that you have
							read, understood, and agree to be bound by these Terms and our
							Privacy Policy. If you do not agree with any part of these Terms,
							you must not access or use our Services.
						</p>
						<div className="mx-auto flex max-w-5xl gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-left">
							<AlertTriangle className="h-5 w-5 flex-shrink-0 text-primary" />
							<p className="text-sm leading-relaxed">
								We reserve the right to modify these Terms at any time. Any
								changes will be effective immediately upon posting on our
								website. Your continued use of the Services following any
								modifications constitutes your acceptance of the revised Terms.
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
						{/* Section 1: Eligibility and Account Registration */}
						<PolicySection
							id="eligibility"
							sectionNumber={1}
							title="Eligibility and Account Registration"
							icon={UserCheck}
						>
							<div className="space-y-6 text-muted-foreground text-sm sm:text-base">
								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										1.1 Eligibility
									</h3>
									<p className="leading-relaxed">
										You must be at least 18 years of age and have the legal
										capacity to enter into binding contracts to use our
										Services. By using the Services, you represent and warrant
										that you meet these eligibility requirements. If you are
										using the Services on behalf of an organization, you
										represent and warrant that you have the authority to bind
										that organization to these Terms.
									</p>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										1.2 Account Registration
									</h3>
									<p className="mb-4 leading-relaxed">
										To access certain features of the Services, you must create
										an account. When registering, you agree to:
									</p>
									<ul className="space-y-3">
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Provide accurate, current, and complete information
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Maintain and promptly update your account information
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Maintain the security and confidentiality of your
												password
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Accept responsibility for all activities that occur
												under your account
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Immediately notify us of any unauthorized use of your
												account
											</span>
										</li>
									</ul>
									<p className="mt-4 leading-relaxed">
										We reserve the right to suspend or terminate accounts that
										contain false or misleading information or that violate
										these Terms.
									</p>
								</div>
							</div>
						</PolicySection>

						{/* Section 2: Services Description */}
						<PolicySection
							id="services"
							sectionNumber={2}
							title="Services Description"
							icon={Globe}
						>
							<div className="space-y-4 text-muted-foreground text-sm sm:text-base">
								<p className="leading-relaxed">
									EventzFlow provides an event management platform that enables
									users to:
								</p>
								<ul className="space-y-3">
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Create, manage, and organize events</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Issue and manage tickets and registrations</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Process check-ins and attendee tracking</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Generate analytics and reports</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Manage event staff and team members</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Access API integrations and developer tools</span>
									</li>
								</ul>
								<p className="leading-relaxed">
									We reserve the right to modify, suspend, or discontinue any
									aspect of the Services at any time without prior notice. We
									shall not be liable to you or any third party for any
									modification, suspension, or discontinuation of the Services.
								</p>
							</div>
						</PolicySection>

						{/* Section 3: User Obligations and Prohibited Conduct */}
						<PolicySection
							id="obligations"
							sectionNumber={3}
							title="User Obligations and Prohibited Conduct"
							icon={Shield}
						>
							<div className="space-y-6 text-muted-foreground text-sm sm:text-base">
								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										3.1 Acceptable Use
									</h3>
									<p className="mb-4 leading-relaxed">
										You agree to use the Services only for lawful purposes and
										in accordance with these Terms. You agree NOT to:
									</p>
									<ul className="space-y-3">
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Use the Services in any way that violates applicable
												laws or regulations
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Impersonate any person or entity or falsely state or
												misrepresent your affiliation
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Engage in any conduct that restricts or inhibits
												anyone's use of the Services
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Upload or transmit viruses, malware, or any other
												malicious code
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Attempt to gain unauthorized access to any portion of
												the Services
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Interfere with or disrupt the Services or servers
												connected to the Services
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Use automated systems (bots, scrapers) without our
												express written permission
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Engage in any fraudulent, deceptive, or manipulative
												practices
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Sell, resell, or commercially exploit the Services
												without authorization
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Remove, alter, or obscure any copyright, trademark, or
												proprietary notices
											</span>
										</li>
									</ul>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										3.2 Content Standards
									</h3>
									<p className="mb-4 leading-relaxed">
										Any content you upload or submit through the Services must
										not:
									</p>
									<ul className="space-y-3">
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Contain material that is defamatory, obscene, offensive,
												or hateful
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Infringe any intellectual property rights or privacy
												rights of third parties
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Contain unsolicited promotions, spam, or commercial
												content
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Promote discrimination, violence, or illegal activities
											</span>
										</li>
									</ul>
								</div>
							</div>
						</PolicySection>

						{/* Section 4: Intellectual Property Rights */}
						<PolicySection
							id="intellectual-property"
							sectionNumber={4}
							title="Intellectual Property Rights"
							icon={FileText}
						>
							<div className="space-y-6 text-muted-foreground text-sm sm:text-base">
								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										4.1 Our Intellectual Property
									</h3>
									<p className="leading-relaxed">
										The Services, including all content, features,
										functionality, software, code, design, graphics, logos, and
										trademarks, are owned by EventzFlow or its licensors and are
										protected by international copyright, trademark, patent,
										trade secret, and other intellectual property laws. You are
										granted a limited, non-exclusive, non-transferable,
										revocable license to access and use the Services for your
										personal or internal business purposes.
									</p>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										4.2 User Content
									</h3>
									<p className="leading-relaxed">
										You retain ownership of any content you submit, upload, or
										create through the Services ("User Content"). By submitting
										User Content, you grant EventzFlow a worldwide,
										non-exclusive, royalty-free, transferable, sublicensable
										license to use, reproduce, modify, adapt, publish,
										translate, create derivative works from, distribute, and
										display such User Content solely for the purpose of
										providing and improving the Services.
									</p>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										4.3 Feedback
									</h3>
									<p className="leading-relaxed">
										If you provide us with any feedback, suggestions, or
										recommendations regarding the Services, you grant us the
										right to use such feedback without any obligation to you.
									</p>
								</div>
							</div>
						</PolicySection>

						{/* Section 5: Payment Terms and Billing */}
						<PolicySection
							id="payment"
							sectionNumber={5}
							title="Payment Terms and Billing"
							icon={CreditCard}
						>
							<div className="space-y-6 text-muted-foreground text-sm sm:text-base">
								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										5.1 Fees and Charges
									</h3>
									<p className="leading-relaxed">
										Certain features of the Services may require payment of
										fees. You agree to pay all applicable fees as described in
										your selected pricing plan. All fees are non-refundable
										unless otherwise stated in our refund policy or required by
										law.
									</p>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										5.2 Subscription and Billing
									</h3>
									<p className="leading-relaxed">
										If you subscribe to a paid plan, you authorize us to charge
										your payment method on a recurring basis according to your
										billing cycle. Subscriptions automatically renew unless
										cancelled before the renewal date. We reserve the right to
										modify pricing with 30 days' notice.
									</p>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										5.3 Taxes
									</h3>
									<p className="leading-relaxed">
										All fees are exclusive of applicable taxes, duties, or
										similar governmental charges. You are responsible for paying
										all such taxes or charges.
									</p>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										5.4 Payment Disputes
									</h3>
									<p className="leading-relaxed">
										If you believe you have been incorrectly charged, you must
										contact us within 30 days of the charge date. Failure to
										notify us within this period constitutes acceptance of the
										charges.
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
						>
							<div className="space-y-6 text-muted-foreground text-sm sm:text-base">
								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										6.1 Cancellation by User
									</h3>
									<p className="leading-relaxed">
										You may cancel your subscription or close your account at
										any time through your account settings. Cancellation will
										take effect at the end of your current billing period. You
										will retain access to paid features until the end of the
										paid period.
									</p>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										6.2 Termination by EventzFlow
									</h3>
									<p className="mb-4 leading-relaxed">
										We reserve the right to suspend or terminate your access to
										the Services immediately, without prior notice or liability,
										for any reason, including but not limited to:
									</p>
									<ul className="space-y-3">
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>Violation of these Terms</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>Fraudulent or illegal activity</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>Non-payment of fees</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Actions that may cause harm to the Services or other
												users
											</span>
										</li>
										<li className="flex gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
											<span>
												Request by law enforcement or government agencies
											</span>
										</li>
									</ul>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										6.3 Effect of Termination
									</h3>
									<p className="leading-relaxed">
										Upon termination, your right to access the Services will
										immediately cease. We may delete your account and all
										associated data. We are not obligated to retain or provide
										you with copies of your User Content after termination,
										except as required by law.
									</p>
								</div>
							</div>
						</PolicySection>

						{/* Section 7: Disclaimers and Warranties */}
						<PolicySection
							id="disclaimers"
							sectionNumber={7}
							title="Disclaimers and Warranties"
							icon={AlertTriangle}
						>
							<div className="space-y-4 text-muted-foreground text-sm sm:text-base">
								<p className="leading-relaxed">
									THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE"
									BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
									IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
									MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
									NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
								</p>
								<p className="leading-relaxed">
									EventzFlow does not warrant that:
								</p>
								<ul className="space-y-3">
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>
											The Services will function uninterrupted, timely, secure,
											or error-free
										</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>
											The results obtained from using the Services will be
											accurate or reliable
										</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>
											The quality of any services, information, or materials
											obtained through the Services will meet your expectations
										</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Any errors in the Services will be corrected</span>
									</li>
								</ul>
								<p className="leading-relaxed">
									Your use of the Services is at your sole risk. You are solely
									responsible for any damage to your computer system or loss of
									data resulting from the use of the Services.
								</p>
							</div>
						</PolicySection>

						{/* Section 8: Limitation of Liability */}
						<PolicySection
							id="liability"
							sectionNumber={8}
							title="Limitation of Liability"
							icon={Shield}
						>
							<div className="space-y-4 text-muted-foreground text-sm sm:text-base">
								<p className="leading-relaxed">
									TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
									SHALL EVENTZFLOW, ITS AFFILIATES, OFFICERS, DIRECTORS,
									EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT,
									INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
									INCLUDING BUT NOT LIMITED TO:
								</p>
								<ul className="space-y-3">
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Loss of profits, revenue, data, or use</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Business interruption</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Loss of goodwill or reputation</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Cost of procurement of substitute services</span>
									</li>
								</ul>
								<p className="leading-relaxed">
									WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING
									NEGLIGENCE), PRODUCT LIABILITY, OR ANY OTHER LEGAL THEORY,
									ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICES,
									EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
								</p>
								<p className="leading-relaxed">
									OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR
									RELATING TO THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE
									AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE
									CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
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
							<div className="space-y-4 text-muted-foreground text-sm sm:text-base">
								<p className="leading-relaxed">
									You agree to defend, indemnify, and hold harmless EventzFlow,
									its affiliates, licensors, and service providers, and their
									respective officers, directors, employees, contractors,
									agents, and representatives from and against any claims,
									liabilities, damages, judgments, awards, losses, costs,
									expenses, or fees (including reasonable attorneys' fees)
									arising out of or relating to:
								</p>
								<ul className="space-y-3">
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Your violation of these Terms</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Your use or misuse of the Services</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Your User Content</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>Your violation of any rights of another party</span>
									</li>
									<li className="flex gap-3">
										<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
										<span>
											Your violation of any applicable laws or regulations
										</span>
									</li>
								</ul>
							</div>
						</PolicySection>

						{/* Section 10: Dispute Resolution and Governing Law */}
						<PolicySection
							id="dispute-resolution"
							sectionNumber={10}
							title="Dispute Resolution and Governing Law"
							icon={Scale}
						>
							<div className="space-y-6 text-muted-foreground text-sm sm:text-base">
								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										10.1 Governing Law
									</h3>
									<p className="leading-relaxed">
										These Terms shall be governed by and construed in accordance
										with the laws of [Your Jurisdiction], without regard to its
										conflict of law provisions.
									</p>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										10.2 Dispute Resolution
									</h3>
									<p className="leading-relaxed">
										In the event of any dispute, controversy, or claim arising
										out of or relating to these Terms or the Services, the
										parties agree to first attempt to resolve the matter through
										good-faith negotiations. If the dispute cannot be resolved
										through negotiation within 30 days, either party may
										initiate mediation or arbitration proceedings.
									</p>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										10.3 Jurisdiction
									</h3>
									<p className="leading-relaxed">
										You agree to submit to the personal and exclusive
										jurisdiction of the courts located in [Your Jurisdiction]
										for the resolution of any disputes arising from these Terms
										or your use of the Services.
									</p>
								</div>
							</div>
						</PolicySection>

						{/* Section 11: Data Protection and Privacy */}
						<PolicySection
							id="data-protection"
							sectionNumber={11}
							title="Data Protection and Privacy"
							icon={Shield}
						>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Your use of the Services is also governed by our Privacy Policy,
								which is incorporated into these Terms by reference. We are
								committed to complying with applicable data protection laws,
								including the General Data Protection Regulation (GDPR) and
								Personal Data Protection Act (PDPA). Please review our Privacy
								Policy to understand how we collect, use, and protect your
								personal data.
							</p>
						</PolicySection>

						{/* Section 12: Third-Party Services and Links */}
						<PolicySection
							id="third-party"
							sectionNumber={12}
							title="Third-Party Services and Links"
							icon={Globe}
						>
							<div className="space-y-4 text-muted-foreground text-sm sm:text-base">
								<p className="leading-relaxed">
									The Services may contain links to third-party websites,
									services, or integrations that are not owned or controlled by
									EventzFlow. We have no control over and assume no
									responsibility for the content, privacy policies, or practices
									of any third-party services.
								</p>
								<p className="leading-relaxed">
									You acknowledge and agree that EventzFlow shall not be
									responsible or liable for any damage or loss caused by your
									use of any third-party services. We strongly advise you to
									read the terms and conditions and privacy policies of any
									third-party services you access.
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
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								EventzFlow shall not be liable for any failure or delay in
								performance due to circumstances beyond its reasonable control,
								including but not limited to acts of God, natural disasters,
								war, terrorism, riots, embargoes, acts of civil or military
								authorities, fire, floods, accidents, pandemics, strikes, or
								shortages of transportation, facilities, fuel, energy, labor, or
								materials.
							</p>
						</PolicySection>

						{/* Section 14: Severability and Waiver */}
						<PolicySection
							id="severability"
							sectionNumber={14}
							title="Severability and Waiver"
							icon={Scale}
						>
							<div className="space-y-6 text-muted-foreground text-sm sm:text-base">
								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										14.1 Severability
									</h3>
									<p className="leading-relaxed">
										If any provision of these Terms is found to be unlawful,
										void, or unenforceable, that provision shall be deemed
										severable from these Terms and shall not affect the validity
										and enforceability of the remaining provisions.
									</p>
								</div>

								<div>
									<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
										14.2 Waiver
									</h3>
									<p className="leading-relaxed">
										No waiver by EventzFlow of any term or condition set forth
										in these Terms shall be deemed a further or continuing
										waiver of such term or condition or a waiver of any other
										term or condition.
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
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								These Terms, together with our Privacy Policy and any other
								legal notices or agreements published by us on the Services,
								constitute the entire agreement between you and EventzFlow
								concerning your use of the Services and supersede all prior or
								contemporaneous communications and proposals, whether oral or
								written, between you and EventzFlow.
							</p>
						</PolicySection>

						{/* Section 16: Assignment */}
						<PolicySection
							id="assignment"
							sectionNumber={16}
							title="Assignment"
							icon={Users}
						>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								You may not assign or transfer these Terms or your rights
								hereunder, in whole or in part, without our prior written
								consent. EventzFlow may assign these Terms or any rights
								hereunder without your consent. Any attempted assignment in
								violation of this section shall be void.
							</p>
						</PolicySection>

						{/* Section 17: Contact Information */}
						<PolicySection
							id="contact"
							sectionNumber={17}
							title="Contact Information"
							icon={Phone}
							highlight
						>
							<p className="mb-6 text-muted-foreground text-sm leading-relaxed sm:text-base">
								If you have any questions, concerns, or complaints regarding
								these Terms, please contact us:
							</p>
							<div className="rounded-lg border-2 border-primary/20 bg-background/80 p-6">
								<p className="mb-3 font-semibold text-base text-foreground sm:text-lg">
									EventzFlow Legal Department
								</p>
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
						These Terms and Conditions are effective as of the date stated above
						and apply to all users of our Services.
						<br />
						Please print or save a copy of these Terms for your records.
					</p>
				</div>
			</div>
		</div>
	);
}
