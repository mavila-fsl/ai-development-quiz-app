# AI Development Quiz App

A full-stack educational platform designed to help users test and reinforce their understanding of AI software development concepts including agent design, prompt engineering, and workflow automation.

## Features

### Core Functionality
- **Multiple Quiz Categories**: Agent Fundamentals, Prompt Engineering, and Model Selection & Context Management
- **Interactive Quiz Experience**: Multiple-choice questions with immediate feedback and detailed explanations
- **Progress Tracking**: Track scores, view history, and monitor performance across categories
- **Role-Based Access Control**: Two user roles with distinct permissions:
  - **Quiz Taker**: Take quizzes, view results, and track performance
  - **Quiz Manager**: Create/edit/delete quiz content, manage categories and questions
- **User Profiles**: Simple username-based accounts with persistent data
- **Responsive Design**: Beautiful, mobile-friendly interface built with TailwindCSS
- **AI-Enhanced Learning**: Optional Claude AI integration for personalized recommendations and enhanced explanations

### Technical Highlights
- **Full-Stack TypeScript**: Type-safe across frontend, backend, and shared types
- **Modern Tech Stack**: React, Express.js, Prisma ORM, SQLite
- **Monorepo Architecture**: Clean separation of concerns with shared types
- **RESTful API**: Well-structured API with validation and error handling
- **Extensible Design**: Easy to add new quizzes, categories, and features

## Project Structure

```
ai-quiz-app/
├── client/                 # React frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── context/       # React context (User management)
│   │   └── App.tsx        # Main app with routing
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Database, environment config
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Validation, error handling
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic (AI service)
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Database seeding
│   └── package.json
│
├── shared/                # Shared TypeScript types
│   ├── src/
│   │   ├── types.ts       # Common interfaces
│   │   └── constants.ts   # Shared constants
│   └── package.json
│
└── package.json           # Root workspace config
```

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Anthropic API Key** (optional): For AI-enhanced features

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for all workspaces (root, client, server, shared).

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# Anthropic Claude API (optional)
ANTHROPIC_API_KEY=your_api_key_here

# CORS
CLIENT_URL=http://localhost:5173
```

**Note**: The app works without an API key, but AI-enhanced features will be disabled.

### 3. Initialize Database

```bash
npm run db:migrate
npm run db:seed
```

This creates the SQLite database and seeds it with:
- 3 quiz categories
- 3 quizzes with 5 questions each
- 2 demo users with different roles (see [User Roles](#user-roles) below)

### 4. Start Development Servers

```bash
npm run dev
```

This starts both the backend and frontend servers concurrently:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## Available Scripts

### Root Level
- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server for production
- `npm run setup` - Install dependencies, migrate DB, and seed data
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:seed` - Seed the database with initial data
- `npm run db:studio` - Open Prisma Studio (database GUI)

### Client (Frontend)
```bash
cd client
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Server (Backend)
```bash
cd server
npm run dev      # Start with hot reload (tsx watch)
npm run build    # Compile TypeScript
npm start        # Run compiled server
```

## User Roles

The app implements role-based access control (RBAC) with two roles:

### Quiz Taker (Default)
- Browse quiz categories
- Take quizzes and submit answers
- View quiz results and explanations
- Track personal statistics and performance
- Cannot create or edit quiz content

### Quiz Manager
- All Quiz Taker permissions, plus:
- Create, edit, and delete quiz categories
- Create, edit, and delete quizzes
- Manage quiz questions and answer options
- Access quiz management dashboard

**Demo Users**:
| Username | Role | Password |
|----------|------|----------|
| `demo_user` | Quiz Taker | `TestPass123!` |
| `quiz_manager` | Quiz Manager | `TestPass123!` |

## API Documentation

### Base URL
`http://localhost:3001/api`

### Endpoints

