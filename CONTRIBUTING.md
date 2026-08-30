# Contributing to Hifz Trainer

Thank you for your interest in contributing! This guide will help you get started.

## Getting started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/hifz-trainer.git
   cd hifz-trainer
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment**:
   ```bash
   cp .env.example .env    # defaults to local SQLite
   npm run db:push
   ```
5. **Start dev server**:
   ```bash
   npm run dev
   ```

## Branching model

- `main` — production branch, protected. No direct commits.
- `dev` — development branch, protected. No direct commits.

### Workflow

1. Create a feature branch from `dev`:
   ```bash
   git checkout dev
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Run checks before committing:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```
4. Push and open a PR targeting `dev`
5. Wait for review and approval before merging

**Never** open PRs directly to `main`. All changes go through `dev` first.

## Code style

- TypeScript strict mode — no `any` types unless absolutely necessary
- Follow existing patterns in the codebase
- Use Tailwind CSS v4 utility classes for styling
- Server components by default; `"use client"` only when needed
- Database access via `getDb()` / `getDbWithTest()` from `@/lib/db`
- API routes in `src/app/api/`

## Commit messages

Use conventional commits:
- `feat: add new reciter support`
- `fix: resolve audio playback on iOS`
- `docs: update contributing guide`
- `chore: update dependencies`

## Testing

- **Unit tests**: Vitest in `src/**/*.test.{ts,tsx}`
- **E2E tests**: Playwright in `e2e/*.spec.ts`
- All tests must pass before merging

## Reporting issues

Use the issue templates for bug reports and feature requests. Include:
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details

## Questions?

Open a discussion or issue if you have questions. We're happy to help!
