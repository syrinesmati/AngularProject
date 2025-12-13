# TaskFlow Pro Backend – Frontend Integration Guide

This file captures what the Angular frontend needs: endpoints, payloads, filters, auth expectations, and data shapes. All routes are REST over JSON, protected by JWT (cookie first, bearer fallback). Use Swagger for live docs.

## Auth & Session
- Login: `POST /auth/login` `{ email, password }` → sets HTTP-only cookie (`access_token`) and returns user. Use cookie for requests; bearer token also accepted.
- Register: `POST /auth/register` `{ email, password, firstName, lastName }`.
- Current user: `GET /auth/me` returns user profile; fails 401 if not logged in.
- Logout: `POST /auth/logout` clears cookie.
- Guarding UI: treat 401/403 as unauth; role guard exists for ADMIN-only endpoints (`/auth/admin-only`).

## Projects & Members
- List/create/update/archive projects: `POST /projects`, `GET /projects`, `PATCH /projects/:id`, `DELETE /projects/:id` (archive semantics, not hard delete).
- Members are enforced: owner or member required. `ProjectMemberRole` = OWNER | EDITOR | VIEWER. Membership listing/management available via Projects module (see Swagger).

## Tasks
- Create: `POST /tasks` `{ title, description?, status?, priority?, dueDate?, position?, projectId, assigneeIds?[] }`.
- List by project with filters/pagination: `GET /tasks/project/:projectId` query `{ status?, priority?, assigneeId?, search?, page?, limit? }` returns `{ data, meta { total, page, limit, totalPages } }`.
- Get one: `GET /tasks/:id` includes owner and assignees.
- Update: `PATCH /tasks/:id` (any of title/description/status/priority/dueDate/position).
- Delete: `DELETE /tasks/:id`.
- Assign/unassign: `POST /tasks/:taskId/assign` `{ userId }`; `DELETE /tasks/:taskId/assign/:userId`.
- Status/priority enums: status = TODO | IN_PROGRESS | IN_REVIEW | DONE; priority = LOW | MEDIUM | HIGH | URGENT.

## Subtasks
- CRUD under `/subtasks`: create requires `taskId`; list via task-scoped operations in UI (use task fetch).

## Labels
- CRUD under `/labels`.
- Tasks can be filtered by label in search endpoints (see Search below). Task-label association is managed inside task updates (labels relation available from Prisma; UI can supply `labelId` filters to search).

## Comments
- Add: `POST /comments` `{ content, taskId }`.
- List for task: `GET /comments/task/:taskId` (newest first), includes author info.
- Update/Delete (author only): `PATCH /comments/:id`, `DELETE /comments/:id`.
- Activity and notifications fire to task owner/assignees.

## Attachments (metadata only)
- Create metadata: `POST /attachments` `{ fileName, fileUrl, fileSize, mimeType, taskId }`.
- List by task: `GET /attachments/task/:taskId` (newest first).
- Delete: `DELETE /attachments/:id`.
- File storage is BYO (provide `fileUrl` from your uploader/S3/Blob). Server enforces project membership, not upload.

## Search (cross-project)
- Tasks: `GET /search/tasks` query params
	- `q` (text on title/description, case-insensitive)
	- `status`, `priority` (enums above)
	- `projectId` (optional scope; must be accessible)
	- `labelId`
	- `dueFrom`, `dueTo` (ISO strings)
	- `page`, `limit`
	Returns paginated tasks with owner, assignees, labels.
- Comments: `GET /search/comments` query params
	- `q` (text on comment content)
	- `taskStatus`, `taskPriority`
	- `projectId`, `labelId`
	- `dueFrom`, `dueTo`
	- `page`, `limit`
	Returns comments with author and task context (title/status/priority/dueDate/projectId).
- Access control: results limited to projects where user is owner or member; requesting an unauthorized `projectId` yields 403.

## Notifications
- Notifications are created for task assignment/update/completion and comments. Listing endpoints exist in Notifications module; each notification has `id`, `type`, `title`, `message`, `isRead`, `entityId`, timestamps. Mark-as-read endpoint available (see Swagger).

## Activity Log
- Recorded for task create/delete/assign, comment add, etc. Activity endpoints list by project/task/user with timestamps and metadata. Use for audit timeline in UI.

## Validation & Errors
- Global `ValidationPipe` with `whitelist` and `forbidNonWhitelisted`: extra payload fields are rejected 400.
- Common errors: 401 unauthenticated, 403 not project member, 404 when entity missing, 400 on validation.

## Environment & Running
- `.env` needs `DATABASE_URL` (pooler) and `DIRECT_URL`. Validation in `src/config/env.validation.ts`.
- Dev start: `npm run start:dev` (PORT default 3000). On Windows + Supabase pooler: `NODE_TLS_REJECT_UNAUTHORIZED=0` is set inside Prisma service for compatibility.

## Seed Data (for local/demo)
- Admin: `admin@taskflow.dev` / `Password123!`
- Member: `member@taskflow.dev` / `Password123!`
- Seed script: `set NODE_TLS_REJECT_UNAUTHORIZED=0 && npx ts-node --skip-project prisma/seed.ts`.

## Frontend Tips
- Rely on HTTP-only cookie; avoid storing token. For API tooling, send bearer from `access_token` cookie if needed.
- Drive dropdowns from enums above; prefer select inputs for status/priority/roles.
- Paginated responses share `{ data, meta { total, page, limit, totalPages } }` shape across tasks/search.
- Use search endpoints for global search bar; project filter optional and enforced server-side.
- Attachments UI should upload to storage first, then POST metadata with resulting URL.
