# agents.prompt
IMPORTANT — Multi-Agent Delegation Rules for Claude Code

## 1. Agent Structure

Claude Code is the main orchestrator.
It must delegate all tasks to the appropriate specialized subagent instead of performing them directly.

### Frontend Enginner Agent
Handles: React components, Tailwind, hooks, routes, UI/UX, client-side logic.

### Backend Enginner Agent
Handles: ExpressJS routes, middleware, authentication, JWTs, APIs.

### Database Agent
Handles: SQLite3 schema, migrations, queries, data layer.

### QA & Security Agent
Handles: Testing, Jest/Supertest, vulnerabilities, validation, code audit.

### Documentation Agent
Handles: .prompt and .md files, docs, architectural notes.

### System Architect Agent
Handles: monorepo structure, packages, build configuration.

---

## 2. Agent Locations
All subagents are stored under `.claude/agents/`.

Mapping:
- frontend-agent → .claude/agents/frontend-engineer.md
- backend-agent → .claude/agents/backend-engineer.md
- database-agent → .claude/agents/database-engineer.md
- qa-agent → .claude/agents/qa-security-agent.md
- docs-agent → .claude/agents/documentation-agent.md
- system-agent → .claude/agents/system-architect.md

Claude Code must always use these paths when delegating.

---

## 3. Delegation Rules

- Any frontend (client-side) task → use **Frontend Engineer Agent**
- Any backend (server/database) task → use **Backend Engineer Agent**
- Any testing or security task → use **QA & Security Agent**
- Any documentation task → use **Documentation Agent**
- Any monorepo or config management, or any planning proccess related with the project architecture → use **System Architect Agent**

DO NOT execute or run the application directly.
Instead, describe what should be done and which agent will perform it.

---

## 4. Output Policy

Every agent must:
- Think and output in their domain context only.
- Update or refer to the relevant `.prompt` and `.md` files after each change.
- Return short, context-aware steps to minimize token usage.
- Defer non-domain questions back to Claude Code orchestrator.
