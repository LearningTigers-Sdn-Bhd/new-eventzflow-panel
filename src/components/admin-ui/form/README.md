# Admin UI Form Components

This directory contains reusable form components for the admin interface.

## InputLabel

A flexible form field component that combines label, input/textarea, and error display with variant support.

### Features

- **Input Types**: `input` (single-line) and `textarea` (multi-line)
- **Variants**: `rounded` (default) and `no-rounded` (square corners)
- **TanStack Form Integration**: Works seamlessly with TanStack Form field state
- **Generic Usage**: Can be used as a controlled component with standard React patterns
- **Validation**: Built-in error display and invalid state handling
- **Accessibility**: Full aria-invalid and htmlFor support

### Props

```typescript
interface InputLabelProps {
  // Label
  label: string;              // The label text
  htmlFor?: string;           // ID for input (used with label)

  // Input type and style
  type?: "input" | "textarea";           // Default: "input"
  variant?: "rounded" | "no-rounded";    // Default: "rounded"

  // Values & handlers
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;

  // Validation
  errors?: Array<{ message?: string } | undefined>;
  isInvalid?: boolean;

  // Additional props
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  rows?: number;              // For textarea (default: 3)
  required?: boolean;         // Shows red asterisk (*) after label

  // Styling
  className?: string;         // Applied to input/textarea
  fieldClassName?: string;    // Applied to Field wrapper
}
```

### Usage Examples

#### With TanStack Form (Recommended)

```tsx
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { useForm } from "@tanstack/react-form";

function MyForm() {
  const form = useForm({
    defaultValues: {
      title: "",
    },
  });

  return (
    <form.Field name="title">
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <InputLabel
            label="Event Title"
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            errors={field.state.meta.errors}
            isInvalid={isInvalid}
            placeholder="Enter event title"
            required
          />
        );
      }}
    </form.Field>
  );
}
```

#### Generic Usage (Controlled Component)

```tsx
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { useState } from "react";

function MyComponent() {
  const [email, setEmail] = useState("");

  return (
    <InputLabel
      label="Email"
      value={email}
      onChange={setEmail}
      placeholder="Enter your email"
      type="input"
      variant="no-rounded"
    />
  );
}
```

#### Textarea Example

```tsx
<InputLabel
  label="Description"
  type="textarea"
  value={description}
  onChange={setDescription}
  rows={4}
  placeholder="Enter description"
  variant="rounded"
/>
```

#### With Validation Errors

```tsx
const [errors, setErrors] = useState([{ message: "Email is required" }]);

<InputLabel
  label="Email"
  value={email}
  onChange={setEmail}
  errors={errors}
  isInvalid={true}
  required  // Shows red asterisk (*)
/>
```

### Variants

#### Rounded (Default)

Standard rounded corners using `rounded-md` class:

```tsx
<InputLabel
  label="Name"
  variant="rounded"
  value={name}
  onChange={setName}
/>
```

#### No-Rounded

Square corners using `rounded-none` class:

```tsx
<InputLabel
  label="Name"
  variant="no-rounded"
  value={name}
  onChange={setName}
/>
```

### Integration with Existing Components

The `InputLabel` component internally uses:
- `Field` from `@/components/ui/field` - Wrapper with orientation and invalid state
- `FieldLabel` from `@/components/ui/field` - Label component
- `FieldError` from `@/components/ui/field` - Error display
- `Input` from `@/components/ui/input` - Base input component
- `Textarea` from `@/components/ui/textarea` - Base textarea component

### Styling with CVA

The component uses `class-variance-authority` (CVA) for variant management, matching the shadcn/ui pattern. Custom classes can be applied via the `className` prop and will be merged with the variant styles.

### Accessibility

- Uses proper `htmlFor` attribute linking label to input
- Supports `aria-invalid` for invalid states
- Displays validation errors with `role="alert"`
- All standard HTML input attributes are supported through prop spreading

## InputActionLabel

A flexible form field component that combines label, input with an inline action button, and error display. Built on top of shadcn's `InputGroup` components for modern inline button UX.

### Features

