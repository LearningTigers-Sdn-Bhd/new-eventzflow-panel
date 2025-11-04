# Import Components

## Overview

The import functionality provides several React components for different use cases. All components are located in `src/components/pages/import/`.

## Components

### ImportFullForm

**Location:** `src/components/pages/import/import-full-form.tsx`

Full-featured import form with all options. Suitable for dedicated import pages or when you need full control over import settings.

**Props:**

```typescript
type ImportFullFormProps = {
  importType?: ImportType; // Default: "tickets"
  dryRun?: boolean; // Default: false
  onResult?: (data: ImportTicketsResponse) => void;
};
```

**Usage:**

```typescript
import { ImportFullForm } from "@/components/pages/import/import-full-form";

<ImportFullForm
  importType="tickets"
  dryRun={false}
  onResult={(data) => {
    console.log("Import completed:", data);
    console.log(`Created: ${data.created.count}`);
    console.log(`Skipped: ${data.skipped.count}`);
  }}
/>
```

**Features:**
- Full import mode enabled by default
- File upload with validation
- Progress indicators
- Error handling
- Success/error callbacks

### ImportQuickForm

**Location:** `src/components/pages/import/import-quick-form.tsx`

Simplified import form for quick imports. Suitable for dialogs or when you need a lightweight import interface.

**Props:**

```typescript
type ImportQuickFormProps = {
  importType?: ImportType; // Default: "tickets"
  dryRun?: boolean; // Default: false
  onResult?: (data: ImportTicketsResponse) => void;
};
```

**Usage:**

```typescript
import { ImportQuickForm } from "@/components/pages/import/import-quick-form";

<ImportQuickForm
  importType="tickets"
  dryRun={false}
  onResult={(data) => {
    console.log("Import completed:", data);
  }}
/>
```

**Features:**
- Quick mode (fast, basic validation)
- Dialog-friendly design
- Minimal UI
- Automatic dialog closing on success

### ImportQuickButton

**Location:** `src/components/pages/import/import-quick-form.tsx`

Button component that opens an import dialog. Perfect for adding import functionality to existing pages with a single button.

**Props:**

```typescript
type ImportQuickButtonProps = {
  importType?: ImportType; // Default: "tickets"
};
```

**Usage:**

```typescript
import { ImportQuickButton } from "@/components/pages/import/import-quick-form";

export function TicketsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Tickets</h1>
        <ImportQuickButton importType="tickets" />
      </div>
      {/* Ticket list */}
    </div>
  );
}
```

**Features:**
- Opens import dialog automatically
- Pre-configured with quick mode
- Minimal setup required
- Responsive design

## Component Comparison

| Feature | ImportFullForm | ImportQuickForm | ImportQuickButton |
|---------|---------------|----------------|-------------------|
| Full Mode | ✅ Enabled | ❌ Disabled | ❌ Disabled |
| Dialog Support | ❌ No | ✅ Yes | ✅ Yes |
| Customization | ✅ High | ⚠️ Medium | ⚠️ Low |
| Best For | Dedicated pages | Dialogs | Quick actions |

## File Upload Component

All import forms use the `TableUpload` component for file selection:

```typescript
<TableUpload
  key={`${importType}-${resetKey}`}
  maxFiles={1}
  maxSize={10 * 1024 * 1024} // 10MB
  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
  multiple={false}
  simulateUpload={false}
  onFilesChange={handleFilesChange}
  className="w-full"
/>
```

**Props:**
- `maxFiles`: Maximum number of files (always 1 for imports)
- `maxSize`: Maximum file size in bytes (10MB default)
- `accept`: Accepted file types and MIME types
- `multiple`: Whether multiple files are allowed (always false)
- `onFilesChange`: Callback when files change

## Integration with Hooks

All components use the `useImportForm` hook internally:

```typescript
const {
  selectedFiles,
  resetKey,
  importMutation,
  handleFilesChange,
  handleSubmit,
  getImportButtonLabel,
} = useImportForm({
  importType,
  dryRun,
  full: true, // or false for quick mode
  onResult,
});
```

See [Hooks documentation](./hooks.md) for more details.

## Styling

All components use Tailwind CSS classes and follow the application's design system:

- **Buttons**: `rounded-none` for consistent styling
- **Forms**: `space-y-4` or `space-y-8` for spacing
- **Layout**: Responsive design with proper padding

## Related

- [API Integration](./api-integration.md) - API details used by components
- [Hooks](./hooks.md) - Underlying hook implementation
- [Usage Examples](./usage-examples.md) - Complete examples
