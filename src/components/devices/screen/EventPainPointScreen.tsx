import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, CheckCheck, Monitor, QrCode } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";

interface EventPainPointScreenProps {
	demoType: string;
	step: number;
	title: string;
}

const EventPainPointScreen: React.FC<EventPainPointScreenProps> = ({
	demoType,
	step,
	title,
}) => {
	const chatRef = useRef<HTMLDivElement>(null);
	const miniAppRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new messages appear
	useEffect(() => {
		if (chatRef.current) {
			chatRef.current.scrollTop = chatRef.current.scrollHeight;
		}
	}, [step]);

	// Auto-scroll for whatsapp-miniapp demo
	useEffect(() => {
		if (demoType === "whatsapp-miniapp" && miniAppRef.current) {
			miniAppRef.current.scrollTop = miniAppRef.current.scrollHeight;
		}
	}, [step, demoType]);
	const renderDemo = () => {
		switch (demoType) {
			case "whatsapp":
				return (
					<div className="flex h-full flex-col bg-[#0b141a]">
						{/* WhatsApp Chat Header */}
						<div className="flex items-center border-[#313d45] border-b bg-[#202c33] px-4 py-3">
							<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-green-500">
								<span className="font-bold text-sm text-white">🎫</span>
							</div>
							<div className="flex-1">
								<h6 className="font-medium text-sm text-white">
									Event Tickets
								</h6>
								<p className="text-[#8696a0] text-xs">
									{step === 0 || step === 2 ? "typing..." : "Online"}
								</p>
							</div>
						</div>

						{/* Chat Messages */}
						<div
							ref={chatRef}
							className="scrollbar-hide flex-1 space-y-2 overflow-y-auto px-4 py-2"
						>
							<AnimatePresence>
								{step >= 0 && (
									<motion.div
										key="msg1"
										className="mb-2 flex justify-start"
										initial={{ opacity: 0, x: -20, scale: 0.8 }}
										animate={{ opacity: 1, x: 0, scale: 1 }}
										exit={{ opacity: 0, x: -20, scale: 0.8 }}
										transition={{ duration: 0.4 }}
									>
										<div
											className="relative max-w-[85%] bg-[#202c33] px-3 py-2 shadow-lg"
											style={{ borderRadius: "7.5px 7.5px 7.5px 0px" }}
										>
											<p className="text-sm text-white">
												Hi! I need 2 tickets for the tech conference 💻
											</p>
											<div className="mt-1 flex items-center justify-end">
												<span className="text-[#8696a0] text-xs">2:30 PM</span>
											</div>
										</div>
									</motion.div>
								)}

								{step >= 1 && (
									<motion.div
										key="msg2"
										className="mb-2 flex justify-end"
										initial={{ opacity: 0, x: 20, scale: 0.8 }}
										animate={{ opacity: 1, x: 0, scale: 1 }}
										exit={{ opacity: 0, x: 20, scale: 0.8 }}
										transition={{ duration: 0.4 }}
									>
										<div
											className="relative max-w-[85%] bg-[#005c4b] px-3 py-2 shadow-lg"
											style={{ borderRadius: "7.5px 7.5px 0px 7.5px" }}
										>
											<p className="text-sm text-white">
												Perfect! Conference tickets available:
											</p>
											<div className="mt-2 rounded-md bg-[#004a3d] p-2">
												<p className="font-semibold text-sm text-white">
													🎫 Conference Pass - $199 each
												</p>
												<p className="text-white/80 text-xs">
													✨ Full access + networking
												</p>
											</div>
											<div className="mt-1 flex items-center justify-end">
												<span className="mr-1 text-[#8696a0] text-xs">
													2:31 PM
												</span>
												<CheckCheck className="h-4 w-4 text-[#53bdeb]" />
											</div>
										</div>
									</motion.div>
								)}

								{step >= 2 && (
									<motion.div
										key="msg3"
										className="mb-2 flex justify-start"
										initial={{ opacity: 0, x: -20, scale: 0.8 }}
										animate={{ opacity: 1, x: 0, scale: 1 }}
										exit={{ opacity: 0, x: -20, scale: 0.8 }}
										transition={{ duration: 0.4 }}
									>
										<div
											className="relative max-w-[80%] bg-[#202c33] px-3 py-2 shadow-lg"
											style={{ borderRadius: "7.5px 7.5px 7.5px 0px" }}
										>
											<p className="text-sm text-white">
												Great! I'll take 2 conference passes 🎉
											</p>
											<div className="mt-1 flex items-center justify-end">
												<span className="text-[#8696a0] text-xs">2:32 PM</span>
											</div>
										</div>
									</motion.div>
								)}

								{step >= 3 && (
									<motion.div
										key="msg4"
										className="mb-2 flex justify-end"
										initial={{ opacity: 0, x: 20, scale: 0.8 }}
										animate={{ opacity: 1, x: 0, scale: 1 }}
										exit={{ opacity: 0, x: 20, scale: 0.8 }}
										transition={{ duration: 0.4 }}
									>
										<div
											className="relative max-w-[90%] bg-[#005c4b] px-3 py-2 shadow-lg"
											style={{ borderRadius: "7.5px 7.5px 0px 7.5px" }}
										>
											<div className="space-y-2">
												<p className="font-semibold text-sm text-white">
													🎊 Order Confirmed!
												</p>
												<div className="rounded-md bg-[#004a3d] p-2 text-sm">
													<p className="text-white">2x Conference Pass</p>
													<p className="font-bold text-white">Total: $398</p>
												</div>
												<p className="text-white/90 text-xs">
													Payment: Card ending •••• 4242 ✅
												</p>
												<p className="text-white/90 text-xs">
													Tickets sent to your email!
												</p>
											</div>
											<div className="mt-1 flex items-center justify-end">
												<span className="mr-1 text-[#8696a0] text-xs">
													2:33 PM
												</span>
												<CheckCheck className="h-4 w-4 text-[#53bdeb]" />
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Chat Input Area */}
						<div className="border-[#313d45] border-t bg-[#202c33] px-4 py-2">
							<div className="flex items-center space-x-2">
								<div className="flex-1 rounded-full bg-[#2a3942] px-4 py-2">
									<p className="text-[#8696a0] text-sm">Type a message</p>
								</div>
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00a884]">
									<svg
										className="h-4 w-4 text-white"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M12 1c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2s2-.9 2-2V3c0-1.1-.9-2-2-2zm6.6 5.8c-.3-.3-.8-.3-1.1 0s-.3.8 0 1.1C18.4 8.7 19 9.8 19 11c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-1.2.6-2.3 1.5-3.1.3-.3.3-.8 0-1.1s-.8-.3-1.1 0C4.2 7.1 3.5 8.9 3.5 11c0 4.4 3.4 8.1 7.8 8.5V21H9c-.4 0-.8.3-.8.8s.3.8.8.8h6c.4 0 .8-.3.8-.8s-.3-.8-.8-.8h-2.3v-1.5c4.4-.4 7.8-4.1 7.8-8.5 0-2.1-.7-3.9-1.9-5.3z" />
									</svg>
								</div>
							</div>
						</div>
					</div>
				);

			case "pricing":
				return (
					<div className="h-full space-y-4 bg-gradient-to-b from-slate-900 to-black p-4">
						<div className="mb-4 text-center">
							<h6 className="mb-1 font-semibold text-white">
								💰 Revenue Calculator
							</h6>
							<p className="text-slate-400 text-xs">See how much you save</p>
						</div>

						<div className="space-y-4">
							<AnimatePresence>
								{step >= 0 && (
									<motion.div
										key="sales-input"
										className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.5 }}
									>
										<p className="mb-2 text-slate-300 text-sm">
											Monthly Ticket Sales
										</p>
										<div className="font-bold text-2xl text-white">$10,000</div>
									</motion.div>
								)}

								{step >= 1 && (
									<motion.div
										key="competitor-fees"
										className="rounded-xl border border-red-500/30 bg-red-500/20 p-4 backdrop-blur-sm"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.5 }}
									>
										<div className="mb-2 flex items-center justify-between">
											<p className="text-red-300 text-sm">Other Platforms</p>
											<span className="rounded bg-red-500/30 px-2 py-1 text-red-200 text-xs">
												8% fee
											</span>
										</div>
										<div className="font-bold text-lg text-red-400">
											$10,000 - $800 = $9,200
										</div>
										<p className="mt-1 text-red-300 text-xs">
											Commission taken from every sale
										</p>
									</motion.div>
								)}

								{step >= 2 && (
									<motion.div
										key="our-platform"
										className="rounded-xl border border-green-500/30 bg-green-500/20 p-4 backdrop-blur-sm"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.5 }}
									>
										<div className="mb-2 flex items-center justify-between">
											<p className="text-green-300 text-sm">Our Platform</p>
											<span className="rounded bg-green-500/30 px-2 py-1 text-green-200 text-xs">
												0% fee
											</span>
										</div>
										<div className="font-bold text-green-400 text-lg">
											$10,000 - $0 = $10,000
										</div>
										<p className="mt-1 text-green-300 text-xs">
											Keep 100% of your revenue!
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				);

			case "qr-validation":
				return (
					<div className="h-full space-y-3 bg-gradient-to-b from-slate-900 to-black p-3 sm:space-y-4 sm:p-4">
						<div className="mb-3 text-center sm:mb-4">
							<h6 className="mb-1 font-semibold text-sm text-white sm:text-base">
								📱 QR Check-In Scanner
							</h6>
							<p className="text-slate-400 text-xs">Organizer Dashboard View</p>
						</div>

						<div className="space-y-2 sm:space-y-3">
							<AnimatePresence>
								{step >= 0 && (
									<motion.div
										key="scanner-ready"
										className="rounded-lg border border-blue-500/30 bg-blue-500/20 p-3 text-center backdrop-blur-sm sm:rounded-xl sm:p-4"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.5 }}
									>
										<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 sm:h-16 sm:w-16 sm:rounded-xl">
											<QrCode className="h-6 w-6 animate-pulse text-white sm:h-8 sm:w-8" />
										</div>
										<p className="font-medium text-white text-xs sm:text-sm">
											QR Scanner Ready
										</p>
										<p className="text-slate-300 text-xs">
											Point camera at attendee QR code
										</p>
									</motion.div>
								)}

								{step >= 1 && (
									<motion.div
										key="scanning"
										className="rounded-lg border border-yellow-500/30 bg-yellow-500/20 p-3 backdrop-blur-sm sm:rounded-xl sm:p-4"
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.8 }}
										transition={{ duration: 0.5 }}
									>
										<div className="flex items-center space-x-2 sm:space-x-3">
											<div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-yellow-500 sm:h-12 sm:w-12">
												<Camera className="h-5 w-5 text-white sm:h-6 sm:w-6" />
											</div>
											<div>
												<p className="font-medium text-white text-xs sm:text-sm">
													Scanning QR Code...
												</p>
												<p className="text-xs text-yellow-300">
													Processing attendee data
												</p>
											</div>
										</div>
									</motion.div>
								)}

								{step >= 2 && (
									<motion.div
										key="validated"
										className="rounded-lg border border-green-500/30 bg-green-500/20 p-3 backdrop-blur-sm sm:rounded-xl sm:p-4"
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 20 }}
										transition={{ duration: 0.5 }}
									>
										<div className="flex items-center space-x-2 sm:space-x-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 sm:h-12 sm:w-12">
												<Check className="h-5 w-5 text-white sm:h-6 sm:w-6" />
											</div>
											<div className="flex-1">
												<p className="font-medium text-white text-xs sm:text-sm">
													Sarah Martinez
												</p>
												<p className="text-green-300 text-xs">
													Conference Pass - Valid ✓
												</p>
												<p className="text-slate-300 text-xs">
													Check-in: 9:15 AM
												</p>
											</div>
										</div>
									</motion.div>
								)}

								{step >= 3 && (
									<motion.div
										key="stats-update"
										className="rounded-lg border border-slate-600/30 bg-slate-700/40 p-2 backdrop-blur-sm sm:rounded-xl sm:p-3"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 10 }}
										transition={{ duration: 0.5 }}
									>
										<div className="grid grid-cols-2 gap-2 text-center sm:gap-3">
											<div>
												<p className="font-bold text-base text-white sm:text-lg">
													247
												</p>
												<p className="text-slate-400 text-xs">Checked In</p>
											</div>
											<div>
												<p className="font-bold text-base text-white sm:text-lg">
													53
												</p>
												<p className="text-slate-400 text-xs">Remaining</p>
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				);

			case "whatsapp-miniapp":
				return (
					<div className="flex h-full flex-col bg-[#0b141a]">
						{/* WhatsApp Mini App Header */}
						<div className="flex items-center border-[#313d45] border-b bg-[#202c33] px-3 py-2 sm:px-4 sm:py-3">
							<div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 sm:mr-3 sm:h-8 sm:w-8">
								<span className="font-bold text-white text-xs sm:text-sm">
									🎫
								</span>
							</div>
							<div className="flex-1">
								<h6 className="font-medium text-white text-xs sm:text-sm">
									Eventzflow App
								</h6>
								<p className="text-[#8696a0] text-xs">Event Registration</p>
							</div>
						</div>

						{/* Mini App Content */}
						<div
							ref={miniAppRef}
							className="scrollbar-hide flex-1 space-y-2 overflow-y-auto px-3 py-2 sm:space-y-3 sm:px-4 sm:py-3"
						>
							<AnimatePresence>
								{step >= 0 && (
									<motion.div
										key="event-card"
										className="rounded-lg border border-[#313d45] bg-[#202c33] p-3 sm:rounded-xl sm:p-4"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.4 }}
									>
										<div className="mb-2 flex items-center space-x-2 sm:mb-3 sm:space-x-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-600 sm:h-12 sm:w-12 sm:rounded-lg">
												<Monitor className="h-5 w-5 text-white sm:h-6 sm:w-6" />
											</div>
											<div>
												<h6 className="font-semibold text-white text-xs sm:text-sm">
													Tech Summit 2024
												</h6>
												<p className="text-[#8696a0] text-xs">
													Dec 15, 2024 • Convention Center
												</p>
											</div>
										</div>
										<div className="text-[#8696a0] text-xs">
											Join industry leaders for cutting-edge tech insights!
										</div>
									</motion.div>
								)}

								{step >= 1 && (
									<motion.div
										key="ticket-options"
										className="rounded-lg border border-[#313d45] bg-[#202c33] p-3 sm:rounded-xl sm:p-4"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.4 }}
									>
										<h6 className="mb-2 font-medium text-white text-xs sm:mb-3 sm:text-sm">
											Select Tickets
										</h6>
										<div className="space-y-2">
											<div className="flex items-center justify-between rounded-md bg-[#005c4b] p-2 sm:rounded-lg">
												<div>
													<p className="text-white text-xs sm:text-sm">
														Conference Pass
													</p>
													<p className="text-[#8696a0] text-xs">
														Full access + networking
													</p>
												</div>
												<div className="text-right">
													<p className="font-semibold text-white text-xs sm:text-sm">
														$199
													</p>
													<div className="flex items-center space-x-1 sm:space-x-2">
														<button className="h-5 w-5 rounded bg-[#004a3d] text-white text-xs sm:h-6 sm:w-6">
															-
														</button>
														<span className="text-white text-xs sm:text-sm">
															2
														</span>
														<button className="h-5 w-5 rounded bg-[#00a884] text-white text-xs sm:h-6 sm:w-6">
															+
														</button>
													</div>
												</div>
											</div>
										</div>
									</motion.div>
								)}

								{step >= 2 && (
									<motion.div
										key="user-info"
										className="rounded-lg border border-[#313d45] bg-[#202c33] p-3 sm:rounded-xl sm:p-4"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.4 }}
									>
										<h6 className="mb-2 font-medium text-white text-xs sm:mb-3 sm:text-sm">
											Your Details
										</h6>
										<div className="space-y-2">
											<input
												type="text"
												placeholder="Full Name"
												className="w-full rounded border-none bg-[#2a3942] p-2 text-white text-xs placeholder-[#8696a0] outline-none sm:text-sm"
												value="John Doe"
												readOnly
											/>
											<input
												type="email"
												placeholder="Email"
												className="w-full rounded border-none bg-[#2a3942] p-2 text-white text-xs placeholder-[#8696a0] outline-none sm:text-sm"
												value="john@example.com"
												readOnly
											/>
										</div>
									</motion.div>
								)}

								{step >= 3 && (
									<motion.div
										key="payment-confirmation"
										className="rounded-lg border border-[#00a884] bg-[#005c4b] p-3 sm:rounded-xl sm:p-4"
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.9 }}
										transition={{ duration: 0.4 }}
									>
										<div className="text-center">
											<div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884] sm:h-12 sm:w-12">
												<Check className="h-5 w-5 text-white sm:h-6 sm:w-6" />
											</div>
											<h6 className="mb-1 font-semibold text-white text-xs sm:text-sm">
												Payment Successful!
											</h6>
											<p className="mb-2 text-[#8696a0] text-xs">
												2x Conference Pass - $398
											</p>
											<p className="text-[#8696a0] text-xs">
												Tickets sent to your WhatsApp
											</p>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				);

			default:
				return <div className="p-4 text-slate-600">Demo loading...</div>;
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* App Header */}
			<div className="flex-shrink-0 border-white/10 border-b px-6 py-3">
				<h5 className="text-center font-medium text-sm text-white">{title}</h5>
			</div>

			{/* Scrollable Content - fills remaining space */}
			<div className="relative flex-1 overflow-hidden">
				<motion.div className="absolute inset-0">{renderDemo()}</motion.div>
			</div>
		</div>
	);
};

export default EventPainPointScreen;
