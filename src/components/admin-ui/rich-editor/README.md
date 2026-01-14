# Rich Editor Component

A powerful, accessible, and customizable rich text editor built on top of [Lexical](https://lexical.dev/), designed for the Admin UI.

## Features

- **Strict Separation of Concerns**: 
  - `RichEditor`: Dedicated component for **editing**.
  - `RichDisplay`: Dedicated component for **viewing** (read-only).
- **Markdown Support**: Full markdown shortcut support (headings, lists, quotes, code blocks).
- **Floating Toolbars**: Context-aware floating menus for text formatting and link editing.
- **Slash Commands**: Quick access to block types via `/` command.
- **Auto-layout**: Responsive layout with optional Table of Contents (Outline).
- **Custom Blocks**: Includes Call-to-Action (CTA) blocks and Image support with drag-and-drop.

## Usage

### 1. Editing Content (`RichEditor`)

Use the `RichEditor` component when you need a full editing interface. It handles state synchronization, toolbars, and plugins automatically.

```tsx
import { useState } from "react";
import { RichEditor } from "@/components/admin-ui/rich-editor/rich-editor";
import { RichEditorToolbar } from "@/components/admin-ui/rich-editor/rich-editor-toolbar";
import { RichEditorContentArea } from "@/components/admin-ui/rich-editor/rich-editor-content-area";
import { RichEditorOutline } from "@/components/admin-ui/rich-editor/rich-editor-outline";
import { RichEditorFooter } from "@/components/admin-ui/rich-editor/rich-editor-footer";
import { WordCount } from "@/components/admin-ui/rich-editor/plugins/word-count";
import { Button } from "@/components/ui/button";
import { ToolbarRightSlot } from "@/components/admin-ui/rich-editor/toolbar-slots";

export default function MyEditorPage() {
  const [content, setContent] = useState("<p>Initial content...</p>");

  const handleSave = () => {
    console.log("Saved content:", content);
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <RichEditor
        value={content}
        onChange={setContent}
        className="flex-1"
      >
        {/* Toolbar with custom slots */}
        <RichEditorToolbar>
          <ToolbarRightSlot>
            <Button size="sm" onClick={handleSave}>Save</Button>
          </ToolbarRightSlot>
        </RichEditorToolbar>

        {/* Outline (Table of Contents) - Optional */}
        <RichEditorOutline side="left" style="block" />

        {/* Main Content Area */}
        <RichEditorContentArea placeholder="Start writing your masterpiece..." />

        {/* Footer with plugins */}
        <RichEditorFooter>
          <WordCount />
        </RichEditorFooter>
      </RichEditor>
    </div>
  );
}
```

#### Props (`RichEditor`)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | **Required** | The HTML content string. |
| `onChange` | `(value: string) => void` | **Required** | Callback fired when content changes. |
| `placeholder` | `string` | `"Start writing..."` | Placeholder text when empty. |
| `minHeight` | `string` | `"200px"` | Minimum height of the editor area. |
| `className` | `string` | `undefined` | Additional classes for the container. |

---

### 2. Viewing Content (`RichDisplay`)

Use the `RichDisplay` component for rendering content in a read-only mode. It mimics the editor's layout and styling but is optimized for consumption. It includes a built-in Table of Contents that highlights the active section while scrolling.

```tsx
import { RichDisplay } from "@/components/admin-ui/rich-editor/display/display";
import { RichDisplayContent } from "@/components/admin-ui/rich-editor/display/display-content";
import { RichDisplayOutline } from "@/components/admin-ui/rich-editor/display/display-outline";

export default function MyPostPage({ post }) {
  return (
    <div className="h-full w-full">
      <RichDisplay
        content={post.article}
        className="h-full w-full border-none shadow-none"
      >
        {/* Navigation Outline */}
        <RichDisplayOutline side="left" style="block" />

        {/* Content Area */}
        <RichDisplayContent>
          {/* You can inject arbitrary React components (like headers) here */}
          <h1>{post.title}</h1>
          <p className="text-muted-foreground">{post.description}</p>
        </RichDisplayContent>
      </RichDisplay>
    </div>
  );
}
```

#### Props (`RichDisplay`)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `content` | `string` | **Required** | The HTML content string to render. |
| `className` | `string` | `undefined` | Additional classes for the container. |

### Component Composition

Both `RichEditor` and `RichDisplay` use a composition pattern. You must include the specific sub-components (`Toolbar`, `Outline`, `ContentArea`, `Footer`) as children to render those parts of the UI. This allows for flexible layouts.

#### Toolbar Slots

The `RichEditorToolbar` supports a slot-based system to allow you to inject custom buttons (like "Save", "Back", or "Delete") without modifying the core toolbar component.

- `ToolbarLeftSlot`: Items placed here will appear at the start of the toolbar (before formatting tools).
- `ToolbarRightSlot`: Items placed here will appear at the end of the toolbar (after formatting tools).

### Content Area Slots

Both `RichEditorContentArea` and `RichDisplayContent` accept React children. These children are rendered **above** the rich text content. This is useful for including page headers, meta-data, or featured images that are part of the page layout but separate from the editable body text.

If children are provided, a visual separator is automatically added between your custom components and the rich text content.

Example:
```tsx
<RichEditorContentArea>
  {/* This header will scroll with the content but is not part of the rich text body */}
  <PostHeader resource={post} />
</RichEditorContentArea>
```

### Layout Options (`Outline`)

The `RichEditorOutline` and `RichDisplayOutline` components accept formatting props:

- `style`: `"block"` (sidebar style) or `"inset"` (floating/overlay style).
- `side`: `"left"` or `"right"` (position of the outline).

Example:
```tsx
<RichEditorOutline style="inset" side="right" />
```

## Architecture

- **Engine**: Lexical
- **Styling**: Tailwind CSS + Shadcn UI
- **Icons**: Lucide React
- **HTML Parsing**: Native DOMParser (for Display)

## Key Directories

- `nodes/`: Custom Lexical nodes (Image, CTA Block).
- `plugins/`: Lexical plugins (Toolbar logic, Slash commands, Markdown transformers).
- `themes/`: Editor theme configuration (mapping CSS classes to node types).
- `display/`: Read-only viewer implementation (decoupled from Lexical core).
