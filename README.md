# Smart Work Sequencer - Frontend

A React TypeScript frontend for the Smart Work Sequencer application - automatically track and summarize developer work by correlating GitHub and Jira activity.

## Features

- 🔐 **OAuth Authentication** - Secure login with GitHub and Jira integration
- 📊 **Dashboard** - AI-powered work summaries and statistics
- 📅 **Timeline View** - Chronological view of commits with filtering
- 📝 **Weekly Reports** - Generate and download work reports
- ⚠️ **Hygiene Alerts** - Track and resolve workflow issues
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on http://localhost:8000

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-work-sequencer-frontend.git
cd smart-work-sequencer-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
VITE_API_URL=http://localhost:8000/api
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── CommitCard.tsx
│   ├── DateRangePicker.tsx
│   ├── HygieneAlert.tsx
│   ├── Layout.tsx
│   ├── LoadingSpinner.tsx
│   ├── StatCard.tsx
│   └── TicketCard.tsx
├── contexts/          # React contexts
│   └── AuthContext.tsx
├── lib/              # Utilities and API client
│   ├── api.ts
│   └── utils.ts
├── pages/            # Page components
│   ├── DashboardPage.tsx
│   ├── HygienePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ReportsPage.tsx
│   ├── SettingsPage.tsx
│   └── TimelinePage.tsx
├── App.tsx           # Root component with routing
├── index.css         # Global styles + Tailwind
└── main.tsx          # Entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |

## Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the build command: `npm run build`
3. Set the output directory: `dist`
4. Add environment variables:
   - `VITE_API_URL`: Your production API URL

## OAuth Flow

The app handles OAuth callbacks for:
- GitHub: `/settings?github=connected`
- Jira: `/settings?jira=connected`

Make sure your OAuth apps are configured with the correct redirect URIs.

## Design System

The app uses a custom design system with:
- **Primary color**: Sky blue (#0ea5e9)
- **Accent color**: Fuchsia (#d946ef)
- **Dark theme**: Slate scale (#0f172a - #f8fafc)
- **Font**: Outfit (sans-serif), JetBrains Mono (monospace)

## License

MIT
