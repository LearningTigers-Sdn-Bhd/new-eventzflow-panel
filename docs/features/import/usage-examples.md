# Usage Examples

## Basic Examples

### Example 1: Basic Import Form

Simple import form using `ImportFullForm` component:

```typescript
"use client";

import { ImportFullForm } from "@/components/pages/import/import-full-form";

export function TicketImportPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Import Tickets</h1>
      <ImportFullForm
        importType="tickets"
        onResult={(data) => {
          console.log(`Imported ${data.total} tickets`);
          console.log(`Created: ${data.created.count}`);
          console.log(`Skipped: ${data.skipped.count}`);
        }}
      />
    </div>
  );
}
```

### Example 2: Dry-Run Import

Preview import results without writing to database:

```typescript
"use client";

import { ImportQuickForm } from "@/components/pages/import/import-quick-form";

export function TicketImportPreview() {
  return (
    <ImportQuickForm
      importType="tickets"
      dryRun={true}
      onResult={(data) => {
        // Preview results without writing to database
        console.log("Preview results:", data);
        console.log(`Would create: ${data.created.count}`);
        console.log(`Would skip: ${data.skipped.count}`);
      }}
    />
  );
}
```

### Example 3: Import Button in Page

Add import functionality to an existing page with a single button:

```typescript
"use client";

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

## Advanced Examples

### Example 4: Custom Import with Hook

Build a custom import form using the `useImportForm` hook:

```typescript
"use client";

