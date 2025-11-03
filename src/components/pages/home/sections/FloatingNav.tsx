"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";

const FloatingNav = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 50);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToSection = (sectionId: string) => {
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
		window.scrollTo({ top: 0, behavior: "smooth" });
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
				className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
					scrolled
						? "border-b border-border bg-background/95 shadow-lg backdrop-blur-lg"
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
							className="text-xl font-bold leading-tight lg:text-2xl"
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
								className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
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
							{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
						className="fixed left-0 right-0 top-[72px] z-40 border-b border-border bg-background/95 backdrop-blur-xl lg:hidden"
					>
						<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
							<div className="flex flex-col gap-2">
								{navigationLinks.map((link) => (
									<button
										key={link.id}
										onClick={() => scrollToSection(link.id)}
										className="rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
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
};

export default FloatingNav;

