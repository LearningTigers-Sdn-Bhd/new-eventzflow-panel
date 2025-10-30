# Universal Dialog System Usage Guide

The universal dialog system allows you to trigger dialogs with dynamic content from anywhere in your application using a centralized Zustand store and shadcn/ui Dialog components.

## Quick Start

```tsx
import { useDialog } from "@/hooks/use-dialog";

function MyComponent() {
  const { openDialog } = useDialog();

  const handleOpenDialog = () => {
    openDialog({
      component: MyFormComponent,
      props: { userId: 123 },
      title: "Edit User",
      size: "lg"
    });
  };

  return (
    <Button onClick={handleOpenDialog}>
      Open Dialog
    </Button>
  );
}
```

## API Reference

### useDialog Hook

The `useDialog` hook provides access to dialog management functions:

```tsx
const { openDialog, closeDialog, resetDialog, isOpen } = useDialog();
```

- `openDialog(params)` - Opens a dialog with the specified component and configuration
- `closeDialog()` - Closes the currently open dialog
- `resetDialog()` - Resets the dialog state to initial values
- `isOpen` - Boolean indicating if a dialog is currently open

### openDialog Parameters

```tsx
interface OpenDialogParams<T = any> {
  component: React.ComponentType<T>;
  props?: T;
  config?: DialogConfig;
}

interface DialogConfig {
  title?: string;
  description?: string;
  size?: DialogSize;
  showCloseButton?: boolean;
}

type DialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
```

## Usage Examples

### Basic Dialog

```tsx
import { useDialog } from "@/hooks/use-dialog";

function BasicExample() {
  const { openDialog } = useDialog();

  const handleOpen = () => {
    openDialog({
      component: () => (
        <div>
          <p>This is a simple dialog content!</p>
        </div>
      ),
      title: "Simple Dialog",
      size: "md"
    });
  };

  return <Button onClick={handleOpen}>Open Simple Dialog</Button>;
}
```

### Form Dialog with Props

```tsx
interface EditUserFormProps {
  userId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

function EditUserForm({ userId, onSave, onCancel }: EditUserFormProps) {
  // Form implementation
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function UserManagement() {
  const { openDialog, closeDialog } = useDialog();

  const handleEditUser = (userId: string) => {
    openDialog({
      component: EditUserForm,
      props: {
        userId,
        onSave: (data) => {
          // Handle save
          console.log("Saving user:", data);
          closeDialog();
        },
        onCancel: () => {
          closeDialog();
        }
      },
      title: "Edit User",
      description: "Update user information",
      size: "lg"
    });
  };

  return (
    <Button onClick={() => handleEditUser("user-123")}>
      Edit User
    </Button>
  );
}
```

### Confirmation Dialog

```tsx
interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="space-y-4">
      <p>{message}</p>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
}

function DeleteButton() {
  const { openDialog, closeDialog } = useDialog();

  const handleDelete = () => {
    openDialog({
      component: ConfirmDialog,
      props: {
        message: "Are you sure you want to delete this item? This action cannot be undone.",
        onConfirm: () => {
          // Perform deletion
          console.log("Item deleted");
          closeDialog();
        },
        onCancel: () => {
          closeDialog();
        }
      },
      title: "Confirm Deletion",
      size: "sm"
    });
  };

  return <Button variant="destructive" onClick={handleDelete}>Delete</Button>;
}
```

### Fullscreen Dialog

```tsx
function FullscreenDialog() {
  const { openDialog } = useDialog();

  const handleOpenFullscreen = () => {
    openDialog({
      component: () => (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Fullscreen Content</h2>
          <p>This dialog takes up the entire screen.</p>
          {/* Large form or complex content */}
        </div>
      ),
      title: "Fullscreen Dialog",
      size: "full"
    });
  };

  return (
    <Button onClick={handleOpenFullscreen}>
      Open Fullscreen Dialog
    </Button>
  );
}
```

## Dialog Sizes

The universal dialog supports multiple size variants:

- `sm` - Small dialog (max-w-sm)
- `md` - Medium dialog (max-w-md)
- `lg` - Large dialog (max-w-lg) - **Default**
- `xl` - Extra large dialog (max-w-xl)
- `2xl` - 2X large dialog (max-w-2xl)
- `full` - Fullscreen dialog (w-screen h-screen)

## Best Practices

### 1. Component Structure

Create reusable dialog content components:

```tsx
// components/dialogs/EditUserDialog.tsx
interface EditUserDialogProps {
  userId: string;
  onClose: () => void;
}

export function EditUserDialog({ userId, onClose }: EditUserDialogProps) {
  // Component implementation
}
```

### 2. Type Safety

Use TypeScript generics for type-safe props:

```tsx
interface MyFormProps {
  data: UserData;
  onSubmit: (data: UserData) => void;
}

function MyComponent() {
  const { openDialog } = useDialog();

  const handleOpen = () => {
    openDialog<MyFormProps>({
      component: MyForm,
      props: {
        data: userData,
        onSubmit: handleSubmit
      }
    });
  };
}
```

### 3. Error Handling

Always provide a way to close the dialog:

```tsx
function MyDialogContent({ onClose }: { onClose: () => void }) {
  const handleError = (error: Error) => {
    // Handle error
    onClose(); // Always close dialog on error
  };

  return (
    <div>
      {/* Content */}
      <Button onClick={onClose}>Close</Button>
    </div>
  );
}
```

### 4. Accessibility

- Always provide a title for screen readers
- Use semantic HTML in dialog content
- Ensure proper focus management
- Include close buttons for user control

### 5. Performance

- Keep dialog content components lightweight
- Use React.memo for expensive components
- Lazy load heavy content when needed

```tsx
const HeavyDialogContent = React.memo(function HeavyDialogContent({ data }: { data: any }) {
  // Expensive rendering logic
  return <div>{/* Heavy content */}</div>;
});
```

## Common Patterns

### Chaining Dialogs

```tsx
function DialogChain() {
  const { openDialog } = useDialog();

  const openSecondDialog = () => {
    openDialog({
      component: SecondDialog,
      props: { onComplete: handleComplete }
    });
  };

  const openFirstDialog = () => {
    openDialog({
      component: FirstDialog,
      props: { onNext: openSecondDialog }
    });
  };
}
```

### Dynamic Content

```tsx
function DynamicDialog() {
  const { openDialog } = useDialog();

  const handleOpen = (type: 'edit' | 'view') => {
    const component = type === 'edit' ? EditForm : ViewOnly;

    openDialog({
      component,
      props: { data: itemData },
      title: type === 'edit' ? 'Edit Item' : 'View Item',
      size: type === 'edit' ? 'lg' : 'md'
    });
  };
}
```

This universal dialog system provides a flexible, type-safe way to manage dialogs throughout your application while maintaining clean separation of concerns and excellent developer experience.
