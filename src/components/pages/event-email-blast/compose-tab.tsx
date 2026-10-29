"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RichEditor } from "@/components/admin-ui/rich-editor/rich-editor";
import { RichEditorContentArea } from "@/components/admin-ui/rich-editor/rich-editor-content-area";
import { RichEditorToolbar } from "@/components/admin-ui/rich-editor/rich-editor-toolbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import {
	createEmailBlast,
	deliverEmailBlast,
	duplicateEmailBlast,
	type EmailBlast,
	type EmailBlastAttachment,
	type EmailBlastFormat,
	getEmailBlastAudience,
	testEmailBlast,
	updateEmailBlast,
} from "@/lib/api/email-blast";
import { getEventTicketTypes } from "@/lib/api/ticket-type";
import { cn } from "@/lib/utils";
import { AttachmentsField } from "./attachments-field";
import { EMAIL_STYLES } from "./email-styles";
import { HtmlEditor } from "./html-editor";
import { LivePreview } from "./live-preview";

const EMPTY_BODY = "<p></p>";
// Image, table, code and CTA blocks can't survive in an email, so the editor hides them.
const EMAIL_HIDDEN_TOOLS = [
	"toc",
	"highlight",
	"checklist",
	"cta",
	"image",
	"code",
	"table",
];
const hasText = (html: string) =>
	html.replace(/<[^>]*>/g, "").trim().length > 0;
const errorMessage = (e: unknown) =>
	e instanceof Error ? e.message : "Something went wrong";

type Props = {
	eventId: string;
	/** A draft to continue; null starts a blank email. */
	initial: EmailBlast | null;
	onSent: () => void;
};

