# HackHeroes 2025 - Frontend
Modern Next.js web application for GenLink volunteer platform connecting seniors with digital assistance.

## 🚀 Features
✅ Next.js 14 with App Router  
✅ TypeScript for type safety  
✅ HeroUI component library  
✅ Tailwind CSS for styling  
✅ JWT-based authentication  
✅ Form validation and data persistence  
✅ Responsive design (mobile-first)  
✅ Real-time volunteer status  
✅ Interactive report management  
✅ Auto-capitalization and input formatting  
✅ Dynamic ETA calculation from backend metrics  

## 📁 Project Structure
```
frontend/
├── app/
│   ├── (auth)/                     # Auth layout group
│   ├── appviews/                   # Simplified app views
│   │   ├── pomoc/                  # Help request form
│   │   └── potwierdzenie/          # Confirmation page
│   ├── baza-wiedzy/                # Knowledge base
│   ├── panel/                      # transfer to the volunteer panel
│   ├── pomoc/                      # Public help form
│   ├── potwierdzenie/              # Public confirmation
│   ├── wolontariusz/               # Volunteer area
│   │   ├── login/                  # Volunteer login
│   │   ├── panel/                  # Volunteer dashboard
│   │   ├── rejestracja/            # Volunteer registration
│   │   ├── ustawienia/             # Account settings
│   │   ├── zgloszenia/             # Available reports
│   │   └── zgloszenie/[id]/        # Report details
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Homepage
│   ├── loading.tsx                 # Global loading UI
│   ├── error.tsx                   # Global error boundary
│   └── not-found.tsx               # 404 page
├── components/
│   ├── auth/
│   │   └── auth-provider.tsx       # Authentication context
│   ├── appviews/                   # Component variations
│   │   ├── navbar.tsx              # Simplified navbar
│   │   ├── pomoc/
│   │   │   └── HelpForm.tsx        # Help request form
│   │   └── potwierdzenie/
│   │       └── ConfirmationContent.tsx
│   ├── navbar.tsx                  # Main navigation
│   ├── navigation-loader.tsx       # Loading overlay
│   ├── theme-switch.tsx            # Dark/light theme
│   ├── icons.tsx                   # SVG icon components
│   └── primitives.ts               # Shared component logic
├── config/
│   ├── api.ts                      # API client configuration
│   ├── fonts.ts                    # Font configurations
│   ├── report-groups.ts            # Report categorization
│   └── site.ts                     # Site-wide settings
├── data/
│   └── guides.ts                   # Knowledge base content
├── hooks/
│   ├── use-report-types.ts         # Report categories hook
│   ├── use-require-auth.ts         # Authentication guard
│   └── use-require-no-active-report.ts
├── lib/
│   ├── api.ts                      # API client methods
│   ├── api-error.ts                # Error handling
│   └── auth-storage.ts             # Token management
├── public/                         # Static assets
├── styles/
│   └── globals.css                 # Global styles
├── types/
│   └── index.ts                    # TypeScript definitions
├── .env.local                      # Environment variables (not in git)
├── .env.example                    # Example environment variables
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🔧 Setup

### 1. Navigate to frontend directory
```bash
cd frontend/GenLink\ Web\ App
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment variables
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and set your API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### 4. Run development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 5. Build for production
```bash
npm run build
npm run start
```

## 🌐 Application Routes

### 📱 Public Pages
- `/` - Homepage with platform overview and volunteer CTAs
- `/pomoc` - Help request form for seniors
- `/potwierdzenie` - Confirmation page after submitting help request
- `/baza-wiedzy` - Knowledge base with digital literacy guides
- `/baza-wiedzy/[guideId]` - Individual guide pages

### 👥 Volunteer Area (`/wolontariusz`)
- `/wolontariusz/login` - Volunteer authentication
- `/wolontariusz/rejestracja` - Volunteer registration
- `/wolontariusz/panel` - Volunteer dashboard with active reports
- `/wolontariusz/zgloszenia` - Browse available help requests
- `/wolontariusz/zgloszenie/[id]` - Detailed view of specific report
- `/wolontariusz/ustawienia` - Account settings and availability

### 🔧 Admin Panel (`/panel`)
- `/panel/[...slug]` - Dynamic admin interface (catch-all route)

### 📋 Simplified Views (`/appviews`)
- `/appviews/pomoc` - Streamlined help form
- `/appviews/potwierdzenie` - Streamlined confirmation

## 🎨 UI Components

### Core Libraries
- **HeroUI**: Modern React component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Key Components
- `<HelpForm>` - Multi-step help request form with validation
- `<Navbar>` - Responsive navigation with authentication states
- `<AuthProvider>` - Global authentication context
- `<NavigationLoader>` - Page transition loading overlay

### Form Features
- Auto-capitalization (names, cities, addresses)
- Phone number formatting (XXX-XXX-XXX)
- Real-time validation
- Data persistence ("Remember me" functionality)
- Dynamic ETA from backend metrics

## 🔐 Authentication Flow

### Volunteer Registration
1. Navigate to `/wolontariusz/rejestracja`
2. Fill out personal details and availability
3. Submit form → Account created
4. Redirect to success page with login link

### Volunteer Login
1. Navigate to `/wolontariusz/login`
2. Enter email and password
3. Receive JWT token → Stored in localStorage
4. Redirect to volunteer dashboard

### Protected Routes
- All `/wolontariusz/*` routes (except login/registration) require authentication
- `useRequireAuth` hook automatically redirects to login
- `useRequireNoActiveReport` ensures volunteers can't take multiple reports

## 📊 Data Management

### API Integration
```typescript
// Example API usage
import { api } from '@/lib/api';

// Submit help request
const report = await api.reports.create({
  full_name: "Anna Kowalski",
  phone: "123456789",
  problem: "Computer setup help",
  // ... other fields
});

// Volunteer accepts report
await api.reports.accept(reportId);

// Get volunteer statistics
const stats = await api.reports.stats();
```

### State Management
- React Context for authentication
- Local state with hooks for form data
- localStorage for form persistence and auth tokens

## 🎯 Key Features

### For Seniors
- **Simple Help Form**: Intuitive interface for requesting digital assistance
- **Real-time Volunteer Count**: Shows how many volunteers are currently active
- **Confirmation with ETA**: Dynamic response time based on actual backend metrics
- **Form Memory**: Saves personal details (excludes problem specifics for privacy)

### For Volunteers
- **Dashboard**: Overview of active reports and volunteer statistics
- **Report Browser**: Filter and search available help requests
- **Report Management**: Accept, cancel, or complete assigned reports
- **Availability Settings**: Configure when you're available to help
- **GenPoints System**: Track contribution points (+10 per completed report)

### Technical Highlights
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error boundaries and API error management
- **Performance**: Next.js optimization with static generation where possible
- **Accessibility**: ARIA labels and keyboard navigation support

## 🔧 Development

### Useful Commands
```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build production
npm run build

# Production server
npm run start
```


## 🤝 Integration with Backend
This frontend communicates with the HackHeroes 2025 FastAPI backend. Make sure to:

1. Start the backend server first
2. Configure `NEXT_PUBLIC_API_BASE_URL` to point to your backend
3. Ensure CORS is properly configured on the backend

---

**HackHeroes 2025 Project** - Connecting seniors with digital volunteers through modern web technology.
