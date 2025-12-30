"use client";

import { motion } from "framer-motion";
import { ArrowRight, PodcastIcon, Zap } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import type { ChatMessage } from "@/components/devices/apps/WhatsApp";
import WhatsApp from "@/components/devices/apps/WhatsApp";
import { Button } from "@/components/ui/button";

// Event registration conversation
const registrationMessages: ChatMessage[] = [
	{
		type: "customer",
		text: "Hi! I want to register for SME Expo 2025",
		time: "10:30",
	},
	{
		type: "bot",
		text: "Hello There! 👋\n\nI'd be happy to help you register. May I have your full name?",
		time: "10:30",
	},
	{
		type: "customer",
		text: "John Smith",
		time: "10:31",
	},
	{
		type: "bot",
		text: "Great! And your email address?",
		time: "10:31",
	},
	{
		type: "customer",
		text: "john.smith@company.com",
		time: "10:32",
	},
	{
		type: "bot",
		text: "Perfect! What's your role?",
		time: "10:32",
	},
	{
		type: "buttons",
		buttons: [
			"🎯 Marketing",
			"💻 Developer",
			"📊 Product Manager",
			"👔 Executive",
		],
		time: "10:32",
	},
	{
		type: "customer",
		text: "👔 Executive",
		time: "10:33",
	},
	{
		type: "bot",
		text: "Excellent! ✅\n\nYou're all set for SME Expo 2025!\n\nHere's your QR code ticket:",
		time: "10:33",
	},
	{
		type: "qrcode",
		text: "QR_CODE_PLACEHOLDER",
		time: "10:33",
	},
	{
		type: "bot",
		text: "See you at the event! 🎉",
		time: "10:34",
	},
];

