# Table Migration & Implementation Plan

This guide outlines the standard pattern for implementing data tables in the application. Use this guide when creating new table pages or migrating existing ones to the `admin-ui` system.

## ⚠️ Critical Warning

**DO NOT MODIFY components in `src/components/admin-ui/**`.**

These are shared core components used across the entire application. Modifying them will break other pages.
- If you need custom behavior, wrap these components or create a feature-specific version in your feature directory.
- If a core change is absolutely necessary, it must be discussed and tested against all existing tables.

## 1. Directory Structure

Organize your feature components under `src/components/pages/{feature-name}/`:

```
src/components/pages/{feature}/
├── {feature}-table.tsx           # Main table wrapper (DataTable)
├── {feature}-table-columns.tsx   # Column definitions
├── {feature}-table-control.tsx   # Search & filter controls
├── {feature}-item.tsx            # Card view for Mobile/Tablet
├── {feature}-action-menu.tsx     # Row actions (Edit, Delete, etc.)
└── create-{feature}-form.tsx     # Create/Edit form
```

## 2. Page Implementation (`page.tsx`)

The page component acts as the controller. It handles data fetching, state, and layout. There are two distinct patterns depending on the route location.

### 2.1 Standard Pages (e.g., `/event`, `/dashboard`, `/users`)

Used for top-level pages. These pages render their own header using `IconTitle`.

**Reference:** `src/app/(auth)/event/page.tsx`

```tsx
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { LoadingState, ErrorState } from "@/components/data-state";
// ... imports

export default function FeaturePage() {
  const { data, isLoading, error } = useQuery({ ... });

  return (
    <div className="p-0">
      <div className="page-header">
         <IconTitle icon={Icon} title="..." description="..." />
         <Button>Create</Button>
      </div>
      
      {isLoading ? <LoadingState /> : error ? <ErrorState /> : (
        <FeatureTable data={data} columns={columns} />
      )}
    </div>
  );
}
```

### 2.2 Event Sub-pages (`/event/[event_id]/{feature}`)

Used for pages nested under a specific event. These pages **MUST** use the `useSetEventActions` hook to inject action buttons into the shared `EventDetailLayout`. They **DO NOT** render their own title/header.

**Reference:** `src/app/(auth)/event/[event_id]/location/page.tsx`

```tsx
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoadingState, ErrorState } from "@/components/data-state";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { FeaturePageButton } from "@/components/pages/feature/page-action/button";
// ... imports

export default function EventFeaturePage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

    // Inject action button (Create/Add) into the layout header
    // Can be conditional based on permissions
	useSetEventActions(<FeaturePageButton />);

	const { data, isLoading, error } = useQuery({ ... });

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState ... />
			) : error ? (
				<ErrorState ... />
			) : (
				<FeatureTable columns={columns} data={data || []} />
			)}
		</div>
	);
}
```

## 3. Table Component (`{feature}-table.tsx`)

This component wraps the TanStack Table logic and handles responsive rendering.

**Key Components to Use:**
- `BaseTable` (`@/components/admin-ui/table/base-table`) for Desktop view
- `ResponsiveLayout`, `DesktopView`, `MobileView`, `TabletView` (`@/components/admin-ui/layout/responsive-layout`)
- `DataPagination` (`@/components/data-pagination`)

**Pattern:**
1. Initialize `useReactTable` hook
2. Use `DataControl` for filters
3. Use `ResponsiveLayout` to switch between `BaseTable` (Desktop) and `{Feature}Item` (Mobile/Tablet)

**Reference:** `src/components/pages/event/event-table.tsx`

## 4. Column Definitions (`{feature}-table-columns.tsx`)

Define your columns using standard `admin-ui` headers and cells for consistency.

**Key Components to Use:**
- `SortableHeader` (`@/components/admin-ui/table/header/sortable-header`)
- `FilterableHeader` (`@/components/admin-ui/table/header/filterable-header`)
- `CopyCell` (`@/components/admin-ui/table/cell/copy-cell`)
- `Badge` (`@/components/ui/badge`) for status columns

**Reference:** `src/components/pages/event/event-table-columns.tsx`

## 5. Responsive Views (`{feature}-item.tsx`)

Create a card-based component for displaying a single row's data on mobile and tablet screens.

- Should display key information clearly.
- Should include the same actions (Action Menu) as the desktop row.
- Used inside `MobileView` and `TabletView` in the main table component.

**Reference:** `src/components/pages/event/event-item.tsx`

## 5.1 Action Menus & Confirmations (`{feature}-action-menu.tsx`)

Row-level actions (Edit, Delete, Archive) should be grouped in an Action Menu component. For destructive or sensitive actions, always use the `useConfirmDialog` hook.

**Key Hook:**
- `useConfirmDialog` (`@/hooks/use-confirm-dialog`)

**Pattern:**
```tsx
const { openConfirm } = useConfirmDialog();

const handleDelete = () => {
  openConfirm({
    title: "Delete Item",
    message: "Are you sure? This action cannot be undone.",
    type: "destructive",
    icon: "delete",
    onConfirm: () => mutation.mutate(id),
  });
};
```

**Common Configs:**
- **Delete**: `type: "destructive"`, `icon: "delete"`
- **Archive**: `type: "warning"`, `icon: "alert"`
- **Restore**: `type: "success"`, `icon: "check"`

## 6. Table Controls (`{feature}-table-control.tsx`)

Implements the control panel above the table, handling search, filtering, sorting, and column visibility. This utilizes the `BaseTableControl` component to ensure a consistent responsive UI.

