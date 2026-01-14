"use client";

import { Mail, MessageCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";

type FooterLink = {
	label: string;
	id?: string | null;
	href?: string;
};

type FooterSection = {
	title: string;
	links: FooterLink[];
};

const FooterNew: React.FC = () => {
	const router = useRouter();
	const pathname = usePathname();

	const footerSections: FooterSection[] = [
		{
			title: "PLATFORM",
			links: [
				{ label: "Benefits", id: "benefits" },
				{ label: "Industries", id: "industries" },
				{ label: "Capabilities", id: "capabilities" },
				{ label: "Testimonials", id: "testimonials" },
			],
		},
		{
			title: "RESOURCES",
			links: [
				{ label: "FAQ", id: "faq" },
				{ label: "Blog", href: "/blog" },
			],
		},
		{
			title: "COMPANY",
			links: [
				{ label: "About Us", href: "/about" },
				{ label: "Contact Us", href: "/contact" },
			],
		},
	];

	const socialLinks = [
		{
			icon: MessageCircle,
			href: "https://wa.me/60177268130",
			label: "WhatsApp",
			activeClass: "border-brand-green bg-brand-green text-black",
			hoverClass: "hover:bg-brand-green-dark hover:border-brand-green-dark",
		},
		{
			icon: Mail,
			href: "mailto:info@eventzflow.com",
			label: "Email",
			activeClass: "border-brand-blue bg-brand-blue text-black",
			hoverClass: "hover:bg-brand-blue-dark hover:border-brand-blue-dark",
		},
	];

	const scrollToSection = (sectionId: string) => {
		const isHomePage = pathname === "/";

		if (!isHomePage) {
			router.push(`/#${sectionId}`);
			return;
		}

		const element = document.getElementById(sectionId);
		if (element) {
			const headerHeight = 80;
			const elementPosition = element.offsetTop - headerHeight;

			window.scrollTo({
				top: elementPosition,
				behavior: "smooth",
			});
		}
	};

	return (
		<footer className="relative bg-black text-white overflow-hidden">
			{/* Decorative Elements */}
			<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

			{/* Main Footer Content */}
			<div className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 md:px-12">
				{/* Content Grid */}
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
					{/* Left - Logo & Social */}
					<div className="lg:col-span-4">
						{/* Logo */}
						<div
							className="text-3xl font-bold leading-none mb-2 md:text-4xl"
							style={{ fontFamily: "Times New Roman, serif" }}
						>
							<span style={{ color: "#23c460" }}>Event</span>
							<span style={{ color: "#2766ec" }}>z</span>
							<span style={{ color: "#23c460" }}>Flow</span>
						</div>
						<p className="text-xs tracking-wide text-white/40 mb-6">
							by Sales Chatalyst
						</p>
						<div className="h-px w-50 bg-white/20 mb-6" />

						<h4 className="text-xs font-bold tracking-[0.2em] text-white/50 mb-6 uppercase">
							Connect With Us
						</h4>
						<div className="flex items-center gap-3">
							{socialLinks.map((social, index) => {
								const IconComponent = social.icon;
								return (
									<a
										key={index}
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={social.label}
										className={`group flex h-12 w-12 items-center justify-center border transition-all duration-300 ${social.activeClass} ${social.hoverClass}`}
									>
										<IconComponent className="h-5 w-5" />
									</a>
								);
							})}
						</div>
					</div>

					{/* Right - Links */}
					<div className="lg:col-span-8">
						<div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
							{footerSections.map((section, index) => (
								<div key={index}>
									<h4 className="mb-5 text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
										{section.title}
									</h4>
									<ul className="space-y-3">
										{section.links.map((link, linkIndex) => (
											<li key={linkIndex}>
												{link.id ? (
													<button
														type="button"
														onClick={() => link.id && scrollToSection(link.id)}
														className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
													>
														{link.label}
													</button>
												) : link.href ? (
													<Link
														href={link.href as Route}
														className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
													>
														{link.label}
													</Link>
												) : (
													<span className="text-sm text-white/60">
														{link.label}
													</span>
												)}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Bar */}
			<div className="border-t border-white/10">
				<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row md:px-12">
					{/* Left - Copyright & By line */}
					<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
						<p className="text-sm tracking-wide text-white/40">
							© {new Date().getFullYear()} EVENTZFLOW
						</p>
						<div className="hidden sm:block h-4 w-px bg-white/20" />
						<p className="text-sm tracking-wide text-white/40">
							BY SALES CHATALYST
						</p>
					</div>

					{/* Right - Legal Links */}
					<div className="flex items-center gap-6">
						<Link
							href="/privacy-policy"
							className="text-sm tracking-wide text-white/40 transition-colors duration-200 hover:text-white"
						>
							Privacy Policy
						</Link>
						<Link
							href="/terms-and-conditions"
							className="text-sm tracking-wide text-white/40 transition-colors duration-200 hover:text-white"
						>
							Terms & Conditions
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default FooterNew;