- **Inline Action Button**: Action button appears inside the input field on the right
- **Flexible Button Props**: Customizable icon, variant, size, and disabled state
- **Variants**: `rounded` (default) and `no-rounded` (square corners)
- **TanStack Form Integration**: Works seamlessly with TanStack Form field state
- **Generic Usage**: Can be used as a controlled component with standard React patterns
- **Validation**: Built-in error display and invalid state handling
- **Accessibility**: Full aria-invalid, aria-label, and htmlFor support

### Props

```typescript
interface InputActionLabelProps {
  // Label
  label: string;              // The label text
  htmlFor?: string;           // ID for input (used with label)

  // Input style
  variant?: "rounded" | "no-rounded";    // Default: "no-rounded"

  // Values & handlers
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;

  // Validation
  errors?: Array<{ message?: string } | undefined>;
  isInvalid?: boolean;

  // Input props
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  required?: boolean;         // Shows red asterisk (*) after label

  // Action button props
  onAction?: () => void;                                              // Button click handler
  actionIcon?: React.ReactNode;                                       // Icon to display in button
  actionLabel?: string;                                               // Accessible label and tooltip
  actionVariant?: "default" | "secondary" | "ghost" | "destructive";  // Default: "ghost"
  actionSize?: "xs" | "sm" | "icon-xs" | "icon-sm";                   // Default: "icon-xs"
  actionDisabled?: boolean;                                           // Disable button independently

  // Styling
  className?: string;           // Applied to InputGroupInput
  fieldClassName?: string;      // Applied to Field wrapper
  inputGroupClassName?: string; // Applied to InputGroup wrapper
}
```

### Usage Examples

#### With TanStack Form (Recommended)

```tsx
import { InputActionLabel } from "@/components/admin-ui/form/input-action-label";
import { useForm } from "@tanstack/react-form";
import { Copy } from "lucide-react";

function MyForm() {
  const form = useForm({
    defaultValues: {
      apiKey: "",
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(form.state.values.apiKey);
  };

  return (
    <form.Field name="apiKey">
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <InputActionLabel
            label="API Key"
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            errors={field.state.meta.errors}
            isInvalid={isInvalid}
            placeholder="Enter API key"
            onAction={handleCopy}
            actionIcon={<Copy className="size-4" />}
            actionLabel="Copy to clipboard"
            actionVariant="ghost"
            required
          />
        );
      }}
    </form.Field>
  );
}
```

#### Generic Usage (Controlled Component)

```tsx
import { InputActionLabel } from "@/components/admin-ui/form/input-action-label";
import { Trash2 } from "lucide-react";
import { useState } from "react";

function MyComponent() {
  const [items, setItems] = useState([
    { id: "1", value: "Item 1" },
    { id: "2", value: "Item 2" },
  ]);

  const handleChange = (id: string, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, value } : item
    ));
  };

  const handleRemove = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <InputActionLabel
          key={item.id}
          label={`Label ${index + 1}`}
          value={item.value}
          onChange={(value) => handleChange(item.id, value)}
          placeholder="Enter label name"
          variant="no-rounded"
          onAction={() => handleRemove(item.id)}
          actionIcon={<Trash2 className="size-4" />}
          actionLabel="Remove label"
          actionVariant="destructive"
          actionDisabled={items.length === 1}
        />
      ))}
    </div>
  );
}
```

#### Different Action Button Variants

**Copy Button (Ghost variant):**
```tsx
import { Copy } from "lucide-react";

<InputActionLabel
  label="API Key"
  value={apiKey}
  onChange={setApiKey}
  onAction={() => copyToClipboard(apiKey)}
  actionIcon={<Copy className="size-4" />}
  actionLabel="Copy"
  actionVariant="ghost"
  actionSize="icon-xs"
/>
```

**Delete Button (Destructive variant):**
```tsx
import { Trash2 } from "lucide-react";

<InputActionLabel
  label="Custom Field"
  value={field}
  onChange={setField}
  onAction={handleDelete}
  actionIcon={<Trash2 className="size-4" />}
  actionLabel="Delete field"
  actionVariant="destructive"
  actionSize="icon-xs"
/>
```

**Clear Button (Secondary variant):**
```tsx
import { X } from "lucide-react";

<InputActionLabel
  label="Search"
  value={search}
  onChange={setSearch}
  onAction={() => setSearch("")}
  actionIcon={<X className="size-4" />}
  actionLabel="Clear search"
  actionVariant="secondary"
  actionSize="icon-xs"
/>
```

