# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EnvManager** is a Tauri v2 desktop application for visually managing `.env` files across multiple development projects. It replaces manual `.env` file editing with an intuitive, fast, and secure interface.

### Problem Solved
Developers constantly juggle between multiple `.env` files (`.env.local`, `.env.dev`, `.env.prod`, `.env.staging`) across different projects. Copying variables, switching environments, or finding an API key becomes tedious. EnvManager centralizes all of this.

## Tech Stack

- **Desktop Framework**: Tauri v2 (Rust backend + webview frontend)
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (configured with "new-york" style)
- **State Management**: Zustand (to be added)
- **Icons**: Lucide React (included with shadcn)
- **Build Tool**: Vite
- **Development Server**: Runs on port `1420` (fixed port required by Tauri)

## Architecture

### Frontend Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx              # Navigation between projects
│   │   ├── Header.tsx               # Project title + global actions
│   │   └── MainLayout.tsx           # Layout wrapper
│   ├── project/
│   │   ├── ProjectCard.tsx          # Project card in sidebar
│   │   ├── AddProjectButton.tsx     # Button + dialog for adding project
│   │   └── ProjectSettings.tsx      # Project config (rename, delete)
│   ├── env/
│   │   ├── EnvFileSelector.tsx      # Tabs to switch .env files
│   │   ├── EnvEditor.tsx            # List of variables
│   │   ├── VariableRow.tsx          # One key=value line with actions
│   │   ├── AddVariableForm.tsx      # Form to add variable
│   │   └── VariableValueCell.tsx    # Value display (hidden/visible toggle)
│   └── ui/                          # shadcn components (already installed)
├── lib/
│   ├── env-parser.ts                # Parse and stringify .env files
│   ├── tauri-commands.ts            # Wrapper for Tauri commands
│   └── utils.ts                     # Utility helpers (cn() already exists)
├── stores/
│   ├── projects-store.ts            # Projects state
│   └── env-store.ts                 # Active .env file state
├── types/
│   └── index.ts                     # TypeScript types
├── App.tsx
├── main.tsx
└── App.css                          # Global styles with shadcn theme
```

### Backend Structure (Rust)

```
src-tauri/
├── src/
│   ├── main.rs                      # Entry point
│   ├── lib.rs                       # Module exports & Tauri builder
│   └── commands/
│       ├── mod.rs                   # Module exports
│       ├── filesystem.rs            # File read/write commands
│       └── dialog.rs                # Native dialog commands
├── Cargo.toml
└── tauri.conf.json
```

### Frontend-Backend Communication

The frontend communicates with Rust backend via the `invoke` function:
```typescript
import { invoke } from "@tauri-apps/api/core";
const result = await invoke("command_name", { arg1: value1 });
```

Corresponding Rust commands are defined in `src-tauri/src/lib.rs` with `#[tauri::command]` and registered via `.invoke_handler(tauri::generate_handler![command_name])`.

## Key TypeScript Types

```typescript
interface Project {
  id: string;                    // UUID generated
  name: string;                  // Display name (editable)
  path: string;                  // Absolute folder path
  envFiles: string[];            // List of .env files found
  createdAt: number;             // Timestamp
  lastOpenedAt: number;          // For sorting by recent
}

interface EnvVariable {
  key: string;
  value: string;
  isComment: boolean;            // true if line is a comment
  isSecret: boolean;             // Auto-detect (contains KEY, SECRET, PASSWORD, TOKEN, API)
  lineNumber: number;            // Position in original file
  rawLine: string;               // Original line to preserve formatting
}

interface EnvFile {
  path: string;                  // Full file path
  filename: string;              // Filename (.env.local, etc)
  variables: EnvVariable[];
  lastModified: number;          // Last modification timestamp
}
```

## Tauri Commands to Implement

All commands should be in `src-tauri/src/commands/`:

```rust
// Dialog commands (dialog.rs)
#[tauri::command]
async fn select_folder() -> Result<Option<String>, String>

// Filesystem commands (filesystem.rs)
#[tauri::command]
async fn scan_env_files(folder_path: String) -> Result<Vec<String>, String>

#[tauri::command]
async fn read_file(file_path: String) -> Result<String, String>

#[tauri::command]
async fn write_file(file_path: String, content: String) -> Result<(), String>

#[tauri::command]
async fn create_file(file_path: String, content: String) -> Result<(), String>

#[tauri::command]
async fn delete_file(file_path: String) -> Result<(), String>

#[tauri::command]
async fn read_projects_config(app_handle: tauri::AppHandle) -> Result<String, String>

#[tauri::command]
async fn save_projects_config(app_handle: tauri::AppHandle, content: String) -> Result<(), String>

#[tauri::command]
async fn copy_to_clipboard(text: String) -> Result<(), String>
```

### Required Tauri Permissions

In `tauri.conf.json`, enable:
- `fs:read` — File reading
- `fs:write` — File writing
- `dialog:open` — Folder selection dialog
- `clipboard:write` — Clipboard writing
- `path:default` — System path access

## Development Commands

### Run Tauri Application in Development
```bash
npm run tauri dev
```
Builds and runs the full Tauri application with hot-reload. **This is the primary development command.**

### Run Frontend Only
```bash
npm run dev
```
Starts Vite dev server (frontend only). Does NOT start the Tauri app.

