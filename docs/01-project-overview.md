# Pikashu — Project Overview

## 1. Project Description

Pikashu is an online bus and minibus ticket booking platform.

The platform allows passengers to search for trips, view trip details, select seats, book tickets, make online payments, and access electronic tickets.

It also provides operational management features for administrators and boarding validation tools for assigned staff.

The application has three user roles:

- ADMIN
- STAFF
- PASSENGER

This document defines the project's overall scope, technology stack, architecture, and fundamental implementation principles.

## 2. MVP Scope

### Included Features

- Authentication and authorization.
- Passenger registration and login.
- Google and Credentials authentication.
- Passenger profile management.
- Staff and Admin account management.
- Fleet management.
- Route management.
- Recurring schedule management.
- Automatic trip generation.
- Public trip search.
- Public trip details.
- Seat selection.
- Booking and checkout.
- Midtrans payment integration.
- Refund processing.
- Optional services.
- Electronic tickets.
- QR Code generation.
- QR scanning through the Web Camera API.
- Passenger booking history.
- Staff trip manifest.
- Admin dashboard.
- Transactional email.
- Background jobs using BullMQ and Redis.

### Excluded Features

- Live GPS tracking.
- GPS-based ETA.
- Intermediate boarding stops.
- Offline QR scanning.
- Native mobile applications.
- Seat map editor.
- Seat tier CRUD.
- Dashboard notification system.
- Audit logs.
- Passenger account deletion.
- Marketing emails and newsletters.

## 3. Technology Stack

| Area            | Technology               |
| --------------- | ------------------------ |
| Framework       | Next.js App Router       |
| Language        | TypeScript               |
| Database        | PostgreSQL               |
| ORM             | Prisma                   |
| Authentication  | Existing NextAuth setup  |
| Styling         | Tailwind CSS             |
| UI Components   | shadcn/ui                |
| Data Fetching   | SWR                      |
| Pagination      | Existing useApiPaginate  |
| Mutations       | Next.js Server Actions   |
| Payment Gateway | Midtrans                 |
| Maps            | Leaflet                  |
| Background Jobs | BullMQ                   |
| Queue Storage   | Redis                    |
| Email           | Nodemailer + Google SMTP |
| Deployment      | Docker Compose           |

## 4. Existing Boilerplate

Pikashu is built on top of an existing boilerplate.

The existing implementation must be preserved and extended.

Important existing locations include:

- `src/lib/prisma.ts`
- `src/lib/auth.ts`
- `src/lib/api.ts`
- `src/lib/action.ts`
- `src/lib/utils.ts`
- `src/hooks/`
- `src/components/`
- `src/features/user/`
- `src/generated/prisma`

These paths are based on the previously identified boilerplate structure and must be verified before implementation.

Do not replace existing Prisma configuration, authentication configuration, or working application features without a justified technical reason.

## 5. Application Roles

### ADMIN

Admin manages the platform's operational resources.

Responsibilities:

- Manage Admin and Staff accounts.
- Manage fleets.
- Manage routes.
- Manage recurring schedules.
- Manage trips.
- Manage fleet pricing.
- Manage facilities.
- Manage optional services.
- Manage Staff assignments.
- View bookings and transactions.
- Process manual refunds when required.
- View operational dashboard metrics.

### STAFF

Staff handles passenger boarding operations.

Permissions:

- View assigned trips.
- View assigned trip manifests.
- Scan ticket QR Codes.
- View ticket and boarding statuses.

Staff cannot manage fleets, routes, schedules, prices, or bookings.

### PASSENGER

Passenger can:

- Search for trips publicly.
- View trip details publicly.
- Register and log in.
- Select seats.
- Create bookings.
- Purchase optional services.
- Pay for bookings.
- Access electronic tickets.
- View booking history.
- Manage their profile.
- Request booking cancellation.

## 6. Authentication

Use the existing NextAuth implementation.

Supported providers:

- Google.
- Credentials.

Rules:

- Public registration creates PASSENGER accounts only.
- Admin and Staff accounts are created by Admin or through the existing seed process.
- Staff cannot register themselves.
- Google authentication using an already registered verified email must link to the existing account instead of creating a duplicate account.
- Email verification is not required for authentication.
- User status is limited to ACTIVE and DISABLED.
- There is no INVITED status.
- The `emailVerified` field may remain for NextAuth compatibility.

The user's role must be stored directly on the User model through a Prisma enum.

Do not create a separate role relation or role table.

## 7. General Architecture

Use the existing feature-based architecture under `src/features/`.

Expected feature domains include:

- user
- fleet
- route
- schedule
- trip
- booking
- ticket
- payment
- optional-service

Follow the existing boilerplate conventions.

Before creating new abstractions, inspect whether equivalent utilities, hooks, services, or components already exist.

## 8. Timezone

The only operational timezone is:

`Asia/Jakarta`

Rules:

- Store timestamps in UTC.
- Display operational dates and times in WIB.
- Use the business timezone for scheduling and booking cutoff calculations.
- Do not rely on the browser's local timezone for business rules.

## 9. Deployment Architecture

Deployment uses Docker Compose.

Required components:

- Next.js application.
- PostgreSQL.
- Redis.
- BullMQ worker.

Do not use Vercel Cron.

Scheduled and background tasks must use BullMQ and Redis.

## 10. Documentation Structure

The project specification consists of five documents:

1. `01-PROJECT-OVERVIEW.md`
2. `02-DOMAIN-AND-BUSINESS-RULES.md`
3. `03-USER-FLOWS-AND-PAGES.md`
4. `04-PAYMENTS-TICKETS-AND-BACKGROUND-JOBS.md`
5. `05-AI-AGENT-IMPLEMENTATION-GUIDE.md`

All five documents should be reviewed before major implementation work.
