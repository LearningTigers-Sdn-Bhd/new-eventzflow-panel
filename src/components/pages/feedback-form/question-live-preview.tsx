"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import type { FeedbackQuestionType } from "@/lib/api/feedback-form";

export interface QuestionLivePreviewProps {
	questionText: string;
	questionType?: FeedbackQuestionType | "";
	required?: boolean;
	options?: string[];
	ratingLabels?: [string, string, string, string, string];
	placeholder?: string;
	hintText?: string;
}

export function QuestionLivePreview({
	questionText,
	questionType,
	required = false,
	options = [],
	ratingLabels = ["", "", "", "", ""],
	placeholder,
	hintText,
}: QuestionLivePreviewProps) {
	const [previewRating, setPreviewRating] = useState<string>("3");
	const [previewRadio, setPreviewRadio] = useState<string>("");
	const [previewChecks, setPreviewChecks] = useState<string[]>([]);

	if (!questionType) {
		return (
			<div className="rounded-none border border-dashed border-border/60 bg-muted/15 px-4 py-4 text-center">
				<p className="text-muted-foreground text-xs">
					Select an answer type above to preview this question.
				</p>
			</div>
		);
	}

	const hasPerScoreLabels = Boolean(
		ratingLabels[1]?.trim() ||
			ratingLabels[2]?.trim() ||
			ratingLabels[3]?.trim(),
	);
	const lowLabel = ratingLabels[0]?.trim() || "Strongly disagree";
	const highLabel = ratingLabels[4]?.trim() || "Strongly agree";

	const effectiveOptions =
		options.length > 0
			? options
			: ["Sample option A", "Sample option B", "Sample option C"];

	return (
		<div className="space-y-3 rounded-none border border-border/50 border-l-2 border-l-[#23C460] bg-muted/20 p-4">
			{questionText.trim() && (
				<div className="space-y-1">
					<p className="font-medium text-foreground text-sm">
						{questionText.trim()}
						{required && <span className="ml-1 text-destructive">*</span>}
					</p>
					{hintText?.trim() && (
						<p className="text-muted-foreground text-xs">{hintText}</p>
					)}
				</div>
			)}

			<div className="pt-0.5">
				{questionType === "rating" && (
					<div className="w-full space-y-3">
						<div className="mx-auto flex max-w-sm justify-between gap-1 sm:gap-2">
							{[1, 2, 3, 4, 5].map((n) => {
								const stepLabel = ratingLabels[n - 1]?.trim();
								const isSelected = previewRating === String(n);
								return (
									<button
										key={n}
										type="button"
										onClick={() => setPreviewRating(String(n))}
										className="group flex flex-1 cursor-pointer flex-col items-center gap-1.5 text-center focus-visible:outline-none"
									>
										<span className="font-semibold text-foreground text-sm tabular-nums">
											{n}
										</span>
										<span
											className={`flex size-7 items-center justify-center rounded-full border-2 transition-all hover:scale-105 ${
												isSelected
													? "border-[#23C460] bg-transparent"
													: "border-muted-foreground/30 hover:border-[#23C460]"
											}`}
										>
											{isSelected && (
												<span className="size-2.5 rounded-full bg-[#23C460]" />
											)}
										</span>
										{hasPerScoreLabels && stepLabel && (
											<span className="line-clamp-2 max-w-[4.5rem] text-[11px] leading-tight text-muted-foreground transition-colors group-hover:text-foreground">
												{stepLabel}
											</span>
										)}
									</button>
								);
							})}
						</div>
						{!hasPerScoreLabels && (
							<div className="mx-auto flex max-w-sm justify-between text-muted-foreground text-xs">
								<span>{lowLabel}</span>
								<span>{highLabel}</span>
							</div>
						)}
					</div>
				)}

				{questionType === "text" && (
					<Textarea
						placeholder={
							placeholder || "Attendee will type their answer here..."
						}
						className="min-h-20 rounded-none bg-background text-sm"
						readOnly
					/>
				)}

				{questionType === "single_choice" && (
					<div className="space-y-2">
						{effectiveOptions.map((opt, i) => {
							const isSelected = (previewRadio || effectiveOptions[0]) === opt;
							return (
								<button
									key={i}
									type="button"
									onClick={() => setPreviewRadio(opt)}
									className="flex w-full cursor-pointer items-center gap-2.5 text-left text-sm hover:text-foreground focus-visible:outline-none"
								>
									<span
										className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
											isSelected
												? "border-[#23C460]"
												: "border-muted-foreground/40"
										}`}
									>
										{isSelected && (
											<span className="size-2 rounded-full bg-[#23C460]" />
										)}
									</span>
									<span className="font-normal text-sm">{opt}</span>
								</button>
							);
						})}
					</div>
				)}

				{questionType === "multi_choice" && (
					<div className="space-y-2">
						{effectiveOptions.map((opt, i) => {
							const isChecked = previewChecks.includes(opt);
							return (
								<button
									key={i}
									type="button"
									onClick={() =>
										setPreviewChecks((prev) =>
											isChecked
												? prev.filter((item) => item !== opt)
												: [...prev, opt],
										)
									}
									className="flex w-full cursor-pointer items-center gap-2.5 text-left text-sm hover:text-foreground focus-visible:outline-none"
								>
									<span
										className={`flex size-4 shrink-0 items-center justify-center rounded-none border text-white ${
											isChecked
												? "border-[#23C460] bg-[#23C460]"
												: "border-muted-foreground/40 bg-background"
										}`}
									>
										{isChecked && (
											<span className="text-[10px] font-bold">✓</span>
										)}
									</span>
									<span className="font-normal text-sm">{opt}</span>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