export function ComposeTab({ eventId, initial, onSent }: Props) {
	const queryClient = useQueryClient();
	const { openConfirm } = useConfirmDialog();
	const [subject, setSubject] = useState(initial?.subject ?? "");
	const [format, setFormat] = useState<EmailBlastFormat>(
		initial?.body_format ?? "rich",
	);
	const [body, setBody] = useState(initial?.body || EMPTY_BODY);
	const [typeIds, setTypeIds] = useState<string[]>(
		(initial?.ticket_type_ids ?? []).map(String),
	);
	const [includePending, setIncludePending] = useState(
		initial?.include_pending ?? false,
	);
	const [banner, setBanner] = useState<File | null>(null);
	const [bannerUrl, setBannerUrl] = useState<string | null>(
		initial?.banner_url ?? null,
	);
	const [savedFiles, setSavedFiles] = useState<EmailBlastAttachment[]>(
		initial?.attachments ?? [],
	);
	const [newFiles, setNewFiles] = useState<File[]>([]);
	const [removedIds, setRemovedIds] = useState<number[]>([]);
	const [draftId, setDraftId] = useState<number | null>(initial?.id ?? null);
	const [styleKey, setStyleKey] = useState(initial?.style_key ?? "general");
	// Bumps when the server-side draft changes in a way the preview must reload for (banner).
	const [previewVersion, setPreviewVersion] = useState(0);
	const [saveOpen, setSaveOpen] = useState(false);
	const [templateName, setTemplateName] = useState("");

	const numericTypeIds = typeIds.map(Number);
	const { data: ticketTypes = [] } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});
	const { data: audience } = useQuery({
		queryKey: ["email-blast-audience", eventId, typeIds, includePending],
		queryFn: () =>
			getEmailBlastAudience(eventId, numericTypeIds, includePending),
	});
	const recipientCount = audience?.recipient_count ?? 0;
	const ready = subject.trim().length > 0 && hasText(body);
	const isHtml = format === "html";

	// Every action works on the saved draft, so preview/test/send always match
	// exactly what is on screen.
	const saveDraft = async (bannerFile?: File) => {
		const draft = {
			// A banner can be picked before the subject is typed; the draft needs some subject to exist.
			subject: subject.trim() || "(untitled draft)",
			body,
			bodyFormat: format,
			styleKey,
			ticketTypeIds: numericTypeIds,
			includePending,
			banner: isHtml ? null : (bannerFile ?? banner),
			attachments: newFiles,
			removeAttachmentIds: removedIds,
		};
		const saved = draftId
			? await updateEmailBlast(eventId, draftId, draft)
			: await createEmailBlast(eventId, draft);
		setDraftId(saved.id);
		setBannerUrl(saved.banner_url);
		setBanner(null);
		setSavedFiles(saved.attachments);
		setNewFiles([]);
		setRemovedIds([]);
		queryClient.invalidateQueries({ queryKey: ["email-blasts", eventId] });
		return saved;
	};

	// A banner is stored with the draft, so upload it as soon as it is chosen; the live preview then shows it.
	const bannerMutation = useMutation({
		mutationFn: (file: File) => saveDraft(file),
		onSuccess: () => setPreviewVersion((v) => v + 1),
		onError: (e) => toast.error(errorMessage(e)),
	});
	const testMutation = useMutation({
		mutationFn: async () => testEmailBlast(eventId, (await saveDraft()).id),
		onSuccess: (res) => toast.success(res.message),
		onError: (e) => toast.error(errorMessage(e)),
	});
	const templateMutation = useMutation({
		mutationFn: async () =>
			duplicateEmailBlast(eventId, (await saveDraft()).id, templateName.trim()),
		onSuccess: (t) => {
			toast.success(`Saved template "${t.name}"`);
			setSaveOpen(false);
			setTemplateName("");
			queryClient.invalidateQueries({ queryKey: ["email-blasts", eventId] });
		},
		onError: (e) => toast.error(errorMessage(e)),
	});
	const sendMutation = useMutation({
		mutationFn: async () => deliverEmailBlast(eventId, (await saveDraft()).id),
		onSuccess: (blast) => {
			toast.success(`Sending to ${blast.recipient_count} delegates`);
			queryClient.invalidateQueries({ queryKey: ["email-blasts", eventId] });
			onSent();
		},
		onError: (e) => toast.error(errorMessage(e)),
	});

	const busy =
		bannerMutation.isPending ||
		testMutation.isPending ||
		templateMutation.isPending ||
		sendMutation.isPending;

	const handleSend = () =>
		openConfirm({
			title: "Send email blast",
			message: `"${subject}" will be emailed to ${recipientCount} delegate${recipientCount === 1 ? "" : "s"} now. This cannot be undone. Continue?`,
			confirmLabel: "Send now",
			cancelLabel: "Cancel",
			type: "warning",
			icon: "alert",
			onConfirm: () => sendMutation.mutate(),
		});

	const switchMode = (next: EmailBlastFormat) => {
		if (next === format) return;
		if (next === "html") return setFormat("html");
		// Back to the simple editor drops custom layout (tables, buttons, colours).
		openConfirm({
			title: "Switch to the simple editor?",
			message:
				"The simple editor keeps text, headings, lists and links only. Custom layout, colours and images in your HTML will be lost.",
			confirmLabel: "Switch",
			cancelLabel: "Keep HTML",
			type: "warning",
			icon: "alert",
			onConfirm: () => setFormat("rich"),
		});
	};

	return (
		<div className="@container">
			<div className="grid @3xl:grid-cols-[minmax(0,1fr)_340px] grid-cols-[minmax(0,1fr)] gap-6">
				<div className="min-w-0 space-y-5">
					<div className="space-y-2">
						<Label htmlFor="blast-subject">Subject</Label>
						<Input
							id="blast-subject"
							className="rounded-none"
							placeholder="e.g. Meet the featured speakers of the Summit"
							value={subject}
							maxLength={200}
							onChange={(e) => setSubject(e.target.value)}
						/>
					</div>

					{!isHtml && (
						<div className="space-y-2">
							<Label htmlFor="blast-style">Email style</Label>
							<Select value={styleKey} onValueChange={setStyleKey}>
								<SelectTrigger id="blast-style" className="w-full rounded-none">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="rounded-none">
									{EMAIL_STYLES.map((st) => (
										<SelectItem key={st.value} value={st.value}>
											{st.label}
											<span className="ml-2 text-muted-foreground text-xs">
												{st.hint}
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-muted-foreground text-xs">
								Sets the header badge and colour at the top of the email.
							</p>
						</div>
					)}

					<div className="space-y-2">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<Label>Message</Label>
							<div className="flex border">
								{(
									[
										["rich", "Write"],
										["html", "HTML code"],
									] as const
								).map(([value, label]) => (
									<button
										key={value}
										type="button"
										onClick={() => switchMode(value)}
										className={cn(
											"px-3 py-1 font-medium text-xs",
											format === value
												? "bg-primary text-primary-foreground"
												: "hover:bg-muted",
										)}
									>
										{label}
									</button>
								))}
							</div>
						</div>

						{isHtml ? (
							<HtmlEditor value={body} onChange={setBody} />
						) : (
							<div className="compact-editor overflow-hidden border">
								<RichEditor
									value={body}
									onChange={setBody}
									minHeight="280px"
									className="w-full"
									disabledExtensions={EMAIL_HIDDEN_TOOLS}
								>
									<RichEditorToolbar />
									<RichEditorContentArea
										className="px-4 py-3 md:px-4"
										minHeight="280px"
									/>
								</RichEditor>
							</div>
						)}
					</div>

					{!isHtml && (
						<LivePreview
							eventId={eventId}
							draftId={draftId}
							subject={subject}
							body={body}
							styleKey={styleKey}
							version={previewVersion}
						/>
					)}

					{!isHtml && (
						<div className="space-y-2">
							<Label htmlFor="blast-banner">Banner image (optional)</Label>
							<Input
								id="blast-banner"
								type="file"
								className="rounded-none"
								accept="image/jpeg,image/png,image/gif"
								onChange={(e) => {
									const file = e.target.files?.[0] ?? null;
									setBanner(file);
									if (file) {
										// Save right away so the live preview can show it.
										setBannerUrl(URL.createObjectURL(file));
										bannerMutation.mutate(file);
									}
								}}
							/>
							<p className="text-muted-foreground text-xs">
								Shown at the top of the email. JPG, PNG or GIF, up to 3 MB.
							</p>
							{bannerUrl && (
								// biome-ignore lint/performance/noImgElement: local blob / backend preview thumbnail
								<img
									src={bannerUrl}
									alt="Banner preview"
									className="max-h-40 w-fit border"
								/>
							)}
						</div>
					)}

					<AttachmentsField
						saved={savedFiles.filter((a) => !removedIds.includes(a.id))}
						pending={newFiles}
						onAdd={(files) => setNewFiles((prev) => [...prev, ...files])}
						onRemoveSaved={(id) => setRemovedIds((prev) => [...prev, id])}
						onRemovePending={(i) =>
							setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
						}
						onError={(message) => toast.error(message)}
					/>
				</div>

				<aside className="@3xl:sticky @3xl:top-4 h-fit space-y-4">
					<div className="space-y-3 border p-4">
						<h4 className="font-medium text-sm">Audience</h4>
						<MultiSelect value={typeIds} onValueChange={setTypeIds}>
							<MultiSelectTrigger className="rounded-none">
								<MultiSelectValue placeholder="All ticket types" />
							</MultiSelectTrigger>
							<MultiSelectContent>
								{ticketTypes.map((t) => (
									<MultiSelectItem key={t.id} value={String(t.id)}>
										{t.name}
									</MultiSelectItem>
								))}
							</MultiSelectContent>
						</MultiSelect>
						<div className="flex items-start gap-2">
							<Checkbox
								id="include-pending"
								checked={includePending}
								onCheckedChange={(v) => setIncludePending(v === true)}
							/>
							<Label
								htmlFor="include-pending"
								className="font-normal text-xs leading-snug"
							>
								Also send to pending tickets (not yet paid)
							</Label>
						</div>
						<div className="flex items-center gap-2 border border-emerald-300 bg-emerald-50 p-3 text-emerald-900 text-xs">
							<Mail className="size-4 shrink-0" />
							<span>
								<span className="font-semibold">{recipientCount}</span>{" "}
								registered delegate{recipientCount === 1 ? "" : "s"} will
								receive this. One email per address; waitlisted tickets are
								skipped.
							</span>
						</div>
					</div>

					<div className="space-y-1 border p-4">
						<h4 className="font-medium text-sm">Sent from</h4>
						<p className="text-sm">{audience?.sender_name ?? "…"}</p>
						<p className="break-all text-muted-foreground text-xs">
							{audience?.sender_address}
						</p>
						<p className="pt-1 text-muted-foreground text-xs">
							Uses the sender in this event's email settings.
						</p>
					</div>

					<div className="flex flex-col gap-2">
						<Button
							variant="outline"
							className="w-full rounded-none"
							disabled={!ready || busy}
							onClick={() => testMutation.mutate()}
						>
							{testMutation.isPending && (
								<Loader2 className="size-4 animate-spin" />
							)}
							Send test to me
						</Button>
						<Button
							variant="outline"
							className="w-full rounded-none"
							disabled={!ready || busy}
							onClick={() => setSaveOpen(true)}
						>
							<Bookmark className="size-4" />
							Save as template
						</Button>
						<Button
							className="w-full rounded-none"
							disabled={!ready || busy || recipientCount === 0}
							onClick={handleSend}
						>
							{sendMutation.isPending ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Send className="size-4" />
							)}
							Send to {recipientCount} delegate{recipientCount === 1 ? "" : "s"}
						</Button>
					</div>
				</aside>

				<Dialog open={saveOpen} onOpenChange={setSaveOpen}>
					<DialogContent className="rounded-none">
						<DialogHeader>
							<DialogTitle>Save as template</DialogTitle>
						</DialogHeader>
						<div className="space-y-2">
							<Label htmlFor="template-name">Template name</Label>
							<Input
								id="template-name"
								className="rounded-none"
								placeholder="e.g. Speaker announcement"
								value={templateName}
								maxLength={100}
								onChange={(e) => setTemplateName(e.target.value)}
							/>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								className="rounded-none"
								onClick={() => setSaveOpen(false)}
							>
								Cancel
							</Button>
							<Button
								className="rounded-none"
								disabled={!templateName.trim() || templateMutation.isPending}
								onClick={() => templateMutation.mutate()}
							>
								{templateMutation.isPending && (
									<Loader2 className="size-4 animate-spin" />
								)}
								Save template
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