**Text Button (with label, not just icon):**
```tsx
<InputActionLabel
  label="URL"
  value={url}
  onChange={setUrl}
  onAction={handleSubmit}
  actionIcon={<Send className="size-4" />}
  actionLabel="Submit"
  actionVariant="default"
  actionSize="sm"  // Use "sm" for text buttons
>
  Submit
</InputActionLabel>
```

#### Without Action Button (Acts like InputLabel)

If you don't provide `onAction`, the component works like a standard input:

```tsx
<InputActionLabel
  label="Name"
  value={name}
  onChange={setName}
  placeholder="Enter name"
  variant="no-rounded"
/>
```

### Migration from Manual Field + Input + Button

**Before** (manual composition):

```tsx
<div className="flex items-end gap-2">
  <div className="flex-1">
    <Field orientation="vertical">
      <FieldLabel htmlFor={label.id}>Label {index + 1}</FieldLabel>
      <Input
        id={label.id}
        value={label.value}
        onChange={(e) => handleLabelChange(label.id, e.target.value)}
        placeholder="e.g., Phone Number"
        disabled={updateMutation.isPending}
        className="rounded-none"
      />
    </Field>
  </div>
  <Button
    type="button"
    variant="outline"
    size="icon"
    onClick={() => handleRemoveLabel(label.id)}
    disabled={labels.length === 1}
    className="shrink-0 rounded-none"
    title="Remove label"
  >
    <Trash2 className="size-4" />
  </Button>
</div>
```

**After** (using InputActionLabel):

```tsx
<InputActionLabel
  label={`Label ${index + 1}`}
  htmlFor={label.id}
  value={label.value}
  onChange={(value) => handleLabelChange(label.id, value)}
  placeholder="e.g., Phone Number"
  disabled={updateMutation.isPending}
  variant="no-rounded"
  onAction={() => handleRemoveLabel(label.id)}
  actionIcon={<Trash2 className="size-4" />}
  actionLabel="Remove label"
  actionVariant="destructive"
  actionDisabled={labels.length === 1}
/>
```

### Variants

#### Rounded (Default)

Standard rounded corners using `rounded-md` class:

```tsx
<InputActionLabel
  label="Name"
  variant="rounded"
  value={name}
  onChange={setName}
  onAction={handleAction}
  actionIcon={<Copy />}
/>
```

#### No-Rounded

Square corners using `rounded-none` class:

```tsx
<InputActionLabel
  label="Name"
  variant="no-rounded"
  value={name}
  onChange={setName}
  onAction={handleAction}
  actionIcon={<Copy />}
/>
```

### Integration with Existing Components

The `InputActionLabel` component internally uses:
- `Field` from `@/components/ui/field` - Wrapper with orientation and invalid state
- `FieldLabel` from `@/components/ui/field` - Label component
- `FieldError` from `@/components/ui/field` - Error display
- `InputGroup` from `@/components/ui/input-group` - Input group wrapper
- `InputGroupInput` from `@/components/ui/input-group` - Base input component
- `InputGroupAddon` from `@/components/ui/input-group` - Addon container
- `InputGroupButton` from `@/components/ui/input-group` - Action button

### Styling with CVA

The component uses `class-variance-authority` (CVA) for variant management, matching the shadcn/ui pattern. Custom classes can be applied via:
- `className` - Applied to the InputGroupInput
- `fieldClassName` - Applied to the Field wrapper
- `inputGroupClassName` - Applied to the InputGroup wrapper

### Accessibility

- Uses proper `htmlFor` attribute linking label to input
- Supports `aria-invalid` for invalid states
- Action button includes `aria-label` and `title` for screen readers and tooltips
- Displays validation errors with `role="alert"`
- All standard HTML input attributes are supported through prop spreading

### Notes

- **Input-only**: This component only supports single-line text inputs (no textarea). Use `InputLabel` for textarea needs.
- **Optional Action**: The action button only renders if `onAction` is provided
- **Button Variants**: Supports all Button variants: `default`, `secondary`, `ghost`, `destructive`
- **Button Sizes**: Supports InputGroup-specific sizes: `xs`, `sm`, `icon-xs`, `icon-sm`

## RadioGroupCard

A flexible form field component that combines a radio group with card-style options, label, and error display. Each option is displayed as a clickable card with a title, optional description, and radio button.

### Features

