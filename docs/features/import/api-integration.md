# API Integration

## Endpoint

**POST** `/v1/imports/tickets`

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | `File` | Yes | Excel (.xlsx, .xls) or CSV (.csv) file |
| `dry_run` | `boolean` (query) | No | If true, validate and report without writing changes |
| `full` | `boolean` (query) | No | If true, use full import mode with additional validation |

## API Client

Located in: `src/lib/api/imports/`

### Functions

**`importTickets(file: File, options?: { dryRun?: boolean; full?: boolean }): Promise<ImportTicketsResponse>`**

Main import function that uploads a file and processes tickets.

**`importTicketsDryRun(file: File, options?: { full?: boolean }): Promise<ImportTicketsResponse>`**

Convenience function for dry-run imports (no writes to database).

## Response Structure

```typescript
type ImportTicketsResponse = {
  total: number;
  created: {
    count: number;
    data: Array<Record<string, unknown> & { model: string; id: string }>;
  };
  updated?: {
    count: number;
    data: Array<Record<string, unknown> & { model: string; id: string }>;
  };
  skipped: {
    count: number;
    data: Array<Record<string, unknown> & { model: string; id: string }>;
  };
  duplicates_in_file?: {
    count: number;
    data: Array<Record<string, unknown> & { model: string; id: string }>;
  };
  errors: {
    count: number;
    data: string[];
  };
};
```

## Usage Examples

### Basic Import

```typescript
import { importTickets } from "@/lib/api/imports";

const result = await importTickets(file);
console.log(`Imported ${result.total} tickets`);
```

### Dry-Run Import

```typescript
import { importTicketsDryRun } from "@/lib/api/imports";

const result = await importTicketsDryRun(file);
// Preview what would be imported without writing to database
if (result.errors.count === 0) {
  // Proceed with actual import
  await importTickets(file);
}
```

### Full Mode Import

```typescript
import { importTickets } from "@/lib/api/imports";

const result = await importTickets(file, { full: true });
// Uses enhanced validation and processing
```

### Dry-Run with Full Mode

```typescript
import { importTicketsDryRun } from "@/lib/api/imports";

const result = await importTicketsDryRun(file, { full: true });
// Preview with enhanced validation
```

## Type Definitions

### ImportType

**Location:** `src/lib/api/imports/types.ts`

```typescript
type ImportType = "tickets" | "events" | "users";
```

Currently only `"tickets"` is implemented. Other types are reserved for future use.

### ImportTicketsRequest

**Location:** `src/lib/api/imports/request.ts`

```typescript
type ImportTicketsRequest = {
  file: File;
  dryRun?: boolean;
};
```

### ImportTicketsResponse

**Location:** `src/lib/api/imports/response.ts`

See [Response Structure](#response-structure) above.

## File Validation

### Supported File Types

- **Excel:** `.xlsx`, `.xls`
- **CSV:** `.csv`

### File Size Limits

Default maximum file size: **10MB** (10 * 1024 * 1024 bytes)

### API-Level Validation

The API client validates file types:

```typescript
const validTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "text/csv", // .csv
];
const validExtensions = [".xlsx", ".xls", ".csv"];
```

## Response Data Examples

### Success Response

```typescript
{
  total: 10,
  created: {
    count: 8,
    data: [
      {
        model: "ticket",
        id: "123",
        attendee_name: "John Doe",
        attendee_email: "john@example.com",
        // ... other ticket fields
      },
      // ... more tickets
    ],
  },
  updated: {
    count: 1,
    data: [
      {
        model: "ticket",
        id: "124",
        // ... ticket data
      },
    ],
  },
  skipped: {
    count: 1,
    data: [
      {
        model: "ticket",
        id: "125",
        // ... ticket data
      },
    ],
  },
  duplicates_in_file: {
    count: 0,
    data: [],
  },
  errors: {
    count: 0,
    data: [],
  },
}
```

### Error Response

If the import encounters errors:

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

## Related

- [Components](./components.md) - Component usage with API
- [Hooks](./hooks.md) - Custom hooks that use the API
- [Usage Examples](./usage-examples.md) - Complete examples
