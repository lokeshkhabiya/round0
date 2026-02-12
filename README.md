# Round0 - AI-Powered Mock Interview Platform

<video src="./apps/candidate-dashboard/public/hero-section-video.mp4" controls muted loop playsinline style="max-width: 100%; border-radius: 12px; box-shadow: 0 16px 40px rgba(0,0,0,0.35);"></video>

Round0 is a comprehensive mock interview platform built with Next.js, Bun, and AI technologies. The platform allows candidates to practice technical, system design, and behavioral interviews with AI-powered assessment, feedback, and mentoring.

---

## 🎯 What Round0 Does

Round0 focuses on **high-fidelity mock interviews** for multiple role categories:
- Software Engineering (frontend, backend, full‑stack, mobile, DevOps, QA)
- Data roles (data scientist, data analyst, data engineer)
- Product & business roles (PM, growth, marketing, sales)
- Other roles (QA, security, support, operations, etc.)

Each mock interview is created from a structured job description and runs as a realistic, round-based interview with:
- Role‑aware prompts and tools (code editor, whiteboard, file upload)
- Voice‑based AI interviewer
- Automated scoring and reporting
- Follow‑up AI mentor sessions

---

## 🧭 End-to-End Flow

### Candidate journey
1. **Landing page (`apps/candidate-dashboard/app/page.tsx`)**
   - Modern marketing page with hero section and demo video.
   - Authenticated users are auto‑redirected to `/mockinterview`.
2. **Browse mock interviews (`/mockinterview`)**
   - Fetches available mock interviews from `GET /mockinterview/get_mockinterviews`.
   - Rich listing with search, filters, and stats implemented in `MockInterviewsListing`.
3. **Start a mock interview**
   - Calls `POST /mockinterview/start_mockinterview` with the selected mock job ID.
   - Backend:
     - Creates a `job_application` with `status=in_progress`.
     - Creates an `interview_session` and initial `interview_round`.
     - Creates a signed **interview token** with job and candidate context.
     - Returns a redirect URL: `${FRONTEND_URL}/interview?token=...`.
4. **Live interview room (`/interview`)**
   - Verifies token via `POST /interview/verify` before starting.
   - Provides tools based on role & difficulty (code editor, Excalidraw whiteboard, etc.).
   - Integrates with ElevenLabs for voice AI via `GET /interview/agent-url`.
   - Streams and records conversation and tool usage:
     - Messages → `POST /interview/message`.
     - Tool results → `POST /interview/tool-result`.
     - Recordings → `POST /interview/upload_recording/:round_id`.
5. **Round completion & scoring**
   - Frontend calls `POST /interview/end` with `round_id`.
   - Backend:
     - Marks round as `completed`.
     - Schedules scoring via `scoringEngine.scoreRound(round_id)` (OpenAI).
     - Persists:
       - `zero_score` (0‑100 overall)
       - `score_components` (technical, communication, reasoning, creativity, cultural fit)
       - `ai_summary`
       - `report_data` (detailed, structured JSON).
6. **Reports & history**
   - **Single round report**: `GET /mockinterview/get_report?round_id=...`.
   - **All reports for candidate**: `GET /mockinterview/my_reports`.
   - **Dashboard stats**: `GET /mockinterview/candidate_stats`.
7. **AI mentor follow-up**
   - Candidate creates or opens a mentor session:
     - `POST /mentor/create-session`
     - `GET /mentor/get-sessions`
   - Converses with mentor via **Server-Sent Events (SSE)**:
     - `POST /mentor/conversation` (streaming response).
   - Conversation and advice are stored in `mentor_session` and `mentor_message`.

### Admin journey
1. **Sign in to admin dashboard (`apps/admin-dashboard`)**
2. **Create mock interviews**
   - Use admin UI backed by `POST /job_posting/create_mock_job`.
   - Job descriptions are stored in `job_description` with `is_mock = true` and a rich `jd_payload` (role category, difficulty level, tools, etc.).
