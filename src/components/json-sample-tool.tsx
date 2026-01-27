"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@/components/ui/field";
import { useDialog } from "@/hooks/use-dialog";
import { useUserSessionStore } from "@/stores/new-auth-store";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventById } from "@/lib/api/event";
import { toast } from "sonner";
import {
	Check,
	Copy,
	FileJson,
	CheckSquare,
	Square,
	Terminal,
	UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";

interface JsonSampleToolProps {
	resourceName: string;
	eventId: string;
	baseFields: string[];
}

export function JsonSampleTool({ resourceName, eventId, baseFields }: JsonSampleToolProps) {
	const { openDialog } = useDialog();
	const user = useUserSessionStore((state) => state.user);

	if (user?.role !== "org_owner") {
		return null;
	}

	const handleOpen = () => {
		openDialog({
			component: JsonToolModal,
			props: {
				resourceName,
				eventId,
				baseFields,
			},
			config: {
				title: `${resourceName} Sample Data`,
				description: "Customize and preview your sample data (JSON) in real-time.",
				size: "5xl",
				className: "rounded-none",
			},
		});
	};

	return (
		<Button
			variant="outline"
			onClick={handleOpen}
			className="w-full rounded-none py-6 md:py-4 lg:w-auto"
		>
			<FileJson className="mr-2 h-4 w-4" />
			Sample Data
		</Button>
	);
}

interface JsonToolModalProps {
	resourceName: string;
	eventId: string;
	baseFields: string[];
}

interface FieldOption {
	id: string;
	label: string;
	isCustom: boolean;
	key?: string;
}

function JsonToolModal({ resourceName, eventId, baseFields }: JsonToolModalProps) {
	const { data: eventData, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	const baseOptions = useMemo<FieldOption[]>(() => {
		return baseFields
			.filter(f => f !== "custom_fields_data")
			.map(f => ({
				id: f,
				label: f.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
				isCustom: false,
				key: undefined,
			}));
	}, [baseFields]);

	const customOptions = useMemo<FieldOption[]>(() => {
		const options: FieldOption[] = [];
		const labels = eventData?.labels_data;

		if (labels && Object.keys(labels).length > 0) {
			Object.entries(labels).forEach(([key, value]) => {
				options.push({
					id: `custom_${key}`,
					label: (value as string) || key,
					isCustom: true,
					key: key
				});
			});
		} else {
			// Dummy custom fields if none exist
			options.push({
				id: "custom_placeholder_1",
				label: "Sample Custom Field 1",
				isCustom: true,
				key: "sample_field_1"
			});
			options.push({
				id: "custom_placeholder_2",
				label: "Sample Custom Field 2",
				isCustom: true,
				key: "sample_field_2"
			});
		}
		return options;
	}, [eventData]);

	const allOptions = useMemo<FieldOption[]>(() => [...baseOptions, ...customOptions], [baseOptions, customOptions]);
	const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);

	useMemo(() => {
		if (allOptions.length > 0 && selectedFieldIds.length === 0) {
			setSelectedFieldIds(allOptions.map(o => o.id));
		}
	}, [allOptions]);

	const [copied, setCopied] = useState(false);

	const toggleField = (id: string) => {
		setSelectedFieldIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	const isAllSelected = selectedFieldIds.length === allOptions.length;
	const handleToggleAll = () => {
		setSelectedFieldIds(isAllSelected ? [] : allOptions.map((o) => o.id));
	};

	const sampleJson = useMemo(() => {
		const generateValue = (fieldId: string) => {
			const f = fieldId.toLowerCase();
			if (f.includes("email")) return "alex.smith@example.com";
			if (f.includes("phone")) return "+6012-345-6789";
			if (f.includes("id") && !f.includes("public")) return 1024;
			if (f.includes("age")) return 28;
			if (f.includes("name")) return "Alex Smith";
			if (f.includes("status")) return 1;
			if (f.includes("role")) return "attendee";
			if (f.includes("type")) return 1;
			if (f.includes("amount") || f.includes("price")) return 150.00;
			if (f.includes("date") || f.includes("at")) return new Date().toISOString();
			return "sample_value";
		};

		const result: Record<string, any> = {};
		const customFields: Record<string, any> = {};

		allOptions.forEach(option => {
			if (selectedFieldIds.includes(option.id)) {
				if (option.isCustom && option.key) {
					customFields[option.key] = generateValue(option.label);
				} else {
					result[option.id] = generateValue(option.id);
				}
			}
		});

		if (Object.keys(customFields).length > 0) {
			result.custom_fields_data = customFields;
		}

		return JSON.stringify(result, null, 2);
	}, [allOptions, selectedFieldIds]);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(sampleJson);
		setCopied(true);
		toast.success("JSON copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	};

	if (isLoadingEvent) {
		return <div className="p-8 text-center text-muted-foreground italic">Loading event schema...</div>;
	}

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr] rounded-none bg-card p-4 sm:p-6">
			{/* Left Column: Fields */}
			<div className="flex flex-col gap-4">
					<div className="rounded-none border bg-background p-4">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 rounded-none border bg-muted/40 p-2">
								<UserCheck className="h-4 w-4" />
							</div>
							<div>
								<p className="text-sm font-semibold">Choose fields</p>
								<p className="text-xs text-muted-foreground">
									Pick what to include in your sample JSON.
								</p>
							</div>
						</div>

					<div className="mt-4 flex items-center justify-between">
						<span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
							Attributes
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="h-7 px-2 text-[10px] rounded-none"
							onClick={handleToggleAll}
						>
							{isAllSelected ? (
								<CheckSquare className="h-3 w-3 mr-1" />
							) : (
								<Square className="h-3 w-3 mr-1" />
							)}
							{isAllSelected ? "Unselect All" : "Select All"}
						</Button>
					</div>
					<ScrollArea className="mt-3 h-[320px] sm:h-[420px] lg:h-[470px]">
						<FieldGroup className="pr-3 py-1 gap-2">
							{baseOptions.map((option) => (
								<Field
									key={option.id}
									orientation="horizontal"
									className={cn(
										"group cursor-pointer rounded-none border border-muted bg-muted/20 px-3 py-2.5 transition-colors hover:bg-primary/5 hover:border-primary/30",
										selectedFieldIds.includes(option.id)
											? "border-primary/40 bg-primary/5"
											: ""
									)}
								>
									<Checkbox
										id={`field-${option.id}`}
										checked={selectedFieldIds.includes(option.id)}
										onCheckedChange={() => toggleField(option.id)}
										className="rounded-none"
									/>
									<FieldLabel
										htmlFor={`field-${option.id}`}
										className="flex-1 cursor-pointer border-none bg-transparent p-0 hover:bg-transparent"
									>
										<div className="flex flex-col gap-1">
											<FieldTitle className="text-sm font-semibold">
												{option.label}
											</FieldTitle>
											<span className="text-[10px] font-mono text-muted-foreground">
												{option.id}
											</span>
										</div>
									</FieldLabel>
								</Field>
							))}
							{customOptions.map((option) => (
								<Field
									key={option.id}
									orientation="horizontal"
									className={cn(
										"group cursor-pointer rounded-none border border-muted bg-muted/20 px-3 py-2.5 transition-colors hover:bg-primary/5 hover:border-primary/30",
										selectedFieldIds.includes(option.id)
											? "border-primary/40 bg-primary/5"
											: ""
									)}
								>
									<Checkbox
										id={`field-${option.id}`}
										checked={selectedFieldIds.includes(option.id)}
										onCheckedChange={() => toggleField(option.id)}
										className="rounded-none"
									/>
									<FieldLabel
										htmlFor={`field-${option.id}`}
										className="flex-1 cursor-pointer border-none bg-transparent p-0 hover:bg-transparent"
									>
										<div className="flex flex-col gap-1">
											<div className="flex items-center gap-2">
												<FieldTitle className="text-sm font-semibold text-blue-600 dark:text-blue-400">
													{option.label}
												</FieldTitle>
												<Badge variant="outline" className="rounded-none text-[9px] font-semibold">
													Custom
												</Badge>
											</div>
											<span className="text-[10px] font-mono text-muted-foreground">
												key: {option.key}
											</span>
										</div>
									</FieldLabel>
								</Field>
							))}
						</FieldGroup>
					</ScrollArea>
				</div>
			</div>

			{/* Right Column: Preview */}
			<div className="rounded-none border bg-background p-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 rounded-none border bg-muted/40 p-2">
							<Terminal className="h-4 w-4" />
						</div>
						<div>
							<p className="text-sm font-semibold">Sample Preview</p>
							<p className="text-xs text-muted-foreground">
								Live generated request body
							</p>
						</div>
					</div>
					<Button
						variant={copied ? "default" : "secondary"}
						size="sm"
						className={cn(
							"h-8 px-4 font-bold text-xs rounded-none transition-all sm:px-6",
							copied && "bg-green-600 hover:bg-green-600"
						)}
						onClick={copyToClipboard}
						disabled={selectedFieldIds.length === 0}
					>
						{copied ? (
							<Check className="h-4 w-4 mr-2" />
						) : (
							<Copy className="h-4 w-4 mr-2" />
						)}
						{copied ? "COPIED" : "COPY JSON"}
					</Button>
				</div>

				<div className="mt-3 flex items-center justify-between">
					<Badge
						variant="outline"
						className="font-mono text-[10px] rounded-none border-primary/20 bg-primary/5 text-primary"
					>
						{selectedFieldIds.length} ACTIVE FIELDS
					</Badge>
				</div>

				<div className="mt-3 h-[280px] sm:h-[420px] lg:h-[520px] overflow-hidden rounded-none border bg-muted/30">
					<ScrollArea className="h-full">
						<pre className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed text-foreground/90 overflow-x-auto whitespace-pre">
							{selectedFieldIds.length > 0 ? (
								<code className="block min-w-max pr-6">{sampleJson}</code>
							) : (
								<div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-3">
									<FileJson className="h-12 w-12 opacity-10" />
									<p className="text-xs font-semibold opacity-60 tracking-wider">
										Select fields to preview
									</p>
								</div>
							)}
						</pre>
					</ScrollArea>
				</div>

				<div className="mt-3 flex items-center gap-2 rounded-none border bg-muted/20 p-3">
					<Check className="h-4 w-4 text-emerald-600" />
					<p className="text-[11px] text-muted-foreground leading-snug font-medium tracking-tight">
						Synced with <span className="text-foreground">{eventData?.title}</span> settings.
					</p>
				</div>
			</div>
		</div>
	);
}
