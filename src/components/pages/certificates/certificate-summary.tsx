"use client";

import { CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
	CertificateField,
	CertificateTemplateStatus,
} from "@/lib/api/certificate";

const FIELD_TYPE_LABELS: Record<CertificateField["type"], string> = {
	attendee_name: "Attendee name",
	event_title: "Event title",
	date: "Date",
	static_text: "Custom text",
};

type CertificateSummaryProps = {
	status: CertificateTemplateStatus;
	orientation: "portrait" | "landscape";
	canvasWidth: number;
	canvasHeight: number;
	fields: CertificateField[];
	hasBackground: boolean;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between py-1.5 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium">{value}</span>
		</div>
	);
}

export function CertificateSummary({
	status,
	orientation,
	canvasWidth,
	canvasHeight,
	fields,
	hasBackground,
}: CertificateSummaryProps) {
	return (
		<div className="space-y-4 border p-4">
			<div>
				<h4 className="font-medium text-sm">Certificate summary</h4>
				<p className="text-muted-foreground text-xs">
					An overview of the current design. Click &ldquo;Edit design&rdquo; to
					make changes.
				</p>
			</div>

			{status === "draft" && (
				<div className="flex gap-2 border border-amber-300 bg-amber-50 p-3 text-amber-900">
					<Info className="mt-0.5 size-4 shrink-0" />
					<div className="space-y-0.5">
						<p className="font-medium text-xs">Still a draft</p>
						<p className="text-xs">
							Your certificate isn&rsquo;t ready to send just yet. When the
							design looks good, click &ldquo;Edit design&rdquo; then
							&ldquo;Save &amp; mark ready&rdquo; to start sending it to your
							participants.
						</p>
					</div>
				</div>
			)}

			{status === "ready" && (
				<div className="flex gap-2 border border-emerald-300 bg-emerald-50 p-3 text-emerald-900">
					<CheckCircle2 className="mt-0.5 size-4 shrink-0" />
					<div className="space-y-0.5">
						<p className="font-medium text-xs">Ready to send</p>
						<p className="text-xs">
							Your certificate is good to go! Head over to the &ldquo;Send &amp;
							Track&rdquo; tab to email it to your participants and keep an eye
							on who has received theirs.
						</p>
					</div>
				</div>
			)}

			<div className="divide-y">
				<SummaryRow
					label="Status"
					value={status === "ready" ? "Ready to send" : "Draft"}
				/>
				<SummaryRow
					label="Orientation"
					value={orientation === "landscape" ? "Landscape" : "Portrait"}
				/>
				<SummaryRow
					label="Size"
					value={`${canvasWidth} × ${canvasHeight} px`}
				/>
				<SummaryRow
					label="Background"
					value={hasBackground ? "Uploaded" : "Not set"}
				/>
				<SummaryRow label="Fields" value={String(fields.length)} />
			</div>

			<div className="space-y-2">
				<p className="font-medium text-xs">Fields on this certificate</p>
				{fields.length === 0 ? (
					<p className="text-muted-foreground text-xs">No fields added yet.</p>
				) : (
					<ul className="space-y-1">
						{fields.map((field) => (
							<li
								key={field.id}
								className="flex items-center justify-between border border-dashed px-2 py-1.5 text-xs"
							>
								<span className="font-medium">
									{FIELD_TYPE_LABELS[field.type] ?? field.label}
								</span>
								<Badge variant="secondary" className="rounded-none">
									{field.font_size}px
								</Badge>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

export default CertificateSummary;
