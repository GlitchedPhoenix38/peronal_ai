# HANDOFF.md

## Current State

Built a new Next.js AI workspace application from an empty directory.

## Implemented

- Next.js App Router + TypeScript + Tailwind setup.
- Premium SaaS workspace UI:
  - Chat interface
  - Conversation sidebar
  - Routing controls
  - Provider operations panel
  - Settings page
  - Usage dashboard
- Interactive frontend behavior:
  - New conversation
  - Conversation search
  - Folder filtering
  - Pinned filtering
  - Pin/unpin
  - Rename
  - Delete
  - Routing mode changes
  - Manual model selection
  - File/image attach and drag/drop
  - Local message send
  - Settings toggles
  - Connection test buttons
- Backend route scaffolding:
  - `/api/chat`
  - `/api/providers`
  - `/api/providers/[providerId]/health`
  - `/api/usage`
  - `/api/uploads`
- Modular provider architecture:
  - Provider catalog
  - Model catalog
  - Adapter boundary
  - Routing engine
- Security primitives:
  - Server-only key handling pattern
  - Zod validation
  - In-memory rate-limit scaffold
- Database schema:
  - Providers
  - Conversations
  - Messages
  - Attachments
  - Usage events
  - Routing events

## Honesty Fix

- Removed fake live provider usage from the default catalog when no API keys are configured.
- `/api/chat` now returns `409 Provider not connected` instead of pretending to generate a model response.
- The UI now clearly says live AI, persistence, encrypted key storage, and object uploads are not connected yet.

## Local-First Key Storage

- Settings can now save provider API keys locally on the laptop.
- Keys are encrypted with AES-256-GCM and written to `.local-data/providers.json`.
- The encryption secret is generated locally at `.local-data/secret`.
- `.local-data` is gitignored.
- Server routes auto-detect locally saved keys immediately through `/api/providers`.
- `/api/chat` now calls real provider APIs through server-side adapters when a key exists.
- Implemented adapters:
  - OpenAI chat completions
  - Gemini generateContent
  - Anthropic messages
  - OpenRouter chat completions

## Remaining Production Work

- Add local SQLite persistence for conversations/messages/usage events.
- Harden provider adapters with retries, streaming, model-specific request shaping, and better error mapping.
- Add authenticated users/workspaces.
- Add local file storage for uploaded files/images and pass supported image payloads to providers.
- Add persistent usage/routing event writes.
- Add unit and E2E tests.
