import { AnimatePresence, motion } from "framer-motion";
import {
	Mic,
	MoreVertical,
	Paperclip,
	Phone as PhoneIcon,
	Smile,
	Video,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import Phone from "../Phone";

export interface ChatMessage {
	type: "bot" | "customer" | "buttons" | "ticket" | string;
	text?: string;
	time?: string;
	status?: "read" | "delivered";
	buttons?: string[];
}

interface WhatsAppProps {
	activeKey?: number;
	contactName?: string;
	contactAvatar?: string;
	contactStatus?: string;
	// New approach - pass messages directly
	messages?: ChatMessage[];
	// Old approach - for custom children (backward compatible)
	children?: React.ReactNode;
	// Custom render functions for non-standard message types
	renderCustomMessage?: (
		message: ChatMessage,
		index: number,
	) => React.ReactNode;
}

const WhatsApp: React.FC<WhatsAppProps> = ({
	activeKey = 0,
	contactName = "Sales Chatalyst",
	contactAvatar = "SC",
	contactStatus,
	messages,
	children,
	renderCustomMessage,
}) => {
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const [visibleMessages, setVisibleMessages] = useState<number>(0);
	const [isTyping, setIsTyping] = useState<boolean>(false);
	const [lastMessageSeen, setLastMessageSeen] = useState<boolean>(false);

	// Animation and typing logic (only if messages are provided)
	useEffect(() => {
		if (!messages || messages.length === 0) return;

		setVisibleMessages(0);
		setIsTyping(false);
		setLastMessageSeen(false);

		const timeouts: NodeJS.Timeout[] = [];

		messages.forEach((message, index) => {
			// Show typing indicator before bot messages (except first one)
			if (message.type === "bot" && index > 0) {
				const typingTimeout = setTimeout(
					() => {
						setIsTyping(true);
					},
					index * 2000 - 800,
				); // Show typing 800ms before message
				timeouts.push(typingTimeout);
			}

			// Show the message
			const messageTimeout = setTimeout(() => {
				setIsTyping(false);
				setVisibleMessages(index + 1);

				// Mark last customer message as seen after a delay
				if (message.type === "customer" && index === messages.length - 1) {
					const seenTimeout = setTimeout(() => {
						setLastMessageSeen(true);
					}, 800); // Mark as seen 800ms after last customer message appears
					timeouts.push(seenTimeout);
				}
			}, index * 2000); // 2 seconds between each message
			timeouts.push(messageTimeout);
		});

		return () => timeouts.forEach(clearTimeout);
	}, [messages, activeKey]);

	// Auto-scroll to bottom when new messages appear
	useEffect(() => {
		if (chatContainerRef.current && messagesEndRef.current) {
			const container = chatContainerRef.current;
			const endElement = messagesEndRef.current;

			const containerRect = container.getBoundingClientRect();
			const endRect = endElement.getBoundingClientRect();
			const scrollPosition =
				endRect.top - containerRect.top + container.scrollTop;

			container.scrollTo({
				top: scrollPosition,
				behavior: "smooth",
			});
		}
	}, [visibleMessages, isTyping]);

	// Render default message layout
	const renderMessage = (message: ChatMessage, index: number) => {
		// Handle buttons
		if (message.type === "buttons") {
			return (
				<motion.div
					key={index}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex justify-start"
				>
					<div className="flex max-w-[75%] flex-col gap-2">
						{message.buttons?.map((btn, i) => (
							<div
								key={i}
								className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-center text-white text-xs"
							>
								{btn}
							</div>
						))}
					</div>
				</motion.div>
			);
		}

		// Handle custom message types (ticket, etc.)
		if (
			message.type !== "bot" &&
			message.type !== "customer" &&
			renderCustomMessage
		) {
			return renderCustomMessage(message, index);
		}

		// Handle regular bot/customer messages
		return (
			<motion.div
				key={index}
				initial={{ opacity: 0, scale: 0.8, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.8, y: -20 }}
				transition={{
					type: "spring",
					stiffness: 400,
					damping: 25,
					duration: 0.5,
				}}
				className={`flex ${message.type === "customer" ? "justify-end" : "justify-start"}`}
			>
				<div
					className={`rounded-[8px] ${
						message.type === "customer"
							? "rounded-tr-[2px] bg-[#005c4b]"
							: "rounded-tl-[2px] bg-[#1f2c34]"
					} max-w-[80%] px-2.5 py-1.5 shadow-md`}
				>
					<p className="mb-0.5 whitespace-pre-line text-[11px] text-white leading-[16px]">
						{message.text}
					</p>
					<div
						className={`mt-0.5 flex items-center text-[9px] ${
							message.type === "customer"
								? "justify-end text-[#a8c6bc]"
								: "text-[#8696a0]"
						} gap-0.5`}
					>
						<span>{message.time}</span>
						{message.type === "customer" && (
							<svg
								viewBox="0 0 16 15"
								width="12"
								height="11"
								className="flex-shrink-0"
							>
								<path
									fill={
										isTyping ||
										index < visibleMessages - 1 ||
										(index === visibleMessages - 1 && lastMessageSeen)
											? "#53bdeb"
											: "#a8c6bc"
									}
									d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
								/>
							</svg>
						)}
					</div>
				</div>
			</motion.div>
		);
	};

	const displayedMessages = messages ? messages.slice(0, visibleMessages) : [];

	return (
		<Phone>
			{/* Layer 1: Fixed Header and Input (stays in place) */}

			{/* WhatsApp Chat Header - Fixed at top */}
			<div className="flex flex-shrink-0 items-center gap-2 bg-[#1f2c34] px-2.5 py-2">
				{/* Avatar & Contact Info */}
				<div className="flex min-w-0 flex-1 items-center gap-1.5">
					<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#6b7c85] font-medium text-white text-xs">
						{contactAvatar}
					</div>
					<div className="min-w-0 flex-1">
						<div className="truncate font-medium text-white text-xs">
							{contactName}
						</div>
						<div className="text-[#8696a0] text-[10px]">
							{isTyping ? "typing..." : contactStatus || "online"}
						</div>
					</div>
				</div>

				{/* Action Icons */}
				<div className="flex flex-shrink-0 items-center gap-2">
					<Video className="h-4 w-4 text-[#8696a0]" />
					<PhoneIcon className="h-4 w-4 text-[#8696a0]" />
					<MoreVertical className="h-4 w-4 text-[#8696a0]" />
				</div>
			</div>

			{/* Layer 2: Scrollable Chat Area - Takes remaining space */}
			<div
				ref={chatContainerRef}
				className="scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden bg-[#0b141a]"
			>
				{/* Messages Container - Pushes content to bottom when not full */}
				<div className="flex min-h-full flex-col justify-end space-y-2 p-2.5">
					{/* Render messages if provided, otherwise use children */}
					{messages ? (
						<AnimatePresence mode="popLayout">
							{displayedMessages.map((message, index) =>
								renderMessage(message, index),
							)}

							{/* Typing Indicator Bubble */}
							{isTyping && (
								<motion.div
									key="typing-indicator"
									className="flex justify-start"
									initial={{ opacity: 0, scale: 0.8, y: 20 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.8, y: -20 }}
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 25,
									}}
								>
									<div className="rounded-[8px] rounded-tl-[2px] bg-[#1f2c34] px-3 py-2 shadow-md">
										<div className="flex gap-0.5">
											<motion.div
												className="h-1.5 w-1.5 rounded-full bg-[#8696a0]"
												animate={{ y: [0, -3, 0] }}
												transition={{
													duration: 0.6,
													repeat: Number.POSITIVE_INFINITY,
													delay: 0,
												}}
											/>
											<motion.div
												className="h-1.5 w-1.5 rounded-full bg-[#8696a0]"
												animate={{ y: [0, -3, 0] }}
												transition={{
													duration: 0.6,
													repeat: Number.POSITIVE_INFINITY,
													delay: 0.2,
												}}
											/>
											<motion.div
												className="h-1.5 w-1.5 rounded-full bg-[#8696a0]"
												animate={{ y: [0, -3, 0] }}
												transition={{
													duration: 0.6,
													repeat: Number.POSITIVE_INFINITY,
													delay: 0.4,
												}}
											/>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					) : (
						children
					)}

					{/* Invisible element at the end for auto-scroll anchor */}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Layer 1: Input Area - Fixed at bottom */}
			<div className="flex flex-shrink-0 items-center gap-1.5 bg-[#1f2c34] px-1.5 pt-1.5 pb-3">
				{/* Input Box */}
				<div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-[#2a3942] px-2.5 py-1.5">
					<Smile className="h-3.5 w-3.5 flex-shrink-0 text-[#8696a0]" />
					<input
						type="text"
						placeholder="Message"
						className="min-w-0 flex-1 bg-transparent text-white text-xs placeholder-[#8696a0] outline-none"
						disabled
					/>
					<Paperclip className="h-3.5 w-3.5 flex-shrink-0 rotate-45 text-[#8696a0]" />
				</div>

				{/* Mic Button */}
				<button className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#00a884]">
					<Mic className="h-3.5 w-3.5 text-white" />
				</button>
			</div>
		</Phone>
	);
};

export default WhatsApp;
