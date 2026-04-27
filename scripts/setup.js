#!/usr/bin/env node
// TEMPLATE FILE — part of admin-template v1.0
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const green = (s) => `\x1b[32m✓ ${s}\x1b[0m`
const red = (s) => `\x1b[31m✗ ${s}\x1b[0m`
const bold = (s) => `\x1b[1m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`

function run(cmd, cwd = root) {
  execSync(cmd, { cwd, stdio: 'inherit' })
}

function copyEnv(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest)
    console.log(green(`Copied ${path.basename(dest)}`))
  } else {
    console.log(dim(`  ${path.basename(dest)} already exists, skipping`))
  }
}

console.log('\n' + bold('━━━ Admin Template Setup ━━━') + '\n')

// 1. Check Node version
const nodeVer = parseInt(process.version.slice(1).split('.')[0])
if (nodeVer < 18) {
  console.log(red(`Node.js 18+ required. You have ${process.version}`))
  process.exit(1)
}
console.log(green(`Node.js ${process.version}`))

// 2. Copy .env files
console.log('\n' + bold('Environment files:'))
copyEnv(path.join(root, 'frontend/.env.example'), path.join(root, 'frontend/.env'))
copyEnv(path.join(root, 'backend/.env.example'), path.join(root, 'backend/.env'))

// 3. Install frontend dependencies
console.log('\n' + bold('Installing frontend dependencies...'))
try {
  run('npm install', path.join(root, 'frontend'))
  console.log(green('Frontend dependencies installed'))
} catch {
  console.log(red('Frontend npm install failed'))
  process.exit(1)
}

// 4. Install backend dependencies
console.log('\n' + bold('Installing backend dependencies...'))
try {
  run('npm install', path.join(root, 'backend'))
  console.log(green('Backend dependencies installed'))
} catch {
  console.log(red('Backend npm install failed'))
  process.exit(1)
}

// 5. Prisma generate
console.log('\n' + bold('Generating Prisma client...'))
try {
  run('npx prisma generate', path.join(root, 'backend'))
  console.log(green('Prisma client generated'))
} catch {
  console.log(red('Prisma generate failed'))
  process.exit(1)
}

// 6. Prisma migrate
console.log('\n' + bold('Running database migrations...'))
try {
  run('npx prisma migrate dev --name init', path.join(root, 'backend'))
  console.log(green('Database migrated'))
} catch {
  console.log(red('Migration failed — is MySQL running? Check backend/.env DATABASE_URL'))
  process.exit(1)
}

// 7. Seed
console.log('\n' + bold('Seeding database...'))
try {
  run('node prisma/seed.js', path.join(root, 'backend'))
  console.log(green('Database seeded'))
} catch {
  console.log(red('Seed failed'))
  process.exit(1)
}

// Done!
console.log(`
\x1b[32m┌─────────────────────────────────────────────┐
│  ✅  Setup complete!                        │
│                                             │
│  Frontend:  http://localhost:5173           │
│  Backend:   http://localhost:5000           │
│                                             │
│  Login:     admin@admin.com                 │
│  Password:  Admin@1234                      │
│                                             │
│  Next step: npm run dev                     │
└─────────────────────────────────────────────┘\x1b[0m
`)
