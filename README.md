# vibewithme

Collaborative terminal IDE for vibe coding. Figma meets v0, in your terminal.

```
npx vibewithme
```

## What is this?

A full terminal UI for non-technical founders building apps with AI. Browse files, chat with your team, and `@ai` to have Claude Code edit your project — all in a beautiful three-column TUI with real-time collaboration.

```
┌─ vibewithme ─────────────────────────────────────────────────┐
│  my-project                    * Pat  * Sarah       [live]   │
├──────────┬─────────────────────────┬─────────────────────────┤
│ Files    │  src/index.ts           │ Chat                    │
│ ──────── │  1 | import express     │ ─────────────────       │
│ > src/   │  2 | const app = ...    │ Pat: lets add auth      │
│   index  │  3 | app.listen(3000)   │                         │
│   auth   │                        │ @ai add JWT auth         │
│ Secrets  │  [Claude editing...]   │ middleware to express     │
│ ──────── │                        │                          │
│ ! API_KEY│                        │ # Claude: I'll add       │
│ Team     │                        │ passport-jwt with...     │
│ ──────── │                        │                          │
│ * Pat    │                        │                          │
│ * Sarah  │                        │ > _                      │
├──────────┴─────────────────────────┴─────────────────────────┤
│ ^1 Files  ^2 Editor  ^3 Chat  ^P Palette  @ai Claude        │
└──────────────────────────────────────────────────────────────┘
```

## Features

- **Three-column TUI** — File tree, editor, and chat panel with vim-style navigation
- **`@ai` Claude integration** — Tag `@ai` in chat to have Claude Code read, edit, and run commands in your project
- **Real-time collaboration** — Figma-level: see other users' cursors, panels, and highlights via Y.js CRDTs
- **Secrets management** — AES-256-GCM encrypted storage for API keys and env vars
- **Team management** — Create rooms, invite members, manage presence
- **Command palette** — Ctrl+P fuzzy finder over files and commands
- **Diff review** — Review Claude's changes with accept/reject before committing

## Quick Start

```bash
# Solo mode — just you and Claude
npx vibewithme /path/to/project --solo

# With collaboration server
npx vibewithme serve                           # Terminal 1: start server
npx vibewithme /path/to/project --room myroom  # Terminal 2+: join room
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+1` | Focus file tree |
| `Ctrl+2` | Focus editor |
| `Ctrl+3` | Focus chat |
| `Tab` | Cycle panels |
| `Ctrl+P` | Command palette |
| `j/k` | Navigate up/down |
| `h/l` | Collapse/expand (file tree) |
| `Enter` | Open file / send message |
| `@ai ...` | Ask Claude to do something |

## Requirements

- Node.js >= 20
- `ANTHROPIC_API_KEY` environment variable (for `@ai` features)

## Architecture

Turborepo monorepo with four packages:

- `vibewithme` — CLI entry point (`npx vibewithme`)
- `@vibewithme/tui` — Ink 6 + React 19 terminal UI
- `@vibewithme/server` — Hono HTTP + Hocuspocus WebSocket collaboration server
- `@vibewithme/shared` — Types, constants, utilities

## Tech Stack

| Layer | Tech |
|-------|------|
| TUI | Ink 6 (React 19 + Yoga flexbox) |
| State | Zustand |
| Collaboration | Y.js + Hocuspocus |
| AI | Claude Agent SDK |
| Server | Hono + Hocuspocus |
| Auth | JWT (jose) |
| Secrets | AES-256-GCM encrypted file |
| Build | Turborepo + tsup |

## License

MIT
