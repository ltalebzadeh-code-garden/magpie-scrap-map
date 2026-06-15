# Magpie Frontend

Magpie is a hyper-local, peer-to-peer resource map for post-crisis recovery. This is the frontend application built with SvelteKit and TypeScript.

## Tech Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: Minimal local CSS
- **State Management**: Svelte stores
- **Map**: Leaflet (to be integrated)
- **Offline Storage**: IndexedDB with Dexie.js (to be integrated)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:
```
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Other Commands

- **Build**: `npm run build` - Create production build
- **Preview**: `npm run preview` - Preview production build
- **Lint**: `npm run lint` - Check code quality
- **Lint Fix**: `npm run lint:fix` - Fix linting issues
- **Format**: `npm run format` - Format code with Prettier
- **Type Check**: `npm run check` - Run TypeScript type checking

## Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable Svelte components
│   │   ├── stores/         # Svelte stores for state management
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── offline/        # Offline/IndexedDB utilities (pending)
│   ├── routes/             # SvelteKit file-based routes
│   │   ├── map/            # Map view (home)
│   │   ├── list/           # List view
│   │   ├── add/            # Add resource form
│   │   └── offline/        # Offline queue management
│   ├── app.html            # HTML template
│   └── app.d.ts            # TypeScript definitions
├── static/                 # Static assets
├── .env.example            # Environment variables template
└── package.json
```

## Features Status

### ✅ Completed (Day 1)
- SvelteKit project initialization
- TypeScript configuration
- ESLint and Prettier setup
- Folder structure
- App shell with navigation
- Placeholder pages
- Online/offline indicator

### 🚧 In Progress
- Backend connection (Day 3)
- Map integration (Day 4-5)
- List view with filters (Day 6)
- Add resource form (Day 7)
- Offline support (Day 8-9)

### 📋 Planned
- Resource detail view
- PWA configuration
- Image upload and compression
- Cached browsing
- Share functionality

## MVP Timeline

This project follows a 15-day MVP development plan. See `STEPS.md` in the project root for the full development roadmap.

## Contributing

This is an MVP project following a tight development schedule. Focus on core functionality over polish.

## License

TBD
