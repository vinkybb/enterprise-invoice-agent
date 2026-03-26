# Enterprise Invoice Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an enterprise-grade invoice management platform with upload + OCR extraction, workflow circulation, and a smart copilot that can operate the UI from natural-language commands.

**Architecture:** Use a single Next.js App Router application with in-memory demo data, API routes for OCR extraction and copilot planning, and a client-side action registry that executes allowlisted UI actions. The OCR provider is abstracted behind a service interface so a real OCR model can be attached later without changing the UI flow.

**Tech Stack:** Next.js, React, TypeScript, Vitest, custom CSS design tokens

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `next-env.d.ts`
- Create: `.gitignore`

**Step 1: Write the base application manifest**

Create `package.json` with scripts for `dev`, `build`, `start`, `lint`, and `test`.

**Step 2: Write TypeScript and Next.js config**

Add strict `tsconfig.json`, `next.config.ts`, and `next-env.d.ts`.

**Step 3: Add ignore rules**

Create `.gitignore` for `.next`, `node_modules`, coverage output, and env files.

**Step 4: Run install**

Run: `npm install`
Expected: dependencies install successfully.

### Task 2: Domain models and data services

**Files:**
- Create: `lib/types.ts`
- Create: `lib/mock-data.ts`
- Create: `lib/store.ts`
- Create: `lib/ocr.ts`
- Create: `lib/copilot.ts`

**Step 1: Define invoice and workflow types**

Add shared types for invoices, OCR fields, workflow stages, chat logs, action plans, and dashboard views.

**Step 2: Seed demo enterprise records**

Create realistic invoice records and SLA / queue stats in `lib/mock-data.ts`.

**Step 3: Implement in-memory repository**

Expose helpers to list invoices, update stage, select current item, and append activity logs.

**Step 4: Implement OCR abstraction**

Create `runOcrPipeline(file)` with deterministic mock extraction and a provider interface for future real OCR integration.

**Step 5: Implement copilot planner**

Parse natural-language commands into allowlisted structured actions like `navigate`, `focusInvoice`, `advanceStage`, and `applyFilter`.

### Task 3: API routes

**Files:**
- Create: `app/api/invoices/upload/route.ts`
- Create: `app/api/copilot/route.ts`

**Step 1: Build upload route**

Accept image / PDF uploads, validate input, run OCR extraction, create invoice records, and return the latest workspace snapshot.

**Step 2: Build copilot route**

Accept user instruction + UI context, generate a structured plan, and return operator feedback for playback.

**Step 3: Add error handling**

Return typed error payloads for unsupported files and unsupported commands.

### Task 4: Enterprise frontend shell

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `components/platform-shell.tsx`
- Create: `components/overview-panel.tsx`
- Create: `components/upload-workspace.tsx`
- Create: `components/workflow-board.tsx`
- Create: `components/invoice-detail.tsx`
- Create: `components/copilot-console.tsx`

**Step 1: Build layout and theme**

Create an enterprise visual language with custom typography, tokens, gradients, panels, and motion.

**Step 2: Build dashboard + queue views**

Show KPI strips, activity timeline, compliance counters, and invoice queues.

**Step 3: Build upload workspace**

Implement drag-drop / picker, upload progress, OCR field cards, and confidence markers.

**Step 4: Build workflow and detail views**

Display invoice state, risk tags, approval chain, and audit notes.

**Step 5: Build smart copilot console**

Render chat transcripts, suggested commands, execution steps, and auto-run responses that change the active UI state.

### Task 5: Verification and docs

**Files:**
- Create: `tests/copilot.test.ts`
- Modify: `README.md`

**Step 1: Add planner tests**

Verify that common commands map to correct structured actions.

**Step 2: Run tests**

Run: `npm test`
Expected: passing Vitest suite.

**Step 3: Run production build**

Run: `npm run build`
Expected: successful Next.js build.

**Step 4: Document usage**

Update `README.md` with features, architecture, and how to plug in a real OCR provider.
