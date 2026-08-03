"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Info, Pencil, Plus, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ImageUpload from "@/components/file-upload/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import {
	type CertificateField,
	type CertificateTemplate,
	downloadCertificate,
	getCertificateTemplate,
	removeCertificateBackground,
	uploadCertificateBackground,
	upsertCertificateTemplate,
} from "@/lib/api/certificate";
import { API_BASE_URL } from "@/utils/rest-api";
import {
	RECOMMENDED_CERTIFICATE_SIZES,
	resolveCertificateCanvasSize,
} from "./certificate-canvas-size";
import { CertificateSummary } from "./certificate-summary";
import { FieldInspector } from "./field-inspector";

// Konva must not run during SSR.
const CertificateCanvas = dynamic(
	() => import("./certificate-canvas").then((m) => m.CertificateCanvas),
	{ ssr: false },
);

const SAMPLE_NAME = "Jane Attendee";

// The backend returns Active Storage URLs as relative paths (only_path: true).
// Prepend the API origin so the browser fetches them from the backend, not the
// panel origin. Already-absolute URLs are returned unchanged.
function resolveImageUrl(url: string | null): string | null {
	if (!url) return null;
	if (/^(https?:|blob:|data:)/.test(url)) return url;
	return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

const FIELD_PRESETS: Record<
	CertificateField["type"],
	{ label: string; fontSize: number; fontStyle: CertificateField["font_style"] }
> = {
	attendee_name: { label: "Attendee Name", fontSize: 48, fontStyle: "bold" },
	event_title: { label: "Event Title", fontSize: 28, fontStyle: "normal" },
	date: { label: "Date", fontSize: 22, fontStyle: "normal" },
	static_text: { label: "Custom Text", fontSize: 22, fontStyle: "normal" },
};

function makeField(
	type: CertificateField["type"],
	canvasWidth: number,
	canvasHeight: number,
	index = 0,
): CertificateField {
	const preset = FIELD_PRESETS[type];
	return {
		id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
		type,
		label: preset.label,
		x: Math.round(canvasWidth * 0.2),
		y: Math.round(canvasHeight * 0.45 + index * 80),
		width: Math.round(canvasWidth * 0.6),
		height: type === "attendee_name" ? 100 : 60,
		font_size: preset.fontSize,
		font_style: preset.fontStyle,
		color: "#1A1A1A",
		align: "center",
		static_value: type === "static_text" ? "" : null,
	};
}

type CertificatesDesignerProps = {
	eventId: string;
};

export function CertificatesDesigner({ eventId }: CertificatesDesignerProps) {
	const queryClient = useQueryClient();
	const { openConfirm } = useConfirmDialog();

	const { data: template } = useQuery({
		queryKey: ["event", eventId, "certificate-template"],
		queryFn: () => getCertificateTemplate(eventId),
	});

	// Local editable state, hydrated from the server template.
	const [orientation, setOrientation] = useState<"portrait" | "landscape">(
		"landscape",
	);
	const [canvasWidth, setCanvasWidth] = useState(1123);
	const [canvasHeight, setCanvasHeight] = useState(794);
	const [fields, setFields] = useState<CertificateField[]>([]);
	const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
	const [status, setStatus] = useState<CertificateTemplate["status"]>("draft");
	const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
	// View vs edit mode. Editing surfaces Add field, the field editor panel, and
	// a draggable canvas; view mode is read-only.
	const [isEditing, setIsEditing] = useState(false);

	// Snapshot of the last saved state, used to revert on Cancel.
	const snapshotRef = useRef<{
		orientation: "portrait" | "landscape";
		canvasWidth: number;
		canvasHeight: number;
		fields: CertificateField[];
		backgroundUrl: string | null;
	} | null>(null);

	// Hydrate local editor state from the server template exactly once, so that
	// background re-uploads or query refetches don't clobber in-progress edits
	// (inferred canvas size, unsaved field drags).
	const hydratedRef = useRef(false);
	useEffect(() => {
		if (hydratedRef.current) return;
		// Still waiting for the query to resolve.
		if (template === undefined) return;
		hydratedRef.current = true;

		if (template === null) {
			// No template yet — start in edit mode so the user can build one.
			setIsEditing(true);
			return;
		}

		setOrientation(template.orientation);
		setCanvasWidth(template.canvas_width);
		setCanvasHeight(template.canvas_height);
		setFields(template.fields ?? []);
		setBackgroundUrl(resolveImageUrl(template.background_image_url));
		setStatus(template.status);
	}, [template]);

	const enterEditMode = () => {
		// Capture the current state so Cancel can revert to it.
		snapshotRef.current = {
			orientation,
			canvasWidth,
			canvasHeight,
			fields,
			backgroundUrl,
		};
		setIsEditing(true);
	};

	const cancelEdit = () => {
		const snap = snapshotRef.current;
		if (snap) {
			setOrientation(snap.orientation);
			setCanvasWidth(snap.canvasWidth);
			setCanvasHeight(snap.canvasHeight);
			setFields(snap.fields);
			setBackgroundUrl(snap.backgroundUrl);
		}
		setSelectedFieldId(null);
		setIsEditing(false);
	};

	const selectedField = useMemo(
		() => fields.find((f) => f.id === selectedFieldId) ?? null,
		[fields, selectedFieldId],
	);

	const patchField = (id: string, patch: Partial<CertificateField>) => {
		setFields((prev) =>
			prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
		);
	};

	const removeField = (id: string) => {
		setFields((prev) => prev.filter((f) => f.id !== id));
		setSelectedFieldId(null);
	};

	const addField = (type: CertificateField["type"]) => {
		// Only one attendee name field makes sense per certificate.
		if (
			type === "attendee_name" &&
			fields.some((f) => f.type === "attendee_name")
		) {
			toast.info("A name field already exists on the certificate.");
			return;
		}
		const field = makeField(type, canvasWidth, canvasHeight, fields.length);
		setFields((prev) => [...prev, field]);
		setSelectedFieldId(field.id);
	};

	const uploadMutation = useMutation({
		mutationFn: (file: File) => uploadCertificateBackground(eventId, file),
		onSuccess: (tpl) => {
			setBackgroundUrl(resolveImageUrl(tpl.background_image_url));
			toast.success("Background uploaded");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "certificate-template"],
			});
		},
		onError: (e: unknown) =>
			toast.error(e instanceof Error ? e.message : "Upload failed"),
	});

	const handleBackgroundSelected = (file: File | null) => {
		if (!file) return;
		// Infer orientation/canvas size from the uploaded image.
		const objectUrl = URL.createObjectURL(file);
		const img = new window.Image();
		img.onload = () => {
			const nextSize = resolveCertificateCanvasSize(
				img.naturalWidth,
				img.naturalHeight,
			);
			setCanvasWidth(nextSize.canvasWidth);
			setCanvasHeight(nextSize.canvasHeight);
			setOrientation(nextSize.orientation);
			URL.revokeObjectURL(objectUrl);
		};
		img.src = objectUrl;
		uploadMutation.mutate(file);
	};

	// Permanently deletes the uploaded background image on the server.
	const removeBackgroundMutation = useMutation({
		mutationFn: () => removeCertificateBackground(eventId),
		onSuccess: (tpl) => {
			setBackgroundUrl(resolveImageUrl(tpl.background_image_url));
			toast.success("Background image removed");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "certificate-template"],
			});
		},
		onError: (e: unknown) =>
			toast.error(
				e instanceof Error ? e.message : "Failed to remove background",
			),
	});

	const confirmRemoveBackground = () => {
		openConfirm({
			title: "Remove background image",
			message:
				"This permanently deletes the uploaded certificate template image. Your placed fields stay, but you'll need to upload a new image. Continue?",
			confirmLabel: "Remove image",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			onConfirm: () => removeBackgroundMutation.mutate(),
		});
	};

	const saveMutation = useMutation({
		mutationFn: (nextStatus: CertificateTemplate["status"]) =>
			upsertCertificateTemplate(eventId, {
				status: nextStatus,
				orientation,
				canvas_width: canvasWidth,
				canvas_height: canvasHeight,
				fields,
			}),
		onSuccess: (tpl) => {
			setStatus(tpl.status);
			setSelectedFieldId(null);
			setIsEditing(false);
			toast.success("Certificate template saved");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "certificate-template"],
			});
		},
		onError: (e: unknown) =>
			toast.error(e instanceof Error ? e.message : "Failed to save template"),
	});

	const downloadMutation = useMutation({
		mutationFn: () => downloadCertificate(eventId),
		onSuccess: (blob) => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "certificate-preview.pdf";
			a.click();
			URL.revokeObjectURL(url);
		},
		onError: (e: unknown) =>
			toast.error(
				e instanceof Error ? e.message : "Failed to download preview",
			),
	});

	const canMarkReady = Boolean(backgroundUrl) && fields.length > 0;

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<h2 className="font-semibold text-lg">Certificate Design</h2>
					<Badge
						variant={status === "ready" ? "default" : "secondary"}
						className="rounded-none"
					>
						{status === "ready" ? "Ready to send" : "Draft"}
					</Badge>
				</div>
				<div className="flex flex-wrap gap-2">
					{isEditing ? (
						<>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="rounded-none">
										<Plus className="mr-1 size-4" />
										Add field
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="rounded-none">
									<DropdownMenuItem onClick={() => addField("attendee_name")}>
										Attendee name
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => addField("event_title")}>
										Event title
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => addField("date")}>
										Date (today)
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => addField("static_text")}>
										Custom text
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<Button
								variant="outline"
								className="rounded-none"
								onClick={cancelEdit}
								disabled={saveMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								variant="outline"
								className="rounded-none"
								onClick={() => saveMutation.mutate("draft")}
								disabled={saveMutation.isPending}
							>
								Save draft
							</Button>
							<Button
								className="rounded-none"
								onClick={() => saveMutation.mutate("ready")}
								disabled={saveMutation.isPending || !canMarkReady}
							>
								Save &amp; mark ready
							</Button>
						</>
					) : (
						<>
							<Button
								variant="outline"
								className="rounded-none"
								onClick={() => downloadMutation.mutate()}
								disabled={!backgroundUrl || downloadMutation.isPending}
							>
								{downloadMutation.isPending ? "Preparing..." : "Preview PDF"}
							</Button>
							<Button className="rounded-none" onClick={enterEditMode}>
								<Pencil className="mr-1 size-4" />
								Edit design
							</Button>
						</>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
				<div className="min-w-0 space-y-3">
					{backgroundUrl ? (
						<>
							<CertificateCanvas
								backgroundUrl={backgroundUrl}
								canvasWidth={canvasWidth}
								canvasHeight={canvasHeight}
								fields={fields}
								selectedFieldId={isEditing ? selectedFieldId : null}
								sampleName={SAMPLE_NAME}
								readOnly={!isEditing}
								onSelectField={setSelectedFieldId}
								onChangeField={patchField}
							/>
							{isEditing && (
								<>
									<p className="text-muted-foreground text-xs">
										Tip: click a field on the certificate to edit its text,
										font, size, and color. Drag it to reposition.
									</p>
									<div className="flex items-center justify-between gap-2 border border-dashed bg-muted/40 px-3 py-2">
										<span className="text-muted-foreground text-xs">
											{orientation} · {canvasWidth}×{canvasHeight}px
										</span>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												className="rounded-none"
												onClick={() => setBackgroundUrl(null)}
											>
												<ImageIcon className="mr-1 size-4" />
												Replace image
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="rounded-none text-destructive hover:text-destructive"
												onClick={confirmRemoveBackground}
												disabled={removeBackgroundMutation.isPending}
											>
												<Trash2 className="mr-1 size-4" />
												{removeBackgroundMutation.isPending
													? "Removing..."
													: "Remove image"}
											</Button>
										</div>
									</div>
								</>
							)}
						</>
					) : isEditing ? (
						<div className="space-y-2">
							<Label>Certificate template image</Label>
							<ImageUpload
								onChange={handleBackgroundSelected}
								maxSize={10 * 1024 * 1024}
							/>
							<p className="text-muted-foreground text-xs">
								Upload your designed certificate (portrait or landscape). Then
								add fields and drag them onto it.
							</p>
							<div className="flex gap-2 border border-blue-200 bg-blue-50 p-3 text-blue-900 text-xs">
								<Info className="mt-0.5 size-4 shrink-0" />
								<p>
									<span className="font-medium">
										Recommended certificate size:
									</span>{" "}
									landscape {RECOMMENDED_CERTIFICATE_SIZES.landscape.width}×
									{RECOMMENDED_CERTIFICATE_SIZES.landscape.height}px or portrait{" "}
									{RECOMMENDED_CERTIFICATE_SIZES.portrait.width}×
									{RECOMMENDED_CERTIFICATE_SIZES.portrait.height}px for best
									export quality.
								</p>
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center gap-2 border border-dashed p-10 text-center">
							<ImageIcon className="size-8 text-muted-foreground" />
							<p className="font-medium text-sm">No certificate designed yet</p>
							<p className="text-muted-foreground text-xs">
								Click &ldquo;Edit design&rdquo; to upload a template and place
								fields.
							</p>
						</div>
					)}
				</div>

				{isEditing ? (
					<FieldInspector
						field={selectedField}
						hasFields={fields.length > 0}
						onChange={patchField}
						onRemove={removeField}
					/>
				) : (
					<CertificateSummary
						status={status}
						orientation={orientation}
						canvasWidth={canvasWidth}
						canvasHeight={canvasHeight}
						fields={fields}
						hasBackground={Boolean(backgroundUrl)}
					/>
				)}
			</div>
		</div>
	);
}

export default CertificatesDesigner;
