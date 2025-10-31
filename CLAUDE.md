# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Guidelines

**DO NOT start or restart the application by yourself unless explicitly requested.** You are not required to check whether the front-end and back-end are currently running. **DO NOT terminate or kill any process unless absolutely necessary.** If such a situation arises, ask for approval first before proceeding.

### Multi-Agent System
All project work is managed by subagents defined in `agents.prompt`.

Whenever a task is requested:
1. Claude Code decides which subagent to delegate to.
2. That subagent operates only in its own scope.
3. No task is executed directly by the orchestrator.

Refer to `agents.prompt` for delegation logic.

### /prompts/ Folder Policy

All new implementation or bug-fix tasks must be defined as `.prompt.md` files inside `/prompts/`.

Claude Code reads these feature prompts as executable blueprints.

Each feature prompt:
- Declares its goal, affected domains, and involved agents
- Must follow delegation rules from `agents.prompt`
- After successful completion, structure the outputs in the `/features/` directory as `.md` files.

## Project Overview

AI Development Quiz App - A full-stack TypeScript educational platform for testing knowledge of AI software development concepts (agent design, prompt engineering, model selection). Built as a monorepo with React frontend, Express backend, and Prisma ORM.

## Development Commands

### Setup and Installation
```bash
npm install                # Install all workspace dependencies
npm run setup             # Full setup: install deps + migrate + seed
npm run db:migrate        # Run Prisma migrations
npm run db:seed           # Seed database with quiz content
npm run db:studio         # Open Prisma Studio GUI at localhost:5555
```

### Development
```bash
npm run dev               # Start both client (5173) and server (3001) concurrently
npm run dev:client        # Start only frontend dev server
npm run dev:server        # Start only backend dev server with hot reload
npm run build             # Build both client and server for production
```

### Working with Individual Workspaces
```bash
cd client && npm run dev              # Frontend only
cd server && npm run dev              # Backend only with tsx watch
```

### Database Operations (from root)
```bash
npm run db:migrate                    # Run Prisma migrations
npm run db:seed                       # Seed database with quiz content
npm run db:generate                   # Regenerate Prisma client after schema changes
npm run db:studio                     # Open Prisma Studio for database management
```

## Architecture

