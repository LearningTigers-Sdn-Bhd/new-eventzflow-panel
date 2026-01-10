"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	EditorContentArea,
	EditorContentOutline,
	EditorFooter,
	EditorToolbar,
	PublicContent,
	PublicContentArea,
	PublicContentOutline,
	RichTextEditor,
	ToolbarLeftSlot,
	ToolbarRightSlot,
	useRichEditor,
} from "@/components/admin-ui/new-editor";
import { PostHeader } from "@/components/pages/resources/posts/show-page/post-header";
import { Button } from "@/components/ui/button";
import { updateResource } from "@/lib/api/resource";
import type { Resource } from "@/lib/api/resource/response";
import { cn } from "@/lib/utils";
import { useResourceEditorStore } from "@/stores/resource-editor-store";

interface ArticleCanvasProps {
	initialPost?: Resource;
}

export const ArticleCanvas = ({ initialPost }: ArticleCanvasProps) => {
	const queryClient = useQueryClient();
	const isPreviewMode = useResourceEditorStore((state) => state.isPreviewMode);
	const [articleContent, setArticleContent] = useState(
		initialPost?.article || "<p>Start writing your resource post...</p>",
	);

	const updateMutation = useMutation({
		mutationFn: updateResource,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resources"] });
			if (initialPost?.slug) {
				queryClient.invalidateQueries({
					queryKey: ["resource", initialPost.slug],
				});
			}
			toast.success("Article saved successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to save article", {
				description: error.message,
			});
		},
	});

	const editor = useRichEditor({
		value: articleContent,
		onChange: setArticleContent,
		minHeight: "calc(100vh - 300px)",
	});

	const handleSave = () => {
		if (!initialPost || !editor) return;

		updateMutation.mutate({
			id: initialPost.id,
			article: editor.getHTML(),
		});
	};

	const handleClear = () => {
		if (!editor) return;

		editor.commands.setContent("<p>Start writing your resource post...</p>");
	};

	const isPublished = initialPost?.status === "published";

	return (
		<>
			{isPreviewMode && (
				<PublicContent
					value={articleContent}
					navVisible={true}
					className="flex h-full w-full flex-col gap-4"
				>
					<div className="flex w-full flex-row">
						<PublicContentOutline style="block" side="left" />
						<PublicContentArea className="w-full">
							{initialPost && (
								<div className="w-full px-4 md:px-8">
									<PostHeader resource={initialPost} />
								</div>
							)}
						</PublicContentArea>
					</div>
				</PublicContent>
			)}

			<div
				className={cn(
					"flex w-full flex-col gap-4 md:mt-0",
					isPreviewMode && "hidden",
				)}
			>
				<RichTextEditor
					editor={editor}
					value={articleContent}
					onChange={setArticleContent}
					editMode={!isPreviewMode && !isPublished}
					className="w-full"
				>
					<EditorToolbar editor={editor}>
						<ToolbarLeftSlot>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-8 rounded-none px-3 font-medium text-xs"
								onClick={() => window.history.back()}
							>
								Back
							</Button>
						</ToolbarLeftSlot>
						<ToolbarRightSlot>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-8 rounded-none px-3 font-medium text-muted-foreground text-xs hover:text-foreground"
								onClick={handleClear}
								disabled={isPublished}
							>
								<X className="mr-1 h-3 w-3" />
								Clear
							</Button>
							<Button
								type="button"
								variant="default"
								size="sm"
								className="h-8 rounded-none px-3 font-medium text-xs"
								onClick={handleSave}
								disabled={
									!initialPost || updateMutation.isPending || isPublished
								}
							>
								<Save className="mr-1 h-3 w-3" />
								Save Article
							</Button>
						</ToolbarRightSlot>
					</EditorToolbar>

					<EditorContentOutline editor={editor} style="inset" side="left" />

					<EditorContentArea editor={editor} className="w-full">
						{initialPost && <PostHeader resource={initialPost} />}
					</EditorContentArea>

					<EditorFooter>
						<span className="px-4 text-muted-foreground text-xs">
							{editor?.storage.characterCount?.words() || 0} words
						</span>
					</EditorFooter>
				</RichTextEditor>
			</div>
		</>
	);
};