const HeroSection: React.FC = () => {
	const [chatKey, setChatKey] = useState(0);

	// Loop the chat animation
	useEffect(() => {
		// Total messages: 11, each takes 2 seconds, plus 2 seconds wait at end
		const totalDuration = 11 * 2000 + 2000; // 24 seconds total

		const interval = setInterval(() => {
			setChatKey((prev) => prev + 1);
		}, totalDuration);

		return () => clearInterval(interval);
	}, []);

	// Custom renderer for QR code message
	const renderQRCode = (message: ChatMessage, index: number) => {
		if (message.type === "qrcode") {
			return (
				<motion.div
					key={index}
					initial={{ opacity: 0, scale: 0.8, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{
						type: "spring",
						stiffness: 400,
						damping: 25,
						duration: 0.5,
					}}
					className="flex justify-start"
				>
					<div className="rounded-[8px] rounded-tl-[2px] bg-[#1f2c34] p-2 shadow-md">
						{/* QR Code */}
						<div className="rounded-lg bg-white p-3">
							<svg
								width="120"
								height="120"
								viewBox="0 0 29 29"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M0 0h7v7H0zM8 0h1v1H8zM10 0h1v1h-1zM12 0h2v1h-2zM15 0h1v2h-1zM17 0h5v1h-1v1h-1V1h-1v1h-1V1h-1zM22 0h7v7h-7zM1 1v5h5V1zM9 1h1v1H9zM11 1h1v2h1V2h2v1h-1v1h-2v1h-1V4h1V3h-1zM16 1v1h-1v1h2V2h1v2h-2v1h1v1h-2v1h1v1h-1v1h2V8h2v1h-1v2h1v-1h2V9h-2V8h1V7h-1V6h2V5h-1V4h1V3h-2V2h1V1h-3v1h-1v1h-1zM23 1v5h5V1zM2 2v3h3V2zM18 2h1v1h-1zM23 2v3h3V2zM10 3h1v1h-1zM9 4v1H8v2h1V6h1v1h2v1h-1v1H9V8h1V7H9V6H8v1H7v1h1v1H7v2H6v-2H5v1H4v2H3v1h1v-1h2v1h1v1H6v1h2v1H7v2H6v-1H4v1H3v1h1v1H3v1h2v1H4v-1H3v-1H2v1H1v1H0v-2h1v-1h1v-2h1v1H2v1h1v-2h1v1h1v2h1v-2H5v-1h1v-2H5v-1H4v-2H3v1H2v-2H1v-1H0V8h1V7h1V6h1v1h2V6H4v1h1V6h1v1h2V6h1zM20 4h1v1h-1zM21 5v1h-2v1h2v1h-3V7h1V6h1V5zM27 5h1v1h-1zM11 6h1v1h-1zM3 7v1H2V7zM5 7h1v2H5zM26 7h2v2h-2zM14 8h1v1h-1zM6 9h1v1H6zM23 9h1v2h1v-1h1v1h-1v1h2v1h-3v-1h-1v1h-1v-1h1v-2h-1v1h-1v-1h1V9h1zM27 9v3h-1v-1h-1v-1h2zM3 10v1H2v-1zM9 10h2v1h1v-1h1v2h-1v-1h-1v1H9v1h1v-1h2v2h-2v1h3v1h-1v1h1v1h-1v2h1v-1h2v1h1v-1h1v1h1v2h-1v-1h-3v2h1v1h1v1h-1v-1h-2v1h1v1H9v1h1v1H9v1h2v-2h1v2h-1v1h2v-2h1v1h2v1h-1v1h4v-1h-1v-1h-1v-2h-1v1h-2v-2h2v-1h2v2h-1v2h2v-1h2v-1h-1v-2h-1v1h-2v-2h1v-1h-1v-2h1v1h2v-2h-1v-1h1v-1h-2v-1h-1v-1h-1v-1h1v-1h-2v1h-1v-2h2v-1h-2v1h-2v-1h1V9h-2v1h-1V9h-2v1h1v1h-2v1h1v1h1v1h-1v-1h-2v-1h1v-2h-1v1H9v1h1v-1h2v1h-2v1h-1zM4 11h1v1H4zM6 11h1v1H6zM27 12h2v1h-1v1h-1zM10 13h1v1h-1zM0 14h1v1H0zM2 14h2v1H2zM5 14h2v2H6v-1H5zM1 15h1v1H1zM4 15h1v2H4zM18 15h1v1h-1zM28 15h1v3h-1zM0 16h1v2H0zM2 16h1v1H2zM22 16h2v1h-2zM25 16h1v1h-1zM1 17h1v1H1zM21 17h1v2h-2v-1h1zM24 17h1v1h-1zM26 17h1v1h-1zM6 18v1H5v1h2v-1h1v1H7v1h2v-1h1v1H9v2h1v-1h1v-1h-1v-1h2v-1h-1v-1h-1v-1H9v1H8v-1H7v1H6zM18 18h1v1h1v-1h2v1h-1v1h-1v2h-1v-1h-2v1h1v1h-2v-1h1v-2h2v-1h-1zM3 19h1v1H3zM23 19h1v1h-1zM25 19h2v1h-2zM15 20h1v1h-1zM24 20h1v1h-1zM1 21h2v1H1zM4 21h1v1H4zM0 22h1v7H0zM7 22h1v1H7zM14 22h1v2h-1zM22 22h7v7h-7zM1 23h1v1H1zM3 23h3v1h1v1H6v2H5v-1H4v-1H3v2H2v-3h1zM15 23h1v1h-1zM23 23v5h5v-5zM7 24h1v2H7zM1 25h1v2H1zM24 24v3h3v-3zM8 26h4v1h1v-1h1v1h-5v1h5v1h-6zM2 27h3v1H2zM0 28h1v1H0zM7 28h1v1H7z"
									fill="black"
								/>
							</svg>
						</div>
						<div className="mt-1 text-[#8696a0] text-[9px]">
							<span>{message.time}</span>
						</div>
					</div>
				</motion.div>
			);
		}
		return null;
	};

	return (
		<>
			<section
				id="hero"
				className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 px-4 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-20 lg:px-8 lg:pt-32 xl:px-12"
			>
				{/* Professional grid pattern background */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />

				{/* Subtle gradient orbs */}
				<div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
				<div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />

				<div className="relative mx-auto flex w-full max-w-7xl flex-col justify-center gap-8 sm:gap-12 lg:flex-row lg:items-center lg:gap-16 xl:gap-20">
					<div className="flex-1 space-y-6 text-center sm:space-y-8 lg:space-y-10 lg:text-left">
						{/* Trust badge */}
						<div className="flex justify-center lg:justify-start">
							<motion.div
								className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 font-medium text-emerald-600 text-xs sm:px-4 sm:py-2 sm:text-sm dark:text-emerald-400"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
							>
								<Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								<span className="whitespace-nowrap">
									Trusted by 500+ event organizers
								</span>
							</motion.div>
						</div>

						<motion.h1
							className="font-bold text-3xl text-foreground leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4rem]"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
						>
							End-to-End,
							<br />
							<span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-blue-400">
								AI-Powered Event Intelligence
							</span>
						</motion.h1>

						<motion.p
							className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg md:text-xl lg:mx-0"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							From visitor booth tracking and QR check-in with instant badge
							printing, to AI audience profiling and retargeting — EventzFlow
							connects every part of the event journey.
						</motion.p>

						<motion.div
							className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4 lg:justify-start"
							initial={{ opacity: 0, y: 24 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
						>
							<Link
								href={"/auth?login" as Route}
								className="w-full sm:w-auto"
							>
								<Button
									size="lg"
									className="group h-11 w-full bg-emerald-600 font-semibold text-sm text-white shadow-emerald-600/25 shadow-lg transition-all hover:bg-emerald-500 hover:shadow-emerald-600/30 hover:shadow-xl sm:h-12 sm:min-w-[200px] sm:text-base dark:bg-emerald-500 dark:hover:bg-emerald-400"
								>
									Start Now
									<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
								</Button>
							</Link>
							<Button
								size="lg"
								variant="outline"
								asChild
								className="h-11 w-full border-2 bg-background font-semibold text-sm transition-all hover:bg-muted sm:h-12 sm:w-auto sm:min-w-[200px] sm:text-base"
							>
								<a href="mailto:info@eventzflow.com">
									Contact Sales
									<PodcastIcon className="ml-2 h-4 w-4" />
								</a>
							</Button>
						</motion.div>
					</div>

					<motion.div
						className="relative w-full flex-shrink-0 lg:max-w-md"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.7, delay: 0.3 }}
					>
						{/* WhatsApp Event Registration Demo */}
						<div className="mx-auto max-w-[320px]">
							<WhatsApp
								key={chatKey}
								activeKey={chatKey}
								contactName="EventzFlow"
								contactAvatar="E"
								contactStatus="online"
								messages={registrationMessages}
								renderCustomMessage={renderQRCode}
							/>
						</div>
					</motion.div>
				</div>
			</section>
		</>
	);
};

export default HeroSection;