### Monorepo Structure
Four npm workspaces managed from root:
- **shared/** - Shared TypeScript types and constants used by all workspaces
- **client/** - React frontend (Vite + TailwindCSS + React Router)
- **database/** - Database layer with Prisma ORM and SQLite (separate from server)
- **server/** - Express backend (TypeScript, imports database from @ai-quiz-app/database)

**Database Workspace:** The database layer is now a separate workspace to provide clear separation of concerns between database engineering and backend engineering. This allows:
- Database migrations and schema changes to be managed independently
- Prisma types to be centrally generated and shared
- Server to depend on `@ai-quiz-app/database` package for all data access
- Scripts like `npm run db:migrate`, `npm run db:seed`, and `npm run db:studio` to be executed from root

### Database Architecture (Prisma)
Located in `database/prisma/schema.prisma`:

**Core Models:**
- `User` - User accounts with bcrypt-hashed passwords and JWT authentication
- `QuizCategory` - High-level categories (Agent Fundamentals, Prompt Engineering, etc.)
- `Quiz` - Individual quizzes with difficulty levels
- `Question` - Multiple choice questions with JSON-stored options
- `QuizAttempt` - User's quiz sessions with scores
- `Answer` - Individual responses within an attempt

**Key Relationships:**
- QuizCategory → Quiz (one-to-many, cascade delete)
- Quiz → Question (one-to-many, cascade delete)
- User → QuizAttempt (one-to-many, cascade delete)
- QuizAttempt → Answer (one-to-many, cascade delete)
- Question → Answer (one-to-many, cascade delete)

**Important Details:**
- Question.options stored as JSON string, parsed to QuestionOption[] in controllers
- QuizAttempt tracks both score (count) and percentage (float)
- All models use UUID primary keys
- Database URL configured via .env (defaults to SQLite file:./dev.db)

### Backend Architecture (MVC Pattern)

**Entry Point:** `server/src/index.ts`
- Express app with helmet, CORS, morgan logging
- Health check at `/health`
- All API routes mounted at `/api`
- Centralized error handling via errorHandler middleware

**Routing Structure:** `server/src/routes/index.ts`
- `/api/users` - User creation and stats
- `/api/categories` - Quiz categories listing
- `/api/quizzes` - Quiz management and questions
- `/api/attempts` - Quiz attempt lifecycle (start, complete, retrieve)
- `/api/ai` - AI-enhanced features (recommendations, explanations)

**Controllers:** Handle request/response logic, import Prisma from @ai-quiz-app/database
- Located in `server/src/controllers/`
- Validation using express-validator middleware
- Return ApiResponse<T> format from shared types
- Questions parsed from JSON storage format before sending to client
- Database access via: `import { prisma } from '@ai-quiz-app/database'`

**AI Service:** `server/src/services/aiService.ts`
- Optional integration with Anthropic Claude API
- Uses claude-3-5-sonnet-20241022 for recommendations
- Uses claude-3-5-haiku-20241022 for explanation enhancements
- Gracefully falls back if ANTHROPIC_API_KEY not configured
- Cost-optimized: faster/cheaper model for simpler explanation tasks

### Frontend Architecture

**Entry:** `client/src/main.tsx` → `App.tsx` (React Router)

**Routing:**
- `/` - HomePage (category selection)
- `/category/:id` - CategoryPage (quiz list for category)
- `/quiz/:id` - QuizPage (interactive quiz experience)
- `/results/:attemptId` - ResultsPage (scored results with explanations)
- `/dashboard` - DashboardPage (user stats and history)

**State Management:**
- UserContext (`client/src/context/UserContext.tsx`) - Global user state
- Local component state for quiz flow
- No Redux/Zustand - Context API sufficient for app size

**API Client:** `client/src/services/api.ts`
- Axios instance with base URL from env
- Typed methods matching backend endpoints
- Returns typed ApiResponse<T> objects

**Components:** `client/src/components/`
- Reusable UI components (Button, Card, ProgressBar, Badge, Loading, Layout)
- TailwindCSS for styling
- Mobile-responsive design

### Type Safety

**Shared Types:** `shared/src/types.ts` - Single source of truth
- Domain models (User, Quiz, Question, QuizAttempt, Answer)
- DTOs (CreateUserDto, SubmitAnswerDto, etc.)
- API response wrappers (ApiResponse<T>, PaginatedResponse<T>)
- UI types (QuizResult, UserStats, CategoryPerformance)
- AI types (AIRecommendation, AIEnhancedExplanation)

All interfaces used consistently across client and server.

## Configuration

### Environment Variables
Root `.env` file (see `.env.example`):
```
PORT=3001                              # Backend server port
NODE_ENV=development                   # Environment mode
DATABASE_URL="file:./dev.db"          # SQLite database path
ANTHROPIC_API_KEY=sk-...              # Optional: Claude AI features
CLIENT_URL=http://localhost:5173      # Frontend URL for CORS
```

### CORS Setup
Server allows requests from CLIENT_URL (default: http://localhost:5173)
Vite proxy configured in `client/vite.config.ts` to proxy `/api` to port 3001

## Key Patterns and Conventions

### Formats validation
- The username must be an alphanumeric string between 4 and 40 characters long and cannot contain spaces or special characters, except for the following: [@-_.]

### Quiz Flow
1. User creates account (POST /api/users)
2. Fetches categories (GET /api/categories)
3. Selects quiz (GET /api/quizzes/:id/questions)
4. Starts attempt (POST /api/attempts/start) - returns attemptId
5. Submits answers (POST /api/attempts/complete) - calculates score
6. Views results (GET /api/attempts/:id) - includes detailed feedback

### Question Format
Questions stored with JSON string options in database:
```typescript
// In DB: options = '[{"id":"a","text":"..."},{"id":"b","text":"..."}]'
// Parsed to: QuestionOption[] = [{id: "a", text: "..."}, ...]
```
Parse/stringify happens in controllers when moving between DB and API.

### Error Handling
- Custom error classes extend Error
- errorHandler middleware in `server/src/middleware/errorHandler.ts`
- Returns consistent JSON error format
- Development mode includes stack traces

### Adding New Quiz Content

**Option 1: Seed file (recommended for bulk)**
Edit `database/prisma/seed.ts` and run `npm run db:seed`

**Option 2: Prisma Studio GUI**
Run `npm run db:studio` and add via browser interface at localhost:5555

**Option 3: Database migrations**
Update `database/prisma/schema.prisma` then run `npm run db:migrate`

## Common Tasks

### Reset Database
```bash
rm database/prisma/dev.db
npm run db:migrate
npm run db:seed
```

### Add New API Endpoint
1. Define DTO in `shared/src/types.ts`
2. Create controller in `server/src/controllers/`
3. Add validation middleware
4. Register route in `server/src/routes/`
5. Import route in `server/src/routes/index.ts`
6. Add client method in `client/src/services/api.ts`

### Add New Page
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Link from existing pages with React Router Link

### Update Prisma Schema
1. Edit `database/prisma/schema.prisma`
2. Run `npm run db:migrate` (creates migration)
3. Run `npm run db:generate` (updates Prisma client)
4. Update types in `shared/src/types.ts` to match
5. Update seed file if needed

## Security

**IMPORTANT**: See [SECURITY.md](./SECURITY.md) for comprehensive security documentation.

### Key Security Features

- **Password Security**: bcrypt hashing with 12 salt rounds
- **Transport Security**: HTTPS enforcement in production with HSTS headers
- **Authentication**: JWT tokens in HTTP-only secure cookies
- **Attack Prevention**: Timing-safe comparisons, SQL injection protection, XSS/CSRF protection
- **Security Headers**: Helmet middleware with enhanced CSP and HSTS configuration

### Password Transmission

Passwords are securely transmitted using industry-standard practices:

- **Development (HTTP)**: Passwords visible in network tools - expected behavior for local dev
- **Production (HTTPS)**: All traffic encrypted via TLS/SSL - passwords not visible
- **Server-side**: Passwords immediately hashed with bcrypt before storage
- **Never stored in plain text**: Only bcrypt hashes stored in database

### Production Security Requirements

1. **HTTPS is mandatory** - Application automatically redirects HTTP to HTTPS
2. **Environment variables** - Set `NODE_ENV=production` to enable security features
3. **Reverse proxy** - Configure nginx/Apache to terminate TLS and set `X-Forwarded-Proto` header
4. **Strong JWT secret** - Minimum 32 characters, randomly generated
5. **Security headers** - HSTS, CSP, and other headers automatically configured via Helmet

## Production Considerations

- Switch DATABASE_URL to PostgreSQL for production deployment
- **Set NODE_ENV=production** (enables HTTPS enforcement, secure cookies, HSTS)
- **Use HTTPS with valid TLS/SSL certificate** (required for security)
- Generate strong JWT_SECRET (minimum 32 characters)
- Build all workspaces: `npm run build`
- Database migrations should be run before server deployment: `npm run db:migrate`
- Frontend build output: `client/dist/`
- Backend compiled output: `server/dist/`
- Database build output: `database/dist/`
- Consider using a process manager (PM2) for the Node server
- Deploy frontend static files to CDN/static host (Vercel, Netlify)
- Deploy backend to Node hosting (Heroku, Railway, Render)
- Configure reverse proxy (nginx) for TLS termination
