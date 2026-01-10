"use client";

import type { Editor } from "@tiptap/react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { cn } from "@/lib/utils";
import { RichTextEditorProvider, useRichTextEditorContext } from "./context";
import { EditorContentArea } from "./editor-content";
import { EditorContentOutline } from "./editor-content-outline";
import { EditorFooter } from "./editor-footer";
import { EditorToolbar } from "./editor-toolbar";
import { ToolbarLeftSlot, ToolbarRightSlot } from "./toolbar-slots";
import { useRichEditor } from "./use-rich-editor";

export interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	editMode?: boolean;
	placeholder?: string;
	minHeight?: string;
	disabledExtensions?: string[];
	disabledGroups?: string[];
	className?: string;
	children?: ReactNode;
	editor?: Editor | null;
}

interface CollectedChildren {
	toolbar: ReactNode;
	outline: ReactNode;
	contentArea: ReactNode;
	footer: ReactNode;
	outlineConfig: { style: "block" | "inset"; side: "left" | "right" } | null;
}

function collectChildren(children: ReactNode): CollectedChildren {
	const childrenArray = children
		? Array.isArray(children)
			? children
			: [children]
		: [];

	let toolbar: ReactNode = null;
	let outline: ReactNode = null;
	let contentArea: ReactNode = null;
	let footer: ReactNode = null;
	let outlineConfig: CollectedChildren["outlineConfig"] = null;

	for (const child of childrenArray) {
		if (!child || typeof child === "string" || typeof child === "number")
			continue;

		const childElement = child as React.ReactElement;
		const childType = childElement.type;
		const childProps = childElement.props;

		// Check for EditorToolbar component
		if (childType === EditorToolbar) {
			toolbar = child;
			continue;
		}

		// Check for EditorContentOutline component
		if (childType === EditorContentOutline) {
			outline = child;
			outlineConfig = {
				style: (childProps as { style?: "block" | "inset" }).style || "block",
				side: (childProps as { side?: "left" | "right" }).side || "left",
			};
			continue;
		}

		// Check for EditorContentArea component
		if (childType === EditorContentArea) {
			contentArea = child;
			continue;
		}

		// Check for EditorFooter component
		if (childType === EditorFooter) {
			footer = child;
			continue;
		}

		// Fallback: check for div with slots (legacy support)
		if (
			childType === "div" &&
			childProps &&
			typeof childProps === "object" &&
			"children" in childProps &&
			Array.isArray(childProps.children)
		) {
			const hasLeftSlot = childProps.children.some(
				(c: ReactNode) => (c as React.ReactElement)?.type === ToolbarLeftSlot,
			);
			const hasRightSlot = childProps.children.some(
				(c: ReactNode) => (c as React.ReactElement)?.type === ToolbarRightSlot,
			);
			if (hasLeftSlot || hasRightSlot) {
				toolbar = child;
			}
		}
	}

	return { toolbar, outline, contentArea, footer, outlineConfig };
}