### Build for Production
```bash
npm run build          # Frontend only
npm run tauri build    # Full Tauri app bundle
```

### Type Checking
```bash
npx tsc --noEmit
```

### Adding shadcn/ui Components
```bash
npx shadcn@latest add [component-name]
```

## UI/UX Guidelines

### Theme
- **Dark mode by default** (developers prefer it)
- Sober colors inspired by IDEs (VS Code, JetBrains)
- Use shadcn components with dark theme

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  EnvManager                                    [─] [□] [×]  │
├────────────────┬────────────────────────────────────────────┤
│                │  Header: Project Name         [⚙] [↻]     │
│   PROJECTS     ├────────────────────────────────────────────┤
│                │  Tabs: .env | .env.local | .env.prod  [+]  │
│  ┌──────────┐  ├────────────────────────────────────────────┤
│  │ Project1 │  │  🔍 Search variables...                    │
│  └──────────┘  ├────────────────────────────────────────────┤
│  ┌──────────┐  │                                            │
│  │ Project2 │  │  KEY                VALUE           ACTIONS│
│  └──────────┘  │  ──────────────────────────────────────────│
│  ┌──────────┐  │  DATABASE_URL       •••••••••      👁 📋 ✏ 🗑│
│  │ Project3 │  │  API_KEY            •••••••••      👁 📋 ✏ 🗑│
│  └──────────┘  │  DEBUG              true           👁 📋 ✏ 🗑│
│                │  PORT               3000           👁 📋 ✏ 🗑│
│  [+ Add]       │                                            │
│                │  [+ Add variable]                          │
└────────────────┴────────────────────────────────────────────┘
```

### Key Interactions
- **Hover states** on variable rows
- **Smooth transitions** on state changes
- **Toasts** for confirmations (copied, saved, error)
- **Keyboard shortcuts**:
  - `Cmd/Ctrl + N`: New project
  - `Cmd/Ctrl + F`: Focus search
  - `Cmd/Ctrl + S`: Save (even if auto-save)
  - `Escape`: Cancel current edit

## Data Persistence

Projects are saved in a local JSON file:
- **Linux/Mac**: `~/.config/envmanager/projects.json`
- **Windows**: `%APPDATA%/envmanager/projects.json`
- Use Tauri's `app.path.appConfigDir()` to get the path

## .env Parser Requirements

The parser must handle:
- Standard format: `KEY=value`
- Quoted values: `KEY="value with spaces"`
- Comments: `# This is a comment`
- Empty lines (preserve for structure)
- Multiline values in quotes
- Variables without value: `KEY=`

## Security & Best Practices

### Security
- **Never log variable values in plain text**
- .env files remain local, no cloud sync
- Be careful with file permissions on Linux/Mac

### Performance
- Lazy load .env files (load only when opened)
- Debounce saves during rapid editing
- Virtualize list if many variables (> 100)

### Code Quality
- TypeScript strict mode enabled
- Functional React components with hooks
- Separate business logic from UI components
- Comment Rust code for clarity

### UX
- Always provide visual feedback (loading, success, error)
- Preserve scroll position during updates
- Handle edge cases (deleted files, denied permissions)

## shadcn/ui Configuration

- **Style**: "new-york"
- **Base color**: slate
- **CSS variables**: enabled
- **Path aliases**: Configured (`@/` → `src/`)
- **Utils**: `cn()` helper in `src/lib/utils.ts`

To add new components:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
# etc.
```

## Adding New Tauri Commands

1. Define the command in appropriate file in `src-tauri/src/commands/`:
```rust
#[tauri::command]
async fn my_command(arg: String) -> Result<String, String> {
    // implementation
}
```

2. Export it from `src-tauri/src/commands/mod.rs`:
```rust
pub use filesystem::*;
pub use dialog::*;
```

3. Register it in `src-tauri/src/lib.rs`:
```rust
.invoke_handler(tauri::generate_handler![greet, my_command])
```

4. Call from React:
```typescript
import { invoke } from "@tauri-apps/api/core";
const result = await invoke("my_command", { arg: "value" });
```

## Important Notes for Implementation

1. **Always verify Tauri imports** are correct for v2 (`@tauri-apps/api` and `@tauri-apps/plugin-*`)

2. **For Rust commands**, use async pattern with `Result<T, String>` for error handling

3. **shadcn components** are already configured, use `npx shadcn@latest add [component]` to add more

4. **Test on target OS** as file paths differ between Windows/Mac/Linux

5. **Start simple then iterate** — better to have a working feature than a complete but buggy one

## Project Structure Notes

- **TypeScript config**: Two configs exist - `tsconfig.json` for source code (strict mode enabled) and `tsconfig.node.json` for Vite config files
- **Rust dependencies**: Managed in `src-tauri/Cargo.toml`. Run `cargo update` from `src-tauri/` to update
- **Assets**: Place static assets in `public/` (copied as-is) or `src/assets/` (processed by Vite)
- **Icons**: Desktop app icons are in `src-tauri/icons/` (various formats for different platforms)

## Vite Configuration Notes

- Port `1420` is fixed and required by Tauri (will fail if unavailable)
- The `src-tauri` directory is ignored by Vite's file watcher
- `clearScreen: false` prevents Vite from obscuring Rust errors
- Path alias `@/` is configured to resolve to `src/`