3. **Manage catalog**
   - View, update, and delete mock jobs via:
     - `GET /job_posting/get_all_mock_jobs`
     - `PUT /job_posting/update_mock_job_by_id`
     - `DELETE /job_posting/delete_mock_job_by_id`
4. **Platform analytics**
   - Admin‑only analytics from `GET /mockinterview/analytics`:
     - Total mock interviews and attempts.
     - Completion and conversion rates.
     - Average scores and role‑wise performance.
     - Top candidates leaderboard.

---

## 🏗️ Architecture

This repo is a **Turborepo monorepo** using **Bun** as the package manager and task runner.

### Applications

#### 1. Admin Dashboard (`apps/admin-dashboard`)
- **Stack:** Next.js 15, React 19, Tailwind 4, shadcn/ui, Zustand.
- **Port:** `3001`
- **Purpose:** Platform administration for mock interviews.
- **Key implementation details:**
  - Uses `app/(routes)/mockinterviews` for creating and editing mock interviews.
  - Talks to backend via `apps/admin-dashboard/api/api.ts` and `.../operations/*`.
  - Auth via Supabase + JWT, with role checks for `admin` and `recruiter`.
  - Components like `app-sidebar` and `app-topbar` provide consistent shell.

#### 2. Candidate Dashboard (`apps/candidate-dashboard`)
- **Stack:** Next.js 15, React 19, Tailwind 4, shadcn/ui, Zustand, CodeMirror, Monaco, Excalidraw, ElevenLabs React.
- **Port:** `3002`
- **Purpose:** Candidate‑facing experience for discovery, interviewing, reports, and mentoring.
- **Key implementation details:**
  - **Landing page:** `app/page.tsx`
    - Uses `HeroSectionImage` and the hero video (`hero-section-video.mp4`) to demonstrate the experience.
    - Auto‑redirects authenticated users to `/mockinterview`.
  - **Mock interviews listing:** `app/(routes)/mockinterview/page.tsx`
    - Fetches mock interviews via `getMockInterviews(token)` from `@/api/operations/mock-interview-api`.
    - Implements search, filters, and derived stats (`getInterviewType`, `useMemo` stats).
  - **Interview room:** `app/(routes)/interview/*` (not fully listed here, but powered by):
    - `join-interview.tsx` – orchestrates the experience.
    - `code-ide.tsx` – CodeMirror/Monaco integration for multi‑language coding.
    - `excalidraw-wrapper.tsx` – system design whiteboard.
    - `conversation-context.tsx` – global context for interview token, round status, and transcript.
  - **Reports & stats:**
    - `mock-interview-stats.tsx`, `attempt-history-card.tsx`, etc. use `/mockinterview/candidate_stats` and `/mockinterview/get_mockinterview_details_and_attempts`.
  - **Auth & state:**
    - `stores/auth-store.ts` handles JWT tokens and auth status.
    - On landing mount, `useAuthStore` + `useRouter` handle redirect logic.

#### 3. Backend (`apps/backend`)
- **Runtime:** Bun.
- **Framework:** Express 5 (ESM).
- **Port:** `8080` (configurable via `PORT`).
- **Database:** PostgreSQL via Prisma (`prisma/schema.prisma`).
- **Key services & modules:**
  - `src/index.ts` – Express app bootstrap, CORS, JSON limits, router wiring.
  - `src/controllers/*` – HTTP layer:
    - `mockinterview.controller.ts` – mock interview APIs and analytics.
    - `interview.controller.ts` – verify/end interview, scoring trigger, tools, media upload.
    - `mentor.controller.ts` – AI mentor chat & sessions.
  - `src/services/*` – core business logic:
    - `scoring-engine.ts` – OpenAI‑based scoring pipeline.
    - `mentor.ts` – AI mentor built on `ai` and `@ai-sdk/openai`.
    - `s3-service.ts` – S3 file uploads (audio/video recordings).
  - `src/lib/*` – utility modules:
    - `interview-token.ts` – JWT generation & verification for secure interview access.
    - `round-specific-instruction.ts` – role/round‑specific instructions and tool sets for AI.
    - `prisma.ts` – Prisma client singleton.
  - `src/routers/*` – route definitions for each controller.

