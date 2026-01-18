# Sidebars

Configuration-driven sidebar system using the **Sidebar Orchestrator** pattern.

## Directory Structure

```
sidebars/
├── types.ts                    # Core type definitions
├── README.md                   # This file
├── registry/
│   ├── orchestrator-config.ts  # No-sidebar routes config
│   └── feature-sidebar-registry.ts  # URL → FeatureConfig mapping
├── orchestrator/
│   ├── sidebar-orchestrator.tsx         # Main layout component
│   ├── sidebar-orchestrator-context.tsx # Global state context
│   └── feature-sidebar.tsx              # Generic feature sidebar
├── hooks/
│   └── use-navigation.ts       # Navigation hook
├── app/                        # Main app sidebar
│   ├── app-sidebar.tsx
│   ├── content-layout.tsx      # Layout wrapper for content
│   ├── app-header.tsx
│   ├── app-footer.tsx
│   ├── app-menu-item.tsx
│   ├── app-menu-config.ts
│   └── app-mobile-nav.tsx
└── features/                   # Feature-specific sidebars
    ├── events/
    │   ├── event-sidebar-config.ts
    │   ├── event-sidebar-provider.tsx
    │   ├── event-menu-header.tsx
    │   └── event-menu-config.ts
    └── resources/
        ├── resource-sidebar-config.ts
        ├── resource-sidebar-provider.tsx
        ├── resource-menu-header.tsx
        └── resource-menu-config.ts
```

## Key Concepts

### Provider Pattern (Data Flow)
The orchestrator uses a nested provider structure to manage both the main application sidebar and feature-specific sidebars. Each feature provider wraps the inner sidebar context and content, enabling data sharing.

```tsx
// Conceptual view of sidebar-orchestrator.tsx
<SidebarProvider>            {/* Main App Sidebar Scope */}
  <AppSidebar />
  <SidebarInset>
    <FeatureProvider>        {/* Feature Data Scope */}
      <SidebarProvider>      {/* Feature Sidebar Scope */}
        <FeatureSidebar />
        <SidebarInset>
          <ContentLayout>
            {children}       {/* Page Content */}
          </ContentLayout>
        </SidebarInset>
      </SidebarProvider>
    </FeatureProvider>
  </SidebarInset>
</SidebarProvider>
```

### Using Context in Pages
Pages can access provider data via context hooks:

```tsx
// In a page component
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";

export default function EventPage() {
  const { currentEvent, permissions, isLoading } = useEventSidebarContext();
  // No need to fetch event data - it's already in context!
}
```

## Registry & Configuration

### Feature Registry (`registry/feature-sidebar-registry.ts`)
Maps URL patterns to feature configurations. The orchestrator checks this registry to determine if a feature sidebar should be shown.
- **Matcher**: Regex to match the current route.
- **Config**: The `FeatureConfig` object (provider, menu, header).

### No-Sidebar Routes (`registry/orchestrator-config.ts`)
Routes that should display **no sidebar** (e.g. full-screen layouts) are defined here. Matches can be exact starts (`start`) or partial includes (`include`).

## Adding a New Feature Sidebar

1. **Create feature directory**: `features/your-feature/`

2. **Create provider** (`your-feature-sidebar-provider.tsx`):
   - Fetch feature data
   - Provide context to children

3. **Create menu config** (`your-feature-menu-config.ts`):
   - Define menu items and groups
   - Add visibility rules

4. **Create header** (optional, `your-feature-menu-header.tsx`):
   - Feature-specific header component

5. **Create sidebar config** (`your-feature-sidebar-config.ts`):
   - Assemble provider, header, and menu

6. **Register in registry** (`registry/feature-sidebar-registry.ts`):
   ```typescript
   {
     matcher: /^\/your-route\/[^/]+/,
     config: yourFeatureSidebarConfig,
   }
   ```

## Context Data Available

### EventSidebarContext
- `eventId` - Event ID from URL
- `events` - All user events
- `currentEvent` - Current event object
- `permissions` - Event permissions
- `isLoading` - Loading state

### ResourceSidebarContext
- `permissions` - User permissions
- `resource` - Current resource (if on post route)
- `slug` - Resource slug from URL
- `isLoading` - Loading state
- `error` - Fetch error
