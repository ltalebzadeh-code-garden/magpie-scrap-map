# Magpie Frontend

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
