# Error Handling & Troubleshooting

## Error Handling

### API Errors

The API client automatically handles errors and throws them as `Error` objects with descriptive messages.

```typescript
import { importTickets } from "@/lib/api/imports";

try {
  const result = await importTickets(file);
  console.log("Success:", result);
} catch (error) {
  if (error instanceof Error) {
    console.error("Import failed:", error.message);
    // Handle error (show toast, etc.)
    toast.error(error.message);
  }
}
```

### Component Error Handling

The `useImportForm` hook automatically handles errors using React Query's `onError` callback:

```typescript
const importMutation = useMutation({
  mutationFn: async (file: File) => importTickets(file, { full }),
  onError: (error: Error) => {
    toast.error(error.message || "Failed to import");
  },
});
```

### Displaying Errors to Users

Show errors in import results:

```typescript
import { useImportForm } from "@/hooks/use-import-form";
import { toast } from "sonner";

function MyImportComponent() {
  const { importMutation } = useImportForm({
    onResult: (data) => {
      if (data.errors.count > 0) {
        toast.error("Import completed with errors", {
          description: data.errors.data.join(", "),
        });
      } else {
        toast.success("Import completed successfully");
      }
    },
  });

  // Component JSX...
}
```

### Error Response Structure

When an import encounters errors, the response includes an `errors` object:

```typescript
{
  total: 10,
  created: { count: 7, data: [...] },
  skipped: { count: 2, data: [...] },
  errors: {
    count: 1,
    data: ["Row 5: Invalid email format"],
  },
}
```

### Handling Multiple Error Types

```typescript
onResult: (data) => {
  if (data.errors.count > 0) {
    const errorMessages = data.errors.data;

    // Categorize errors
    const validationErrors = errorMessages.filter(msg =>
      msg.includes("Invalid") || msg.includes("required")
    );
    const duplicateErrors = errorMessages.filter(msg =>
      msg.includes("duplicate") || msg.includes("already exists")
    );

    if (validationErrors.length > 0) {
      toast.error("Validation errors", {
        description: validationErrors.slice(0, 3).join(", "),
      });
    }

    if (duplicateErrors.length > 0) {
      toast.warning("Duplicate entries found", {
        description: `${duplicateErrors.length} duplicate(s) skipped`,
      });
    }
  }
},
```

## Troubleshooting

### Import Fails Silently

**Issue:** Import mutation doesn't show errors.

**Solution:** Check the mutation's `onError` callback and ensure error handling is implemented:

```typescript
const importMutation = useMutation({
  mutationFn: importTickets,
  onError: (error) => {
    console.error("Import error:", error);
    toast.error(error.message);
  },
});
```

**Alternative:** Check React Query devtools for mutation state:

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// In your app
<ReactQueryDevtools initialIsOpen={false} />
```

### Files Not Uploading

**Issue:** File selection doesn't trigger upload.

**Solution:** Ensure file is properly wrapped in `FileWithPreview` format and passed to mutation:

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (selectedFiles.length === 0) {
    toast.error("Please select a file");
    return;
  }

  const file = selectedFiles[0];
  if (file.file instanceof File) {
    importMutation.mutate(file.file);
  } else {
    toast.error("Invalid file");
  }
};
```

**Check:**
- File is selected in `TableUpload` component
- `handleFilesChange` is called when file is selected
- File is wrapped in `FileWithPreview` format

### Cache Not Refreshing

**Issue:** Ticket list doesn't update after import.

**Solution:** Ensure query invalidation is happening after successful import:

```typescript
onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: ["event"] });
},
```

**Manual Invalidation:**

```typescript
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// After successful import
queryClient.invalidateQueries({ queryKey: ["event", eventId, "tickets"] });
```

### File Validation Errors

**Issue:** File upload fails with validation error.

**Solution:** Check file type and size before upload:

```typescript
const handleFileSelect = (file: File) => {
  // Check file type
  const validExtensions = [".xlsx", ".xls", ".csv"];
  const extension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  if (!validExtensions.includes(extension)) {
    toast.error("Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are supported.");
    return;
  }

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    toast.error("File size must be less than 10MB");
    return;
  }

  // Proceed with file selection
  handleFilesChange([{ file, preview: URL.createObjectURL(file) }]);
};
```

### Import Takes Too Long

**Issue:** Import operation takes a very long time or hangs.

**Possible Causes:**
- Large file size (>10MB)
- Network issues
- Server processing time

**Solutions:**
1. **Show Progress Indicator:**
   ```typescript
   {importMutation.isPending && (
     <div>
       <p>Importing... This may take a while for large files.</p>
       <Progress value={undefined} />
     </div>
   )}
   ```

2. **Timeout Handling:**
   ```typescript
   const result = await Promise.race([
     importTickets(file),
     new Promise((_, reject) =>
       setTimeout(() => reject(new Error("Import timeout")), 60000)
     ),
   ]);
   ```

3. **Split Large Files:**
   Consider splitting very large files into smaller batches.

### Dialog Not Closing After Import

**Issue:** Import dialog doesn't close after successful import.

**Solution:** The hook automatically closes dialogs, but you can manually close:

```typescript
const { closeDialog } = useDialog();

const { importMutation } = useImportForm({
  onResult: (data) => {
    // Handle result
    setTimeout(() => closeDialog(), 1000);
  },
});
```

### Type Errors

**Issue:** TypeScript errors when using import functions.

**Solution:** Ensure proper imports and type definitions:

```typescript
import type { ImportTicketsResponse } from "@/lib/api/imports";
import { importTickets } from "@/lib/api/imports";

// Properly typed
const result: ImportTicketsResponse = await importTickets(file);
```

### React Query Mutation State Issues

**Issue:** Mutation state doesn't reset or behaves unexpectedly.

**Solution:** Manually reset mutation state:

```typescript
const { importMutation } = useImportForm({});

// Reset after handling result
importMutation.reset();
```

### Network Errors

**Issue:** Network requests fail or timeout.

**Solution:** Handle network errors separately:

```typescript
try {
  await importTickets(file);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes("network") || error.message.includes("fetch")) {
      toast.error("Network error. Please check your connection and try again.");
    } else {
      toast.error(error.message);
    }
  }
}
```

## Common Error Messages

### "No file provided"
- **Cause:** File parameter is missing or null
- **Solution:** Ensure file is selected before submitting

### "Invalid file type"
- **Cause:** File type is not .xlsx, .xls, or .csv
- **Solution:** Use supported file formats

### "File size exceeds limit"
- **Cause:** File is larger than 10MB
- **Solution:** Split large files or reduce file size

### "Unauthorized"
- **Cause:** Authentication token is missing or invalid
- **Solution:** Check authentication state and refresh token if needed

### "Import failed"
- **Cause:** Server-side error during import
- **Solution:** Check server logs and file format

## Debugging Tips

### 1. Enable Console Logging

```typescript
const { importMutation } = useImportForm({
  onResult: (data) => {
    console.log("Import result:", data);
    console.log("Created:", data.created);
    console.log("Skipped:", data.skipped);
    console.log("Errors:", data.errors);
  },
});
```

### 2. Check Network Requests

Use browser DevTools Network tab to inspect API requests:
- Check request payload
- Verify response status
- Review response body

### 3. Use React Query DevTools

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// In your app
<ReactQueryDevtools initialIsOpen={false} />
```

### 4. Validate File Format

Before uploading, validate Excel file structure:
- Check required columns exist
- Verify data types
- Ensure no empty required fields

## Related

- [API Integration](./api-integration.md) - API error responses
- [Hooks](./hooks.md) - Hook error handling
- [Usage Examples](./usage-examples.md) - Error handling examples
