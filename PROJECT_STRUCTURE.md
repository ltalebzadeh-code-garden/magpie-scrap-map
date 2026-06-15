# Magpie Project Structure

## Root Directory

```
magpie/
├── frontend/               # SvelteKit frontend application
├── .git/                   # Git repository
├── PROJECT.md              # Project overview and requirements
├── FLOWS.md                # Product flows and user journeys
├── STEPS.md                # 15-day development plan
├── MEMORY.md               # Development progress log
├── CHANGELOG.md            # Version history and changes
├── PROJECT_STRUCTURE.md    # This file
└── README.md               # Project root README
```

## Frontend Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Header.svelte       # App header with title and status
│   │   │   └── Nav.svelte          # Main navigation component
│   │   ├── stores/
│   │   │   ├── online.ts           # Online/offline state store
│   │   │   └── index.ts            # Store exports
│   │   ├── types/
│   │   │   ├── resource.ts         # Resource type definitions
│   │   │   └── index.ts            # Type exports
│   │   ├── utils/
│   │   │   ├── categories.ts       # Category labels and lists
│   │   │   └── index.ts            # Utility exports
│   │   ├── offline/
│   │   │   └── README.md           # Placeholder for IndexedDB utilities
│   │   ├── index.ts                # Main lib exports
│   │   └── assets/
│   │       └── favicon.svg         # App favicon
│   ├── routes/
│   │   ├── map/                    # Map view route (future)
│   │   ├── list/
│   │   │   └── +page.svelte        # List view page
│   │   ├── add/
│   │   │   └── +page.svelte        # Add resource page
│   │   ├── offline/
│   │   │   └── +page.svelte        # Offline queue page
│   │   ├── +layout.svelte          # Root layout with header/nav
│   │   └── +page.svelte            # Home page (map view)
│   ├── app.html                    # HTML template
│   └── app.d.ts                    # App-level TypeScript definitions
├── static/                         # Static assets
├── node_modules/                   # Dependencies (gitignored)
├── .svelte-kit/                    # SvelteKit build artifacts (gitignored)
├── .eslintrc.cjs                   # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── .prettierignore                 # Prettier ignore patterns
├── .gitignore                      # Git ignore patterns
├── .env.example                    # Environment variables template
├── .env                            # Local environment (gitignored)
├── package.json                    # Project dependencies and scripts
├── package-lock.json               # Locked dependency versions
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
└── README.md                       # Frontend documentation
```

## Key Files

### Configuration
- `frontend/package.json` - Dependencies, scripts, project metadata
- `frontend/tsconfig.json` - TypeScript compiler options
- `frontend/vite.config.ts` - Vite build configuration
- `frontend/.eslintrc.cjs` - ESLint rules and parser config
- `frontend/.prettierrc` - Code formatting rules

### Type Definitions
- `frontend/src/lib/types/resource.ts` - Core resource data types
  - `Resource` interface
  - `ResourceSummary` interface
  - `ResourceStatus`, `ResourceCategory`, `LocationAccuracy` types

### Components
- `frontend/src/lib/components/Header.svelte` - App header with online indicator
- `frontend/src/lib/components/Nav.svelte` - Navigation tabs

### Routes (Pages)
- `frontend/src/routes/+page.svelte` - Map view (home)
- `frontend/src/routes/list/+page.svelte` - List view
- `frontend/src/routes/add/+page.svelte` - Add resource form
- `frontend/src/routes/offline/+page.svelte` - Offline queue

### Stores
- `frontend/src/lib/stores/online.ts` - Online/offline state detection

### Utilities
- `frontend/src/lib/utils/categories.ts` - Category labels and constants

## Development Status

### ✅ Completed
- Project initialization
- Folder structure
- Type definitions
- Basic routing
- App shell components
- Online/offline detection
- Placeholder pages

### 🚧 Next Steps
- Supabase client setup
- Database schema
- Backend connection
- Map integration (Leaflet)
- Data fetching and caching

## Build Outputs

- `frontend/.svelte-kit/` - Development build artifacts
- `frontend/build/` - Production build output (generated on `npm run build`)

## Ignored Files

Files excluded from version control:
- `node_modules/`
- `.svelte-kit/`
- `build/`
- `.env`
- `*.log`
- `.DS_Store`

## Scripts

Available npm commands in `frontend/`:
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format with Prettier
- `npm run format:check` - Check formatting
- `npm run check` - TypeScript type checking
- `npm run check:watch` - Watch mode type checking