### Shared Packages

- `packages/typescript-config` – base TS config for all apps.
- `packages/eslint-config` – shared ESLint setup for consistent linting.

### Archived

- `archived/recruiter-dashboard` – older recruiter‑facing UI retained for reference but not part of the active product surface.

---

## 🔑 Key Technologies

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Radix UI, Lucide.
- **Backend:** Express 5 on Bun, Prisma ORM.
- **Database:** PostgreSQL (Supabase‑hosted in typical deployments).
- **AI / LLMs:**
  - OpenAI (chat completions and `ai` SDK).
  - Custom scoring engine (`scoring-engine.ts`) and mentor (`mentor.ts`) on top.
- **Voice & real-time:**
  - ElevenLabs ConvAI for voice‑driven interviewer (`getAgentUrl`).
  - SSE for mentor streaming.
- **Storage & infra:**
  - AWS S3 for recordings and uploads.
  - AWS SES for email (where configured).
  - Redis (planned/used for caching where configured).
- **Tooling & DevX:**
  - Turborepo for workspace orchestration.
  - Bun for scripts and dependency management.

---

## 📊 Data Model (Prisma)

Core models defined in `apps/backend/prisma/schema.prisma`:

- **`user`**
  - Fields: `id`, `email`, `name`, `role` (`recruiter | candidate | admin`), timestamps.
  - Relations:
    - `job_descriptions` – jobs (mock or real) created by recruiters.
    - `candidate_applications` – job applications/interview attempts.
    - `candidate_profile` / `recruiter_profile`.
    - `mentor_sessions`.

- **`job_description`**
  - Represents a job or mock interview template.
  - Fields: `title`, `description`, `jd_payload` (`Json`), `is_mock` (Boolean).
  - Linked to `user` (recruiter/owner).

- **`job_application`**
  - Represents a candidate’s attempt on a specific `job_description`.
  - Status: `pending | invited | in_progress | completed | accepted | rejected`.
  - Each application has one or more `interview_session` records.

- **`interview_session` & `interview_round`**
  - `interview_session` groups rounds within a single attempt.
  - `interview_round` stores:
    - `round_number`, `round_type` (`skill_assessment | behavioral | system_design`).
    - Timing: `started_at`, `end_at`, `status`.
    - AI evaluation: `zero_score`, `score_components`, `ai_summary`, `report_data`.
    - `agent_session_id` for ElevenLabs sessions.

- **Conversation & tools**
  - `message` – transcript for AI‑candidate conversation (`MESSENGER_ROLE`, `MESSAGE_TYPE`).
  - `attachment` – linked media (image, audio, video, code, document).
  - `tool_result` – code / design / other tool evaluations per round.

- **Recording & usage**
  - `session_recording` – S3 URLs per `(session_id, round_id)`.
  - `usage_log` – tokens & model usage (`SERVICE_TYPE` for cost/monitoring).

- **Mentor**
  - `mentor_session` – high‑level coaching sessions, optionally tied to a specific `interview_session`.
  - `mentor_message` – streaming history for mentor conversations.

---

## 🔐 Authentication & Authorization

- **JWT-based auth**
  - Backend expects authenticated routes to populate `req.user` and `req.interview_token` (for interview‑scoped routes).
  - `interview-token.ts` signs interview tokens used for `/interview/*` endpoints.

- **Roles**
  - `USER_ROLE.candidate` – can browse mock interviews, start interviews, view their own stats, reports, and mentor sessions.
  - `USER_ROLE.recruiter` – cannot access mock interview catalog as a candidate (guard in `getMockInterviews`).
  - `USER_ROLE.admin` – can access analytics and admin‑level operations.

- **Frontend integration**
  - Supabase Auth is used in dashboards to manage sessions and JWTs.
  - Candidate app stores tokens in `useAuthStore`.

---

## 🤖 AI Interviewer, Scoring, and Mentor

