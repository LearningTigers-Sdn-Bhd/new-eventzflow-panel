import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getEventById } from "@/lib/api/event";
import { cn } from "@/lib/utils";
import { isImageUrlValue } from "@/lib/utils/custom-fields-display";
import { API_BASE_URL } from "@/utils/rest-api";
import type { BaseTicket } from "../event-ticket-table-columns";

const DOCUMENT_LABELS: Record<string, string> = {
	passport_copy: "IC / Passport Copy",
	photo_1: "Participant Selfie",
	photo_2: "Additional Photo",
	indemnity_form: "Indemnity Form",
	signature: "Signature",
};

function documentLabel(key: string | null, filename: string): string {
	if (key && DOCUMENT_LABELS[key]) return DOCUMENT_LABELS[key];
	return key || filename;
}

function absoluteAssetUrl(url: string): string {
	return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

interface TicketViewModalProps {
	ticket: BaseTicket;
	onClose?: () => void;
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section>
			<h3 className="px-1 pb-2 font-semibold text-foreground text-sm">
				{title}
			</h3>
			<table className="w-full table-fixed border-collapse rounded-none border bg-card text-sm">
				<tbody>{children}</tbody>
			</table>
		</section>
	);
}

function Field({
	label,
	children,
	className,
}: {
	label: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<tr className={cn("border-b last:border-b-0", className)}>
			<th className="w-28 border-r bg-muted/50 px-3 py-2.5 text-left align-top font-medium text-foreground/80 sm:w-36 sm:px-4 sm:py-3">
				{label}
			</th>
			<td className="px-3 py-2.5 align-top leading-relaxed sm:px-4 sm:py-3">
				{children}
			</td>
		</tr>
	);
}

function DocumentImage({ label, url }: { label: string; url: string }) {
	return (
		<tr className="border-b last:border-b-0">
			<td colSpan={2} className="px-3 py-2.5 sm:px-4 sm:py-3">
				<div className="flex items-center justify-between gap-2 pb-2">
					<span className="font-medium text-foreground/80 text-sm">
						{label}
					</span>
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 text-primary text-xs hover:underline"
					>
						Open full image
						<ExternalLink className="size-3" />
					</a>
				</div>
				<a href={url} target="_blank" rel="noopener noreferrer">
					<div className="relative aspect-video w-full overflow-hidden rounded-none border bg-muted">
						<img
							src={url}
							alt={label}
							className="h-full w-full object-contain"
						/>
					</div>
				</a>
			</td>
		</tr>
	);
}

