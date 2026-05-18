"use client";

import { motion } from "framer-motion";
import {
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
	RefreshCw,
	Shield,
	UserCheck,
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
				isBlack ? "border-white/20 bg-black" : "border-black/10 bg-white"
			}`}
		>
			<div
				className={`mb-6 flex items-start gap-4 border-b pb-6 ${
					isBlack ? "border-white/10" : "border-black/10"
				}`}
			>
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
					<p
						className={`mb-1 font-bold text-xs uppercase tracking-[0.2em] ${
							isBlack ? "text-white/40" : "text-black/40"
						}`}
					>
						Section {sectionNumber}
					</p>
					<h2
						className={`font-bold text-xl md:text-2xl ${
							isBlack ? "text-white" : "text-black"
						}`}
					>
						{title}
					</h2>
				</div>
			</div>
			<div className="space-y-4">{children}</div>
		</motion.section>
	);
}

export default function PrivacyPolicyPageClient() {
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
					className="max-w-4xl text-center"
				>
					<p className="mb-4 font-medium text-base text-white/60 uppercase tracking-[0.3em]">
						Legal
					</p>
					<h1 className="font-black text-4xl text-white uppercase tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
						Privacy Policy
					</h1>
					<p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 leading-relaxed">
						Learn how we collect, use, and protect your personal information. We
						are committed to maintaining the privacy and security of your data.
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
						className="space-y-6 text-justify [&_p+p]:indent-8"
					>
						<p className="mx-auto max-w-4xl text-base text-black/70 leading-relaxed md:text-lg">
							<strong className="text-black">Jesselton Pixel Sdn Bhd</strong> is
							the sole developer and sole proprietor for EventzFlow, a
							cloud-based online event management software, designed to support
							in-person events, virtual events, and hybrid events. EventzFlow is
							committed to protecting your privacy and providing you the most
							powerful and safe online experience. This publication intends to
							help you understand how personal information you provide to
							EventzFlow is collected and used directly or indirectly through
							the use of its website and platform, so you may make your own
							informed decisions.
						</p>
						<p className="mx-auto max-w-4xl text-base text-black/70 leading-relaxed md:text-lg">
							For the purpose of this policy, EventzFlow defines the term
							&ldquo;Organiser&rdquo; as an entity with which EventzFlow has an
							established relationship, the term &ldquo;Attendee&rdquo; as any
							individual who signs up for any events via EventzFlow&apos; event
							registration system, or who is included as a contact in an
							Organiser&apos;s account, and &ldquo;Visitor&rdquo; as anyone
							visiting our front-end website – www.eventzflow.com.
						</p>
						<p className="mx-auto max-w-4xl text-base text-black/70 leading-relaxed md:text-lg">
							Any information stored on EventzFlow&apos; platform is treated as
							confidential. All information is stored securely and is accessed
							by authorized personnel only. EventzFlow implements and maintains
							appropriate technical, security and organisational measures to
							protect Personal Data against unauthorized or unlawful processing
							and use, and against accidental loss, destruction, damage, theft
							or disclosure.
						</p>
						<p className="mx-auto max-w-4xl text-base text-black/70 leading-relaxed md:text-lg">
							By accessing and/or continuing our services, you consent to the
							data practices described in this statement. All changes that
							materially affect your personally identifiable information will be
							posted in our privacy policy. If you continue our services after
							these notices of changes have been posted, you hereby agree to the
							changed practices unless otherwise notified to us.
						</p>
						<div className="mt-8 flex justify-center indent-0">
							<div className="inline-flex max-w-4xl items-center gap-3 border border-black/20 bg-black/5 px-6 py-4 text-left">
								<Info className="h-5 w-5 flex-shrink-0 text-black" />
								<p className="text-base text-black/70">
									If you have any questions regarding this Privacy Policy,
									please contact{" "}
									<a
										href="mailto:hello@eventzflow.com"
										className="font-bold text-black underline hover:no-underline"
									>
										hello@eventzflow.com
									</a>
									.
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Policy Sections */}
			<section className="bg-white px-6 pb-24">
				<div className="mx-auto max-w-5xl space-y-6">
					{/* Section 1: Information Collection by EventzFlow */}
					<PolicySection
						id="information-collection"
						sectionNumber={1}
						title="Information Collection by EventzFlow (Jesselton Pixel)"
						icon={Database}
					>
						<div className="space-y-6 text-justify text-base text-black/70 md:text-lg [&_p+p]:indent-8">
							<div>
								<h3 className="mb-3 indent-0 font-bold text-base text-black uppercase tracking-tight">
									General
								</h3>
								<p className="leading-relaxed">
									The following sections cover the specifics of each of the
									three groups from which data is collected: Visitors, Attendees
									and Organisers.
								</p>
							</div>

							<div className="space-y-12 indent-0">
								{/* Visitors Category */}
								<div className="space-y-6">
									<h3 className="font-bold text-black text-xl uppercase tracking-tight">
										1.1 Visitors
									</h3>
									<div className="space-y-4 text-justify [&_p+p]:indent-8">
										<p className="leading-relaxed">
											By visiting our website, you consent to the collection and
											use of your Personal Data as described herein. If you do
											not agree to the terms set out herein, please do not visit
											this website. If required by applicable law, we will seek
											your explicit consent to process Personal Data collected
											on this website or volunteered by you. Kindly note that
											any consent will be entirely voluntary. However, if you do
											not grant the requested consent to the processing of your
											Personal Data, the use of this website may not be
											possible.
										</p>
										<p className="leading-relaxed">
											EventzFlow may collect, record and analyze information of
											Visitors to its website including your IP address and
											cookies. EventzFlow may add information collected by way
											of page view activity. EventzFlow may also collect and
											process any Personal Data that you volunteer to us in our
											website&apos;s forms, such as when you register for events
											or sign up for information and newsletters. If you provide
											EventzFlow with your social media details, EventzFlow may
											retrieve publicly available information about you from
											social media.
										</p>
										<p className="leading-relaxed">
											Such Personal Data may comprise your IP address, first and
											last name, your postal and email address, your telephone
											number, your job title, data for social networks, your
											areas of interest, and certain information about the
											company you are working for (company name and address), as
											well as information as to the type of relationship that
											exists between EventzFlow and yourself.
										</p>
										<p className="leading-relaxed">
											EventzFlow gathers data about visits to the website,
											including numbers of Visitors and visits, Geo-location
											data, length of time spent on the site, pages clicked on
											or where Visitors have come.
										</p>
									</div>

									<div className="space-y-6">
										<div className="border-black border-l-4 py-1 pl-6">
											<h4 className="mb-2 font-bold text-black text-sm uppercase tracking-tight">
												Purpose of Processing Personal Data
											</h4>
											<p className="leading-relaxed">
												EventzFlow uses the collected data to communicate with
												Visitors, to customize content for Visitors, to show ads
												on other websites to Visitors, and to improve its
												website by analyzing how Visitors navigate its website.
											</p>
										</div>

										<div className="border-black border-l-4 py-1 pl-6">
											<h4 className="mb-2 font-bold text-black text-sm uppercase tracking-tight">
												Sharing Personal Data
											</h4>
											<p className="leading-relaxed">
												EventzFlow may also share such information with service
												vendors or contractors in order to provide a requested
												service or transaction or in order to analyze the
												Visitors&apos; behavior on its website.
											</p>
										</div>

										<div className="border-black border-l-4 py-1 pl-6">
											<h4 className="mb-2 font-bold text-black text-sm uppercase tracking-tight">
												Cookies
											</h4>
											<p className="leading-relaxed">
												Cookies are small pieces of information sent by a
												website to a Visitor&apos;s hard disk. Cookies cannot be
												used to run programs or deliver viruses to your
												computer. By continuing to visit the website, you agree
												to the placement of cookies on your device. If you
												choose not to accept our cookies, we cannot guarantee
												that your experience will be as fulfilling as it would
												otherwise be. We may also place cookies from third
												parties for functional and marketing purposes. The use
												of cookies is widespread and benefits the surfer.
											</p>
										</div>

										<div className="border-black border-l-4 py-1 pl-6">
											<h4 className="mb-2 font-bold text-black text-sm uppercase tracking-tight">
												Links to Other Sites
											</h4>
											<p className="leading-relaxed">
												Please be aware that while visiting our site, Visitors
												can follow links to other sites that are beyond our
												sphere of influence. EventzFlow is not responsible for
												the content or privacy policy of these other sites.
											</p>
										</div>
									</div>
								</div>

								{/* Attendees Category */}
								<div className="space-y-6">
									<h3 className="font-bold text-black text-xl uppercase tracking-tight">
										1.2 Attendees
									</h3>
									<div className="space-y-4 text-justify [&_p+p]:indent-8">
										<p className="leading-relaxed">
											Attendees should be aware that in responding to events
											registrations or events invitations powered by EventzFlow,
											they could be disclosing information that could make them
											personally identifiable to Organisers. Attendees
											responding to these registrations / invitations should be
											aware that they alone are responsible for the content of
											their responses. For more detailed information concerning
											the protection of privacy when responding to event
											registrations and/or event invitations, Attendees may
											contact the Organiser of the event. It is the
											Organiser&apos;s responsibility to ensure that collection
											and processing of data are done in accordance with
											applicable law. EventzFlow will not process Personal Data
											of Attendees for other purposes or by other means than
											instructed by its Organisers.
										</p>
									</div>

									<div className="space-y-6">
										<div className="border-black border-l-4 py-1 pl-6">
											<h4 className="mb-2 font-bold text-black text-sm uppercase tracking-tight">
												Inquiries
											</h4>
											<p className="leading-relaxed">
												If you wish to inquire about your Personal Data that may
												have been collected from any forms powered by
												EventzFlow, we recommend that you contact the Organiser
												that created or sent you the event registration form /
												event invitation. As EventzFlow is a Processor, it does
												not control the Personal Data used or stored but
												processes it on behalf of its Organisers.
											</p>
										</div>

										<div className="border-black border-l-4 py-1 pl-6">
											<h4 className="mb-2 font-bold text-black text-sm uppercase tracking-tight">
												Collection of Attendees&apos; Data
											</h4>
											<div className="space-y-4 text-justify [&_p+p]:indent-8">
												<p className="leading-relaxed">
													During Attendees&apos; registrations on
													EventzFlow&apos;s platform, they provide information
													such as name, company name, email, address, telephone,
													credit-card number and other relevant data. This
													information is used by EventzFlow to identify the
													Attendees and provide them with support, services,
													mailings, sales and marketing actions, billing and to
													meet contractual obligations.
												</p>
												<p className="leading-relaxed">
													EventzFlow&apos; contractual obligations are only in
													accordance with the Organisers&apos; instructions.
													EventzFlow will not retain Attendees&apos; data longer
													than is necessary to fulfil the purposes for which it
													was collected or as required by applicable laws or
													regulations.
												</p>
												<p className="leading-relaxed">
													It is the Organiser&apos;s responsibility to ensure
													that all collection and processing of Personal Data is
													done in accordance with applicable law. EventzFlow
													will not process Personal Data for other purposes or
													by other means than instructed by its Users.
												</p>
												<p className="leading-relaxed">
													Attendees&apos; data includes data from individuals
													uploaded, transferred or manually entered by an
													EventzFlow Organiser into their account. Personal Data
													may include, personal contact information such as
													name, home address, home telephone or mobile number,
													email address, information concerning family,
													lifestyle and social circumstances including age, date
													of birth, marital status, number of children,
													employment details, education/qualification, business
													contact details, gender, religion, race, health detail
													and other sensitive Personal Data. Answers to
													questions by Attendees may also include Personal Data.
												</p>
												<p className="leading-relaxed">
													For Organisers and Attendees in the European Economic
													Area (&ldquo;EEA&rdquo;), the Organiser will be known
													as the &ldquo;controller&rdquo;, while EventzFlow will
													be known as the &ldquo;processor&rdquo; as defined in
													the Directive and the GDPR.
												</p>
												<p className="leading-relaxed">
													If you or your organization are required under the
													European Union&apos;s General Data Protection
													Regulation (GDPR) to enter into a contract, or other
													binding legal act under EU or Member State law, with
													your data processors, you are required to review and
													accept EventzFlow&apos; Data Processing Agreement.
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Organisers Category */}
								<div className="space-y-6">
									<h3 className="font-bold text-black text-xl uppercase tracking-tight">
										1.3 Organisers
									</h3>
									<div className="space-y-4 text-justify [&_p+p]:indent-8">
										<p className="leading-relaxed">
											In order to provide services to its Organisers, EventzFlow
											requires the entity to first agree to provide us with
											pertinent Personal Data to setup its accounts.
											Furthermore, EventzFlow&apos; Organisers collect
											information from Attendees when they launch events
											registration / distribute event invitations. This section
											will describe how these two types of data are collected
											and used by EventzFlow as well as geographical differences
											that affect this policy. Data entered or transferred into
											EventzFlow by Organisers such as texts, questions,
											contacts, media files, etc., remains the property of the
											Organiser and may not be shared with a third party by
											EventzFlow without express consent from the Organiser.
										</p>
									</div>

									<div className="space-y-6">
										<div className="border-black border-l-4 py-1 pl-6">
											<h4 className="mb-2 font-bold text-black text-sm uppercase tracking-tight">
												Collection of Organisers&apos; Data
											</h4>
											<div className="space-y-4 text-justify [&_p+p]:indent-8">
												<p className="leading-relaxed">
													During Organisers&apos; registrations / accounts&apos;
													sign ups, they provide information such as name,
													company name, email, address, telephone, credit-card
													number and other relevant data. This information is
													used by EventzFlow to identify the Organisers and
													provide them with support, services, mailings, sales
													and marketing actions, billing and to meet contractual
													obligations.
												</p>
												<p className="leading-relaxed">
													If the Organisers wish to edit and/or remove their
													Personal Data from all EventzFlow platforms, they
													shall (in writing) request EventzFlow to carry out the
													required actions for said actions above. EventzFlow
													will not retain Organisers&apos; data longer than is
													necessary to fulfil the purposes for which it was
													collected or as required by applicable laws or
													regulations.
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</PolicySection>

					{/* Section 2: Use of Your Personal Information */}
					<PolicySection
						id="use-of-information"
						sectionNumber={2}
						title="Use of Your Personal Information"
						icon={UserCheck}
						isBlack
					>
						<div className="space-y-4 text-justify text-base text-white/70 md:text-lg [&_p+p]:indent-8">
							<p className="leading-relaxed">
								EventzFlow collects and uses your personal information to
								operate and deliver the services you have requested. When you
								sign up with EventzFlow, you are automatically enrolled in our
								periodic newsletter. This newsletter has information about new
								features, and useful tips about using the website. If you do not
								wish to receive the periodic newsletter, simply unsubscribe by
								clicking the &ldquo;Unsubscribe&rdquo; links in the newsletter.
								When you unsubscribe, you will no longer receive the periodic
								newsletter. However, you will continue to receive emails that
								are related to your usage of the EventzFlow website. EventzFlow
								also uses your personally identifiable information to inform you
								of other products or services available from EventzFlow and its
								affiliates. EventzFlow may also contact you via surveys to
								conduct research about your opinion of current services or of
								potential new services that may be offered. EventzFlow will
								communicate with you through emails and messages posted on
								EventzFlow.
							</p>
							<p className="leading-relaxed">
								There is also information about your computer hardware and
								software that is automatically collected by EventzFlow. This
								information can include: your IP address, browser type, domain
								names, access times, pages visited, features used and referring
								Web site addresses. This information is used by EventzFlow for
								the operation of the service, to maintain quality of the
								service, and to provide general statistics regarding use of
								EventzFlow.
							</p>
							<p className="leading-relaxed">
								EventzFlow may, from time to time, contact you on behalf of
								carefully selected business partners about a particular offering
								that we believe may be of interest to you. In those cases, your
								unique personally identifiable information (e-mail, name) is not
								transferred to the third party. In addition, EventzFlow may
								share data with trusted partners to help us perform statistical
								analysis, send you email or postal mail, provide customer
								support, or arrange for deliveries. All such third parties are
								prohibited from using your personal information except to
								provide these services to EventzFlow, and they are required to
								maintain the confidentiality of your information.
							</p>
							<p className="leading-relaxed">
								From time to time, EventzFlow may enter into strategic
								partnerships in which your personally identifiable information
								may be provided to a carefully selected business partner. These
								strategic partnerships may include private-label, co-branded
								websites, or other promotional web pages for which EventzFlow
								receives financial compensation. Any strategic partners to whom
								we disclose personal information may have their own privacy
								policies, which describe how they use and disclose personal
								information. Those policies will govern use, handling and
								disclosure of your personal information once we have shared it
								with those strategic partners as described in this Privacy
								Policy.
							</p>
							<p className="leading-relaxed">
								EventzFlow keeps track of the Web sites and pages our customers
								visit within EventzFlow, in order to determine what services are
								the most popular. This data is used to deliver customized
								content and advertising within EventzFlow to customers whose
								behavior indicates that they are interested in a particular
								subject area.
							</p>
						</div>
					</PolicySection>

					{/* Section 3: Retention and Deletion */}
					<PolicySection
						id="retention-deletion"
						sectionNumber={3}
						title="Retention and Deletion"
						icon={Clock}
					>
						<div className="space-y-4 text-justify text-base text-black/70 md:text-lg [&_p+p]:indent-8">
							<p className="leading-relaxed">
								EventzFlow will not retain data longer than is necessary to
								fulfil the purposes for which it was collected or as required by
								applicable laws or regulations. For Attendees&apos; data,
								EventzFlow&apos; Organisers have control of the purpose for
								collecting data, and the duration for which the Personal Data
								may be kept. When an Organiser&apos;s account is terminated or
								expired, all Personal Data collected through the platform will
								be deleted only when instructed by the Organiser, as required by
								applicable law.
							</p>
						</div>
					</PolicySection>

					{/* Section 4: Acceptance of These Conditions */}
					<PolicySection
						id="acceptance"
						sectionNumber={4}
						title="Acceptance of These Conditions"
						icon={FileText}
						isBlack
					>
						<div className="space-y-4 text-justify text-base text-white/70 md:text-lg [&_p+p]:indent-8">
							<p className="leading-relaxed">
								We assume that all Visitors to our website, Attendees registered
								on forms powered by EventzFlow, and Organisers have carefully
								read this document and agree to its contents. If someone does
								not agree with this privacy policy, they should refrain from
								using our website and platform. We reserve the right to change
								our privacy policy as necessity dictates. Continued use of
								EventzFlow website and platform after having been informed of
								any such changes to these conditions implies acceptance of the
								revised privacy policy.
							</p>
						</div>
					</PolicySection>

					{/* Section 5: Legal Obligation to Disclose */}
					<PolicySection
						id="legal-obligation"
						sectionNumber={5}
						title="Our Legal Obligation to Disclose Personal Information"
						icon={Shield}
					>
						<div className="space-y-4 text-justify text-base text-black/70 md:text-lg [&_p+p]:indent-8">
							<p className="leading-relaxed">
								We will reveal an Organiser&apos;s and / or Attendee&apos;s
								personal information without his/her prior permission only when
								we have reason to believe that the disclosure of this
								information is required to establish the identity of, to contact
								or to initiate legal proceedings against a person or persons who
								are suspected of infringing rights or property belonging to
								EventzFlow or to others who could be harmed by the user&apos;s
								activities or of persons who could (deliberately or otherwise)
								transgress upon these rights and property. We are permitted to
								disclose personal information when we have good reason to
								believe that this is legally required.
							</p>
						</div>
					</PolicySection>

					{/* Section 6: Changes to This Privacy Policy */}
					<PolicySection
						id="changes"
						sectionNumber={6}
						title="Changes to This Privacy Policy"
						icon={RefreshCw}
						isBlack
					>
						<div className="space-y-4 text-justify text-base text-white/70 md:text-lg [&_p+p]:indent-8">
							<p className="leading-relaxed">
								EventzFlow will occasionally update this Privacy Policy. When we
								make changes, we will post the updated Privacy Policy here. We
								recommend that you check our website from time to time to inform
								yourself of any changes to the Privacy Policy.
							</p>
						</div>
					</PolicySection>

					{/* Section 7: Geographical Location */}
					<PolicySection
						id="geographical-location"
						sectionNumber={7}
						title="Geographical Location"
						icon={Globe}
					>
						<div className="space-y-4 text-justify text-base text-black/70 md:text-lg [&_p+p]:indent-8">
							<p className="leading-relaxed">
								All data collected by Organisers through EventzFlow will be
								stored exclusively in{" "}
								<strong className="text-black">AWS Singapore</strong>. All
								hosting is performed in accordance with the highest security
								regulations. All transfers of data internally in the EEA and/or
								involves the transfer of data from within the EEA to any third
								party country out of the EEA shall be done in accordance with
								the General Data Protection Regulation &ldquo;GDPR&rdquo;.
							</p>
							<p className="leading-relaxed">
								EventzFlow has adopted reasonable physical, technical and
								organizational safeguards for all Personal Data collected from
								its website and/or platform against accidental, unauthorized or
								unlawful destruction, loss, alteration, disclosure, access, use
								or processing of the Organisers&apos; data in EventzFlow&apos;
								possession. EventzFlow will promptly notify the Organiser and
								where suitable, the Attendees in the event of any known
								unauthorized access to, or use of, the Organisers&apos; data.
							</p>
						</div>
					</PolicySection>

					{/* Section 8: Data Security */}
					<PolicySection
						id="data-security"
						sectionNumber={8}
						title="Data Security"
						icon={Lock}
						isBlack
					>
						<div className="space-y-4 text-justify text-base text-white/70 md:text-lg [&_p+p]:indent-8">
							<p className="leading-relaxed">
								EventzFlow implements and maintains appropriate technical,
								security and organisational measures to protect Personal Data
								against unauthorized or unlawful processing and use, and against
								accidental loss, destruction, damage, theft or disclosure.
							</p>
						</div>
					</PolicySection>

					{/* Section 9: DPO Contact */}
					<PolicySection
						id="dpo"
						sectionNumber={9}
						title="EventzFlow Data Protection Officer (DPO)"
						icon={Mail}
					>
						<div className="text-justify text-base text-black/70 md:text-lg [&_p+p]:indent-8">
							<p className="mb-6 indent-0 leading-relaxed">
								EventzFlow&apos; appointed &ldquo;Data Protection Officer&rdquo;
								or DPO shall be responsible for matters relating to privacy and
								data protection. This Data Protection Officer can be reached at
								the following address:
							</p>
							<div className="border border-black/20 bg-black/5 p-6 indent-0">
								<div className="space-y-2">
									<div>
										<strong className="text-black">
											EventzFlow (Jesselton Pixel Sdn Bhd)
										</strong>
									</div>
									<div>
										<strong className="text-black">Attn:</strong> Mohammad Fazli
										Bin Losimin
									</div>
									<div>
										<strong className="text-black">Email:</strong>{" "}
										<a
											href="mailto:hello@eventzflow.com"
											className="text-black underline hover:no-underline"
										>
											hello@eventzflow.com
										</a>
									</div>
								</div>
							</div>
							<div className="mt-6 space-y-4">
								<p className="leading-relaxed">
									Jesselton Pixel Sdn. Bhd. (202001041027) has created this
									privacy statement to exude its commitment to privacy.
								</p>
								<p className="leading-relaxed">
									EventzFlow is committed to protecting your privacy and
									providing you the most powerful and safe online experience.
									This publication intends to help you understand how personal
									information you provide to EventzFlow is collected and used,
									so you can make informed decisions when using the website
									located at www.eventzflow.com (&ldquo;EventzFlow&rdquo;).
								</p>
								<p className="leading-relaxed">
									By using EventzFlow, you consent to the data practices
									described in this statement. Notices of all changes that
									materially affect ways that your personally identifiable
									information may be used or shared will be posted in updates to
									our privacy policy. If you continue to use EventzFlow and
									services after these notices of changes have been posted to
									the site, you hereby provide your consent to the changed
									practices.
								</p>
								<p className="leading-relaxed">
									If you have any questions regarding this Privacy Policy,
									please contact:{" "}
									<a
										href="mailto:hello@eventzflow.com"
										className="font-bold text-black underline hover:no-underline"
									>
										hello@eventzflow.com
									</a>
									.
								</p>
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
						className="text-sm text-white/50"
					>
						This Privacy Policy is effective as of the date stated above and
						applies to all users of our Services.
					</motion.p>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2, ease: SMOOTH_EASE }}
						className="mt-8"
					>
						<Link
							href="/terms-and-conditions"
							className="border border-white px-8 py-4 text-center font-bold text-white text-xs tracking-widest transition-all duration-300 hover:border-[#23c460] hover:bg-[#23c460]"
						>
							VIEW TERMS &amp; CONDITIONS
						</Link>
					</motion.div>
				</div>
			</section>
		</main>
	);
}
