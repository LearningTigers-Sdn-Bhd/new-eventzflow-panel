"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
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
			<div className="mb-6 flex items-center justify-between sm:mb-8">
				<div className="max-w-lg">
					<h2 className="font-serif text-3xl text-stone-900 sm:text-5xl">
						Guest{" "}
						<span className="mt-1 block text-stone-700 italic">
							Information
						</span>
					</h2>
				</div>
				<button
					type="button"
					onClick={onBack}
					className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-all hover:border-stone-400 hover:text-stone-700 sm:h-12 sm:w-12"
				>
					<ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
				</button>
			</div>

			<div className="mb-6 flex flex-col gap-2 px-1 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
				<p className="font-serif text-sm text-stone-600 italic">
					Please share the details of those accompanying you:
				</p>
				<p className="whitespace-nowrap font-semibold text-[10px] text-stone-500 uppercase tracking-widest sm:text-xs">
					{isUnlimited
						? `${companions.length} guests in your group`
						: `Guest ${companions.length} of ${extraGuestLimit}`}
				</p>
			</div>

			<div className="mb-6 space-y-4 sm:mb-10 sm:space-y-6">
				<AnimatePresence initial={false}>
					{companions.map((companion, index) => (
						<motion.div
							key={companion.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.98 }}
							className="relative rounded-xl border border-stone-100 bg-rsvp-canvas p-6 shadow-sm sm:p-10"
						>
							<div className="mb-6 flex items-center justify-between border-stone-200 border-b pb-4 sm:mb-8">
								<div className="flex items-center gap-4">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-serif text-[10px] text-stone-600 italic shadow-sm sm:h-10 sm:w-10 sm:text-xs">
										{index + 1}
									</div>
									<h3 className="font-serif text-lg text-stone-900 italic sm:text-xl">
										Guest Details
									</h3>
								</div>
								{companions.length > 1 && (
									<button
										type="button"
										onClick={() => removeCompanion(companion.id)}
										className="text-stone-400 transition-colors hover:text-red-400"
									>
										<Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
									</button>
								)}
							</div>

							<div className="grid gap-6 sm:gap-8">
								{(() => {
									const field = getCompanionFieldMeta(index, "full_name");
									return (
										<div className="space-y-2">
											<label
												htmlFor={field.id}
												className="font-bold text-[10px] text-stone-500 uppercase tracking-widest"
											>
												{field.label} <span className="text-red-400">*</span>
											</label>
											<input
												id={field.id}
												type="text"
												placeholder={field.placeholder}
												value={companion.full_name}
												onChange={(e) =>
													updateCompanion(
														companion.id,
														"full_name",
														e.target.value,
													)
												}
												className="h-10 w-full rounded-none border-stone-200 border-b bg-transparent px-0 font-serif text-base text-stone-900 transition-colors placeholder:text-stone-300 focus:border-stone-900 focus:outline-none sm:h-12"
												required
											/>
										</div>
									);
								})()}

								<div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
									{(() => {
										const field = getCompanionFieldMeta(index, "phone");
										return (
											<div className="space-y-2">
												<label
													htmlFor={field.id}
													className="font-bold text-[10px] text-stone-500 uppercase tracking-widest"
												>
													{field.label}
												</label>
												<input
													id={field.id}
													type="text"
													placeholder={field.placeholder}
													value={companion.phone || ""}
													onChange={(e) =>
														updateCompanion(
															companion.id,
															"phone",
															e.target.value,
														)
													}
													className="h-10 w-full rounded-none border-stone-200 border-b bg-transparent px-0 font-serif text-base text-stone-900 transition-colors placeholder:text-stone-300 focus:border-stone-900 focus:outline-none sm:h-12"
												/>
											</div>
										);
									})()}
									{(() => {
										const field = getCompanionFieldMeta(index, "email");
										return (
											<div className="space-y-2">
												<label
													htmlFor={field.id}
													className="font-bold text-[10px] text-stone-500 uppercase tracking-widest"
												>
													{field.label}
												</label>
												<input
													id={field.id}
													type="email"
													placeholder={field.placeholder}
													value={companion.email || ""}
													onChange={(e) =>
														updateCompanion(
															companion.id,
															"email",
															e.target.value,
														)
													}
													className="h-10 w-full rounded-none border-stone-200 border-b bg-transparent px-0 font-serif text-base text-stone-900 transition-colors placeholder:text-stone-300 focus:border-stone-900 focus:outline-none sm:h-12"
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
						className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 border-dashed bg-white py-4 font-bold text-[10px] text-stone-500 uppercase tracking-widest transition-all hover:bg-stone-50 hover:text-stone-700 sm:gap-3"
					>
						<UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
						Add another guest
					</button>
				)}
			</div>

			<div className="mt-4 flex justify-center sm:mt-6">
				<Button
					onClick={handleSubmit}
					disabled={!canSubmit || isSubmitting}
					className="h-12 w-full rounded-full bg-rsvp-ink font-bold text-[11px] text-white uppercase tracking-widest shadow-stone-200 shadow-xl transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 sm:h-14 sm:max-w-xs"
				>
					{isSubmitting ? "Saving response..." : "Confirm My RSVP"}
				</Button>
			</div>
		</div>
	);
}