import { useImportForm } from "@/hooks/use-import-form";
import { TableUpload } from "@/components/file-upload/table-upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CustomImportForm() {
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
      const message = `Import completed: ${data.total} tickets processed`;
      if (data.errors.count > 0) {
        toast.warning(message, {
          description: `${data.errors.count} error(s) occurred`,
        });
      } else {
        toast.success(message);
      }
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Select Excel or CSV file
        </label>
        <TableUpload
          key={`import-${resetKey}`}
          maxFiles={1}
          maxSize={10 * 1024 * 1024} // 10MB
          accept=".xlsx,.xls,.csv"
          multiple={false}
          onFilesChange={handleFilesChange}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Cancel logic
          }}
          disabled={importMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={selectedFiles.length === 0 || importMutation.isPending}
        >
          {importMutation.isPending ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import Tickets
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
```

### Example 5: Import with Custom Validation

Add custom validation before import:

```typescript
"use client";

import { useImportForm } from "@/hooks/use-import-form";
import { TableUpload } from "@/components/file-upload/table-upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ValidatedImportForm() {
  const {
    selectedFiles,
    importMutation,
    handleFilesChange,
    handleSubmit,
  } = useImportForm({
    onResult: (data) => {
      toast.success(`Imported ${data.total} tickets`);
    },
  });

  const handleFilesChangeWithValidation = (files: FileWithPreview[]) => {
    if (files.length > 0) {
      const file = files[0].file;
      if (file instanceof File) {
        // Custom validation
        if (file.size > 10 * 1024 * 1024) {
          toast.error("File size must be less than 10MB");
          return;
        }

        const extension = file.name
          .substring(file.name.lastIndexOf("."))
          .toLowerCase();
        if (![".xlsx", ".xls", ".csv"].includes(extension)) {
          toast.error("Only Excel (.xlsx, .xls) and CSV (.csv) files are supported");
          return;
        }
      }
    }
    handleFilesChange(files);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TableUpload
        onFilesChange={handleFilesChangeWithValidation}
      />
      <Button
        type="submit"
        disabled={selectedFiles.length === 0 || importMutation.isPending}
      >
        {importMutation.isPending ? "Importing..." : "Import"}
      </Button>
    </form>
  );
}
```

### Example 6: Two-Step Import (Dry-Run then Import)

Preview before actual import:

```typescript
"use client";

import { useState } from "react";
import { useImportForm } from "@/hooks/use-import-form";
import { importTickets } from "@/lib/api/imports";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TwoStepImportForm() {
  const [previewData, setPreviewData] = useState<ImportTicketsResponse | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const {
    selectedFiles,
    importMutation: previewMutation,
    handleFilesChange,
    handleSubmit: handlePreview,
  } = useImportForm({
    dryRun: true,
    onResult: (data) => {
      setPreviewData(data);
      toast.success("Preview complete. Review results and click Import to proceed.");
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      return importTickets(file, { full: true });
    },
    onSuccess: (data) => {
      toast.success(`Imported ${data.total} tickets`);
      setPreviewData(null);
      setFile(null);
    },
  });

  const handlePreviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length > 0 && selectedFiles[0].file instanceof File) {
      setFile(selectedFiles[0].file);
      handlePreview(e);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handlePreviewSubmit}>
        <TableUpload onFilesChange={handleFilesChange} />
        <Button
          type="submit"
          disabled={selectedFiles.length === 0 || previewMutation.isPending}
        >
          {previewMutation.isPending ? "Previewing..." : "Preview Import"}
        </Button>
      </form>

      {previewData && (
        <div className="border p-4 rounded-lg space-y-2">
          <h3 className="font-bold">Preview Results</h3>
          <p>Total: {previewData.total}</p>
          <p>Created: {previewData.created.count}</p>
          <p>Skipped: {previewData.skipped.count}</p>
          {previewData.errors.count > 0 && (
            <p className="text-red-600">
              Errors: {previewData.errors.count}
            </p>
          )}

          <Button
            onClick={() => importMutation.mutate()}
            disabled={importMutation.isPending}
            className="mt-2"
          >
            {importMutation.isPending ? "Importing..." : "Confirm Import"}
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Example 7: Import with Progress Tracking

Track import progress and display results:

```typescript
"use client";

import { useState } from "react";
import { useImportForm } from "@/hooks/use-import-form";
import { ImportTicketsResponse } from "@/lib/api/imports";
import { Progress } from "@/components/ui/progress";

export function ImportWithProgress() {
  const [result, setResult] = useState<ImportTicketsResponse | null>(null);

  const {
    selectedFiles,
    importMutation,
    handleFilesChange,
    handleSubmit,
  } = useImportForm({
    onResult: (data) => {
      setResult(data);
    },
  });

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <TableUpload onFilesChange={handleFilesChange} />
        <Button
          type="submit"
          disabled={selectedFiles.length === 0 || importMutation.isPending}
        >
          Import
        </Button>
      </form>

      {importMutation.isPending && (
        <div>
          <p>Importing...</p>
          <Progress value={undefined} /> {/* Indeterminate progress */}
        </div>
      )}

      {result && (
        <div className="border p-4 rounded-lg space-y-2">
          <h3 className="font-bold">Import Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Processed</p>
              <p className="text-2xl font-bold">{result.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-2xl font-bold text-green-600">
                {result.created.count}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Skipped</p>
              <p className="text-2xl font-bold text-yellow-600">
                {result.skipped.count}
              </p>
            </div>
            {result.errors.count > 0 && (
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {result.errors.count}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Always Use Dry-Run for Testing

Test import files with dry-run mode before actual imports:

```typescript
const result = await importTicketsDryRun(file);
if (result.errors.count === 0) {
  // Proceed with actual import
  await importTickets(file);
}
```

### 2. Handle Errors Gracefully

Always provide user feedback for errors:

```typescript
onResult: (data) => {
  if (data.errors.count > 0) {
    toast.error(`Import completed with ${data.errors.count} error(s)`, {
      description: data.errors.data.slice(0, 3).join(", "),
    });
  }
},
```

### 3. Show Progress Indicators

Use the mutation's `isPending` state to show loading states:

```typescript
<Button disabled={importMutation.isPending}>
  {importMutation.isPending ? "Importing..." : "Import"}
</Button>
```

### 4. Validate Files Before Upload

Consider client-side validation before submitting:

```typescript
const handleFileSelect = (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    toast.error("File size must be less than 10MB");
    return;
  }
  // Proceed with file selection
};
```

## Related

- [Components](./components.md) - Component documentation
- [Hooks](./hooks.md) - Hook usage patterns
- [Error Handling](./error-handling.md) - Error handling examples
