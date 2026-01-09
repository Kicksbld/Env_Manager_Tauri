# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri desktop application using React 19 + TypeScript + Vite for the frontend and Rust for the backend. Tauri enables building lightweight, secure desktop applications with web technologies while leveraging Rust for native capabilities.

## Architecture

### Frontend (React/TypeScript)
- **Entry point**: `src/main.tsx` - React app initialization
- **Main component**: `src/App.tsx` - Root application component
- **Build tool**: Vite (configured in `vite.config.ts`)
- **Development server**: Runs on port `1420` (fixed port required by Tauri)

### Backend (Rust/Tauri)
- **Entry point**: `src-tauri/src/main.rs` - Calls `lib.rs::run()`
- **Core logic**: `src-tauri/src/lib.rs` - Tauri builder setup, command handlers, and plugins
- **Commands**: Rust functions decorated with `#[tauri::command]` that can be invoked from frontend
- **Configuration**: `src-tauri/tauri.conf.json` - App metadata, window config, build settings, bundling options

### Frontend-Backend Communication
The frontend communicates with Rust backend via the `invoke` function from `@tauri-apps/api/core`:
```typescript
import { invoke } from "@tauri-apps/api/core";
const result = await invoke("command_name", { arg1: value1 });
```

Corresponding Rust commands are defined in `src-tauri/src/lib.rs` with the `#[tauri::command]` macro and registered via `.invoke_handler(tauri::generate_handler![command_name])`.

## Development Commands

### Run Development Server
```bash
npm run dev
```
Starts Vite dev server (frontend only). This does NOT start the Tauri app.

### Run Tauri Application in Development
```bash
npm run tauri dev
```
Builds and runs the full Tauri application with hot-reload for both frontend and backend changes. This is the primary development command.

### Build for Production
```bash
npm run build
```
Builds the frontend (TypeScript compilation + Vite build). For full Tauri app bundle:
```bash
npm run tauri build
```
Creates platform-specific installers in `src-tauri/target/release/bundle/`.

### Type Checking
```bash
npx tsc --noEmit
```
Run TypeScript compiler in check mode without emitting files.

### Preview Production Build
```bash
npm run preview
```
Preview the Vite production build locally.

## Project Structure Notes

- **TypeScript config**: Two configs exist - `tsconfig.json` for source code (strict mode enabled) and `tsconfig.node.json` for Vite config files
- **Rust dependencies**: Managed in `src-tauri/Cargo.toml`. Run `cargo update` from `src-tauri/` to update dependencies
- **Assets**: Place static assets in `public/` (copied as-is to dist) or `src/assets/` (processed by Vite)
- **Icons**: Desktop app icons are in `src-tauri/icons/` (various formats for different platforms)

## Adding New Tauri Commands

1. Define the command function in `src-tauri/src/lib.rs`:
```rust
#[tauri::command]
fn my_command(arg: String) -> Result<String, String> {
    // implementation
}
```

2. Register it in the `invoke_handler`:
```rust
.invoke_handler(tauri::generate_handler![greet, my_command])
```

3. Call from React:
```typescript
const result = await invoke("my_command", { arg: "value" });
```

## Tauri Configuration

The `src-tauri/tauri.conf.json` file controls:
- App identifier and version
- Build commands (`beforeDevCommand`, `beforeBuildCommand`)
- Window properties (size, title)
- Security policies (CSP)
- Bundle settings and icons

## Vite Configuration Notes

- Port `1420` is fixed and required by Tauri (will fail if unavailable)
- The `src-tauri` directory is ignored by Vite's file watcher
- `clearScreen: false` prevents Vite from obscuring Rust errors