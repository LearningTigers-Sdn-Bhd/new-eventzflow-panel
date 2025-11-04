# Import Functionality

## Overview

The EventzFlow panel application provides a comprehensive import system for bulk importing tickets from Excel (.xlsx, .xls) or CSV files. This feature allows administrators to efficiently manage large volumes of ticket data through file uploads.

## Quick Start

```typescript
import { ImportQuickButton } from "@/components/pages/import/import-quick-form";

// Simple button that opens import dialog
<ImportQuickButton importType="tickets" />
```

## Documentation

- **[API Integration](./api-integration.md)** - API endpoint details, request/response types, and client usage
- **[Components](./components.md)** - Import components (ImportFullForm, ImportQuickForm, ImportQuickButton)
- **[Hooks](./hooks.md)** - Custom hooks for managing import state and mutations
- **[Usage Examples](./usage-examples.md)** - Real-world examples and code snippets
- **[Error Handling & Troubleshooting](./error-handling.md)** - Error handling patterns and common issues

## Features

- **File Upload**: Support for Excel (.xlsx, .xls) and CSV files
- **Dry-Run Mode**: Preview imports without writing to database
- **Full Mode**: Enhanced validation and processing
- **Error Reporting**: Detailed error messages and validation feedback
- **Progress Tracking**: Real-time import status and results
- **React Query Integration**: Automatic cache invalidation and state management

## Import Modes

### Quick Mode (default)
- Basic validation
- Standard processing
- Faster import times
- Use `full: false` or omit `full` parameter

### Full Mode
- Enhanced validation
- Additional processing steps
- More comprehensive error checking
- Use `full: true`

### Dry-Run Mode
- Validates file without writing to database
- Returns preview of what would be imported
- Useful for testing import files
- Use `dryRun: true` or `importTicketsDryRun()`

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

## File Requirements

- **Supported Formats**: `.xlsx`, `.xls`, `.csv`
- **Maximum Size**: 10MB
- **Content-Type**: `multipart/form-data`

## Related Documentation

- [Backend Import Documentation](../../../eventz-flow-backend/docs/TICKET_EXCEL_IMPORT_EXPORT.md)
- [REST API Integration](../rest-api-integration.md)
- [React Query Documentation](https://tanstack.com/query/latest)

## Support

For questions or issues:
- Check the [Backend API Documentation](../../../eventz-flow-backend/docs/TICKET_EXCEL_IMPORT_EXPORT.md)
- Review component implementations in `src/components/pages/import/`
- Review hook implementation in `src/hooks/use-import-form.ts`
