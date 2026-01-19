"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowRight,
	Loader2,
	Mail,
	Phone,
	QrCode,
	Search,
	User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CheckInMethod } from "@/lib/api/event-check-in";
import { containerVariants, itemVariants } from "./animations";
import { CheckInMethodCard } from "./CheckInMethodCard";
import { QRScanner } from "./QRScanner"; // Import from original location or move it

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
}: CheckInSelectionProps) {
	return (
		<motion.div
			key="search-mode"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="space-y-16"
		>
			<AnimatePresence mode="wait">
				{inputStep === "selection" ? (
					<motion.div
						key="selection-grid"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="space-y-10"
					>
						<div className="pb-4">
							<h2 className="mb-4 font-bold text-4xl text-neutral-900 uppercase tracking-tighter sm:text-5xl">
								Check In Method
							</h2>
							<p className="max-w-xl font-medium text-base text-neutral-500 leading-relaxed">
								Select an identification method to retrieve your booking details
								and access the event.
							</p>
						</div>
						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
								className="flex items-center gap-2 font-mono text-[10px] text-neutral-400 uppercase tracking-widest hover:text-black"
							>
								<ArrowRight className="h-3 w-3 rotate-180" />
								Back to Selection
							</button>
							<div className="font-bold text-xs uppercase tracking-widest">
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
							<div className="flex h-full flex-col justify-between pt-4">
								{/* Pure Input Field */}
								<motion.div variants={itemVariants} className="group relative">
									<label className="mb-6 block font-bold font-mono text-neutral-500 text-sm uppercase tracking-widest">
										Enter {searchMethod}
									</label>
									<div className="relative border-neutral-100 border-b-2 transition-colors duration-300 focus-within:border-black">
										<Input
											value={searchValue}
											onChange={(e) => setSearchValue(e.target.value)}
											onKeyDown={(e) => e.key === "Enter" && onSearch()}
											placeholder="Type here..."
											className="h-auto w-full rounded-none border-none bg-transparent px-0 py-4 font-bold font-sans text-6xl text-neutral-900 tracking-tight placeholder:text-neutral-300 focus-visible:ring-0 sm:text-8xl"
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
														className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 hover:bg-neutral-900 hover:text-white"
													>
														<span className="sr-only">Clear</span>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="14"
															height="14"
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
								</motion.div>

								{/* Anchored Action Button */}
								<motion.div variants={itemVariants} className="mt-12">
									<Button
										onClick={() => onSearch()}
										disabled={!searchValue.trim() || isSearching}
										className="group flex h-20 w-full items-center justify-between rounded-none bg-brand-green px-8 font-bold font-mono text-white text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-brand-green-dark hover:shadow-xl disabled:opacity-50"
									>
										<span>Search</span>
										<ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
									</Button>
								</motion.div>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