- **Options-based API**: Simple array of options instead of manual JSX composition
- **Generic Types**: Full TypeScript support with generic value types
- **TanStack Form Integration**: Works seamlessly with TanStack Form field state
- **Generic Usage**: Can be used as a controlled component with standard React patterns
- **Validation**: Built-in error display and invalid state handling
- **Per-option Control**: Individual options can be disabled
- **Accessibility**: Full aria-invalid support and keyboard navigation

### Props

```typescript
interface RadioGroupCardOption<T extends string> {
  value: T;                // The value for this option
  label: string;           // Main title (displayed prominently)
  description?: string;    // Optional subtitle/description
  disabled?: boolean;      // Disable this specific option
}

interface RadioGroupCardProps<T extends string> {
  // Label
  label?: string;          // Optional top-level label
  description?: string;    // Optional top-level description

  // Options
  options: RadioGroupCardOption<T>[];

  // Values & handlers
  value: T;
  onChange: (value: T) => void;
  onBlur?: () => void;

  // Validation
  errors?: Array<{ message?: string } | undefined>;
  isInvalid?: boolean;

  // Additional props
  disabled?: boolean;      // Disable all options
  required?: boolean;      // Shows red asterisk (*) after label

  // Styling
  className?: string;          // Applied to RadioGroup
  fieldClassName?: string;     // Applied to FieldSet wrapper
  fieldGroupClassName?: string; // Applied to FieldGroup wrapper
}
```

### Usage Examples

#### With TanStack Form (Recommended)

```tsx
import { RadioGroupCard } from "@/components/admin-ui/form/radio-group-card";
import { useForm } from "@tanstack/react-form";

function MyForm() {
  const form = useForm({
    defaultValues: {
      eventType: "conference" as const,
    },
  });

  return (
    <form.Field name="eventType">
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <RadioGroupCard
            label="Event Type"
            description="Select the type of event you want to create"
            options={[
              {
                value: "conference",
                label: "Conference",
                description: "Multi-day event with sessions and speakers",
              },
              {
                value: "workshop",
                label: "Workshop",
                description: "Hands-on learning experience",
              },
              {
                value: "meetup",
                label: "Meetup",
                description: "Casual networking event",
                disabled: true, // Can disable specific options
              },
            ]}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            errors={field.state.meta.errors}
            isInvalid={isInvalid}
            required
          />
        );
      }}
    </form.Field>
  );
}
```

#### Generic Usage (Controlled Component)

```tsx
import { RadioGroupCard } from "@/components/admin-ui/form/radio-group-card";
import { useState } from "react";

function MyComponent() {
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  return (
    <RadioGroupCard
      label="Event Visibility"
      description="Choose who can see your event"
      options={[
        {
          value: "public",
          label: "Public",
          description: "Anyone can see this event",
        },
        {
          value: "private",
          label: "Private",
          description: "Only invited users can see this event",
        },
      ]}
      value={visibility}
      onChange={setVisibility}
    />
  );
}
```

#### Boolean Conversion Pattern

For boolean form fields, convert between boolean and string values:

```tsx
<form.Field name="isPublic">
  {(field) => (
    <RadioGroupCard
      label="Event Visibility"
      options={[
        { value: "yes", label: "Visible", description: "Public event" },
        { value: "no", label: "Hidden", description: "Private event" },
      ]}
      value={field.state.value ? "yes" : "no"}
      onChange={(value) => field.handleChange(value === "yes")}
      onBlur={field.handleBlur}
    />
  )}
</form.Field>
```

#### With Validation Errors

```tsx
const [errors, setErrors] = useState([{ message: "Please select an option" }]);

<RadioGroupCard
  label="Event Type"
  options={eventTypeOptions}
  value={eventType}
  onChange={setEventType}
  errors={errors}
  isInvalid={true}
  required
/>
```

#### Without Top-Level Label

```tsx
<RadioGroupCard
  options={[
    { value: "yes", label: "Enable Feature" },
    { value: "no", label: "Disable Feature" },
  ]}
  value={featureEnabled}
  onChange={setFeatureEnabled}
/>
```

### Migration Guide

**Before** (manual JSX composition):

