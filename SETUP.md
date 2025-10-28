# Quick Setup Guide

Follow these steps to get the AI Development Quiz App running on your machine.

## Step 1: Install Dependencies

```bash
npm install
```

This installs all dependencies for the entire monorepo (client, server, and shared packages).

## Step 2: Configure Environment (Optional)

The `.env` file has been created with default settings. If you want to use AI-enhanced features:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Open `.env` and add your key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

**Note**: The app works perfectly fine without an API key. AI features will gracefully fall back to standard functionality.

## Step 3: Set Up Database

```bash
npm run db:migrate
npm run db:seed
```

This creates your SQLite database and populates it with:
- 3 quiz categories (Agent Fundamentals, Prompt Engineering, Model Selection)
- 3 quizzes with 5 questions each (15 total questions)
- 1 demo user

## Step 4: Start the Application

```bash
npm run dev
```

This starts both servers:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## Step 5: Use the App

1. Open your browser to http://localhost:5173
2. Create a username on the welcome page
3. Browse quiz categories
4. Take a quiz and see your results
5. Check your dashboard for performance stats

## Useful Commands

- `npm run db:studio` - Open Prisma Studio to view/edit database
- `npm run dev:client` - Run only the frontend
- `npm run dev:server` - Run only the backend
- `npm run build` - Build for production

## Troubleshooting

### "Port already in use"
If port 3001 or 5173 is already in use:
- Change `PORT` in `.env` for backend
- Change port in `client/vite.config.ts` for frontend

### Database issues
Reset the database:
```bash
rm server/prisma/dev.db
npm run db:migrate
npm run db:seed
```

### Dependencies issues
Clear and reinstall:
```bash
rm -rf node_modules client/node_modules server/node_modules shared/node_modules
npm install
```

## Next Steps

- Check out the full `README.md` for detailed documentation
- Explore the code structure
- Add your own quiz questions
- Extend with new features

Enjoy building with AI Quiz App!
