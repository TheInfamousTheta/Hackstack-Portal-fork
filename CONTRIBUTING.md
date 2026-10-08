# Contributing to Hackstack Portal

Thanks for helping improve Hackstack Portal — the LMS built by the Student Web Committee, IIT Guwahati. This guide covers how to get started and what we expect in a pull request.

## Getting started

1. Fork the repository and clone your fork.
2. Follow the setup steps in [README.md](README.md) for the backend (Express + MongoDB) and frontend (React + Vite).
   - Environment variables: treat `backend/.env.example` and `frontend/.env.example` as the source of truth — they are kept more current than the README.
3. Create a branch off `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

   Use `feature/`, `fix/`, or `docs/` prefixes.

## Making changes

### Backend (`backend/`)

- CommonJS (`require`), Express 5, Mongoose 9.
- Routes live in `routes/`, business logic in `controllers/`, schemas in `models/`, auth checks in `middleware/`.
- User auth is Google OAuth (HttpOnly cookie JWT); admin auth is a separate Bearer-token JWT — keep them isolated, as the middleware comments describe.

### Frontend (`frontend/`)

- React 19 + Vite, Tailwind 4, React Router 7. Pages in `src/pages/`, shared UI in `src/components/` (shadcn-style components under `src/components/ui/`), API calls in `src/services/`.
- The admin portal lives outside `src/` in `frontend/adminportal/`.
- Run the dev server and actually click through your change — most bugs here are visual or state-related.

### Checks before you commit

```bash
cd frontend && npm run lint   # frontend changes only; backend has no lint script yet
```

There is no automated test suite yet. In your PR, describe how you tested the change manually (steps, endpoints hit, screenshots for UI).

## Pull requests

- Open the PR against `main` and fill in the PR template.
- **Link the issue you're fixing** (e.g. `Closes #12`) — required for Hacktoberfest PRs.
- Keep PRs small and focused; one feature or fix per PR.
- Review is required before merge — a maintainer with write access must approve.
- Expect feedback; maintainers may ask for changes before merging.

> **Note:** merging to `main` triggers the deploy workflow and pushes your change to production. That is why every PR needs a review.

## Reporting issues

- Search existing issues first, then open a new one with reproduction steps, expected vs. actual behaviour, and screenshots if it's UI.
- Use the `hacktoberfest` / `hacktoberfest2026` labeled issues as the curated backlog for Hacktoberfest — comment on an issue before you start working on it.

## Code style

- ES6+ JavaScript; functional React components with hooks.
- `camelCase` for variables/functions, `PascalCase` for components.
- Match the style of the file you're editing; don't reformat unrelated code.
- No secrets, `.env` files, or `node_modules` in commits (all gitignored).