```tsx
<FieldGroup>
  <FieldSet>
    <FieldLabel>Event Visibility</FieldLabel>
    <FieldDescription>Select if you want to make your event visible to the public.</FieldDescription>
    <RadioGroup value={field.state.value ? "yes" : "no"} onValueChange={(value) => field.handleChange(value === "yes")}>
      <FieldLabel htmlFor="yes">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Visible</FieldTitle>
            <FieldDescription>The event will be visible to the public.</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="yes" id="yes" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="no">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Hidden</FieldTitle>
            <FieldDescription>The event will not be visible to the public.</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="no" id="no" />
        </Field>
      </FieldLabel>
    </RadioGroup>
  </FieldSet>
</FieldGroup>
```

**After** (using RadioGroupCard):

```tsx
<RadioGroupCard
  label="Event Visibility"
  description="Select if you want to make your event visible to the public."
  options={[
    { value: "yes", label: "Visible", description: "The event will be visible to the public." },
    { value: "no", label: "Hidden", description: "The event will not be visible to the public." },
  ]}
  value={field.state.value ? "yes" : "no"}
  onChange={(value) => field.handleChange(value === "yes")}
  onBlur={field.handleBlur}
  errors={field.state.meta.errors}
  isInvalid={isInvalid}
/>
```

### Integration with Existing Components

The `RadioGroupCard` component internally uses:
- `FieldGroup`, `FieldSet` - Wrapper structure
- `FieldLegend` - Top-level label
- `FieldDescription` - Description text
- `RadioGroup`, `RadioGroupItem` - Base radio components from `@/components/ui/radio-group`
- `Field` - Individual option container with horizontal orientation
- `FieldContent`, `FieldTitle` - Option label structure
- `FieldError` - Error display

### Accessibility

- Uses proper `htmlFor` attribute linking label to radio items
- Supports `aria-invalid` for invalid states
- Displays validation errors with `role="alert"`
- Full keyboard navigation support
- Per-option disabled states with visual feedback

## SwitchCardInput

A flexible form field component that combines a switch with a card-style layout, label, optional description, and error display. Perfect for boolean toggles with explanatory text.

### Features

- **Clickable Card**: Entire card is clickable to toggle the switch (not just the switch itself)
- **CVA Variants**: Configurable `variant` (rounded/no-rounded) and `border` (bordered/borderless)
- **Orientations**: Horizontal (default) and vertical layouts
- **TanStack Form Integration**: Works seamlessly with TanStack Form field state
- **Generic Usage**: Can be used as a controlled component with standard React patterns
- **Validation**: Built-in error display and invalid state handling
- **Visual Feedback**: Cursor pointer on hover, disabled state with reduced opacity
- **Accessibility**: Full aria-invalid support and proper label linking

### Props

```typescript
interface SwitchCardInputProps {
  // Label and description
  label: string;
  description?: string;
  htmlFor?: string;

  // Styling variants
  variant?: "rounded" | "no-rounded";    // Default: "rounded"
  border?: boolean;                      // Default: true
  orientation?: "horizontal" | "vertical"; // Default: "horizontal"

  // Values & handlers
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onBlur?: () => void;

  // Validation
  errors?: Array<{ message?: string } | undefined>;
  isInvalid?: boolean;

  // Additional props
  disabled?: boolean;
  required?: boolean;         // Shows red asterisk (*) after label

  // Styling
  className?: string;         // Applied to Field wrapper
  fieldClassName?: string;    // Alternative to className
}
```

### Usage Examples

#### With TanStack Form (Recommended)

```tsx
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { useForm } from "@tanstack/react-form";

function MyForm() {
  const form = useForm({
    defaultValues: {
      useExhibitorKit: false,
    },
  });

  return (
    <form.Field name="useExhibitorKit">
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <SwitchCardInput
            label="Enable Exhibitor Kit"
            description="By enabling this, you will be able to let your exhibitor contractors to manage their kits."
            variant="rounded"
            border={true}
            checked={field.state.value}
            onCheckedChange={field.handleChange}
            onBlur={field.handleBlur}
            errors={field.state.meta.errors}
            isInvalid={isInvalid}
          />
        );
      }}
    </form.Field>
  );
}
```

#### Generic Usage (Controlled Component)

```tsx
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { useState } from "react";

function MyComponent() {
  const [enabled, setEnabled] = useState(false);

  return (
    <SwitchCardInput
      label="Enable Feature"
      description="Toggle this feature on or off"
      variant="rounded"
      border={true}
      checked={enabled}
      onCheckedChange={setEnabled}
    />
  );
}
```

