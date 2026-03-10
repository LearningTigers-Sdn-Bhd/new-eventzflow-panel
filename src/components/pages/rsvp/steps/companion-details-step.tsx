"use client";

import { ArrowLeft, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { RsvpCompanionRequest } from "@/lib/api/rsvp";
import {
	appendCompanionDraft,
	createCompanionDrafts,
	removeCompanionDraft,
	toCompanionRequests,
	updateCompanionDraft,
} from "./companion-drafts";
import { getCompanionFieldMeta } from "./companion-fields";

interface CompanionDetailsStepProps {
	extraGuestLimit: number | null;
	initialCompanions: RsvpCompanionRequest[];
	onSubmit: (companions: RsvpCompanionRequest[]) => void;
	onBack: () => void;
	isSubmitting: boolean;
}

export function CompanionDetailsStep({
	extraGuestLimit,
	initialCompanions,
	onSubmit,
	onBack,
	isSubmitting,
}: CompanionDetailsStepProps) {
	const isUnlimited = extraGuestLimit == null;
	const [companions, setCompanions] = useState(() =>
		createCompanionDrafts(initialCompanions),
	);

	const addCompanion = () => {
		if (isUnlimited || companions.length < extraGuestLimit) {
			setCompanions((current) => appendCompanionDraft(current));
		}
	};

	const removeCompanion = (id: string) => {
		setCompanions((current) => removeCompanionDraft(current, id));
	};

	const updateCompanion = (
		id: string,
		field: keyof RsvpCompanionRequest,
		value: string,
	) => {
		setCompanions((current) => updateCompanionDraft(current, id, field, value));
	};

	const canSubmit = companions.every((c) => c.full_name.trim().length > 0);
	const canAddMore = isUnlimited || companions.length < extraGuestLimit;

	const handleSubmit = () => {
		const validCompanions = toCompanionRequests(companions).filter(
			(c) => c.full_name.trim().length > 0,
		);
		onSubmit(validCompanions);
	};

	return (
		<div className="flex flex-col">
			<div className="mb-8 flex items-center justify-between border-b-4 border-black pb-6 sm:mb-12 sm:pb-8">
				<div>
					<h2 className="font-serif text-3xl text-black sm:text-5xl">
						Guest <span className="italic">Information</span>
					</h2>
				</div>
				<button
					type="button"
					onClick={onBack}
					className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white transition-colors hover:bg-black hover:text-white sm:h-12 sm:w-12"
				>
					<ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
				</button>
			</div>

			<div className="mb-6 flex justify-end px-1 sm:mb-8">
				<p className="text-xs font-black uppercase tracking-widest text-black sm:text-sm">
					{isUnlimited
						? `${companions.length} guests in your group`
						: `Guest ${companions.length} of ${extraGuestLimit}`}
				</p>
			</div>

			<div className="mb-10 text-left">
				<p className="text-base font-bold text-gray-900 sm:text-xl">
					Please share the details of those accompanying you:
				</p>
			</div>

			<div className="mb-8 space-y-6 sm:mb-10 sm:space-y-8">
				<AnimatePresence initial={false}>
					{companions.map((companion, index) => (
						<motion.div
							key={companion.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.98 }}
							className="relative border-[3px] border-black bg-white p-6 sm:border-4 sm:p-8"
						>
							<div className="mb-6 flex items-center justify-between border-b-2 border-black pb-4 sm:mb-8">
								<div className="flex items-center gap-3 sm:gap-4">
									<div className="flex h-8 w-8 items-center justify-center bg-black text-xs font-black text-white sm:h-10 sm:w-10 sm:text-sm">
										{index + 1}
									</div>
									<h3 className="font-black uppercase tracking-tighter text-xl sm:text-2xl">Guest Details</h3>
								</div>
								{companions.length > 1 && (
									<button
										type="button"
										onClick={() => removeCompanion(companion.id)}
										className="text-gray-400 transition-colors hover:text-red-600"
									>
										<Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
									</button>
								)}
							</div>

							<div className="grid gap-6 sm:gap-8">
								{(() => {
									const field = getCompanionFieldMeta(index, "full_name");
									return (
										<div className="space-y-2 sm:space-y-3">
											<label
												htmlFor={field.id}
												className="text-[10px] font-black uppercase tracking-widest text-black sm:text-xs"
											>
												{field.label} <span className="text-red-600">*</span>
											</label>
											<input
												id={field.id}
												type="text"
												placeholder={field.placeholder}
												value={companion.full_name}
												onChange={(e) =>
													updateCompanion(companion.id, "full_name", e.target.value)
												}
												className="h-12 w-full border-[3px] border-black bg-white px-4 text-base font-bold text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-green/30 sm:h-14 sm:border-4 sm:text-lg"
												required
											/>
										</div>
									);
								})()}

								<div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
									{(() => {
										const field = getCompanionFieldMeta(index, "phone");
										return (
											<div className="space-y-2 sm:space-y-3">
												<label
													htmlFor={field.id}
													className="text-[10px] font-black uppercase tracking-widest text-black sm:text-xs"
												>
													{field.label}
												</label>
												<input
													id={field.id}
													type="text"
													placeholder={field.placeholder}
													value={companion.phone || ""}
													onChange={(e) =>
														updateCompanion(companion.id, "phone", e.target.value)
													}
													className="h-12 w-full border-[3px] border-black bg-white px-4 text-base font-bold text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-green/30 sm:h-14 sm:border-4 sm:text-lg"
												/>
											</div>
										);
									})()}
									{(() => {
										const field = getCompanionFieldMeta(index, "email");
										return (
											<div className="space-y-2 sm:space-y-3">
												<label
													htmlFor={field.id}
													className="text-[10px] font-black uppercase tracking-widest text-black sm:text-xs"
												>
													{field.label}
												</label>
												<input
													id={field.id}
													type="email"
													placeholder={field.placeholder}
													value={companion.email || ""}
													onChange={(e) =>
														updateCompanion(companion.id, "email", e.target.value)
													}
													className="h-12 w-full border-[3px] border-black bg-white px-4 text-base font-bold text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-green/30 sm:h-14 sm:border-4 sm:text-lg"
												/>
											</div>
										);
									})()}
								</div>
							</div>
						</motion.div>
					))}
				</AnimatePresence>

				{canAddMore && (
					<button
						type="button"
						onClick={addCompanion}
						className="flex w-full items-center justify-center gap-3 border-[3px] border-dashed border-black bg-white py-4 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-black hover:text-white sm:gap-4 sm:border-4 sm:py-6 sm:text-sm"
					>
						<UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
						Add another guest
					</button>
				)}
			</div>

			<Button
				onClick={handleSubmit}
				disabled={!canSubmit || isSubmitting}
				className="h-16 w-full rounded-none border-[3px] border-black bg-black text-lg font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-black active:scale-[0.98] disabled:opacity-50 sm:h-20 sm:border-4 sm:text-xl"
			>
				{isSubmitting ? "Saving your response..." : "Confirm My RSVP"}
			</Button>
		</div>
	);
}