export default function TicketViewModal({ ticket }: TicketViewModalProps) {
	const date = new Date(ticket.createdAt);
	const params = useParams();
	const eventId = params.event_id as string;

	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	// Merge event labels_data with any custom labels injected directly into the ticket
	const mergedLabelsMap = React.useMemo(() => {
		const map: Record<string, string> = { ...(eventData?.labels_data ?? {}) };
		ticket.customLabels?.forEach(({ name }) => {
			if (!(name in map)) {
				map[name] = name
					.replace(/_/g, " ")
					.replace(/\b\w/g, (c) => c.toUpperCase());
			}
		});
		return map;
	}, [eventData?.labels_data, ticket.customLabels]);

	const customLabels =
		Object.keys(mergedLabelsMap).length > 0
			? Object.entries(mergedLabelsMap).map(([key, labelName]) => {
					const rawValue = ticket.customLabels?.find(
						(l) => l.name === key,
					)?.value;
					return {
						name: labelName as string,
						value: typeof rawValue === "string" ? rawValue : "",
					};
				})
			: [];

	const registeredByEmail = ticket.registeredByEmail?.trim();
	const textLabels = customLabels.filter((l) => !isImageUrlValue(l.value));
	const imageLabels = customLabels.filter((l) => isImageUrlValue(l.value));
	const hasAdditionalInfo = Boolean(registeredByEmail) || textLabels.length > 0;
	const hasPaymentInfo = Boolean(
		ticket.paymentMethod || ticket.transactionId || ticket.paymentScreenshotUrl,
	);
	const isScanned = ticket.status === "scanned";

	return (
		<div className="flex flex-col gap-5 p-3 sm:gap-6 sm:p-4">
			{/* Status strip */}
			<div
				className={cn(
					"flex items-center justify-between gap-3 rounded-none border px-3 py-2.5 sm:px-4 sm:py-3",
					isScanned
						? "border-green-200 bg-green-50/60 dark:border-green-900 dark:bg-green-950/40"
						: "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/40",
				)}
			>
				<span className="text-muted-foreground text-xs">
					Registered {date.toLocaleDateString()} at {date.toLocaleTimeString()}
				</span>
				<Badge
					variant="outline"
					className={cn(
						"gap-1 rounded-none font-medium",
						isScanned
							? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
							: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
					)}
				>
					{isScanned ? (
						<CheckCircle2 className="size-3.5" />
					) : (
						<Clock className="size-3.5" />
					)}
					{isScanned ? "Scanned" : "Not scanned"}
				</Badge>
			</div>

			{/* Ticket holder */}
			<Section title="Ticket holder">
				<Field label="Full name">
					<span className="capitalize">{ticket.name || "-"}</span>
				</Field>
				<Field label="Email">{ticket.email || "No email provided"}</Field>
				<Field label="Phone">{ticket.phone || "No phone provided"}</Field>
				{ticket.vehicleRegistration && (
					<Field label="Expedition group">
						{ticket.vehicleRegistration.registrationFormName || "Unknown group"}
					</Field>
				)}
			</Section>

			{/* Ticket details */}
			<Section title="Ticket details">
				<Field label="Ticket type">
					{ticket.ticketTypeName
						? `${ticket.ticketTypeName}${ticket.ticketTypeId ? ` (#${ticket.ticketTypeId})` : ""}`
						: "Standard"}
				</Field>
				{ticket.passBundle?.name && (
					<Field label="Bundle pass">{ticket.passBundle.name}</Field>
				)}
				<Field label="Price">
					RM
					{(typeof ticket.value === "number"
						? ticket.value
						: Number.parseFloat(ticket.value as string) || 0
					).toFixed(2)}
				</Field>
				<Field label="Purchase date">
					{date.toLocaleDateString(undefined, { dateStyle: "long" })}
				</Field>
			</Section>

			{/* Payment */}
			{hasPaymentInfo && (
				<Section title="Payment">
					{ticket.paymentMethod && (
						<Field label="Method">
							<span className="capitalize">{ticket.paymentMethod}</span>
						</Field>
					)}
					{ticket.transactionId && (
						<Field label="Transaction ID">{ticket.transactionId}</Field>
					)}
					{ticket.paymentScreenshotUrl && (
						<Field label="Screenshot">
							<a
								href={ticket.paymentScreenshotUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-primary hover:underline"
							>
								View screenshot
								<ExternalLink className="size-3" />
							</a>
						</Field>
					)}
				</Section>
			)}

			{/* Additional information */}
			{(hasAdditionalInfo || imageLabels.length > 0) && (
				<Section title="Additional information">
					{registeredByEmail && (
						<Field label="Registered by">{registeredByEmail}</Field>
					)}
					{textLabels.map((label) => (
						<Field key={label.name} label={label.name}>
							<span className="whitespace-pre-line break-words capitalize">
								{label.value || "-"}
							</span>
						</Field>
					))}
					{imageLabels.map((label) => (
						<DocumentImage
							key={label.name}
							label={label.name}
							url={label.value}
						/>
					))}
				</Section>
			)}

			{/* Documents */}
			{ticket.documents && ticket.documents.length > 0 && (
				<Section title="Registration documents">
					{ticket.documents.map((doc) => (
						<DocumentImage
							key={doc.url}
							label={documentLabel(doc.key, doc.filename)}
							url={absoluteAssetUrl(doc.url)}
						/>
					))}
				</Section>
			)}
		</div>
	);
}
