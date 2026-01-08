"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Menu } from "lucide-react";
import * as React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Register GSAP plugin
if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

// --- Context ---

interface StickyHeaderContextValue {
	isSticky: boolean;
	headerRef: React.RefObject<HTMLDivElement | null>;
	detailsRef: React.RefObject<HTMLDivElement | null>;
	descriptionRef: React.RefObject<HTMLDivElement | null>;
}

const StickyHeaderContext =
	React.createContext<StickyHeaderContextValue | null>(null);

function useStickyHeader() {
	const context = React.useContext(StickyHeaderContext);
	if (!context) {
		throw new Error(
			"MobileStickyHeader sub-components must be used within MobileStickyHeader",
		);
	}
	return context;
}

// --- Root Component ---

interface MobileStickyHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export function MobileStickyHeader({
	children,
	className,
	...props
}: MobileStickyHeaderProps) {
	const headerRef = React.useRef<HTMLDivElement>(null);
	const detailsRef = React.useRef<HTMLDivElement>(null);
	const descriptionRef = React.useRef<HTMLDivElement>(null);
	const [isSticky, setIsSticky] = React.useState(false);

	React.useEffect(() => {
		const ctx = gsap.context(() => {
			if (!headerRef.current) return;

			ScrollTrigger.create({
				trigger: headerRef.current,
				start: "top top-=50px",
				onEnter: () => {
					setIsSticky(true);
					if (descriptionRef.current) {
						gsap.to(descriptionRef.current, {
							height: 0,
							opacity: 0,
							duration: 0.25,
							ease: "power2.out",
						});
					}
					if (detailsRef.current) {
						gsap.to(detailsRef.current, {
							paddingTop: "0.5rem",
							paddingBottom: "0.5rem",
							duration: 0.25,
							ease: "power2.out",
						});
					}
				},
				onLeaveBack: () => {
					setIsSticky(false);
					if (descriptionRef.current) {
						gsap.to(descriptionRef.current, {
							height: "auto",
							opacity: 1,
							duration: 0.25,
							ease: "power2.in",
						});
					}
					if (detailsRef.current) {
						gsap.to(detailsRef.current, {
							paddingTop: "0.5rem",
							paddingBottom: "2rem",
							duration: 0.25,
							ease: "power2.in",
						});
					}
				},
			});
		});

		return () => ctx.revert();
	}, []);

	const value = React.useMemo(
		() => ({ isSticky, headerRef, detailsRef, descriptionRef }),
		[isSticky],
	);

	return (
		<StickyHeaderContext.Provider value={value}>
			{/* Placeholder to prevent layout jump */}
			{isSticky && <div className="h-40" />}

			<div
				ref={headerRef}
				className={cn(
					"flex flex-col",
					isSticky
						? "fixed top-0 left-0 z-50 -mt-4 w-screen pt-4 shadow-sm"
						: "relative w-full",
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</StickyHeaderContext.Provider>
	);
}

// --- Sub-components ---

// 1. Main Styled Container (bg-muted, border, animated padding)
export function MobileStickyHeaderMain({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	const { detailsRef, isSticky } = useStickyHeader();

	return (
		<div
			ref={detailsRef}
			className={cn(
				"flex w-full flex-col items-start gap-2 rounded-none border bg-muted px-4 transition-all duration-300 will-change-[padding]",
				isSticky ? "pt-2 pb-2" : "pt-2 pb-8",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

// 2. Row Wrapper (for Icon + Title)
export function MobileStickyHeaderRow({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("flex w-full items-center gap-4", className)}
			{...props}
		>
			{children}
		</div>
	);
}

// 3. Icon Wrapper
interface MobileStickyHeaderIconProps
	extends React.HTMLAttributes<HTMLDivElement> {
	icon?: React.ReactNode;
}

export function MobileStickyHeaderIcon({
	icon,
	children,
	className,
	...props
}: MobileStickyHeaderIconProps) {
	return (
		<div className={cn("flex shrink-0", className)} {...props}>
			{icon || children}
		</div>
	);
}

// 4. Title (Handles truncation)
export function MobileStickyHeaderTitle({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
	const { isSticky } = useStickyHeader();

	return (
		<h3
			className={cn(
				"text-balance font-bold text-lg tracking-tight md:text-xl",
				isSticky && "line-clamp-1",
				className,
			)}
			{...props}
		>
			{children}
		</h3>
	);
}

// 5. Description Content (The part that hides on scroll)
export function MobileStickyHeaderContent({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	const { descriptionRef, isSticky } = useStickyHeader();

	return (
		<div
			ref={descriptionRef}
			className={cn(
				"flex w-full flex-col gap-2 overflow-hidden transition-all duration-300 will-change-[height,opacity]",
				isSticky && "hidden",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

// 6. Navigation Bar (The bottom toggle strip)
interface MobileStickyHeaderNavProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	label: string;
}

export function MobileStickyHeaderNav({
	label,
	className,
	...props
}: MobileStickyHeaderNavProps) {
	const { toggleSidebar } = useSidebar();

	return (
		<button
			type="button"
			onClick={toggleSidebar}
			className={cn(
				"flex items-center justify-between gap-4 rounded-none border bg-muted px-4 py-2",
				className,
			)}
			{...props}
		>
			<span className="font-semibold text-sm">{label}</span>
			<div className="py-2">
				<Menu className="size-5" />
				<span className="sr-only">Open Navigation</span>
			</div>
		</button>
	);
}
