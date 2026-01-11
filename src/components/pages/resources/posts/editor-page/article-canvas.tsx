"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RichDisplay } from "@/components/admin-ui/rich-editor/display/display";
import { RichDisplayContent } from "@/components/admin-ui/rich-editor/display/display-content";
import { RichDisplayOutline } from "@/components/admin-ui/rich-editor/display/display-outline";
import { WordCount } from "@/components/admin-ui/rich-editor/plugins/word-count";
import { RichEditor } from "@/components/admin-ui/rich-editor/rich-editor";
import { RichEditorContentArea } from "@/components/admin-ui/rich-editor/rich-editor-content-area";
import { RichEditorFooter } from "@/components/admin-ui/rich-editor/rich-editor-footer";
import { RichEditorOutline } from "@/components/admin-ui/rich-editor/rich-editor-outline";
import { RichEditorToolbar } from "@/components/admin-ui/rich-editor/rich-editor-toolbar";
import {
	ToolbarLeftSlot,
	ToolbarRightSlot,
} from "@/components/admin-ui/rich-editor/toolbar-slots";

import { PostHeader } from "@/components/pages/resources/posts/show-page/post-header";
import { Button } from "@/components/ui/button";
import { updateResource } from "@/lib/api/resource";
import type { Resource } from "@/lib/api/resource/response";
import { cn } from "@/lib/utils";

interface ArticleCanvasProps {
	initialPost?: Resource;
	isPreviewMode?: boolean;
}

export const ArticleCanvas = ({
	initialPost,
	isPreviewMode = false,
}: ArticleCanvasProps) => {
	const queryClient = useQueryClient();
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

	// We don't need useRichEditor hook anymore, RichEditor is controlled via value/onChange

	const handleSave = () => {
		if (!initialPost) return;

		updateMutation.mutate({
			id: initialPost.id,
			article: articleContent,
		});
	};

	const handleClear = () => {
		setArticleContent("<p>Start writing your resource post...</p>");
	};

	const isPublished = initialPost?.status === "published";

	return (
		<>
			{isPreviewMode && (
				<div className="flex h-full w-full flex-col gap-4">
					<RichDisplay
						content={articleContent}
						className="h-full w-full border-none shadow-none"
					>
						<RichDisplayOutline style="block" side="left" />
						<RichDisplayContent>
							{initialPost && (
								<div className="w-full px-4 md:px-8">
									<PostHeader resource={initialPost} />
								</div>
							)}
						</RichDisplayContent>
					</RichDisplay>
				</div>
			)}

			<div
				className={cn(
					"flex w-full flex-col gap-4 md:mt-0",
					isPreviewMode && "hidden",
				)}
			>
				<RichEditor
					value={articleContent}
					onChange={setArticleContent}
					className="w-full"
					minHeight="calc(100vh - 300px)"
				>
					<RichEditorToolbar>
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
					</RichEditorToolbar>

					<RichEditorOutline style="block" side="left" />

					<RichEditorContentArea className="w-full">
						{initialPost && <PostHeader resource={initialPost} />}
					</RichEditorContentArea>

					<RichEditorFooter>
						<WordCount />
					</RichEditorFooter>
				</RichEditor>
			</div>
		</>
	);
};
