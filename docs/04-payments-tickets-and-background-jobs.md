# Pikashu — Payments, Tickets, and Background Jobs

## 1. Payment Integration

Pikashu uses Midtrans as its payment gateway.

The application must verify payment status using trusted server-side Midtrans responses and webhooks.

Never trust client-side payment status.

## 2. Booking Payment Hold

Every newly created booking has a payment hold of 15 minutes.

The expiration timestamp must be generated and stored by the server.

During the hold:

- Selected seats are reserved.
- Optional service capacity is reserved.
- The Passenger can complete payment.

When the hold expires without successful payment:

- The booking expires.
- Seats are released.
- Optional service capacity is released.
- The expired booking cannot continue through the original payment flow.

The UI must display a countdown based on the server expiration timestamp.

## 3. Payment Calculation

The checkout total consists of:

- Ticket prices.
- Optional service prices.

There is:

- No platform service fee.
- No automated tax calculation.

Use trip-level price snapshots rather than current fleet or service catalog prices.

Historical booking totals must remain unchanged when catalog prices change.

## 4. Payment Webhooks

All payment webhooks must be idempotent.

Repeated webhook delivery must not cause:

- Duplicate payment records.
- Duplicate tickets.
- Duplicate inventory updates.
- Duplicate refund operations.
- Duplicate booking state transitions.

Verify webhook authenticity using the appropriate Midtrans verification mechanism.

Never trust payment information submitted by the browser.

## 5. Late Successful Payments

A successful payment may arrive after the booking hold has expired.

Handle this case as follows:

1. Check whether the booking has already expired.
2. Check whether the originally reserved inventory is still available.
3. If inventory is still available, attempt to restore the booking.
4. If inventory is unavailable, do not restore the booking.
5. When restoration is impossible, initiate a refund if supported.
6. Otherwise, create an Admin/manual refund fallback.

All steps must be safe against duplicate webhook execution.

The system must not oversell seats or optional service capacity.

## 6. Refund Policy

### Passenger Cancellation

Passengers may request cancellation until departure.

For unpaid bookings:

- Cancel the booking.
- Release inventory.
- No refund is required.

For paid bookings:

- Use Midtrans automatic refund when supported.
- Use Admin/manual processing when automatic refunds are unsupported or fail.
- Do not charge an automatic cancellation fee.

### Admin Trip Cancellation

When Admin cancels a trip:

- Change trip status to CANCELLED.
- Notify affected passengers through email.
- Cancel related tickets and bookings according to the cancellation process.
- Release unpaid inventory.
- Process paid booking refunds.

### Refund Status

Do not mark a refund as successful merely because a refund request was accepted by the API.

Only mark it successful after receiving the appropriate Midtrans confirmation.

If manual processing is required, preserve its processing status until Admin confirms completion.

## 7. Ticket Generation

One seat produces exactly one ticket.

Each ticket must have:

- A unique ticket code.
- A unique QR token.
- A passenger name.
- A seat number.
- A ticket status.
- A boarding status.

Ticket code format:

`TKT-XXXXXXXX`

Booking code format:

`PKH-XXXXXXXX`

Both use eight random alphanumeric characters after their prefixes.

Use unique database constraints and collision retry logic.

Do not expose sequential database IDs as public ticket or booking identifiers.

## 8. QR Code Security

QR Codes must contain a unique opaque ticket token.

Do not encode:

- Booking IDs.
- Passenger personal information.
- Email addresses.
- Phone numbers.
- Other sensitive information.

The token must be validated server-side.

QR Codes are generated on demand.

The QR token must not be reusable for successful boarding.

## 9. Boarding Validation

A ticket can be boarded only when:

- The ticket exists.
- The ticket belongs to the relevant trip.
- The ticket status is VALID.
- The boarding status is NOT_BOARDED.
- The Staff member is assigned to the trip.
- The Staff account is ACTIVE.

Successful scanning changes:

`NOT_BOARDED` → `BOARDED`

A cancelled or already boarded ticket must be rejected.

The validation and status update must be atomic to prevent concurrent scans from boarding the same ticket twice.

QR scanning uses the browser Web Camera API.

Offline scanning is excluded.

## 10. Ticket Access

Ticket pages require authentication.

Only the booking owner may access the booking and its tickets.

Email links must:

1. Open the relevant ticket or booking URL.
2. Redirect unauthenticated users to login.
3. Return the user to the requested page after authentication.
4. Verify booking ownership on the server.

Staff access is governed separately by trip assignment and operational permissions.

## 11. Transactional Email

Use Nodemailer with Google SMTP.

Email is limited to these four use cases:

1. Booking and payment confirmation.
2. Ticket delivery.
3. Cancellation and refund notifications.
4. Trip changes and cancellation notifications.

No marketing emails or newsletters.

Ticket emails contain links to authenticated ticket pages.

QR Codes are generated on demand and are not required as email attachments.

## 12. Background Jobs

Use BullMQ and Redis.

Do not use Vercel Cron.

Run background workers as part of the Docker Compose deployment.

### 12.1 Recurring Trip Generation

Purpose:

Maintain a rolling seven-day trip generation horizon.

Rules:

- Generate trips from ACTIVE schedules.
- Do not generate trips from INACTIVE schedules.
- Prevent duplicates using `(scheduleId, departureAt)`.
- Preserve already generated trips.
- Make generation idempotent.

### 12.2 Booking Expiration

Purpose:

Expire unpaid bookings after the 15-minute payment hold.

Rules:

- Check the actual booking expiration timestamp.
- Do not expire bookings that have already been paid successfully.
- Update the booking state safely.
- Release held seats.
- Release optional service capacity.
- Prevent duplicate expiration processing.

The expiration job must be safe when a payment webhook arrives at approximately the same time.

### 12.3 Trip Completion

Purpose:

Automatically mark trips COMPLETED after `arrivalAt`.

Rules:

- Process trips whose arrival time has passed.
- Only transition eligible trips.
- Do not change CANCELLED trips to COMPLETED.
- Make processing idempotent.

## 13. Job Reliability

All background jobs must:

- Be idempotent.
- Handle retries safely.
- Avoid duplicate business operations.
- Log operational errors.
- Handle worker restarts.
- Use database transactions where required.
- Avoid relying solely on in-memory state.

Job scheduling and worker implementation must follow the existing project architecture where possible.

## 14. Booking and Inventory Concurrency

Seat reservation and optional service reservation must be protected against concurrent checkout requests.

The system must guarantee:

- A seat cannot be sold twice.
- Optional service capacity cannot be exceeded.
- Expiration cannot release already paid inventory.
- Payment confirmation cannot activate an already invalid reservation without availability checks.

Use appropriate PostgreSQL constraints, transactions, and locking strategies.

The exact implementation must be chosen after inspecting the existing Prisma schema and database conventions.

## 15. Important Unspecified Payment Details

The following must not be assumed without verification or an explicit product decision:

- Exact Midtrans payment methods enabled.
- Exact payment notification retry policy.
- Exact refund API support for every payment method.
- Final payment status enum names.
- Final booking status enum names.
- Midtrans account-specific configuration.

Use supported Midtrans capabilities and retain Admin/manual fallback for refunds.
