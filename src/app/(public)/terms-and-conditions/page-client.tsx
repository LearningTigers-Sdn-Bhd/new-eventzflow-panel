"use client";

import { motion } from "framer-motion";
import {
	AlertTriangle,
	CreditCard,
	FileText,
	Globe,
	type LucideIcon,
	Mail,
	Phone,
	RefreshCw,
	Scale,
	Shield,
	UserCheck,
	Users,
	XCircle,
	Info,
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
						Please read these terms and conditions carefully before using our services. Your use of EventzFlow constitutes your agreement to all such terms, conditions, and notices.
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
						className="space-y-6 text-center"
					>
						<p className="text-base leading-relaxed text-black/70 md:text-lg max-w-4xl mx-auto">
							<strong className="text-black uppercase">Agreement between User and EventzFlow – Jesselton Pixel Sdn Bhd</strong>
						</p>
						<p className="text-base leading-relaxed text-black/70 md:text-lg max-w-4xl mx-auto">
							EventzFlow consists of various web pages and applications operated by Jesselton Pixel Sdn Bhd located under the www.eventzflow.com and eventzflow.com domains.
						</p>
						<p className="text-base leading-relaxed text-black/70 md:text-lg max-w-4xl mx-auto">
							EventzFlow is offered to you conditioned on your acceptance without modification of the terms, conditions, and notices contained herein. Your use of EventzFlow constitutes your agreement to all such terms, conditions, and notices. When you create (or are assigned to) an account at EventzFlow, you accept these terms and conditions.
						</p>
					</motion.div>
				</div>
			</section>

			{/* Terms Sections */}
			<section className="bg-white px-6 pb-24">
				<div className="mx-auto max-w-5xl space-y-6">
					{/* Section 1: Links to Third Party Sites */}
					<PolicySection
						id="third-party-links"
						sectionNumber={1}
						title="Links to Third Party Sites"
						icon={Globe}
					>
						<div className="text-black/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								EventzFlow may contain links to other Web Sites or &ldquo;Linked Sites&rdquo;. The Linked Sites are not under the control of EventzFlow and EventzFlow is not responsible for the contents of any Linked Sites, including without limitation any link contained in a Linked Site, or any changes or updates to a Linked Site. EventzFlow is not responsible for webcasting or any other form of transmission received from any Linked Sites. EventzFlow is providing these links to you only as a convenience, and the inclusion of any link does not imply endorsement by EventzFlow of the site or any association with its operators.
							</p>
						</div>
					</PolicySection>

					{/* Section 2: No Unlawful or Prohibited Use */}
					<PolicySection
						id="no-unlawful-use"
						sectionNumber={2}
						title="No Unlawful or Prohibited Use"
						icon={Shield}
						isBlack
					>
						<div className="text-white/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								As a condition of your use of the EventzFlow Web Site, you warrant to EventzFlow that you will not use EventzFlow for any purpose that is unlawful or prohibited by these terms, conditions, and notices. You may not use EventzFlow in any manner which could damage, disable, overburden, or impair EventzFlow or interfere with any other party&rsquo;s use and enjoyment of EventzFlow. You may not obtain or attempt to obtain any materials or information through any means not intentionally made available or provided for through EventzFlow.
							</p>
						</div>
					</PolicySection>

					{/* Section 3: User Conduct */}
					<PolicySection
						id="user-conduct"
						sectionNumber={3}
						title="User Conduct"
						icon={UserCheck}
					>
						<div className="text-black/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								EventzFlow reserves the right, but does not assume the responsibility, to monitor or review your conduct on EventzFlow. Your use of EventzFlow is subject to all applicable local, state, national and international laws and regulations.
							</p>
							<p className="leading-relaxed">
								In using EventzFlow you agree not to post, transmit, or otherwise make available, through or in connection with EventzFlow:
							</p>
							<ul className="space-y-4 indent-0 list-none mt-4">
								{[
									"Anything that is or may be (a) unlawful, threatening, harassing, degrading, abusive, hateful or intimidating; (b) defamatory; libelous or invasive of another’s privacy; (c) fraudulent or tortuous; (d) vulgar, obscene, indecent, sexually explicit, pornographic or otherwise objectionable; or (e) protected by copyright, trademark, trade secret, right of publicity or other proprietary rights without the express prior consent of the owner of such right.",
									"Any material that would give rise to criminal or civil liability; that encourages conduct that constitutes a criminal offense, including prostitution; or that encourages or provides instructional information about illegal activities or activities such as “hacking,” “cracking,” or “phreaking.”",
									"Any virus, worm, Trojan Horse, easter egg, time bomb, spyware, cancelbot, or other computer code, file, or program that is harmful or invasive or that may or is intended to damage or hijack the operation of, or to monitor the use of, any hardware, software or equipment.",
									"Any unsolicited or unauthorized advertising, promotional material, “junk mail,” “spam,” “chain letter,” “pyramid scheme”, survey, contest, or investment opportunity, or any other form of solicitation, or use any distribution lists including any person who has not given specific permission to be included in such a process (commercial or otherwise).",
									"Any unlawful, harassing, defamatory, abusive, threatening, harmful, vulgar, obscene, sexually explicit, or otherwise objectionable material of any kind or nature;",
									"Any Materials that you do not have a right to transmit under any law or under contractual or fiduciary relationships (such as inside information, proprietary and confidential information learned or disclosed as part of employment relationships or under nondisclosure agreements).",
									"Impersonate any person or entity, including without limitation any of our officials, forum leaders, guides or hosts; falsely state or otherwise misrepresent your affiliation with any person or entity; or express or imply that we endorse any statement you make.",
									"Interfere with or disrupt the operation of EventzFlow or the servers or networks used to make EventzFlow available; or violate any requirements, procedures, policies or regulations of such networks.",
									"Use EventzFlow to distribute or otherwise publish any material containing any solicitation of funds, promotion, advertising, or solicitation for goods or services without our express prior written consent; or use EventzFlow in a commercial manner.",
									"Attempt to gain unauthorized access to EventzFlow, other accounts, computer systems or networks connected to EventzFlow, through password mining or any other means.",
									"Use any robot, spider, site search/retrieval application or other manual or automatic device to retrieve, index, “scrape,” “data mine” or in any way gather Content or Materials from EventzFlow or reproduce or circumvent the navigational structure or presentation of EventzFlow.",
									"Engage in any other conduct which, in EventzFlow&rsquo; sole discretion, is considered inappropriate, unauthorized or objectionable."
								].map((item, idx) => (
									<li key={idx} className="flex gap-6 border-l-4 border-black pl-6 py-2">
										<span className="font-black text-black text-xl">{idx + 1}.</span>
										<span className="leading-relaxed">{item}</span>
									</li>
								))}
							</ul>
						</div>
					</PolicySection>

					{/* Section 4: No Spamming */}
					<PolicySection
						id="no-spamming"
						sectionNumber={4}
						title="No Spamming"
						icon={XCircle}
						isBlack
					>
						<div className="text-white/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								You agree not to use any feature of EventzFlow for chain letters, junk mail, or &ldquo;Spamming&rdquo; nor make any use of the distribution lists in a manner involving any person who has not given specific permission to be included in such a process. An e-mail advertisement which is (a) addressed to a recipient with whom you do not have an existing business or personal relationship and (b) is not sent at the request of or with the express consent of the recipient to receive such communications from you (&ldquo;Spam&rdquo; or &ldquo;Spamming&rdquo;) is strictly prohibited by EventzFlow . 
							</p>
							<p className="leading-relaxed">
								If you use any feature of EventzFlow for the purpose of sending Spam, your right to use EventzFlow immediately terminates and EventzFlow reserves the right to seek appropriate legal recourse, as necessary. You agree that EventzFlow may, at its sole discretion, immediately remove any communications that it reasonably believes constitutes &ldquo;Spamming,&rdquo; including removal of any contact information related thereto. If you believe that other users are using EventzFlow for Spam, please notify EventzFlow by emailing at <a href="mailto:hello@eventzflow.com" className="text-white underline font-bold">hello@eventzflow.com</a>.
							</p>
							<p className="leading-relaxed italic text-sm">
								Please note that by posting a public event you are consenting to receive, and authorizing EventzFlow to forward to you, emails from other users. Such messages are not included in the above definition of Spam.
							</p>
						</div>
					</PolicySection>

					{/* Section 5: Use of Communication Services */}
					<PolicySection
						id="communication-services"
						sectionNumber={5}
						title="Use of Communication Services"
						icon={Users}
					>
						<div className="text-black/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								EventzFlow may contain message board services, chat areas, news groups, forums, surveys, polls, communities, personal web pages, and/or other message or communication facilities designed to enable you to communicate with the public at large or with a group (collectively, &ldquo;Communication Services&rdquo;), you agree to use the Communication Services only to post, send and receive messages and material that are proper and related to the particular Communication Service.
							</p>
							<p className="leading-relaxed">
								EventzFlow has no obligation to monitor the Communication Services. However, EventzFlow reserves the right to review materials posted to a Communication Service and to remove any materials in its sole discretion. EventzFlow reserves the right to terminate your access to any or all of the Communication Services at any time without notice for any reason whatsoever. EventzFlow reserves the right at all times to disclose any information as necessary to satisfy any applicable law, regulation, legal process or governmental request, or to edit, refuse to post or to remove any information or materials, in whole or in part, in EventzFlow&rsquo; sole discretion.
							</p>
						</div>
					</PolicySection>

					{/* Section 6: Materials Provided to EventzFlow */}
					<PolicySection
						id="materials-provided"
						sectionNumber={6}
						title="Materials Provided to EventzFlow or Posted"
						icon={FileText}
						isBlack
					>
						<div className="text-white/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								EventzFlow does not claim ownership of the materials you provide to EventzFlow (including feedback and suggestions) or post, upload, input or submit to EventzFlow or its associated services (collectively &ldquo;Submissions&rdquo;). However, by posting, uploading, inputting, providing or submitting your Submission you are granting EventzFlow, its affiliated companies and necessary sub-licensees permission to use your Submission in connection with the operation of their Internet businesses including, without limitation, the rights to: copy, distribute, transmit, publicly display, publicly perform, reproduce, edit, translate and reformat your Submission; and to publish your name in connection with your Submission.
							</p>
							<p className="leading-relaxed">
								No compensation will be paid with respect to the use of your Submission, as provided herein. EventzFlow is under no obligation to post or use any Submission you may provide and may remove any Submission at any time in EventzFlow&rsquo; sole discretion.
							</p>
							<p className="leading-relaxed">
								By posting, uploading, inputting, providing or submitting your Submission you warrant and represent that you own or otherwise control all of the rights to your Submission as described in this section including, without limitation, all the rights necessary for you to provide, post, upload, input or submit the Submissions.
							</p>
						</div>
					</PolicySection>

					{/* Section 7: Memberships and Packages */}
					<PolicySection
						id="memberships-packages"
						sectionNumber={7}
						title="Memberships and Packages"
						icon={CreditCard}
					>
						<div className="text-black/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								EventzFlow Basic, Professional, Enterprise and À La Carte are paid versions that are available on annual subscription and pay-per-event. Purchasing Account Upgrade and Credits can be done within EventzFlow. It is your responsibility to promptly provide EventzFlow with any contact or billing information changes or updates (including, address, credit card numbers, etc). New features will be added to the paid versions of EventzFlow on a regular basis. Some features may become free at the sole discretion of EventzFlow.
							</p>
						</div>
					</PolicySection>

					{/* Section 8: Payment */}
					<PolicySection
						id="payment"
						sectionNumber={8}
						title="Payment"
						icon={CreditCard}
						isBlack
					>
						<div className="text-white/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								Payment for EventzFlow&rsquo; services and packages can made via credit card and online banking in multiple currencies and is non-refundable. EventzFlow reserves the right to cancel your services and packages in the case of non-payment or invalid credit card details. Any attorney fees, court costs, or other costs incurred in collection of delinquent undisputed amounts shall be the responsibility of and paid for by the User. If payment is not current, EventzFlow may immediately cease to provide any and all deliverables to the User. User must notify EventzFlow about any billing problems or discrepancies within 30 days after charges first appear on your statement. If it is not brought to the attention of EventzFlow within 30 days, you agree to waive your right to dispute such problems or discrepancies.
							</p>
						</div>
					</PolicySection>

					{/* Section 9: Refund Policy */}
					<PolicySection
						id="refund-policy"
						sectionNumber={9}
						title="Event Registration Refund Policy"
						icon={Scale}
					>
						<div className="text-black/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8 space-y-6">
							<p className="leading-relaxed">
								EventzFlow is an event management platform used by Event Organizers to manage registrations and payments for their events. While EventzFlow provides the system and payment processing support, each Organizer remains responsible for setting and enforcing their own event refund policy. The refund handling process depends on whether the transaction has been remitted to the Organizer.
							</p>

							<div className="border-l-4 border-black pl-6 py-2 space-y-4 indent-0">
								<h4 className="font-bold text-black uppercase tracking-tight">For Organizer</h4>
								<p className="leading-relaxed">
									To apply for refund for the attendees you may contact our support team at <a href="mailto:hello@eventzflow.com" className="font-bold text-black underline">hello@eventzflow.com</a> with details below:
								</p>
								<ul className="space-y-1 list-none font-mono text-sm bg-black/5 p-4 border border-black/10">
									<li>Event Name:</li>
									<li>Transaction No/ID:</li>
									<li>Attendees Name:</li>
									<li>Attendees Email:</li>
								</ul>
								<p className="leading-relaxed text-sm italic">
									All requests must be submitted in email. Any request via another medium of communication will not be accepted.
								</p>
								<div className="bg-black/5 p-4 border border-black/10">
									<h5 className="font-bold text-black text-xs uppercase mb-2 flex items-center gap-2">
										<Info className="h-3 w-3" /> Important Note
									</h5>
									<p className="text-sm leading-relaxed">
										EventzFlow will only process refunds directly to attendees for transactions that have not yet been remitted to the Organizer. Once the remittance period has passed, all refund requests must be handled by the Organizer. After this period, attendees are required to contact the Organizer directly regarding any refund matters.
									</p>
								</div>
							</div>

							<div className="border-l-4 border-black pl-6 py-2 space-y-4 indent-0">
								<h4 className="font-bold text-black uppercase tracking-tight">For Attendees/Participants</h4>
								<p className="leading-relaxed">
									In order to initiate a refund request, EventzFlow instructs Attendees or Participants to contact the Organizer directly as set forth in the Organizer&rsquo;s applicable refund policy. If attendees are unable to get Organizer&rsquo;s contact, you may contact our support team at <a href="mailto:hello@eventzflow.com" className="font-bold text-black underline">hello@eventzflow.com</a>. Our team will help you to get the Organizer details for you to request your refund.
								</p>
								<p className="leading-relaxed">
									EventzFlow will only proceed with the refunding process if the request is coming from the Organizer. EventzFlow will only process refunds directly to attendees for transactions that have not yet been remitted to the Organizer. Once the refund process has been approved, it may take 7-15 days for the amount to be transferred in your account.
								</p>
							</div>
						</div>
					</PolicySection>

					{/* Section 10: Indemnity */}
					<PolicySection
						id="indemnity"
						sectionNumber={10}
						title="Indemnity"
						icon={Shield}
						isBlack
					>
						<div className="text-white/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								You agree to indemnify and hold harmless EventzFlow, and its subsidiaries, affiliates, officers, agents, or other partners, and employees, from any claim or demand, including reasonable attorneys&rsquo; fees, made by any third party due to or arising out of your use of and access to EventzFlow, your violation of the TOS, your violation of any rights of another person or entity, or your violation of any applicable laws or regulations.
							</p>
						</div>
					</PolicySection>

					{/* Section 11: Applicable Law */}
					<PolicySection
						id="applicable-law"
						sectionNumber={11}
						title="Applicable Law"
						icon={Scale}
					>
						<div className="text-black/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								The materials in this site are provided &ldquo;as is&rdquo; and without warranties of any kind either expressed or implied to the fullest extent permissible pursuant to applicable law. User agrees to indemnify, defend and hold EventzFlow and all affiliated partners harmless from any claims (including, but not limited to, claims for defamation, trade disparagement, privacy and intellectual property infringement) and damages including attorneys&rsquo; fees arising from any submissions by you or through your account.
							</p>
						</div>
					</PolicySection>

					{/* Section 12: Merger or Acquisition */}
					<PolicySection
						id="merger-acquisition"
						sectionNumber={12}
						title="Merger or Acquisition"
						icon={Users}
						isBlack
					>
						<div className="text-white/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								It is possible that the services and/or related assets of EventzFlow might be acquired as part of a merger or acquisition. In such an event, you understand and agree that EventzFlow may assign its rights under these terms and that your personal information may be transferred to the succeeding entity.
							</p>
						</div>
					</PolicySection>

					{/* Section 13: Liability Disclaimer */}
					<PolicySection
						id="liability-disclaimer"
						sectionNumber={13}
						title="Liability Disclaimer"
						icon={AlertTriangle}
					>
						<div className="text-black/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed italic">
								The EventzFlow collection of website services and contents are provided &ldquo;as-is&rdquo; without exception.
							</p>
							<p className="leading-relaxed">
								The information, software, products, and services included in or available through EventzFlow may include inaccuracies or typographical errors. Changes are periodically added to the information herein. EventzFlow and/or its suppliers may make improvements and/or changes to EventzFlow at any time.
							</p>
							<p className="leading-relaxed">
								EventzFlow and/or its suppliers make no representations about the suitability, reliability, availability, timeliness, and accuracy of the information, software, products, services and related graphics contained on EventzFlow for any purpose. EventzFlow and/or its suppliers hereby disclaim all warranties and conditions with regard to this information, software, products, services and related graphics, including all implied warranties or conditions of merchantability, fitness for a particular purpose, title and non- infringement.
							</p>
							<p className="leading-relaxed">
								To the maximum extent permitted by applicable law, in no event shall EventzFlow and/or its suppliers be liable for any direct, indirect, punitive, incidental, special, consequential damages or any damages whatsoever including, without limitation, damages for loss of use, data or profits, arising out of or in any way connected with the use or performance of EventzFlow, with the delay or inability to use EventzFlow or related services, the provision of or failure to provide services, or for any information, software, products, services and related graphics obtained through EventzFlow, or otherwise arising out of the use of EventzFlow, whether based on contract, tort, negligence, strict liability or otherwise, even if EventzFlow or any of its suppliers has been advised of the possibility of damages. Because some states/jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages, the above limitation may not apply to the User. If the User is dissatisfied with any portion of EventzFlow, or with any of these terms of use, your sole and exclusive remedy is to discontinue using EventzFlow.
							</p>
						</div>
					</PolicySection>

					{/* Section 14: Copyrights and Trademark Notices */}
					<PolicySection
						id="copyrights-trademarks"
						sectionNumber={14}
						title="Copyrights and Trademark Notices"
						icon={FileText}
						isBlack
					>
						<div className="text-white/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								All contents of EventzFlow are protected by Malaysia&rsquo;s and Indonesia&rsquo;s copyrights law and international treaties and may not be copied or re-used without the express permission of Jesselton Pixel Sdn Bhd (hereinafter referred to as &ldquo;EventzFlow&rdquo;), which reserves all rights. Reuse of any of such content online for any purpose is strictly prohibited. Permission to use EventzFlow proprietary content is granted on a case-by-case basis. Please direct your inquiries to <a href="mailto:hello@eventzflow.com" className="text-white underline font-bold">hello@eventzflow.com</a>.
							</p>
							<p className="leading-relaxed">
								Among the trademarks and wordmarks owned by The Company are EventzFlow, Jesselton Pixel Sdn Bhd and the respective logos of all the sites. These trademarks and wordmarks are filed and registered in Malaysia.
							</p>
						</div>
					</PolicySection>

					{/* Section 15: Modification and Privacy */}
					<PolicySection
						id="modification-privacy"
						sectionNumber={15}
						title="Modification and Privacy"
						icon={RefreshCw}
					>
						<div className="text-black/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="leading-relaxed">
								EventzFlow reserves the right to change the terms, conditions, and notices under which EventzFlow is offered. The effective date will be posted at the top of this agreement if any changes are made to the agreement.
							</p>
							<p className="leading-relaxed font-bold">
								Please also refer to EventzFlow&rsquo;s <Link href="/privacy-policy" className="text-black underline hover:no-underline">Privacy Policy</Link> as part of the terms of use.
							</p>
						</div>
					</PolicySection>

					{/* Section 16: Contact Information */}
					<PolicySection
						id="contact"
						sectionNumber={16}
						title="Contact Information"
						icon={Phone}
					>
						<div className="text-black/70 text-base md:text-lg text-justify space-y-6 [&_p+p]:indent-8">
							<p className="mb-6 leading-relaxed indent-0">
								If you have any questions, concerns, or complaints regarding these Terms, please contact us:
							</p>
							<div className="border border-black/20 bg-black/5 p-6 indent-0 [&_p]:indent-0">
								<div className="mb-3 font-bold text-black md:text-lg">
									EventzFlow Legal Department
								</div>
								<div className="space-y-2">
									<div>
										<span className="font-bold text-black">Email:</span>{" "}
										<a
											href="mailto:hello@eventzflow.com"
											className="text-black underline hover:no-underline"
										>
											hello@eventzflow.com
										</a>
									</div>
									<div>
										<span className="font-bold text-black">Company:</span>{" "}
										Jesselton Pixel Sdn. Bhd.
									</div>
									<div>
										<span className="font-bold text-black">Phone:</span>{" "}
										<a
											href="https://wa.me/60166236511"
											target="_blank"
											rel="noopener noreferrer"
											className="text-black underline hover:no-underline"
										>
											+6016-6236511
										</a>
									</div>
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
						These Terms and Conditions constitute the entire agreement between you and EventzFlow.
						<br />
						By using our platform, you acknowledge that you have read and agreed to these terms.
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