### Interview scoring pipeline (`scoring-engine.ts`)
1. **Trigger**
   - After `POST /interview/end`, a delayed call to `scoringEngine.scoreRound(round_id)` runs.
2. **Data aggregation**
   - Loads `interview_round` with:
     - `messages` (full transcript with roles and timestamps).
     - `tool_results` (code, system design, etc.).
     - `session.application.job_description` and `candidate`.
3. **Prompting & scoring**
   - Builds a detailed prompt with:
     - Job context and requirements from `jd_payload`.
     - Transcript (role‑tagged).
     - Tool outputs and whether they passed.
   - Calls OpenAI `gpt-4.1` with a strict JSON‑only instruction.
4. **Persistence**
   - Writes:
     - `zero_score` (overall 0‑100).
     - `score_components` JSON (technical, communication, reasoning, creativity, cultural fit).
     - `ai_summary` (~20–30 word overview).
     - `report_data` (stringified JSON with per‑dimension details).
   - Sets `report_generated_at`.

### System design and code evaluation
- **System design (`evaluateCanvas`)**
  - Endpoint: `POST /interview/evaluate-canvas`.
  - Input: question, serialized Excalidraw canvas data, and PNG base64 image.
  - Uses OpenAI with a strict JSON schema returning:
    - `score` (0‑100).
    - `summary` (2–3 sentence feedback).

- **Code evaluation (`evaluateCode`)**
  - Endpoint: `POST /interview/evaluate-code`.
  - Input: `code`, `language`, `question`.
  - Returns JSON with:
    - `score` (0‑100).
    - `summary` with coverage of correctness, quality, efficiency, and improvements.

### AI Mentor (`mentor.ts` + `mentor.controller.ts`)
- **Model & tooling**
  - Uses `@ai-sdk/openai` and `ai`:
    - Model: `gpt-4.1-mini-2025-04-14`.
    - Tools:
      - `web_search_preview` (OpenAI web search).
      - `get_user_context` (user + candidate profile + applications).
      - `get_interview_performance` (recent sessions and rounds).
      - `get_skill_analysis` (cross‑interview skill trends).
- **Streaming**
  - `POST /mentor/conversation`:
    - Persists user message.
    - Opens an SSE stream using `streamText`.
    - Streams every `text-delta` and tool call result to the client.
    - At the end, persists the full AI response as `mentor_message` with `messenger_role = "ai_mentor"`.

---

## 📈 Analytics & Reporting

### Candidate stats (`getCandidateMockInterviewStats`)
- Per‑candidate overview exposed via `GET /mockinterview/candidate_stats`:
  - `totalAttempts`
  - `completedAttempts`
  - `averageScore`
  - `recentAttempts` (last 5 attempts with role category, score, status).

### Admin analytics (`getMockInterviewAnalytics`)
- Exposed via `GET /mockinterview/analytics` (admin‑only).
- Aggregates:
  - `totalMockInterviews`
  - `totalAttempts`
  - `completedAttempts`
  - Global `averageScore`
  - Completion rate
  - `rolePerformance` (average score and attempts per role category).
  - `leaderboard` (top candidates by average score and total attempts).

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js** ≥ 18
- **Bun** ≥ `1.2.16`
- **PostgreSQL** database (Supabase recommended)
- **Redis** instance (if you enable caching)
- **OpenAI API key**
- **ElevenLabs API key** (for voice interviewer)
- **AWS credentials** (S3, SES)

### Install dependencies

```bash
git clone <repository-url>
cd round0
bun install
```

### Environment variables

Create `.env` files for each app.

**Backend** (`apps/backend/.env`):

```env
PORT=8080
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
ELEVENLABS_AGENT_ID=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3002
```

