# Import Hooks

## Overview

The import functionality uses custom React hooks to manage state, file handling, and React Query mutations.

## useImportForm

**Location:** `src/hooks/use-import-form.ts`

Custom hook that manages import form state, file handling, and React Query mutations. This is the core hook used by all import components.

### Options

```typescript
interface UseImportFormOptions {
  dryRun?: boolean; // Default: false
  importType?: ImportType; // Default: "tickets"
  full?: boolean; // Default: false
  onResult?: (data: ImportTicketsResponse) => void;
}
```

**Parameters:**
- `dryRun`: If `true`, validates file without writing to database
- `importType`: Type of import (currently only `"tickets"` is supported)
- `full`: If `true`, uses full import mode with enhanced validation
- `onResult`: Callback function called when import completes

### Returns

```typescript
{
  selectedFiles: FileWithPreview[];
  resetKey: number;
  importMutation: UseMutationResult<ImportTicketsResponse, Error, File>;
  handleFilesChange: (files: FileWithPreview[]) => void;
  handleSubmit: (e: React.FormEvent) => void;
  getImportButtonLabel: () => string;
  isOpen: boolean;
  closeDialog: () => void;
}
```

**Return Values:**
- `selectedFiles`: Array of selected files (typically one file)
- `resetKey`: Key for resetting file upload component
- `importMutation`: React Query mutation object with `isPending`, `mutate`, etc.
- `handleFilesChange`: Handler for file selection changes
- `handleSubmit`: Form submission handler
- `getImportButtonLabel`: Function to get button label text
- `isOpen`: Whether dialog is open (from `useDialog` hook)
- `closeDialog`: Function to close dialog

### Usage

```typescript
import { useImportForm } from "@/hooks/use-import-form";

function MyImportComponent() {
  const {
    selectedFiles,
    resetKey,
    importMutation,
    handleFilesChange,
    handleSubmit,
  } = useImportForm({
    dryRun: false,
    full: true,
    onResult: (data) => {
      console.log("Import result:", data);
      console.log(`Total: ${data.total}`);
      console.log(`Created: ${data.created.count}`);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <TableUpload
        key={`import-${resetKey}`}
        onFilesChange={handleFilesChange}
      />
      <button
        type="submit"
        disabled={selectedFiles.length === 0 || importMutation.isPending}
      >
        {importMutation.isPending ? "Importing..." : "Import"}
      </button>
    </form>
  );
}
```

## React Query Integration

### Mutation Configuration

The hook uses React Query's `useMutation` for async state management:

```typescript
const importMutation = useMutation({
  mutationFn: async (file: File) =>
    dryRun
      ? importTicketsDryRun(file, { full })
      : importTickets(file, { full }),
  onSuccess: (data) => {
    // Handle success
    const message = `Import completed: ${data.total} total processed...`;
    toast.success(message);

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ["event"] });

    // Call user callback
    onResult?.(data);

    // Reset form
    setSelectedFiles([]);
    setResetKey((prev) => prev + 1);

    // Close dialog if open
    if (isOpen) {
      setTimeout(() => closeDialog(), 1500);
    }
  },
  onError: (error: Error) => {
    toast.error(error.message || "Failed to import");
  },
});
```

### Cache Invalidation

After a successful import, the hook automatically invalidates event-related queries:

```typescript
queryClient.invalidateQueries({
  queryKey: ["event"],
});
```

This ensures that ticket lists and event data are refreshed after imports.

### Manual Query Invalidation

If you need to invalidate queries manually:

```typescript
import { useQueryClient } from "@tanstack/react-query";

function MyComponent() {
  const queryClient = useQueryClient();

  const handleImportSuccess = () => {
    // Invalidate specific queries
    queryClient.invalidateQueries({
      queryKey: ["event", eventId, "tickets"]
    });
  };

  // Component code...
}
```

## Mutation State

The `importMutation` object provides several useful properties:

```typescript
const {
  isPending,      // Whether import is in progress
  isError,        // Whether import failed
  isSuccess,      // Whether import succeeded
  error,          // Error object if failed
  data,           // Response data if succeeded
  mutate,         // Function to trigger import
  mutateAsync,    // Async function to trigger import
  reset,          // Reset mutation state
} = importMutation;
```

### Usage Examples

```typescript
// Check if import is in progress
if (importMutation.isPending) {
  return <LoadingSpinner />;
}

// Check if import failed
if (importMutation.isError) {
  return <ErrorMessage error={importMutation.error} />;
}

// Access import results
if (importMutation.isSuccess) {
  const { total, created, skipped } = importMutation.data;
  console.log(`Imported ${total} tickets`);
}
```

## Error Handling

The hook automatically handles errors using React Query's `onError` callback:

```typescript
onError: (error: Error) => {
  toast.error(error.message || "Failed to import");
}
```

You can also handle errors in your component:

```typescript
const { importMutation } = useImportForm({
  onResult: (data) => {
    if (data.errors.count > 0) {
      toast.warning("Import completed with errors", {
        description: data.errors.data.join(", "),
      });
    }
  },
});
```

## Dialog Integration

The hook integrates with the `useDialog` hook for dialog management:

```typescript
const { closeDialog, isOpen } = useDialog();
```

When an import succeeds, the dialog automatically closes after 1.5 seconds:

```typescript
if (isOpen) {
  setTimeout(() => closeDialog(), 1500);
}
```

## File Management

The hook manages file state using React state:

```typescript
const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
const [resetKey, setResetKey] = useState(0);
```

Files are reset after successful import:

```typescript
setSelectedFiles([]);
setResetKey((prev) => prev + 1);
```

## Related

- [API Integration](./api-integration.md) - API functions used by the hook
- [Components](./components.md) - Components that use this hook
- [Error Handling](./error-handling.md) - Error handling patterns