#### Variant Examples

**Bordered with rounded corners (default):**
```tsx
<SwitchCardInput
  label="Enable Notifications"
  description="Receive email notifications"
  variant="rounded"
  border={true}
  checked={notifications}
  onCheckedChange={setNotifications}
/>
```

**Borderless with rounded corners:**
```tsx
<SwitchCardInput
  label="Allow Printing Services"
  description="Enable printing services for contractors"
  variant="rounded"
  border={false}
  checked={printing}
  onCheckedChange={setPrinting}
/>
```

**Bordered with square corners:**
```tsx
<SwitchCardInput
  label="Dark Mode"
  variant="no-rounded"
  border={true}
  checked={darkMode}
  onCheckedChange={setDarkMode}
/>
```

**Borderless with square corners (minimal):**
```tsx
<SwitchCardInput
  label="Compact View"
  variant="no-rounded"
  border={false}
  checked={compact}
  onCheckedChange={setCompact}
/>
```

#### With Vertical Orientation

```tsx
<SwitchCardInput
  label="Advanced Settings"
  description="Show advanced configuration options"
  orientation="vertical"
  variant="rounded"
  border={true}
  checked={advanced}
  onCheckedChange={setAdvanced}
/>
```

#### With Validation

```tsx
<form.Field name="acceptTerms">
  {(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
      <SwitchCardInput
        label="Accept Terms"
        description="You must accept the terms and conditions"
        checked={field.state.value}
        onCheckedChange={field.handleChange}
        errors={field.state.meta.errors}
        isInvalid={isInvalid}
        required
      />
    );
  }}
</form.Field>
```

### Migration Guide

**Before** (manual JSX composition):

```tsx
<Field orientation="horizontal" className="rounded-lg border p-4">
  <FieldContent>
    <FieldLabel htmlFor={useExhibitorKitId}>
      Enable Exhibitor Kit
    </FieldLabel>
    <FieldDescription>
      By enabling this, you will be able to let your exhibitor contractors
      to manage their kits to exhibitors under contractorships for your event.
    </FieldDescription>
  </FieldContent>
  <Switch
    id={useExhibitorKitId}
    checked={exhibitorKitField.state.value}
    onCheckedChange={(checked) => {
      exhibitorKitField.handleChange(checked);
    }}
    disabled={createEventMutation.isPending}
  />
</Field>
```

**After** (using SwitchCardInput):

```tsx
<SwitchCardInput
  label="Enable Exhibitor Kit"
  description="By enabling this, you will be able to let your exhibitor contractors to manage their kits to exhibitors under contractorships for your event."
  htmlFor={useExhibitorKitId}
  variant="rounded"
  border={true}
  checked={exhibitorKitField.state.value}
  onCheckedChange={(checked) => {
    exhibitorKitField.handleChange(checked);
  }}
  disabled={createEventMutation.isPending}
/>
```

### CVA Variants

The component uses `class-variance-authority` (CVA) for variant management:

- **`variant`**: Controls corner rounding
  - `rounded`: Applies `rounded-lg` class
  - `no-rounded`: Applies `rounded-none` class

- **`border`**: Controls border and padding
  - `true`: Adds `border p-4` classes
  - `false`: No border or padding (clean layout)

These variants are **combinable**, allowing you to create different visual styles:
- `variant="rounded"` + `border={true}` → Rounded card with border and padding
- `variant="rounded"` + `border={false}` → Rounded card without border/padding
- `variant="no-rounded"` + `border={true}` → Square card with border and padding
- `variant="no-rounded"` + `border={false}` → Square card without border/padding

### Integration with Existing Components

The `SwitchCardInput` component internally uses:
- `Field` - Wrapper with orientation and invalid state support
- `FieldContent` - Content wrapper for label and description
- `FieldLabel` - Label component with required indicator
- `FieldDescription` - Optional description text
- `Switch` - Base switch component from `@/components/ui/switch`
- `FieldError` - Error display with validation messages

### Accessibility

- Uses proper `htmlFor` attribute linking label to switch
- Supports `aria-invalid` for invalid states
- Displays validation errors with proper semantics
- Full keyboard navigation support via Switch component
- Required indicator for accessibility compliance
