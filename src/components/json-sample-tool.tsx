"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Check,
	CheckSquare,
	Copy,
	FileJson,
	Square,
	Terminal,
	UserCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDialog } from "@/hooks/use-dialog";
import { getEventById } from "@/lib/api/event";
import { cn } from "@/lib/utils";
import { useUserSessionStore } from "@/stores/new-auth-store";

interface JsonSampleToolProps {
	resourceName: string;
	eventId: string;
	baseFields: string[];
}

export function JsonSampleTool({
	resourceName,
	eventId,
	baseFields,
}: JsonSampleToolProps) {
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
				description:
					"Customize and preview your sample data (JSON) in real-time.",
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

function JsonToolModal({
	resourceName,
	eventId,
	baseFields,
}: JsonToolModalProps) {
	const { data: eventData, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	const baseOptions = useMemo<FieldOption[]>(() => {
		return baseFields
			.filter((f) => f !== "custom_fields_data")
			.map((f) => ({
				id: f,
				label: f
					.split("_")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" "),
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
					key: key,
				});
			});
		} else {
			options.push({
				id: "custom_placeholder_1",
				label: "Sample Custom Field 1",
				isCustom: true,
				key: "sample_field_1",
			});
			options.push({
				id: "custom_placeholder_2",
				label: "Sample Custom Field 2",
				isCustom: true,
				key: "sample_field_2",
			});
		}
		return options;
	}, [eventData]);

	const allOptions = useMemo<FieldOption[]>(
		() => [...baseOptions, ...customOptions],
		[baseOptions, customOptions],
	);
	const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);

	useMemo(() => {
		if (allOptions.length > 0 && selectedFieldIds.length === 0) {
			setSelectedFieldIds(allOptions.map((o) => o.id));
		}
	}, [allOptions]);

	const [copied, setCopied] = useState(false);
	const [method, setMethod] = useState<
		"GET" | "POST" | "PATCH" | "PUT" | "DELETE"
	>("POST");

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
			if (f.includes("amount") || f.includes("price")) return 150.0;
			if (f.includes("date") || f.includes("at"))
				return new Date().toISOString();
			return "sample_value";
		};

		const result: Record<string, any> = {};
		const customFields: Record<string, any> = {};

		allOptions.forEach((option) => {
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

	const curlCommand = useMemo(() => {
		const baseUrl = "https://api.eventzflow.com/v1";
		const endpoint = `/${resourceName.toLowerCase()}${method === "GET" || method === "DELETE" ? "?event_id=" + eventId : ""}`;

		let curl = `curl -X ${method} "${baseUrl}${endpoint}" \\\n`;
		curl += `  -H "Content-Type: application/json" \\\n`;
		curl += `  -H "Authorization: Bearer YOUR_API_KEY"`;

		if (
			method !== "GET" &&
			method !== "DELETE" &&
			selectedFieldIds.length > 0
		) {
			curl += ` \\\n  -d '${sampleJson.replace(/'/g, "'\\''")}'`;
		}

		return curl;
	}, [method, resourceName, eventId, sampleJson, selectedFieldIds]);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(curlCommand);
		setCopied(true);
		toast.success("cURL command copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	};

	if (isLoadingEvent) {
		return (
			<div className="p-8 text-center text-muted-foreground italic">
				Loading event schema...
			</div>
		);
	}

	return (
		<div className="grid h-[calc(100vh-200px)] min-h-[500px] grid-cols-1 gap-6 overflow-hidden rounded-none bg-card p-4 sm:p-6 lg:grid-cols-[360px_1fr]">
			{/* Left Column: Fields */}
			<div className="flex min-h-0 flex-col overflow-hidden">
				<div className="flex h-full flex-col rounded-none border bg-background p-4">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 rounded-none border bg-muted/40 p-2">
							<UserCheck className="h-4 w-4" />
						</div>
						<div>
							<p className="font-semibold text-sm">Choose fields</p>
							<p className="text-muted-foreground text-xs">
								Pick what to include in your sample JSON.
							</p>
						</div>
					</div>

					<div className="mt-4 flex items-center justify-between">
						<span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
							Attributes
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="h-7 rounded-none px-2 text-[10px]"
							onClick={handleToggleAll}
						>
							{isAllSelected ? (
								<CheckSquare className="mr-1 h-3 w-3" />
							) : (
								<Square className="mr-1 h-3 w-3" />
							)}
							{isAllSelected ? "Unselect All" : "Select All"}
						</Button>
					</div>
					<ScrollArea className="mt-3 flex-1 overflow-hidden">
						<FieldGroup className="gap-2 py-1 pr-3">
							{baseOptions.map((option) => (
								<Field
									key={option.id}
									orientation="horizontal"
									className={cn(
										"group cursor-pointer rounded-none border border-muted bg-muted/20 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5",
										selectedFieldIds.includes(option.id)
											? "border-primary/40 bg-primary/5"
											: "",
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
											<FieldTitle className="font-semibold text-sm">
												{option.label}
											</FieldTitle>
											<span className="font-mono text-[10px] text-muted-foreground">
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
										"group cursor-pointer rounded-none border border-muted bg-muted/20 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5",
										selectedFieldIds.includes(option.id)
											? "border-primary/40 bg-primary/5"
											: "",
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
												<FieldTitle className="font-semibold text-blue-600 text-sm dark:text-blue-400">
													{option.label}
												</FieldTitle>
												<Badge
													variant="outline"
													className="rounded-none font-semibold text-[9px]"
												>
													Custom
												</Badge>
											</div>
											<span className="font-mono text-[10px] text-muted-foreground">
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
			<div className="flex min-h-0 flex-col overflow-hidden rounded-none border bg-background p-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 rounded-none border bg-muted/40 p-2">
							<Terminal className="h-4 w-4" />
						</div>
						<div>
							<p className="font-semibold text-sm">Sample Preview</p>
							<p className="text-muted-foreground text-xs">
								Live generated request body
							</p>
						</div>
					</div>
					<Button
						variant={copied ? "default" : "secondary"}
						size="sm"
						className={cn(
							"h-8 rounded-none px-4 font-bold text-xs transition-all sm:px-6",
							copied && "bg-green-600 hover:bg-green-600",
						)}
						onClick={copyToClipboard}
					>
						{copied ? (
							<Check className="mr-2 h-4 w-4" />
						) : (
							<Copy className="mr-2 h-4 w-4" />
						)}
						{copied ? "COPIED" : "COPY CURL"}
					</Button>
				</div>

				<div className="mt-3 flex items-center justify-between">
					<div className="flex items-center gap-1 rounded-none border bg-muted/40 p-1">
						{(["GET", "POST", "PATCH", "PUT", "DELETE"] as const).map((m) => (
							<Button
								key={m}
								variant={method === m ? "default" : "ghost"}
								size="sm"
								className={cn(
									"h-7 rounded-none px-3 font-bold text-[10px]",
									method === m
										? "bg-primary text-primary-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground",
								)}
								onClick={() => setMethod(m)}
							>
								{m}
							</Button>
						))}
					</div>
					<Badge
						variant="outline"
						className="rounded-none border-primary/20 bg-primary/5 font-mono text-[10px] text-primary"
					>
						{selectedFieldIds.length} ACTIVE FIELDS
					</Badge>
				</div>

				<div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border bg-muted/30">
					<div className="h-full w-full overflow-y-auto overflow-x-hidden">
						<div className="p-4 sm:p-6">
							<div className="flex flex-col gap-4">
								<div>
									<p className="mb-2 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
										cURL Command
									</p>
									<pre className="whitespace-pre-wrap break-all font-mono text-foreground/90 text-xs leading-relaxed sm:text-sm">
										<code className="text-blue-600 dark:text-blue-400">
											{curlCommand}
										</code>
									</pre>
								</div>

								<div className="border-t border-dashed" />

								<div>
									<p className="mb-2 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
										Sample Result
									</p>
									{selectedFieldIds.length > 0 ? (
										<pre className="whitespace-pre-wrap break-all font-mono text-foreground/90 text-xs leading-relaxed sm:text-sm">
											<code>{sampleJson}</code>
										</pre>
									) : (
										<div className="flex h-[100px] flex-col items-center justify-center gap-3 text-muted-foreground">
											<p className="font-semibold text-xs tracking-wider opacity-60">
												Select fields to preview payload
											</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-3 flex items-center gap-2 rounded-none border bg-muted/20 p-3">
					<Check className="h-4 w-4 text-emerald-600" />
					<p className="font-medium text-[11px] text-muted-foreground leading-snug tracking-tight">
						Synced with{" "}
						<span className="text-foreground">{eventData?.title}</span>{" "}
						settings.
					</p>
				</div>
			</div>
		</div>
	);
}
