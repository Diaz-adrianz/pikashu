# Pikashu — AI Agent Implementation Guide

## 1. Primary Instruction

You are an AI software engineering agent working on Pikashu.

Your responsibility is to extend the existing application while preserving its architecture, conventions, and working functionality.

The existing boilerplate is the source of truth for implementation patterns.

These documents define the approved product requirements and business rules.

Do not replace existing implementations simply because you prefer another architecture.

## 2. Mandatory Repository Inspection

Before implementing a feature:

1. Inspect the actual repository structure.
2. Read relevant existing files.
3. Inspect existing feature implementations.
4. Inspect existing components and hooks.
5. Inspect Prisma schema and configuration.
6. Inspect authentication and authorization.
7. Inspect existing API and Server Action patterns.
8. Inspect relevant dependencies.
9. Identify reusable utilities before creating new ones.

Never assume a file's contents based only on its filename.

Do not create duplicate abstractions or helpers.

If the repository is unavailable, state this limitation instead of claiming that files have been inspected.

## 3. Preserve the Existing Boilerplate

The following existing implementations must be preserved unless a justified change is necessary:

- Prisma setup.
- NextAuth configuration.
- Existing authentication pages.
- Existing shared components.
- Existing API response utilities.
- Existing Server Action utilities.
- Existing pagination hooks.
- Existing styling and UI conventions.
- Existing seed implementation.
- Existing Docker Compose configuration.

Known locations include:

```text
src/
├── app/
├── components/
│   ├── shared/
│   └── ui/
├── features/
│   └── user/
├── generated/
│   └── prisma/
├── hooks/
└── lib/
```

Verify the actual repository before using these paths.

## 4. Feature-Based Architecture

Use the existing feature-based structure.

Expected business domains include:

```text
src/features/
├── user/
├── fleet/
├── route/
├── schedule/
├── trip/
├── booking/
├── ticket/
├── payment/
└── optional-service/
```

These are expected domains, not permission to impose a new directory structure.

Follow the existing `features/user` implementation as the primary reference.

Use existing file conventions such as:

- `actions.ts`
- `schemas.ts`
- `services.ts`

Only introduce additional files when required by the existing architecture.

## 5. Prisma

Preserve:

- Existing Prisma configuration.
- Existing generator configuration.
- Existing datasource configuration.
- Existing generated client location.
- Existing Prisma singleton.

Known locations:

- `src/lib/prisma.ts`
- `src/generated/prisma`

Do not replace the Prisma client setup.

Extend the schema and create migrations according to existing project conventions.

Before changing a model:

1. Inspect existing models.
2. Inspect existing enums.
3. Inspect relations.
4. Check whether the required field or relation already exists.
5. Consider historical data and migration safety.

Do not duplicate existing models or fields.

## 6. Authentication and Authorization

Reuse the existing NextAuth configuration.

Required roles:

- ADMIN
- STAFF
- PASSENGER

Each User has exactly one role stored directly on the User model.

Required account statuses:

- ACTIVE
- DISABLED

Rules:

- Public registration only creates PASSENGER.
- Staff cannot self-register.
- Admin and Staff are created by Admin or seed.
- Disabled accounts cannot authenticate.
- Google authentication must link to an existing account when the verified email matches.
- Booking and ticket access must verify ownership.
- Staff access must verify trip assignment.
- Admin-only operations must enforce server-side authorization.

Never rely exclusively on client-side route guards or hidden UI elements.

## 7. Existing Seed

Preserve the existing Admin seed.

Previously identified behavior:

- `seedUsers`.
- Admin email: `admin@pikashu.id`.
- Password from `SEED_USER_PASSWORD`.
- Password hashing using `bcrypt.hash(..., 12)`.

Verify the actual implementation before modifying it.

Do not create a separate Admin bootstrap mechanism.

## 8. Query and Mutation Conventions

### Queries

Use client-side data fetching with SWR.

Reuse the existing pagination hook:

`useApiPaginate`

Do not create a new pagination implementation.

The existing pagination defaults are:

- Initial page: 1.
- Default limit: 10.
- Existing cache modes and query parameter behavior.

Verify the actual hook implementation before use.

### Mutations

Use Next.js Server Actions.

Follow the existing action conventions.

Do not introduce a separate mutation architecture without a clear requirement.

## 9. API Response Format

Use the response utilities from the existing `src/lib/api.ts`.

Known response types include:

```ts
export type ApiResponse<T> = {
  status?: number;
  message: string;
  data: T;
};

export type ApiResponsePaginate<T> = ApiResponse<{
  items: T[];
  total: number;
}>;
```

Additional known types:

```ts
export type ApiParams = Record<string, string | undefined>;

export type ApiFetcherError = {
  message: string;
};

export type ApiCacheMode = 'cached' | 'fresh';
```

These declarations must be verified against the actual source file.

Do not introduce an alternative response envelope.

## 10. UI and Components

Use:

- Tailwind CSS.
- Existing shadcn/ui components.
- Existing shared components.
- Existing hooks and utilities.

Do not introduce another component library unless it is technically essential and approved.

Maintain the existing visual conventions.

Avoid unnecessary redesign of working authentication pages or shared layouts.

## 11. Upload Handling

Store uploaded files in the project root:

```text
uploads/
├── fleets/
└── facilities/
```

Do not use Cloudflare R2 for these uploads.

Supported formats:

- JPEG.
- PNG.
- WebP.

