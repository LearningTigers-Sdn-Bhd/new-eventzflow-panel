"use client";
import { useState, useEffect } from "react";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const [open, setOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(true);

	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 1024;
			setIsMobile(mobile);
			if (!mobile) {
				setOpen(false);
			}
		};

		// Check on mount
		checkMobile();

		// Check on resize
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Scroll to section helper
	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			const headerHeight = 80;
			const elementPosition = element.offsetTop - headerHeight;

			window.scrollTo({
				top: elementPosition,
				behavior: "smooth",
			});
		}
		setOpen(false);
	};

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const navigationLinks = [
		{ label: "Features", id: "feature-showcase" },
		{ label: "Solutions", id: "pain-points" },
		{ label: "Integrations", id: "integrations-section" },
		{ label: "Demo", id: "product-demo" },
		{ label: "FAQ", id: "question-answers" },
	];

	return (
		<header className="w-full border-b px-4 py-2 sticky top-0 z-40 bg-background">
			<div className="flex w-full items-center justify-between lg:justify-between lg:relative">
				{/* Logo - Desktop Left Corner */}
				<button 
					onClick={scrollToTop}
					className="hidden lg:flex items-center space-x-3 hover:opacity-80 transition-opacity"
				>
					<span className="text-2xl font-bold leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
						<span style={{ color: '#23c460' }}>Event</span>
						<span style={{ color: '#2766ec' }}>z</span>
						<span style={{ color: '#23c460' }}>Flow</span>
					</span>
				</button>

				{/* Mobile Menu - Left Side */}
				<div className="flex items-center gap-2 lg:hidden">
					{isMobile && (
						<Sheet open={open} onOpenChange={setOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon">
									<Menu className="h-5 w-5" />
									<span className="sr-only">Toggle menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col p-0">
							<SheetHeader className="sticky top-0 bg-background z-10 px-6 pt-6 pb-4 border-b">
								{/* Logo in Mobile Sheet */}
								<button 
									onClick={() => {
										scrollToTop();
										setOpen(false);
									}}
									className="flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity w-fit"
								>
									<span className="text-2xl font-bold leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
										<span style={{ color: '#23c460' }}>Event</span>
										<span style={{ color: '#2766ec' }}>z</span>
										<span style={{ color: '#23c460' }}>Flow</span>
									</span>
								</button>
								<SheetTitle>Navigation</SheetTitle>
								<SheetDescription>
									Navigate to different sections of the page
								</SheetDescription>
							</SheetHeader>
							<div className="flex-1 overflow-y-auto px-6 py-6">
								<div className="flex flex-col gap-1.5">
									{navigationLinks.map((link, index) => (
										<button
											key={index}
											type="button"
											onClick={() => scrollToSection(link.id)}
											className="text-muted-foreground hover:text-foreground transition-colors py-2.5 px-4 rounded-lg hover:bg-accent text-left w-full text-sm"
										>
											{link.label}
										</button>
									))}
								</div>
							</div>
						</SheetContent>
					</Sheet>
					)}
				</div>

				{/* Desktop Navigation - Centered */}
				<div className="hidden lg:flex lg:absolute lg:left-1/2 lg:-translate-x-1/2">
					<NavigationMenu viewport={false}>
						<NavigationMenuList>
							{navigationLinks.map((link, index) => (
								<NavigationMenuItem key={index}>
									<NavigationMenuLink
										asChild
										className={navigationMenuTriggerStyle()}
									>
										<button
											type="button"
											onClick={() => scrollToSection(link.id)}
										>
											{link.label}
										</button>
									</NavigationMenuLink>
								</NavigationMenuItem>
							))}
						</NavigationMenuList>
					</NavigationMenu>
				</div>

				{/* Right Side - Theme Toggle and User Menu */}
				<div className="flex items-center gap-1">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
