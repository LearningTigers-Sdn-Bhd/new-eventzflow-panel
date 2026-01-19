"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	ArrowRight,
	Check,
	Loader2,
	Mail,
	Phone,
	QrCode,
	User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AttendeePreview, CheckInMethod } from "@/lib/api/event-check-in";
import { containerVariants, itemVariants } from "./animations";
import { CheckInMethodCard } from "./CheckInMethodCard";
import { QRScanner } from "./QRScanner";

interface CheckInSelectionProps {
	inputStep: "selection" | "input";
	setInputStep: (step: "selection" | "input") => void;
	searchMethod: CheckInMethod;
	setSearchMethod: (method: CheckInMethod) => void;
	searchValue: string;
	setSearchValue: (val: string) => void;
	isSearching: boolean;
	onSearch: () => void;
	onScan: (val: string) => void;
	onSelectMethod: (method: CheckInMethod) => void;
	liveResults: AttendeePreview[];
	onSelectAttendee: (attendee: AttendeePreview) => void;
	searchError: string | null;
}

export function CheckInSelection({
	inputStep,
	setInputStep,
	searchMethod,
	setSearchMethod,
	searchValue,
	setSearchValue,
	isSearching,
	onSearch,
	onScan,
	onSelectMethod,
	liveResults,
	onSelectAttendee,
	searchError,
}: CheckInSelectionProps) {
	return (
		<motion.div
			key="search-mode"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="space-y-8"
		>
			<AnimatePresence mode="wait">
				{inputStep === "selection" ? (
					<motion.div
						key="selection-grid"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="space-y-8"
					>
						<div className="relative border-black border-l-4 pl-6 pb-2">
							<h2 className="mb-2 font-black text-4xl text-neutral-900 uppercase tracking-tight sm:text-5xl">
								Check In Method
							</h2>
							<p className="max-w-md font-medium text-sm text-neutral-400 leading-relaxed">
								Please select your preferred identification method to access the event premises.
							</p>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<motion.div variants={itemVariants}>
								<CheckInMethodCard
									label="Name"
									description="Search by attendee's full name"
									icon={User}
									onClick={() => onSelectMethod("name")}
								/>
							</motion.div>
							<motion.div variants={itemVariants}>
								<CheckInMethodCard
									label="Email"
									description="Search by email address"
									icon={Mail}
									onClick={() => onSelectMethod("email")}
								/>
							</motion.div>
							<motion.div variants={itemVariants}>
								<CheckInMethodCard
									label="Phone"
									description="Search by registered phone number"
									icon={Phone}
									onClick={() => onSelectMethod("phone")}
								/>
							</motion.div>
							<motion.div variants={itemVariants}>
								<CheckInMethodCard
									label="Scan QR Code"
									description="Point camera at QR Code for instant check-in"
									featured
									icon={QrCode}
									onClick={() => {
										setSearchMethod("scan");
										setInputStep("input");
									}}
								/>
							</motion.div>
						</div>
					</motion.div>
				) : (
					<motion.div
						key="input-form"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="space-y-12"
					>
						{/* Navigation Header */}
						<div className="flex items-center justify-between border-neutral-100 border-b pb-4">
							<button
								onClick={() => {
									setInputStep("selection");
									setSearchValue("");
								}}
								className="flex items-center gap-2 font-mono text-sm text-black uppercase tracking-widest hover:text-brand-green"
							>
								<ArrowRight className="h-4 w-4 rotate-180" />
								Back to Selection
							</button>
							<div className="font-bold text-sm text-neutral-500 uppercase tracking-widest">
								{searchMethod === "scan"
									? "Scanning QR"
									: `Searching by ${searchMethod}`}
							</div>
						</div>

						{searchMethod === "scan" ? (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="space-y-8"
							>
								<div className="border-2 border-neutral-100 bg-neutral-50 p-4">
									<div className="relative aspect-square overflow-hidden bg-black">
										<QRScanner onScan={onScan} />
									</div>
								</div>
								<p className="text-center font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
									Align code within the frame
								</p>
							</motion.div>
						) : (
							<div className="flex h-full flex-col pt-4">
								{/* Input Field */}
								<motion.div variants={itemVariants} className="group relative">
									<label className="mb-4 block font-bold font-mono text-lg text-neutral-500 uppercase tracking-widest">
										Enter {searchMethod}
									</label>
									<div className="relative border-neutral-300 border-b-2 transition-colors duration-300 focus-within:border-black">
										<Input
											value={searchValue}
											onChange={(e) => setSearchValue(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter" && searchMethod === "email") {
													onSearch();
												}
											}}
											placeholder={searchMethod === "email" ? "Enter full email..." : "Start typing..."}
											type={searchMethod === "email" ? "email" : "text"}
											className="h-auto w-full rounded-none border-none bg-transparent px-0 py-3 font-bold font-sans text-lg text-neutral-900 tracking-tight placeholder:text-neutral-300 focus-visible:ring-0 sm:text-xl lg:text-2xl"
											autoFocus
										/>
										<div className="absolute top-1/2 right-0 -translate-y-1/2">
											{isSearching ? (
												<Loader2 className="h-8 w-8 animate-spin text-brand-green" />
											) : (
												searchValue.length > 0 && (
													<motion.button
														initial={{ opacity: 0, scale: 0.8 }}
														animate={{ opacity: 1, scale: 1 }}
														onClick={() => setSearchValue("")}
														className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 hover:bg-neutral-900 hover:text-white"
													>
														<span className="sr-only">Clear</span>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="18"
															height="18"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<line x1="18" y1="6" x2="6" y2="18" />
															<line x1="6" y1="6" x2="18" y2="18" />
														</svg>
													</motion.button>
												)
											)}
										</div>
									</div>
									<p className="mt-3 font-mono text-sm text-neutral-500 uppercase tracking-widest">
										{searchMethod === "email"
											? "Enter your full email address"
											: searchValue.length < 2
												? "Type at least 2 characters"
												: isSearching
													? "Searching..."
													: liveResults.length > 0
														? `${liveResults.length} result${liveResults.length > 1 ? "s" : ""} found`
														: searchValue.length >= 2
															? "No matches found"
															: ""}
									</p>
								</motion.div>

								{/* Search Button for Email */}
								{searchMethod === "email" && (
									<motion.div variants={itemVariants} className="mt-8 space-y-4">
										<Button
											onClick={() => onSearch()}
											disabled={!searchValue.trim() || isSearching}
											className="group flex h-16 w-full items-center justify-between rounded-none bg-brand-green px-8 font-bold font-mono text-white text-sm uppercase tracking-widest transition-all duration-300 hover:bg-brand-green-dark hover:shadow-xl disabled:opacity-50"
										>
											<span>Search</span>
											<ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
										</Button>

										{/* Error Banner */}
										<AnimatePresence>
											{searchError && (
												<motion.div
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -10 }}
													transition={{ duration: 0.2 }}
													className="flex items-start gap-3 border border-amber-200 bg-amber-50 p-4"
												>
													<AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
													<div>
														<p className="font-medium text-amber-800">
															Email not found
														</p>
														<p className="mt-1 text-sm text-amber-700">
															{searchError}
														</p>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.div>
								)}

								{/* Live Results for Name/Phone */}
								{searchMethod !== "email" && (
									<AnimatePresence mode="sync">
										{liveResults.length > 0 && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ duration: 0.2 }}
												className="mt-6 max-h-[320px] space-y-2 overflow-y-auto pr-1"
											>
												{liveResults.map((attendee) => (
													<motion.button
														key={attendee.public_id}
														layout="position"
														initial={{ opacity: 0, scale: 0.97, y: 4 }}
														animate={{ opacity: 1, scale: 1, y: 0 }}
														exit={{ opacity: 0, scale: 0.97 }}
														transition={{
															duration: 0.2,
															ease: [0.25, 0.1, 0.25, 1],
														}}
														onClick={() => onSelectAttendee(attendee)}
														className="group flex w-full items-center justify-between border border-black bg-white p-5 text-left transition-colors duration-150 hover:border-black hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
													>
														<div className="min-w-0 flex-1">
															<div className="flex items-center gap-3">
																<span className="truncate font-bold text-base text-neutral-900">
																	{attendee.name}
																</span>
																{attendee.checked_in && (
																	<span className="flex shrink-0 items-center gap-1 border border-green-300 bg-green-100 px-2 py-0.5 font-mono text-[10px] text-green-700 uppercase">
																		<Check className="h-3 w-3" />
																		Checked in
																	</span>
																)}
															</div>
															<div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-xs text-neutral-500">
																{attendee.email && (
																	<span className="truncate rounded border border-neutral-300 rounded-none bg-neutral-100 px-1.5 py-0.5">
																		{attendee.email}
																	</span>
																)}
																{attendee.phone && (
																	<span className="shrink-0 rounded border border-neutral-300 rounded-none bg-neutral-100 px-1.5 py-0.5">
																		{attendee.phone}
																	</span>
																)}
																{attendee.type_name && (
																	<span className="shrink-0 rounded border border-neutral-300 rounded-none bg-neutral-100 px-1.5 py-0.5">
																		{attendee.type_name}
																	</span>
																)}
															</div>
														</div>
														<ArrowRight className="h-6 w-6 shrink-0 text-neutral-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-green" />
													</motion.button>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								)}
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
