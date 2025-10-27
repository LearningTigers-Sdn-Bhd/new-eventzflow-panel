# EventzFlow Panel

Modern event management panel built with Next.js 16 and React 19, featuring real-time QR code scanning, comprehensive state management, and seamless REST API integration.

## Tech Stack

- **Framework**: Next.js 16 (React 19.2.0)
- **Runtime**: Bun runtime & package manager
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (with React Query Devtools)
- **Forms**: TanStack React Form
- **HTTP Client**: ky
- **UI**: Radix UI + Tailwind CSS 4 + shadcn/ui components
- **QR Codes**: html5-qrcode, react-qr-code
- **Validation**: Zod
- **Code Quality**: Biome (linter & formatter)
- **Utilities**: date-fns, Recharts, Sonner (toast), next-themes

## Prerequisites

This project uses **Bun** as the package manager and runtime. Make sure you have Bun installed on your system.

**Note**: Do NOT use npm, yarn, or pnpm. This project is configured specifically for Bun.

## Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://api.yourbackend.com
```

## Development

Run the development server on port 3001:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the application.

### Other Essential Commands

```bash
# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format

# Check code
bun run check

# Fix code issues
bun run check:fix
```

## Project Structure

```
src/
├── app/                 # Next.js App Router (file-based routing)
│   ├── (auth)/         # Authenticated route group
│   ├── (public)/       # Public route group
│   └── layout.tsx      # Root layout
├── components/         # Reusable React components
│   ├── ui/             # shadcn/ui components
│   ├── pages/          # Page sections (NOT routes)
│   └── providers/      # Context providers
├── hooks/              # Custom React hooks
│   ├── use-auth.ts     # Authentication state
│   ├── use-scanner.ts  # QR code scanning
│   └── use-hydrated-store.ts
├── lib/
│   └── api/            # API modules (auth, event, ticket, etc.)
│       └── {module}/   # Each API module follows consistent pattern
│           ├── request.ts   # Request schemas
│           ├── response downloads.
ts   # Response types
│           ├── endpoints.ts # API endpoint functions
│           └── index.ts     # Public exports
├── stores/             # Zustand state stores
│   ├── new-auth-store.ts
│   └── dialog-store.ts
├── services/           # Service utilities
│   └── refresh-queue.ts
└── utils/              # Utility functions
    ├── rest-api.ts
    └── error-handler.ts
```

## Key Features

### Event Management
- **Dashboard** - Comprehensive overview of all events with statistics (total events, tickets, revenue, check-ins, locations)
- **Event Analytics** - Detailed analytics and insights for individual events with charts and performance metrics
- **Event Details** - Manage event locations, staff assignments, and configurations
- **Multi-Event Support** - Switch between different events seamlessly

### Ticket Management
- **Create & Edit Tickets** - Full CRUD operations for event tickets
- **Ticket Types** - Support for various ticket types with different pricing and configurations
- **QR Code Generation** - Generate unique QR codes for each ticket
- **Pending Tickets** - Manage pending ticket transactions and approvals
- **Ticket Scanned Logs** - Comprehensive logs of all scanned tickets with search and filtering

### QR Code Scanning
- **Real-time Scanning** - Instant ticket validation using device camera
- **Duplicate Detection** - Prevents multiple check-ins for the same ticket
- **Offline Support** - Store scanned tickets locally with sync capability
- **Activity Feed** - Real-time display of all scanned tickets with search and filter options
- **Export Functionality** - Export scan results to CSV format
- **Audio Feedback** - Visual and audio notifications for successful/duplicate scans

### Analytics & Reporting
- **Dashboard Statistics** - Track total events, active events, tickets, revenue, check-ins, and locations
- **Event Performance** - Monitor individual event metrics and attendee data
- **Charts & Visualizations** - Interactive charts powered by Recharts for data visualization

### Team & Credits Management
- **Team Management** - Manage team members and staff assignments
- **Credits System** - Track and manage platform credits
- **User Settings** - Customize user preferences and profile settings

### Technical Features
- **Authentication** - Token-based auth with automatic refresh and secure session management
- **REST API Integration** - Modular API structure with type-safe TypeScript calls
- **State Management** - Zustand stores with persistence + TanStack Query for server state
- **Form Management** - TanStack React Form for complex form handling with validation
- **Code Quality** - Biome for linting and formatting with consistent code style

## Documentation

Comprehensive documentation is available in the `./docs/` directory:

- [REST API Integration](./docs/rest-api-integration.md) - API module structure and patterns
- [REST API Client](./docs/rest-api-client.md) - HTTP client implementation details
- [User Session Hydration](./docs/user-session-hydration-strats.md) - Authentication strategies
- [Refresh Queue Strategy](./docs/refresh-queue-strategy.md) - Token refresh implementation
- [Scan Features](./docs/features/scan/) - QR code scanning documentation

## Contributing

1. Create a new branch
2. Make your changes
3. Run linting and formatting: `bun run check:fix`
4. Submit a pull request

## License

LearningTigers MY - All rights reserved