**Key Component:**
- `BaseTableControl` (`@/components/admin-ui/table/control/base-table-control`)

**Configuration Objects:**

1.  **Search Config**: Controls the client-side fuzzy search behavior.
    ```typescript
    type SearchConfig = {
      placeholder: string;        // Text to show in input
      enableCustomSearch: boolean; // Usually false for standard client-side search
      columns?: string[];         // Data keys to search against (e.g., ["title", "email"])
    };
    ```

2.  **Control Config**: Defines buttons for Filters, Sorting, and Visibility.
    ```typescript
    type ControlConfig = {
      label: string;
      columnId: string;
      type: "sort" | "filter" | "visibility";
      data?: { label: string; value: string }[]; // Options for filters
      topPriority?: boolean; // Forces control to appear prominently on mobile
    };
    ```

**Implementation Pattern:**

You must define separate configurations for Desktop and Mobile to optimize screen space.

**Reference:** `src/components/pages/event/event-table-control.tsx`

```tsx
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

export function DataControl<TData>({ table }: DataControlProps<TData>) {
  
  // 1. Define Search Configuration
  const searchConfig = {
    placeholder: "Search items...",
    enableCustomSearch: false,
    columns: ["title", "id", "status"] // Columns to search
  };

  // 2. Define Desktop Controls (Usually Visibility + Filters)
  const desktopConfigs: ControlConfig[] = [
    {
      label: "Status",
      columnId: "status",
      type: "filter",
      data: [ { label: "Active", value: "active" }, ... ]
    },
    {
      label: "Columns",
      columnId: "visibility",
      type: "visibility"
    }
  ];

  // 3. Define Mobile Controls (Sort options usually move here)
  const mobileConfigs: ControlConfig[] = [
    {
      label: "Title",
      columnId: "title",
      type: "sort"
    },
    {
        label: "Status",
        columnId: "status",
        type: "filter",
        data: ...
    }
  ];

  return (
    <BaseTableControl
      table={table}
      searchConfig={{ searchConfig }}
      desktopConfig={{ controlConfigs: desktopConfigs }}
      mobileConfig={{ controlConfigs: mobileConfigs }}
    />
  );
}
```

## Summary of `admin-ui` Components

| Component | Path | Usage |
|-----------|------|-------|
| `BaseTable` | `@/components/admin-ui/table/base-table` | Core desktop table renderer |
| `BaseTableControl` | `@/components/admin-ui/table/control/base-table-control` | Search, filters, and visibility panel |
| `SortableHeader` | `@/components/admin-ui/table/header/sortable-header` | Column header with sorting |
| `FilterableHeader` | `@/components/admin-ui/table/header/filterable-header` | Column header with dropdown filter |
| `CopyCell` | `@/components/admin-ui/table/cell/copy-cell` | Cell that copies value on click |
| `ResponsiveLayout` | `@/components/admin-ui/layout/responsive-layout` | Manages desktop/tablet/mobile switching |
| `IconTitle` | `@/components/admin-ui/icon-heading` | Standard page header title |
| `useConfirmDialog` | `@/hooks/use-confirm-dialog` | Hook for standardized confirmation dialogs |

## 7. Prompt Section

Use these prompts to guide the AI when refactoring or creating pages.

### Case 1: Event Sub-pages (`event/{id}/{feature-name}/page.tsx`)

For pages nested under a specific event ID. These must use `useSetEventActions` for the header actions.

**Reference Page:** `src/app/(auth)/event/[event_id]/location/page.tsx`

**Prompt:**
```txt
Refactor `src/app/(auth)/event/[event_id]/{feature}/page.tsx` and associated components.

1. **Page Structure**: Follow `src/app/(auth)/event/[event_id]/location/page.tsx`.
   - Use `useSetEventActions` hook to place the "Create/Add" button in the layout header.
   - Do NOT include `IconTitle` or page headers in the page component.
   - Use `LoadingState` and `ErrorState`.

2. **Table Components**: Refactor to follow the standard `admin-ui` pattern:
   - `{feature}-table.tsx` (Use `BaseTable`, `ResponsiveLayout`)
   - `{feature}-table-columns.tsx` (Use `SortableHeader`, `ActionMenu`)
   - `{feature}-table-control.tsx` (Use `BaseTableControl`)
   - `{feature}-item.tsx` (For mobile view)

Ensure the action column is sticky.
Rename files to match the pattern: `{feature}-table.tsx`, `{feature}-table-columns.tsx`, etc.
```

### Case 2: Standard Pages (Outside `event/{id}`)

For top-level pages like `/event`, `/dashboard`, etc.

**Reference Page:** `src/app/(auth)/event/page.tsx`

**Prompt:**
```txt
Refactor `src/app/(auth)/{feature}/page.tsx` and associated components.

1. **Page Structure**: Follow `src/app/(auth)/event/page.tsx`.
   - Use `IconTitle` for the page header.
   - Place "Create/Add" buttons directly in the page header section.

2. **Table Components**: Refactor to follow the standard `admin-ui` pattern:
   - `{feature}-table.tsx` (Use `BaseTable`, `ResponsiveLayout`)
   - `{feature}-table-columns.tsx` (Use `SortableHeader`, `ActionMenu`)
   - `{feature}-table-control.tsx` (Use `BaseTableControl`)
   - `{feature}-item.tsx` (For mobile view)

Ensure the action column is sticky.
```

---
**Note:** Always check `src/app/(auth)/event/page.tsx` or `src/app/(auth)/event/[event_id]/location/page.tsx` as the source of truth for the latest patterns.