Maximum file size:

5 MB per file.

Rules:

- Validate MIME type.
- Validate file extension.
- Generate UUID filenames.
- Store file paths in the database.
- Do not store image binary data in PostgreSQL.

No avatar upload is supported.

### Fleet Images

- Multiple images per fleet.
- One main image.
- Automatically select another image when the main image is deleted.
- Use a system placeholder when no image remains.

### Facility Images

- Exactly one image per facility.

## 12. Background Jobs and Infrastructure

Use:

- BullMQ.
- Redis.
- Docker Compose.

Do not use Vercel Cron.

Required jobs:

1. Rolling seven-day recurring trip generation.
2. Fifteen-minute unpaid booking expiration.
3. Trip completion after `arrivalAt`.

Use a worker process compatible with the existing Docker Compose architecture.

Inspect the current Docker configuration before changing services.

Do not replace existing service configurations unnecessarily.

## 13. Business Rules That Must Never Be Violated

The following rules are critical:

1. One fleet has exactly one seat tier.
2. One trip uses exactly one fleet.
3. All seats in a fleet share the same tier and price.
4. Fleet seat layouts are hardcoded.
5. Trip prices are snapshotted at trip generation.
6. Optional services are global catalog entries.
7. Optional service prices are snapshotted at trip generation.
8. Booking payment hold is 15 minutes.
9. Booking cutoff is two hours before departure.
10. Recurring trip generation maintains a seven-day horizon.
11. Passenger cancellation is allowed until departure.
12. No automatic cancellation fee is charged.
13. Ticket and boarding statuses are separate.
14. Each seat has one ticket and one QR Code.
15. QR tokens must be opaque and validated server-side.
16. QR scanning is online only.
17. Ticket access requires login and ownership verification.
18. Staff can access only assigned trips.
19. Staff assignments can change at any time.
20. There is no dashboard notification system.
21. There is no audit log.
22. There is no Passenger account deletion feature.
23. There is no live GPS tracking.
24. There are no intermediate boarding stops.

## 14. Data Integrity

Prioritize database-level integrity.

Use:

- Foreign keys.
- Unique constraints.
- Appropriate indexes.
- Transactions.
- Atomic updates.
- Safe concurrency handling.

Important uniqueness requirements include:

- Booking code.
- Ticket code.
- QR token.
- `(scheduleId, departureAt)` for generated trips.
- Appropriate active reservation constraints.

Do not rely only on client-side validation.

## 15. Security Requirements

- Validate all inputs on the server.
- Enforce authorization on the server.
- Verify booking ownership.
- Verify Staff trip assignment.
- Verify Midtrans notifications.
- Do not expose private passenger data in Staff manifests.
- Do not expose internal sequential IDs as public identifiers.
- Do not expose QR tokens in unrelated API responses.
- Prevent duplicate QR boarding.
- Protect against concurrent seat reservations.
- Validate uploaded files.
- Never trust client-provided payment status.

## 16. Testing Requirements

Add or update tests for relevant behavior.

Prioritize:

- Authentication and authorization.
- Booking ownership.
- Seat availability.
- Concurrent booking attempts.
- Payment webhook idempotency.
- Late payment handling.
- Booking expiration.
- Inventory release.
- Refund state transitions.
- Ticket generation.
- QR validation.
- Duplicate boarding prevention.
- Staff assignment permissions.
- Trip generation idempotency.
- Trip completion.
- Historical snapshot preservation.

Follow the existing testing framework and conventions.

Do not introduce a new testing framework without necessity.

## 17. Implementation Workflow

For each feature:

1. Read the relevant specification documents.
2. Inspect the existing implementation.
3. Identify reusable components and utilities.
4. Explain the intended changes.
5. Implement only the necessary changes.
6. Preserve unrelated code.
7. Update Prisma migrations if required.
8. Validate TypeScript types.
9. Run relevant linting and tests.
10. Report changed files and verification results.

Avoid rewriting unchanged code.

Prefer focused changes over large unrelated refactors.

## 18. Handling Unspecified Decisions

Do not invent product decisions.

When a requirement is not specified:

1. Inspect existing project conventions.
2. Use established technical practices where appropriate.
3. Identify assumptions explicitly.
4. Ask for clarification if the decision materially affects business behavior, data integrity, security, or user experience.

Technical implementation details may be chosen by the agent when they do not conflict with approved business rules.

## 19. Known Unspecified Items

The following details require verification or clarification when implementation reaches them:

- Exact Prisma model names and final schema.
- Exact booking and payment status enums.
- Exact Midtrans payment methods enabled.
- Exact Midtrans account refund capabilities.
- Exact email templates and content.
- Exact BUS and MINIBUS seat coordinates and layout definitions.
- Exact fleet and route form fields beyond confirmed requirements.
- Exact UI design and responsive layouts.
- Exact Admin and Passenger dashboard visual composition.
- Exact pagination filters for individual management pages.
- Exact BullMQ repeatable job scheduling strategy.
- Exact QR token generation and expiration policy.
- Exact ticket and booking code character set.
- Exact refund processing statuses.

Do not silently convert these items into confirmed product requirements.

## 20. Final Principle

The existing boilerplate is the foundation of Pikashu.

The approved business requirements define what the application must do.

The AI Agent must inspect the actual implementation before deciding how to extend it.

Preserve existing functionality, maintain consistency, and implement only what is required.