**Admin Dashboard** (`apps/admin-dashboard/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Candidate Dashboard** (`apps/candidate-dashboard/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ELEVENLABS_AGENT_ENABLED=true
```

### Database setup

```bash
cd apps/backend
bun run generate   # or: bun prisma generate
bun run migrate    # or: bun prisma migrate dev
```

### Development

From repo root:

```bash
bun run dev
```

This starts:
- Admin Dashboard → `http://localhost:3001`
- Candidate Dashboard → `http://localhost:3002`
- Backend API → `http://localhost:8080`

Run individual apps:

```bash
cd apps/admin-dashboard && bun run dev
cd apps/candidate-dashboard && bun run dev
cd apps/backend && bun run dev
```

### Build

```bash
bun run build
```

### Production with PM2 (example)

```bash
# Build all apps
bun run build

# Start via PM2
pm2 start ecosystem.config.js

# Monitor
pm2 status
pm2 logs
```

---

## 📝 HTTP API Overview

### Mock interview (`/mockinterview`)

- `GET /mockinterview/get_mockinterviews`
  - List all available mock interviews for a candidate.
- `POST /mockinterview/start_mockinterview`
  - Start a new attempt; creates application, session, round and returns interview token.
- `GET /mockinterview/get_mockinterview_details_and_attempts`
  - Fetch details for a specific mock job and all attempts by the current candidate.
- `GET /mockinterview/get_report`
  - Fetch detailed report for a specific round.
- `GET /mockinterview/my_reports`
  - List all completed mock interview reports for the current candidate.
- `GET /mockinterview/candidate_stats`
  - High‑level stats for the current candidate.
- `GET /mockinterview/analytics` (admin only)
  - Platform‑wide analytics and leaderboard.
- `POST /mockinterview/generate_jd`
  - Generate a mock interview JD using AI.

### Interview (`/interview`)

- `POST /interview/verify`
  - Validates interview token and marks round as started.
- `POST /interview/end`
  - Ends the round and triggers scoring.
- `GET /interview/transcript/:round_id`
  - Returns ordered message transcript.
- `GET /interview/report/:round_id`
  - Returns scoring & summary (once generated).
- `POST /interview/evaluate-canvas`
  - Evaluates system design canvas.
- `POST /interview/evaluate-code`
  - Evaluates code solution.
- `POST /interview/agent-url`
  - Returns ElevenLabs signed URL for ConvAI agent.
- `POST /interview/upload_recording/:round_id`
  - Uploads video/audio recording to S3.
- `POST /interview/message`
  - Persists a message in the interview transcript.
- `POST /interview/tool-result`
  - Persists results from code/whiteboard tools.

### Mentor (`/mentor`)

- `POST /mentor/create-session`
  - Creates a new mentor session (optionally linked to an interview session).
- `POST /mentor/conversation`
  - SSE endpoint for streaming mentor responses.
- `GET /mentor/get-sessions`
  - Lists recent mentor sessions for the current candidate.
- `GET /mentor/get-messages?mentor_session_id=...`
  - Fetches all messages for a specific session.

### Job posting & admin (`/job_posting`, `/users`, `/job_applications`)

- `POST /job_posting/create_mock_job`
- `GET /job_posting/get_all_mock_jobs`
- `PUT /job_posting/update_mock_job_by_id`
- `DELETE /job_posting/delete_mock_job_by_id`
- `...` additional job application and user management endpoints under:
  - `/job_applications/*`
  - `/users/*`

---

## 🧪 Quality: Linting, Types, Formatting

From the monorepo root:

```bash
# Type checking across workspaces
bun run check-types

# Linting (per app, via Next.js)
cd apps/admin-dashboard && bun run lint
cd apps/candidate-dashboard && bun run lint

# Formatting (markdown + ts/tsx)
bun run format
```

---

## 🤝 Contributing

1. Fork and clone the repo.
2. Create a feature branch from `main`.
3. Run the app locally and add/update tests or types where relevant.
4. Ensure linting and formatting pass.
5. Open a pull request with a clear description and screenshots or recordings where relevant.

---

## 📄 License

Add your license text here (e.g. MIT, Apache‑2.0).

---

## 🙏 Acknowledgments

- Built with [Turborepo](https://turborepo.com/).
- UI components from [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/).
- Icons by [Lucide](https://lucide.dev/).
- AI powered by [OpenAI](https://openai.com/) and [ElevenLabs](https://elevenlabs.io/).