function RichTextEditorLayout({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const { outlineVisible, setHasOutline } = useRichTextEditorContext();
	const collected = useMemo(() => collectChildren(children), [children]);
	const { outlineConfig } = collected;

	useEffect(() => {
		setHasOutline(!!collected.outline);
	}, [collected.outline, setHasOutline]);

	const isBlockStyle = outlineConfig?.style === "block";
	const isLeftSide = outlineConfig?.side === "left";
	const isOutlineVisible = !!collected.outline && outlineVisible;

	const renderDesktopContent = () => {
		if (!collected.toolbar) {
			return (
				<div className="flex h-full flex-col">
					{collected.outline}
					{collected.contentArea}
					{collected.footer}
				</div>
			);
		}

		if (isBlockStyle) {
			const gridCols = isOutlineVisible
				? isLeftSide
					? "grid-cols-[240px_1fr]"
					: "grid-cols-[1fr_240px]"
				: "grid-cols-1";

			return (
				<>
					<div className={cn("grid w-full items-start", gridCols)}>
						{isLeftSide && isOutlineVisible && (
							<div className="sticky top-0 h-screen overflow-y-auto border-r">
								{collected.outline}
							</div>
						)}

						<div className="flex min-w-0 flex-col">
							{collected.toolbar}
							{collected.contentArea}
						</div>

						{!isLeftSide && isOutlineVisible && (
							<div className="sticky top-0 h-screen overflow-y-auto border-l">
								{collected.outline}
							</div>
						)}
					</div>
					{collected.footer}
				</>
			);
		}

		const gridCols = isOutlineVisible
			? isLeftSide
				? "grid-cols-[240px_1fr]"
				: "grid-cols-[1fr_240px]"
			: "grid-cols-1";

		return (
			<>
				{collected.toolbar}
				<div className={cn("grid w-full items-start", gridCols)}>
					{isLeftSide && isOutlineVisible && (
						<div className="sticky top-13 h-[calc(100vh-3.25rem)] overflow-y-auto border-r">
							{collected.outline}
						</div>
					)}

					<div className="min-w-0 flex-1">{collected.contentArea}</div>

					{!isLeftSide && isOutlineVisible && (
						<div className="sticky top-13 h-[calc(100vh-3.25rem)] overflow-y-auto border-l">
							{collected.outline}
						</div>
					)}
				</div>
				{collected.footer}
			</>
		);
	};

	const renderMobileContent = () => {
		return (
			<>
				<div className="sticky top-0 z-20 flex flex-col bg-background shadow-sm">
					<div className="z-10">{collected.toolbar}</div>
					{isOutlineVisible && (
						<div className="max-h-[30vh] shrink-0 overflow-y-auto border-b bg-muted/5">
							{collected.outline}
						</div>
					)}
				</div>
				<div className="flex-1">{collected.contentArea}</div>
				{collected.footer}
			</>
		);
	};

	return (
		<ResponsiveLayout
			className={cn("relative flex w-full flex-col border", className)}
		>
			<DesktopView className="flex w-full flex-col">
				{renderDesktopContent()}
			</DesktopView>
			<MobileTabletView className="flex w-full flex-col">
				{renderMobileContent()}
			</MobileTabletView>
		</ResponsiveLayout>
	);
}

// 1. New Component: Presentation Layer
function RichTextEditorPresentation({
	editor,
	editMode,
	setEditMode,
	disabledExtensions,
	disabledGroups,
	children,
	className,
}: {
	editor: Editor | null;
	editMode: boolean;
	setEditMode: (value: boolean) => void;
	disabledExtensions: string[];
	disabledGroups: string[];
	children: ReactNode;
	className?: string;
}) {
	const [outlineVisible, setOutlineVisible] = useState(true);

	useEffect(() => {
		if (editor && editor.isEditable !== editMode) {
			setTimeout(() => {
				if (!editor.isDestroyed) {
					editor.setEditable(editMode);
				}
			}, 0);
		}
	}, [editor, editMode]);

	// Note: We intentionally do NOT use useEffect to sync `value` -> `editor` here
	// because that logic belongs to the "Managed" wrapper or the parent component.
	// This component assumes the `editor` prop is the source of truth for the instance.

	const [, forceUpdate] = useState({});

	useEffect(() => {
		if (!editor) return;

		const handleUpdate = () => forceUpdate({});

		editor.on("transaction", handleUpdate);
		editor.on("selectionUpdate", handleUpdate);

		return () => {
			editor.off("transaction", handleUpdate);
			editor.off("selectionUpdate", handleUpdate);
		};
	}, [editor]);

	const handleOutlineVisibleChange = useCallback((visible: boolean) => {
		setOutlineVisible(visible);
	}, []);

	return (
		<RichTextEditorProvider
			editor={editor}
			editMode={editMode}
			setEditMode={setEditMode}
			disabledExtensions={disabledExtensions}
			disabledGroups={disabledGroups}
			outlineVisible={outlineVisible}
			onOutlineVisibleChange={handleOutlineVisibleChange}
		>
			<RichTextEditorLayout className={className}>
				{children}
			</RichTextEditorLayout>
		</RichTextEditorProvider>
	);
}

// 2. New Component: Managed Editor (Creates its own editor)
function RichTextEditorManaged({
	value,
	onChange,
	editMode = true,
	placeholder,
	minHeight = "200px",
	disabledExtensions = [],
	disabledGroups = [],
	className,
	children,
}: RichTextEditorProps) {
	// Stabilize arrays
	const lastExtensionsRef = useRef(disabledExtensions);
	if (disabledExtensions.join(",") !== lastExtensionsRef.current.join(",")) {
		lastExtensionsRef.current = disabledExtensions;
	}
	const stableDisabledExtensions = lastExtensionsRef.current;

	const lastGroupsRef = useRef(disabledGroups);
	if (disabledGroups.join(",") !== lastGroupsRef.current.join(",")) {
		lastGroupsRef.current = disabledGroups;
	}
	const stableDisabledGroups = lastGroupsRef.current;

	const editor = useRichEditor({
		value,
		onChange,
		placeholder,
		minHeight,
		editable: editMode,
		disabledExtensions: stableDisabledExtensions,
		disabledGroups: stableDisabledGroups,
	});

	const [localEditMode, setLocalEditMode] = useState(editMode);

	useEffect(() => {
		setLocalEditMode(editMode);
	}, [editMode]);

	const lastSyncedValueRef = useRef(value);

	// Sync value -> editor content (only if externally changed and not focused)
	useEffect(() => {
		if (!editor || value === lastSyncedValueRef.current) return;

		if (!editor.isFocused && value !== editor.getHTML()) {
			// Delay content update to avoid flushSync issues during React lifecycle
			setTimeout(() => {
				if (!editor.isDestroyed) {
					editor.commands.setContent(value, { emitUpdate: false });
				}
			}, 0);
		}

		lastSyncedValueRef.current = value;
	}, [value, editor]);

	return (
		<RichTextEditorPresentation
			editor={editor}
			editMode={localEditMode}
			setEditMode={setLocalEditMode}
			disabledExtensions={stableDisabledExtensions}
			disabledGroups={stableDisabledGroups}
			className={className}
		>
			{children}
		</RichTextEditorPresentation>
	);
}

// 3. New Component: Controlled Editor (Uses passed editor)
function RichTextEditorControlled({
	editor,
	editMode = true,
	disabledExtensions = [],
	disabledGroups = [],
	className,
	children,
}: RichTextEditorProps & { editor: Editor }) { // Ensure editor is present
	const [localEditMode, setLocalEditMode] = useState(editMode);

	useEffect(() => {
		setLocalEditMode(editMode);
	}, [editMode]);

	// In controlled mode, we assume the parent handles `useRichEditor` and its content syncing.
	// We just pass everything down.

	return (
		<RichTextEditorPresentation
			editor={editor}
			editMode={localEditMode}
			setEditMode={setLocalEditMode}
			disabledExtensions={disabledExtensions || []}
			disabledGroups={disabledGroups || []}
			className={className}
		>
			{children}
		</RichTextEditorPresentation>
	);
}

// 4. Main Component (Switch)
export function RichTextEditor(props: RichTextEditorProps) {
	if (props.editor) {
		return <RichTextEditorControlled {...props} editor={props.editor} />;
	}
	return <RichTextEditorManaged {...props} />;
}