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
				{ label: "Industries", id: "industries" },
				{ label: "Features", id: "features" },
				{ label: "Testimonials", id: "testimonials" },
				{ label: "FAQ", id: "faq" },
			],
		},
		{
			title: "RESOURCES",
			links: [
				{ label: "Why Choose Us", id: "why-choose" },
				{ label: "Our Capabilities", id: "capabilities" },
			],
		},
		{
			title: "COMPANY",
			links: [{ label: "About", href: "/about" }],
		},
	];

	const socialLinks = [
		{
			icon: MessageCircle,
			href: "https://wa.me/60177268130",
			label: "WhatsApp",
		},
		{ icon: Mail, href: "mailto:info@saleschatalyst.com", label: "Email" },
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
				{/* Giant Brand Section */}
				<div className="mb-16 text-center">
					<div className="flex items-center justify-center gap-4 mb-6">
						<div className="h-px w-12 bg-white/30" />
						<span className="text-xs tracking-[0.3em] text-white/40 uppercase">
							Event Management Platform
						</span>
						<div className="h-px w-12 bg-white/30" />
					</div>

					{/* Logo */}
					<h2
						className="text-6xl font-bold leading-none md:text-8xl lg:text-9xl"
						style={{ fontFamily: "Times New Roman, serif" }}
					>
						<span style={{ color: "#23c460" }}>Event</span>
						<span style={{ color: "#2766ec" }}>z</span>
						<span style={{ color: "#23c460" }}>Flow</span>
					</h2>
				</div>

				{/* Content Grid */}
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 border-t border-white/10 pt-12">
					{/* Left - Social & Contact */}
					<div className="lg:col-span-4">
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
										aria-label={social.label}
										className="group flex h-12 w-12 items-center justify-center border border-white/20 text-white/50 transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
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
														className="text-sm text-white/40 transition-colors duration-200 hover:text-white"
													>
														{link.label}
													</button>
												) : link.href ? (
													<Link
														href={link.href as Route}
														className="text-sm text-white/40 transition-colors duration-200 hover:text-white"
													>
														{link.label}
													</Link>
												) : (
													<span className="text-sm text-white/40">
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
						<p className="text-xs tracking-wide text-white/30">
							© {new Date().getFullYear()} EVENTZFLOW
						</p>
						<div className="hidden sm:block h-4 w-px bg-white/20" />
						<p className="text-xs tracking-wide text-white/30">
							BY SALES CHATALYST
						</p>
					</div>

					{/* Right - Legal Links */}
					<div className="flex items-center gap-6">
						<Link
							href="/privacy-policy"
							className="text-xs tracking-wide text-white/30 transition-colors duration-200 hover:text-white"
						>
							Privacy Policy
						</Link>
						<Link
							href="/terms-and-conditions"
							className="text-xs tracking-wide text-white/30 transition-colors duration-200 hover:text-white"
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
