# Getting Started

## Prerequisites

- Node.js 18+
- MySQL 8+
- Git

## Setup (2 minutes)

```bash
# 1. Clone the template
git clone https://github.com/yourteam/admin-template.git my-project
cd my-project
rm -rf .git && git init
git add . && git commit -m "initial: from admin-template v1.0"

# 2. Configure branding (optional — can do after first run)
# Edit: frontend/src/config/app.config.js

# 3. Run setup (installs deps, migrates DB, seeds data)
node scripts/setup.js

# 4. Start development servers
npm run dev
```

## First Login

Open http://localhost:5173 and login with:

- **Email**: admin@admin.com
- **Password**: Admin@1234

## Common Errors

| Error | Fix |
|---|---|
| `MySQL connect failed` | Make sure MySQL is running. Check `DATABASE_URL` in `backend/.env` |
| `Prisma generate failed` | Run `npm install` inside `backend/` then retry |
| `Port 5173 in use` | Kill the process: `lsof -ti:5173 | xargs kill` |
| `CORS error in browser` | Make sure `CLIENT_URL` in `backend/.env` matches your frontend URL |

## Project Structure

See the full structure in the System Context section of `Promot.md`.
