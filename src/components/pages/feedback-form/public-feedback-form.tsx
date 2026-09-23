"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
	type FeedbackQuestion,
	getPublicFeedbackForm,
	submitFeedback,
} from "@/lib/api/feedback-form";
import { cn } from "@/lib/utils";
import {
	type FeedbackAnswerValues,
	missingRequired,
	toAnswerPayload,
} from "./feedback-answers";

type PublicFeedbackFormProps = {
	slug: string;
	ticketPublicId?: string;
};

export function PublicFeedbackForm({
	slug,
	ticketPublicId,
}: PublicFeedbackFormProps) {
	const [values, setValues] = useState<FeedbackAnswerValues>({});
	const [missingIds, setMissingIds] = useState<number[]>([]);

	const {
		data: form,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["public-feedback-form", slug],
		queryFn: () => getPublicFeedbackForm(slug),
		retry: false,
	});

	useEffect(() => {
		if (form?.title) document.title = form.title;
	}, [form?.title]);

	const mutation = useMutation({
		mutationFn: () => {
			if (!form) throw new Error("Form not loaded");
			return submitFeedback({
				form_id: form.id,
				ticket_public_id: ticketPublicId,
				answers: toAnswerPayload(form.questions, values),
			});
		},
	});

	const setValue = (id: number, value: string | string[]) => {
		setValues((v) => ({ ...v, [id]: value }));
		setMissingIds((ids) => ids.filter((x) => x !== id));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!form) return;
		const missing = missingRequired(form.questions, values).map((q) => q.id);
		setMissingIds(missing);
		if (missing.length === 0) mutation.mutate();
	};

	if (isLoading) {
		return <LoadingState title="Loading feedback form..." description="" />;
	}

	if (isError || !form) {
		return (
			<ErrorState
				title="Feedback form not available"
				description="This form may be closed or the link is incorrect."
			/>
		);
	}

	return (
		<div className="min-h-screen bg-muted/30 px-4 py-10 sm:py-16">
			<Card className="mx-auto w-full max-w-2xl rounded-none shadow-none">
				<CardHeader className="border-b">
					<CardTitle className="text-2xl">{form.title}</CardTitle>
					{form.description && (
						<p className="whitespace-pre-line text-muted-foreground">
							{form.description}
						</p>
					)}
				</CardHeader>
				<CardContent>
					{mutation.isSuccess ? (
						<div className="flex flex-col items-center gap-3 py-10 text-center">
							<CheckCircle2 className="size-12 text-green-600" />
							<p className="font-semibold text-lg">
								Thank you for your feedback!
							</p>
							<p className="text-muted-foreground text-sm">
								Your response has been recorded.
							</p>
						</div>
					) : (
						<form className="space-y-6" onSubmit={handleSubmit} noValidate>
							{form.questions.map((q, index) => (
								<fieldset key={q.id} className="space-y-3 border-b pb-6">
									<legend className="mb-3 font-medium">
										{index + 1}. {q.question_text}
										{q.required && <span className="text-destructive"> *</span>}
									</legend>
									<QuestionInput
										question={q}
										value={values[q.id]}
										onChange={(value) => setValue(q.id, value)}
									/>
									{missingIds.includes(q.id) && (
										<p className="text-destructive text-sm">
											This question is required.
										</p>
									)}
								</fieldset>
							))}

							{mutation.isError && (
								<p className="rounded-none border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm">
									{mutation.error.message}
								</p>
							)}

							<Button
								type="submit"
								className="w-full rounded-none sm:w-auto"
								disabled={mutation.isPending}
							>
								{mutation.isPending && (
									<Loader2 className="size-4 animate-spin" />
								)}
								Submit feedback
							</Button>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function QuestionInput({
	question,
	value,
	onChange,
}: {
	question: FeedbackQuestion;
	value: string | string[] | undefined;
	onChange: (value: string | string[]) => void;
}) {
	const id = `q-${question.id}`;

	switch (question.question_type) {
		case "rating":
			return (
				<div className="flex gap-1">
					{[1, 2, 3, 4, 5].map((n) => (
						<label
							key={n}
							className="cursor-pointer rounded-none p-1 has-focus-visible:outline-2 has-focus-visible:outline-ring"
						>
							<input
								type="radio"
								name={id}
								value={n}
								checked={value === String(n)}
								onChange={() => onChange(String(n))}
								className="sr-only"
								aria-label={`${n} star${n > 1 ? "s" : ""}`}
							/>
							<Star
								className={cn(
									"size-8 text-amber-400",
									Number(value) >= n && "fill-current",
								)}
							/>
						</label>
					))}
				</div>
			);
		case "text":
			return (
				<Textarea
					id={id}
					className="rounded-none"
					value={(value as string) ?? ""}
					onChange={(e) => onChange(e.target.value)}
				/>
			);
		case "yes_no":
		case "single_choice": {
			const options =
				question.question_type === "yes_no"
					? [
							{ value: "yes", label: "Yes" },
							{ value: "no", label: "No" },
						]
					: (question.options ?? []).map((o) => ({ value: o, label: o }));
			return (
				<RadioGroup value={(value as string) ?? ""} onValueChange={onChange}>
					{options.map((o, i) => (
						<div key={o.value} className="flex items-center gap-2">
							<RadioGroupItem value={o.value} id={`${id}-${i}`} />
							<Label htmlFor={`${id}-${i}`} className="font-normal">
								{o.label}
							</Label>
						</div>
					))}
				</RadioGroup>
			);
		}
		case "multi_choice": {
			const selected = (value as string[]) ?? [];
			return (
				<div className="grid gap-3">
					{(question.options ?? []).map((o, i) => (
						<div key={o} className="flex items-center gap-2">
							<Checkbox
								id={`${id}-${i}`}
								className="rounded-none"
								checked={selected.includes(o)}
								onCheckedChange={(checked) =>
									onChange(
										checked
											? [...selected, o]
											: selected.filter((x) => x !== o),
									)
								}
							/>
							<Label htmlFor={`${id}-${i}`} className="font-normal">
								{o}
							</Label>
						</div>
					))}
				</div>
			);
		}
	}
}