#### Users (Public)
- `POST /api/users` - Create a new user (default role: Quiz Taker)
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/stats` - Get user statistics

#### Categories
- `GET /api/categories` - Get all categories (Authenticated)
- `GET /api/categories/:id` - Get category details (Authenticated)
- `POST /api/categories` - Create category (Quiz Manager only)
- `PUT /api/categories/:id` - Update category (Quiz Manager only)
- `DELETE /api/categories/:id` - Delete category (Quiz Manager only)

#### Quizzes
- `GET /api/quizzes` - Get all quizzes (Authenticated)
- `GET /api/quizzes/:id` - Get quiz details (Authenticated)
- `GET /api/quizzes/:id/questions` - Get quiz questions (Authenticated)
- `POST /api/quizzes` - Create quiz (Quiz Manager only)
- `PUT /api/quizzes/:id` - Update quiz (Quiz Manager only)
- `DELETE /api/quizzes/:id` - Delete quiz (Quiz Manager only)

#### Questions (Quiz Manager only)
- `GET /api/questions` - Get questions with answers
- `GET /api/questions/:id` - Get question details
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

#### Quiz Attempts
- `POST /api/attempts/start` - Start quiz attempt (Authenticated)
- `POST /api/attempts/complete` - Submit answers (Authenticated)
- `GET /api/attempts/:id` - Get attempt results (Authenticated)
- `GET /api/attempts/user/:userId` - Get user's attempts (Authenticated)

#### AI Features
- `POST /api/ai/recommendation` - Get recommendations (Authenticated)
- `POST /api/ai/enhance-explanation` - Get enhanced explanation (Authenticated)

## Database Schema

### Models
- **User**: User accounts
- **QuizCategory**: Quiz categories (Agent Fundamentals, Prompt Engineering, etc.)
- **Quiz**: Individual quizzes within categories
- **Question**: Quiz questions with multiple choice options
- **QuizAttempt**: User quiz attempts with scores
- **Answer**: Individual answers within an attempt

### Relationships
- QuizCategory → Quiz (one-to-many)
- Quiz → Question (one-to-many)
- User → QuizAttempt (one-to-many)
- QuizAttempt → Answer (one-to-many)

## Features in Detail

### Quiz Taking Flow
1. User creates an account with a username
2. Browse quiz categories on the home page
3. Select a category to view available quizzes
4. Start a quiz (creates a quiz attempt)
5. Answer questions with immediate navigation
6. Submit quiz to see results
7. Review answers with explanations

### Dashboard
- Overview of total attempts and quizzes taken
- Average and best scores
- Performance breakdown by category
- Recent quiz attempt history
- Quick access to retake quizzes

### AI Integration (Optional)
When configured with an Anthropic API key:
- **Personalized Recommendations**: AI analyzes performance and suggests study topics
- **Enhanced Explanations**: Get more detailed, personalized explanations for incorrect answers
- Uses Claude Sonnet for recommendations and Haiku for explanations (cost-optimized)

## Extending the App

### Adding New Quizzes

#### Option 1: Using Prisma Studio
```bash
npm run db:studio
```
Navigate to http://localhost:5555 and add data through the GUI.

#### Option 2: Programmatically
Edit `server/prisma/seed.ts` and add new quiz data, then:
```bash
npm run db:seed
```

#### Option 3: Via API
Use the database directly or create admin endpoints (not included in v1).

### Adding New Features

The app is structured for easy extension:

1. **Shared Types**: Add new types in `shared/src/types.ts`
2. **Backend**: Create new controllers, routes, and services in `server/src/`
3. **Frontend**: Add new pages and components in `client/src/`

### Example: Adding a "Favorite Quizzes" Feature

1. Update Prisma schema:
```prisma
model User {
  // ... existing fields
  favoriteQuizzes Quiz[] @relation("UserFavorites")
}
```

2. Add API endpoints in `server/src/routes/`
3. Create frontend UI in `client/src/components/`
4. Update shared types in `shared/src/types.ts`

## Deployment

### Frontend (Vite/React)
Build the client:
```bash
cd client
npm run build
```
Deploy the `dist/` folder to any static hosting (Vercel, Netlify, etc.)

### Backend (Express)
Build the server:
```bash
cd server
npm run build
```
Deploy to any Node.js hosting (Heroku, Railway, Render, etc.)

### Environment Variables for Production
Ensure you set:
- `NODE_ENV=production`
- `DATABASE_URL` (consider PostgreSQL for production)
- `CLIENT_URL` (your frontend URL)
- `ANTHROPIC_API_KEY` (if using AI features)

## Tech Stack

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client

### Backend
- **Node.js**: Runtime
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **Prisma**: ORM and database toolkit
- **SQLite**: Database (development)
- **express-validator**: Request validation
- **Anthropic SDK**: Claude AI integration

### Development Tools
- **tsx**: TypeScript execution
- **concurrently**: Run multiple commands
- **Morgan**: HTTP request logger
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing

## Best Practices Implemented

1. **Type Safety**: Full TypeScript coverage with shared types
2. **Error Handling**: Centralized error handling with custom error classes
3. **Validation**: Input validation on both client and server
4. **Security**: Helmet for security headers, CORS configuration
5. **Code Organization**: Clear separation of concerns (MVC pattern)
6. **API Design**: RESTful endpoints with consistent response format
7. **Database Design**: Proper relationships and constraints
8. **User Experience**: Loading states, animations, responsive design
9. **Accessibility**: ARIA labels, keyboard navigation
10. **Extensibility**: Modular architecture for easy feature additions

## Troubleshooting

### Database Issues
```bash
# Reset database
rm server/prisma/dev.db
npm run db:migrate
npm run db:seed
```

### Port Already in Use
Change ports in `.env` and `client/vite.config.ts`

### TypeScript Errors
```bash
# Regenerate Prisma client
cd server
npx prisma generate
```

### API Not Connecting
1. Verify backend is running on port 3001
2. Check CORS settings in `server/src/index.ts`
3. Verify proxy settings in `client/vite.config.ts`

## Contributing

This is a demonstration project built to showcase full-stack development best practices. Feel free to:
- Fork and modify for your own use
- Add new quiz categories and questions
- Extend with additional features
- Use as a learning resource

## License

MIT License - feel free to use this project for learning or as a foundation for your own applications.

## Acknowledgments

- Quiz content focuses on AI development fundamentals
- Built with modern web development best practices
- Designed for educational purposes and easy extension
