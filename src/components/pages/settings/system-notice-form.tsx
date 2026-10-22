"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	getSystemNotice,
	PUBLIC_SYSTEM_NOTICE_QUERY_KEY,
	SYSTEM_NOTICE_MAX_LENGTH,
	updateSystemNotice,
	updateSystemNoticeSchema,
} from "@/lib/api/system-notice";
import {
	CUSTOM_TEMPLATE_ID,
	DEFAULT_TEMPLATE_VALUES,
	DURATION_OPTIONS,
	fillTemplate,
	formatDuration,
	hasPlaceholder,
	matchTemplateId,
	NO_WORST_CASE,
	nextWorst,
	SYSTEM_NOTICE_TEMPLATES,
	type TemplateValues,
	templateNeedsTime,
} from "./system-notice-templates";

const NOTICE_KEY = ["system-notice"];

export function SystemNoticeForm() {
	const queryClient = useQueryClient();
	const [message, setMessage] = useState("");
	const [active, setActive] = useState(false);
	// The template being filled in with the time / duration pickers, and the
	// values picked for it.
	const [pickerTemplateId, setPickerTemplateId] = useState<string | null>(null);
	const [values, setValues] = useState<TemplateValues>(DEFAULT_TEMPLATE_VALUES);

	const {
		data: notice,
		isLoading,
		error,
	} = useQuery({
		queryKey: NOTICE_KEY,
		queryFn: getSystemNotice,
	});

	useEffect(() => {
		if (notice) {
			setMessage(notice.message);
			setActive(notice.active);
		}
	}, [notice]);

	const changed =
		notice !== undefined &&
		(message.trim() !== notice.message || active !== notice.active);

	const parsed = updateSystemNoticeSchema.safeParse({ message, active });
	const unfilledPlaceholder = hasPlaceholder(message);

	// The pickers only apply while the text is still the untouched template;
	// editing the text by hand turns it into a custom message.
	const pickerTemplate = SYSTEM_NOTICE_TEMPLATES.find(
		(item) => item.id === pickerTemplateId,
	);
	const pickersActive =
		pickerTemplate !== undefined &&
		message === fillTemplate(pickerTemplate.text, values);
	const selectedTemplateId =
		pickersActive && pickerTemplate
			? pickerTemplate.id
			: matchTemplateId(message);

	const saveMutation = useMutation({
		mutationFn: () => updateSystemNotice({ message, active }),
		onSuccess: (saved) => {
			queryClient.setQueryData(NOTICE_KEY, saved);
			// Show or hide the banner in this tab right away.
			queryClient.invalidateQueries({
				queryKey: PUBLIC_SYSTEM_NOTICE_QUERY_KEY,
			});
			toast.success(
				saved.active
					? "Banner is now live for all users."
					: "Banner is switched off.",
			);
		},
		onError: (err: Error) => {
			toast.error(err.message || "Failed to update the banner.");
		},
	});

	const onTemplateChange = (id: string) => {
		const template = SYSTEM_NOTICE_TEMPLATES.find((item) => item.id === id);
		// "Custom" keeps whatever is typed so far.
		if (!template) {
			setPickerTemplateId(null);
			return;
		}
		setValues(DEFAULT_TEMPLATE_VALUES);
		setPickerTemplateId(template.id);
		setMessage(fillTemplate(template.text, DEFAULT_TEMPLATE_VALUES));
	};

	const onValuesChange = (change: Partial<TemplateValues>) => {
		if (!pickerTemplate) return;
		const next = { ...values, ...change };
		next.worst = nextWorst(next.expected, next.worst);
		setValues(next);
		setMessage(fillTemplate(pickerTemplate.text, next));
	};

	if (isLoading) {
		return <p className="text-muted-foreground text-sm">Loading...</p>;
	}
	if (error) {
		return (
			<p className="text-destructive text-sm">
				Failed to load the system notice. Please refresh the page.
			</p>
		);
	}

	// What is saved vs what is on screen, so the status never disagrees with Save.
	const status = changed
		? "Unsaved changes."
		: notice?.active
			? "Live now: users can see this banner."
			: "Off: users cannot see a banner.";

	return (
		<div className="space-y-5">
			<div className="space-y-1.5">
				<p className="text-muted-foreground text-xs">
					What users will see at the top of the app
				</p>
				{message.trim() ? (
					<div className="flex items-center justify-center gap-2 border border-sky-300 bg-sky-100 px-4 py-2 text-center text-sky-950 text-sm dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100">
						<Info className="h-4 w-4 shrink-0" aria-hidden="true" />
						<span>{message.trim()}</span>
					</div>
				) : (
					<p className="border border-dashed p-3 text-muted-foreground text-sm">
						Pick a template or write a message to see the preview.
					</p>
				)}
			</div>

			<div className="grid gap-5 md:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="system-notice-template">Template</Label>
					<Select value={selectedTemplateId} onValueChange={onTemplateChange}>
						<SelectTrigger
							id="system-notice-template"
							className="w-full rounded-none"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							{SYSTEM_NOTICE_TEMPLATES.map((template) => (
								<SelectItem key={template.id} value={template.id}>
									{template.label}
								</SelectItem>
							))}
							<SelectItem value={CUSTOM_TEMPLATE_ID}>Custom message</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-start justify-between gap-4 border border-dashed p-3">
					<div className="space-y-0.5">
						<Label htmlFor="system-notice-active">
							Show the banner to everyone
						</Label>
						<p className="text-muted-foreground text-xs">
							Takes effect within about a minute, for every user in every
							organisation. Switch it off again once the update is done.
						</p>
					</div>
					<Switch
						id="system-notice-active"
						checked={active}
						onCheckedChange={setActive}
					/>
				</div>
			</div>

			{pickersActive && pickerTemplate && (
				<div className="grid gap-5 md:grid-cols-3">
					{templateNeedsTime(pickerTemplate) && (
						<div className="space-y-1.5">
							<Label htmlFor="system-notice-time">Time</Label>
							<Input
								id="system-notice-time"
								type="time"
								value={values.time}
								onChange={(event) =>
									onValuesChange({ time: event.target.value })
								}
								className="rounded-none"
							/>
						</div>
					)}
					<div className="space-y-1.5">
						<Label htmlFor="system-notice-expected">Expected duration</Label>
						<Select
							value={String(values.expected)}
							onValueChange={(value) =>
								onValuesChange({ expected: Number(value) })
							}
						>
							<SelectTrigger
								id="system-notice-expected"
								className="w-full rounded-none"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="rounded-none">
								{DURATION_OPTIONS.map((minutes) => (
									<SelectItem key={minutes} value={String(minutes)}>
										{formatDuration(minutes)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="system-notice-worst">Worst case</Label>
						<Select
							value={String(values.worst)}
							onValueChange={(value) =>
								onValuesChange({ worst: Number(value) })
							}
						>
							<SelectTrigger
								id="system-notice-worst"
								className="w-full rounded-none"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="rounded-none">
								<SelectItem value={String(NO_WORST_CASE)}>
									Not stated
								</SelectItem>
								{DURATION_OPTIONS.filter(
									(minutes) => minutes > values.expected,
								).map((minutes) => (
									<SelectItem key={minutes} value={String(minutes)}>
										{formatDuration(minutes)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			)}

			<div className="space-y-1.5">
				<Label htmlFor="system-notice-message">Message</Label>
				<Textarea
					id="system-notice-message"
					value={message}
					onChange={(event) => setMessage(event.target.value)}
					maxLength={SYSTEM_NOTICE_MAX_LENGTH}
					rows={3}
					className="rounded-none"
					placeholder="Pick a template above, or write your own message."
				/>
				<div className="flex items-start justify-between gap-2 text-xs">
					<p
						className={
							unfilledPlaceholder ? "text-destructive" : "text-muted-foreground"
						}
					>
						{unfilledPlaceholder
							? "Fill in the time (or replace the [placeholder]) before saving."
							: "Edit the template freely."}
					</p>
					<p className="shrink-0 text-muted-foreground">
						{message.length}/{SYSTEM_NOTICE_MAX_LENGTH}
					</p>
				</div>
			</div>

			{!parsed.success && active && (
				<p className="text-destructive text-sm">
					{parsed.error.issues[0]?.message}
				</p>
			)}

			<div className="flex items-center justify-between gap-4 border-t border-dashed pt-4">
				<p
					className={
						changed
							? "font-medium text-foreground text-sm"
							: "text-muted-foreground text-sm"
					}
				>
					{status}
				</p>
				<Button
					className="rounded-none"
					onClick={() => saveMutation.mutate()}
					disabled={
						!changed ||
						!parsed.success ||
						(active && unfilledPlaceholder) ||
						saveMutation.isPending
					}
				>
					{saveMutation.isPending ? "Saving..." : "Save"}
				</Button>
			</div>
		</div>
	);
}
