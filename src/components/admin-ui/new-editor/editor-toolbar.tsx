"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Highlighter,
  Image as ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTodo,
  Megaphone,
  MoreHorizontal,
  Quote,
  Redo,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";
import { useRichTextEditorContext } from "./context";
import { LinkForm } from "./form-modals/link-form";
import { ToolbarLeftSlot, ToolbarRightSlot } from "./toolbar-slots";
import { handleImageUpload } from "./use-rich-editor";

interface EditorToolbarProps {
  editor: Editor | null;
  uploadTarget?: string;
  className?: string;
  children?: React.ReactNode;
}

const ToolbarButton = ({
  onClick,
  isActive,
  children,
  tooltip,
  disabled = false,
  className = "",
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  tooltip: string;
  disabled?: boolean;
  className?: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant={isActive ? "secondary" : "ghost"}
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className={cn("h-8 w-8 rounded-none p-0", className)}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent
      side="bottom"
      className="rounded-none px-2 py-1 text-[10px]"
    >
      {tooltip}
    </TooltipContent>
  </Tooltip>
);

export function EditorToolbar({
  editor,
  uploadTarget = "general",
  className,
  children,
}: EditorToolbarProps) {
  const { openDialog, closeDialog } = useDialog();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    disabledExtensions,
    disabledGroups,
    hasOutline,
    outlineVisible,
    toggleOutline,
  } = useRichTextEditorContext();

  const [visibleGroupCount, setVisibleGroupCount] = useState(100);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = measureRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    let frameId: number;

    const performMeasurement = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const children = Array.from(container.children) as HTMLElement[];
        let count = 0;
        if (children.length > 0) {
          const top = children[0].offsetTop;
          for (let i = 0; i < children.length; i++) {
            if (children[i].offsetTop > top + 5) {
              break;
            }
            count++;
          }
        }
        setVisibleGroupCount(count);
      });
    };

    const debouncedCheckLayout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(performMeasurement, 100);
    };

    // Initial check and re-check when dependencies change.
    // These dependencies are referenced here to satisfy the linter and ensure
    // that we re-measure the layout whenever the items in the toolbar change.
    if (
      hasOutline !== undefined ||
      disabledExtensions.length >= 0 ||
      disabledGroups.length >= 0
    ) {
      performMeasurement();
    }

    const observer = new ResizeObserver(debouncedCheckLayout);
    observer.observe(container);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [hasOutline, disabledExtensions, disabledGroups]);

  if (!editor) return null;

  const isExtensionDisabled = (extensionName: string) =>
    disabledExtensions.includes(extensionName);
  const isGroupDisabled = (groupName: string) =>
    disabledGroups.includes(groupName);

  const _getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    return "Paragraph";
  };

  const setLink = () => {
    const { href, target } = editor.getAttributes("link");
    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(
      selection.from,
      selection.to,
      " ",
    );

    openDialog({
      component: LinkForm,
      props: {
        initialData: {
          url: href || "",
          label: selectedText || "",
          openInNewTab: target === "_blank",
        },
        onSubmit: (data) => {
          if (data.url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
          } else {
            const chain = editor.chain().focus().extendMarkRange("link");

            if (data.label && data.label !== selectedText) {
              chain.insertContent({
                type: "text",
                text: data.label,
                marks: [
                  {
                    type: "link",
                    attrs: {
                      href: data.url,
                      target: data.openInNewTab ? "_blank" : null,
                    },
                  },
                ],
              });
            } else {
              chain.setLink({
                href: data.url,
                target: data.openInNewTab ? "_blank" : null,
              });
            }

            chain.run();
          }
          closeDialog();
        },
        onCancel: closeDialog,
      },
      config: {
        title: "Manage Link",
        size: "lg",
      },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const pos = editor.state.selection.from;
      handleImageUpload(editor.view, file, pos, uploadTarget);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const groups = [
    {
      id: "navigation",
      items: [
        {
          tooltip: "Undo",
          icon: Undo,
          onClick: () => editor.chain().focus().undo().run(),
          disabled: !editor.can().undo(),
        },
        {
          tooltip: "Redo",
          icon: Redo,
          onClick: () => editor.chain().focus().redo().run(),
          disabled: !editor.can().redo(),
        },
        ...(hasOutline
          ? [
              {
                tooltip: "Table of Contents",
                icon: List,
                onClick: toggleOutline,
                isActive: outlineVisible,
              },
            ]
          : []),
      ],
    },
    {
      id: "style-font",
      items: [
        {
          tooltip: "Bold",
          icon: Bold,
          onClick: () => editor.chain().focus().toggleBold().run(),
          isActive: editor.isActive("bold"),
        },
        {
          tooltip: "Italic",
          icon: Italic,
          onClick: () => editor.chain().focus().toggleItalic().run(),
          isActive: editor.isActive("italic"),
        },
        {
          tooltip: "Underline",
          icon: UnderlineIcon,
          onClick: () => editor.chain().focus().toggleUnderline().run(),
          isActive: editor.isActive("underline"),
        },
        {
          tooltip: "Strikethrough",
          icon: Strikethrough,
          onClick: () => editor.chain().focus().toggleStrike().run(),
          isActive: editor.isActive("strike"),
        },
      ],
    },
    {
      id: "highlight",
      colors: [
        { name: "Default", color: "transparent", label: "None" },
        { name: "#ffecad", color: "#ffecad", label: "Yellow" },
        { name: "#ffd5d2", color: "#ffd5d2", label: "Red" },
        { name: "#d3f5d3", color: "#d3f5d3", label: "Green" },
        { name: "#d3e5ef", color: "#d3e5ef", label: "Blue" },
        { name: "#e9d5f0", color: "#e9d5f0", label: "Purple" },
        { name: "#fbe4e4", color: "#fbe4e4", label: "Pink" },
        { name: "#f1f1ef", color: "#f1f1ef", label: "Gray" },
      ],
    },
    {
      id: "style-align",
      items: [
        {
          tooltip: "Align Left",
          icon: AlignLeft,
          onClick: () => editor.chain().focus().setTextAlign("left").run(),
          isActive: editor.isActive({ textAlign: "left" }),
        },
        {
          tooltip: "Align Center",
          icon: AlignCenter,
          onClick: () => editor.chain().focus().setTextAlign("center").run(),
          isActive: editor.isActive({ textAlign: "center" }),
        },
        {
          tooltip: "Align Right",
          icon: AlignRight,
          onClick: () => editor.chain().focus().setTextAlign("right").run(),
          isActive: editor.isActive({ textAlign: "right" }),
        },
        {
          tooltip: "Align Justify",
          icon: AlignJustify,
          onClick: () => editor.chain().focus().setTextAlign("justify").run(),
          isActive: editor.isActive({ textAlign: "justify" }),
        },
      ],
    },
    {
      id: "style-indent",
      items: [
        {
          tooltip: "Decrease Indent",
          icon: IndentDecrease,
          onClick: () => editor.chain().focus().outdent().run(),
        },
        {
          tooltip: "Increase Indent",
          icon: IndentIncrease,
          onClick: () => editor.chain().focus().indent().run(),
        },
      ],
    },
    {
      id: "list",
      items: [
        {
          tooltip: "Bullet List",
          icon: List,
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          isActive: editor.isActive("bulletList"),
        },
        {
          tooltip: "Numbered List",
          icon: ListOrdered,
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: editor.isActive("orderedList"),
        },
        {
          tooltip: "Checklist",
          icon: ListTodo,
          onClick: () => editor.chain().focus().toggleTaskList().run(),
          isActive: editor.isActive("taskList"),
        },
      ],
    },
    {
      id: "element",
      items: [
        ...(!isExtensionDisabled("cta-block")
          ? [
              {
                tooltip: "Insert CTA Block",
                icon: Megaphone,
                onClick: () =>
                  editor
                    .chain()
                    .focus()
                    .insertContent({ type: "ctaBlock" })
                    .run(),
                isActive: editor.isActive("ctaBlock"),
              },
            ]
          : []),
        {
          tooltip: "Insert Link",
          icon: LinkIcon,
          onClick: setLink,
          isActive: editor.isActive("link"),
        },
        {
          tooltip: "Upload Image",
          icon: ImageIcon,
          onClick: () => fileInputRef.current?.click(),
        },
        {
          tooltip: "Blockquote",
          icon: Quote,
          onClick: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: editor.isActive("blockquote"),
        },
        {
          tooltip: "Code Block",
          icon: Code2,
          onClick: () => editor.chain().focus().toggleCodeBlock().run(),
          isActive: editor.isActive("codeBlock"),
        },
      ],
    },
  ];

  const renderGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return null;

    if (group.id === "highlight") {
      return (
        <DropdownMenu key={group.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={editor.isActive("highlight") ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 rounded-none p-0"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="rounded-none px-2 py-1 text-[10px]"
            >
              Highlight Color
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            align="start"
            className="grid min-w-0 grid-cols-4 gap-1 rounded-none p-2"
          >
            {group.colors?.map((c) => (
              <DropdownMenuItem
                key={c.name}
                onClick={() => {
                  if (c.color === "transparent") {
                    editor.chain().focus().unsetHighlight().run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .setHighlight({ color: c.color })
                      .run();
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-none border p-0 transition-transform hover:scale-110"
                style={{ backgroundColor: c.color }}
                title={c.label}
              >
                {c.color === "transparent" && (
                  <div className="h-4 w-0.5 rotate-45 bg-red-500" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div key={group.id} className="flex items-center gap-0.5">
        {group.items?.map((item) => (
          <ToolbarButton key={item.tooltip} {...item}>
            <item.icon className="h-4 w-4" />
          </ToolbarButton>
        ))}
      </div>
    );
  };

  const _renderTableActions = () => (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-none p-0"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="rounded-none px-2 py-1 text-[10px]"
        >
          Table Actions
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="rounded-none">
        <DropdownMenuItem
          className="rounded-none"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          Insert Table
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-none"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
        >
          Add Column Before
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-none"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        >
          Add Column After
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-none"
          onClick={() => editor.chain().focus().deleteColumn().run()}
        >
          Delete Column
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-none"
          onClick={() => editor.chain().focus().addRowBefore().run()}
        >
          Add Row Before
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-none"
          onClick={() => editor.chain().focus().addRowAfter().run()}
        >
          Add Row After
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-none"
          onClick={() => editor.chain().focus().deleteRow().run()}
        >
          Delete Row
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-none"
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          Delete Table
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const childrenArray = children
    ? Array.isArray(children)
      ? children
      : [children]
    : [];
  const leftSlot = childrenArray.find(
    (child: React.ReactElement) => child?.type === ToolbarLeftSlot,
  );
  const rightSlot = childrenArray.find(
    (child: React.ReactElement) => child?.type === ToolbarRightSlot,
  );

  const leftSlotContent = leftSlot?.props?.children;
  const rightSlotContent = rightSlot?.props?.children;

  const visibleGroups = groups
    .filter((g) => !isGroupDisabled(g.id))
    .slice(0, visibleGroupCount);
  const overflowGroups = groups
    .filter((g) => !isGroupDisabled(g.id))
    .slice(visibleGroupCount);

  return (
    <TooltipProvider delayDuration={400}>
      <div
        className={cn(
          "sticky top-0 z-10 flex min-h-12 flex-col border-b bg-background px-2 py-2 transition-all",
          className,
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />

        <div className="flex w-full items-start gap-2">
          {/* Left Slot */}
          {leftSlotContent && (
            <div className="flex shrink-0 items-center">{leftSlotContent}</div>
          )}

          {/* Middle Toolbar Groups - Collapsible */}
          <div className="relative min-w-0 flex-1">
            {/* Hidden Measurement Container */}
            <div
              ref={measureRef}
              className="pointer-events-none absolute top-0 left-0 -z-50 flex w-full flex-wrap items-center gap-1 opacity-0"
              aria-hidden="true"
            >
              {groups.map((group) => {
                if (isGroupDisabled(group.id)) return null;
                const rendered = renderGroup(group.id);
                return (
                  <div key={group.id} className="flex items-center">
                    {group.id !== "navigation" && (
                      <Separator orientation="vertical" className="mx-1 h-6" />
                    )}
                    {rendered}
                  </div>
                );
              })}
            </div>

            {/* Visible Toolbar */}
            <div className="flex h-9 items-center gap-1 overflow-hidden">
              {visibleGroups.map((group, index) => {
                const rendered = renderGroup(group.id);
                return (
                  <div key={group.id} className="flex items-center">
                    {group.id !== "navigation" &&
                      (index > 0 || visibleGroups[0].id !== "navigation") && (
                        <Separator
                          orientation="vertical"
                          className="mx-1 h-6"
                        />
                      )}
                    {rendered}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Controls - Toggle + Right Slot */}
          <div className="flex shrink-0 items-start gap-1">
            {overflowGroups.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-6 p-0 text-muted-foreground hover:text-foreground"
                    title="More tools"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-70 p-2"
                  sideOffset={5}
                >
                  <div className="flex flex-wrap items-center gap-1">
                    {overflowGroups.map((group) => (
                      <div key={group.id} className="flex items-center">
                        {group.id !== "navigation" && (
                          <Separator
                            orientation="vertical"
                            className="mx-1 h-6"
                          />
                        )}
                        {renderGroup(group.id)}
                      </div>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {rightSlotContent && (
              <div className="flex items-center">{rightSlotContent}</div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
