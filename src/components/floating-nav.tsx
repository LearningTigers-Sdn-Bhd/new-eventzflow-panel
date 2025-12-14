"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";

export default function FloatingNav() {
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 50);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Handle hash navigation when landing on the page
	useEffect(() => {
		if (pathname === "/" && window.location.hash) {
			const hash = window.location.hash.substring(1); // Remove the '#'
			// Small delay to ensure page is fully loaded
			setTimeout(() => {
				const element = document.getElementById(hash);
				if (element) {
					const elementPosition = element.offsetTop;
					window.scrollTo({
						top: elementPosition,
						behavior: "smooth",
					});
				}
			}, 100);
		}
	}, [pathname]);

	const scrollToSection = (sectionId: string) => {
		// Check if we're on the home page
		const isHomePage = pathname === "/";

		if (!isHomePage) {
			// If not on home page, navigate to home page with hash
			router.push(`/#${sectionId}`);
			setIsOpen(false);
			return;
		}

		// If on home page, scroll to section
		const element = document.getElementById(sectionId);
		if (element) {
			const elementPosition = element.offsetTop;
			window.scrollTo({
				top: elementPosition,
				behavior: "smooth",
			});
		}
		setIsOpen(false);
	};

	const scrollToTop = () => {
		// Check if we're on the home page
		const isHomePage = pathname === "/";

		if (!isHomePage) {
			// If not on home page, navigate to home page
			router.push("/");
		} else {
			// If on home page, scroll to top
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
		setIsOpen(false);
	};

	const navigationLinks = [
		{ label: "Industries", id: "industries" },
		{ label: "Testimonials", id: "testimonials" },
		{ label: "Features", id: "features" },
		{ label: "Solutions", id: "solutions" },
		{ label: "FAQ", id: "faq" },
	];

	return (
		<>
			<motion.nav
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.3 }}
				className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
					scrolled
						? "border-border border-b bg-background/95 shadow-lg backdrop-blur-lg"
						: "bg-transparent"
				}`}
			>
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
					{/* Logo */}
					<button
						onClick={scrollToTop}
						className="flex items-center space-x-2 transition-opacity hover:opacity-80"
					>
						<span
							className="font-bold text-xl leading-tight lg:text-2xl"
							style={{ fontFamily: "Times New Roman, serif" }}
						>
							<span style={{ color: "#23c460" }}>Event</span>
							<span style={{ color: "#2766ec" }}>z</span>
							<span style={{ color: "#23c460" }}>Flow</span>
						</span>
					</button>

					{/* Desktop Navigation */}
					<div className="hidden items-center gap-1 lg:flex">
						{navigationLinks.map((link) => (
							<button
								key={link.id}
								onClick={() => scrollToSection(link.id)}
								className="rounded-lg px-4 py-2 font-medium text-muted-foreground text-sm transition-all hover:bg-accent hover:text-foreground"
							>
								{link.label}
							</button>
						))}
					</div>

					{/* Right Side Actions */}
					<div className="flex items-center gap-2">
						<ModeToggle />
						<UserMenu />

						{/* Mobile Menu Button */}
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="rounded-lg p-2 text-foreground transition-colors hover:bg-accent lg:hidden"
						>
							{isOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</button>
					</div>
				</div>
			</motion.nav>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.2 }}
						className="fixed top-[72px] right-0 left-0 z-40 border-border border-b bg-background/95 backdrop-blur-xl lg:hidden"
					>
						<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
							<div className="flex flex-col gap-2">
								{navigationLinks.map((link) => (
									<button
										key={link.id}
										onClick={() => scrollToSection(link.id)}
										className="rounded-lg px-4 py-3 text-left font-medium text-muted-foreground text-sm transition-all hover:bg-accent hover:text-foreground"
									>
										{link.label}
									</button>
								))}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
