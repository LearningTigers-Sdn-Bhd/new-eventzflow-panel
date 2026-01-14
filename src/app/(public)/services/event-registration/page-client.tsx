"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ChatMessage } from "@/components/devices/apps/WhatsApp";
import WhatsApp from "@/components/devices/apps/WhatsApp";
import ServiceHero from "@/components/pages/services/ServiceHero";
import ServiceFeaturesSection from "@/components/pages/services/ServiceFeaturesSection";
import ServiceHowItWorksSection from "@/components/pages/services/ServiceHowItWorksSection";
import ServiceShowcaseSection from "@/components/pages/services/ServiceShowcaseSection";
import ServiceCTASection from "@/components/pages/services/ServiceCTASection";

const features = [
	{
		id: "01",
		title: "Web Registration Forms",
		category: "Capture",
		description:
			"Customizable registration forms that capture exactly the data you need from attendees with pixel-perfect precision.",
	},
	{
		id: "02",
		title: "WhatsApp Automation",
		category: "Engage",
		description:
			"Let attendees register directly via WhatsApp with automated responses and instant confirmations.",
	},
	{
		id: "03",
		title: "Smart Ticketing",
		category: "Manage",
		description:
			"Create multiple ticket categories with custom pricing, limits, and availability windows.",
	},
	{
		id: "04",
		title: "QR Code Generation",
		category: "Access",
		description:
			"Every registrant receives a unique, fraud-proof QR code for lightning-fast, secure check-in at your event.",
	},
	{
		id: "05",
		title: "Bulk Operations",
		category: "Scale",
		description:
			"Import and manage hundreds of attendees at once via CSV or Excel spreadsheets.",
	},
	{
		id: "06",
		title: "Custom Labels",
		category: "Adapt",
		description:
			"Add your custom fields to collect specific information for your event needs.",
	},
];

const steps = [
	{
		number: "01",
		title: "Create Your Event",
		description:
			"Set up your event with custom ticket types, pricing, and registration fields in minutes.",
	},
	{
		number: "02",
		title: "Share Registration Link",
		description:
			"Distribute your registration form via web, WhatsApp, email, or embed it on your website.",
	},
	{
		number: "03",
		title: "Collect & Manage",
		description:
			"Attendees register and receive their QR codes automatically. You manage everything from one dashboard.",
	},
];

const highlights = [
	{ number: "01", text: "Instant automated responses" },
	{ number: "02", text: "Collect any info you need" },
	{ number: "03", text: "Auto QR ticket generation" },
	{ number: "04", text: "Works 24/7 automatically" },
];

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

function WhatsAppDemo() {
	const [chatKey, setChatKey] = useState(0);

	useEffect(() => {
		const totalDuration = 11 * 2000 + 2000;
		const interval = setInterval(() => {
			setChatKey((prev) => prev + 1);
		}, totalDuration);
		return () => clearInterval(interval);
	}, []);

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
		<WhatsApp
			key={chatKey}
			activeKey={chatKey}
			contactName="EventzFlow"
			contactAvatar="E"
			contactStatus="online"
			messages={registrationMessages}
			renderCustomMessage={renderQRCode}
		/>
	);
}

export default function EventRegistrationPageClient() {
	return (
		<main>
			<ServiceHero
				title="Event"
				titleOutline="Registration"
				tagline="RSVP, Ticketing & WhatsApp"
				description="Seamless registration experience with multiple channels including web forms, WhatsApp automation, and QR code scanning. Collect attendee information effortlessly."
				heroImage="/images/services/hero/EventRegistration.webp"
			/>
			<ServiceFeaturesSection
				title="Everything"
				titleSecondLine="You Need."
				subtitle="Designed for performance. Our registration modules are built to handle scale while maintaining precision."
				features={features}
			/>
			<ServiceHowItWorksSection
				title="Three simple steps"
				steps={steps}
			/>
			<ServiceShowcaseSection
				label="Live Demo"
				title="Registration via WhatsApp"
				description="Let attendees register directly through WhatsApp. Our bot handles the entire flow — from collecting details to issuing personalized QR code tickets automatically. No app downloads required."
				highlights={highlights}
				decorativeLabels={{
					top: "Already on\ntheir phone",
					bottom: "Instant\ntickets",
				}}
			>
				<WhatsAppDemo />
			</ServiceShowcaseSection>
			<ServiceCTASection
				title="Ready to streamline your event registration?"
				description="Join hundreds of event organizers who trust EventzFlow for seamless attendee management."
			/>
		</main>
	);
}
