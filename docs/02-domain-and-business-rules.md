# Pikashu — Domain and Business Rules

## 1. User and Role

Each user has exactly one role.

```prisma
enum Role {
  ADMIN
  STAFF
  PASSENGER
}
```

User status:

```prisma
enum UserStatus {
  ACTIVE
  DISABLED
}
```

Rules:

- Admin can create Admin and Staff accounts.
- Staff cannot register themselves.
- Public registration only creates Passenger accounts.
- DISABLED users cannot authenticate.
- There is no INVITED status.
- Roles are stored directly on the User model.
- No separate role relation or role table is required.

## 2. Fleet

A Fleet represents a physical vehicle.

### Fleet Type

```prisma
enum FleetType {
  BUS
  MINIBUS
}
```

There are exactly two hardcoded seat layouts:

- BUS.
- MINIBUS.

Seat layouts cannot be edited through the Admin dashboard.

### Fleet Status

```prisma
enum FleetStatus {
  ACTIVE
  INACTIVE
}
```

Rules:

- ACTIVE fleets can be assigned to new trips.
- INACTIVE fleets cannot be assigned to new trips.
- A fleet cannot be deactivated while it is used by a trip with unresolved active bookings.
- A fleet that has never been used by a trip can be permanently deleted.
- A fleet that has been used historically cannot be permanently deleted. It must be marked INACTIVE.

### Fleet Seat Tier

```prisma
enum SeatTier {
  ECONOMY
  BUSINESS
}
```

**Critical rule: Each fleet has exactly one seat tier.**

Examples:

- Fleet A: BUS + ECONOMY.
- Fleet B: BUS + BUSINESS.
- Fleet C: MINIBUS + ECONOMY.

Every seat in the same fleet has the same tier and price.

A trip uses exactly one fleet. Therefore, a trip and its booking cannot contain multiple seat tiers.

Seat tiers are fixed enums, not CRUD resources.

Admin can manage the price and facilities associated with each tier.

A fleet cannot change its seat tier while it is used by a trip with active bookings.

## 3. Fleet Images

- A fleet can have multiple images.
- Exactly one image is designated as the main image.
- If the main image is deleted, another available image must be selected automatically.
- If no images remain, use the system placeholder.
- Store files under `uploads/fleets/`.

## 4. Facilities

Facilities belong to seat tiers.

Each facility contains:

- `image`
- `title`
- `description`

Rules:

- Each facility has exactly one image.
- Facilities do not have categories.
- Admin can create, update, and delete facilities.
- Store images under `uploads/facilities/`.

## 5. Route

A Route contains:

- Name.
- Origin city.
- Destination city.
- Origin coordinates.
- Destination coordinates.
- GeoJSON route path.
- Estimated duration.
- Status.

Route status:

```prisma
enum RouteStatus {
  ACTIVE
  INACTIVE
}
```

Rules:

- ACTIVE routes can be used for new trips.
- INACTIVE routes cannot be used for new trips.
- Routes never used by a trip can be permanently deleted.
- Historically used routes cannot be permanently deleted.
- A route used by a trip with active bookings cannot be edited directly.

There are no intermediate stops.

Leaflet displays a static route only.

Live GPS tracking and GPS-based ETA are excluded.

## 6. Recurring Schedule

A Schedule represents a recurring departure configuration.

```prisma
enum ScheduleStatus {
  ACTIVE
  INACTIVE
}
```

Rules:

- ACTIVE schedules generate trips automatically.
- INACTIVE schedules stop generating new trips.
- Already generated trips remain unchanged.
- Trip generation maintains a rolling seven-day horizon.
- Generation must be idempotent.
- A unique constraint must prevent duplicate trips for the same `(scheduleId, departureAt)`.

Schedule edits only affect trips generated after the change.

Existing trips must retain their original configuration.

If an existing trip with active bookings requires an operational change, cancel the old trip and create a replacement.

## 7. Trip

A Trip represents an actual scheduled journey.

A trip has:

- Schedule.
- Route.
- Fleet.
- Departure time.
- Arrival time.
- Price snapshot.
- Seat tier snapshot.
- Optional service price snapshots.
- Status.

Each trip uses exactly one fleet and one route.

```prisma
enum TripStatus {
  SCHEDULED
  CANCELLED
  COMPLETED
}
```

There is no ONGOING status.

A trip automatically becomes COMPLETED after `arrivalAt` has passed.

Admin can cancel a trip at any time before it becomes COMPLETED.

### Trip Snapshots

Trip pricing is captured when the trip is generated.

Changing fleet pricing must not affect existing trips.

Historical trip details must preserve the applicable seat tier, pricing, and facilities information.

Configuration changes must not modify historical transaction data.

## 8. Seat Layout and Availability

Seat layouts are hardcoded based on FleetType.

- BUS uses the BUS layout.
- MINIBUS uses the MINIBUS layout.

Admin cannot edit seat positions or seat counts.

Capacity is derived from the corresponding layout.

Public visitors can view seat layouts and availability.

Login is required before selecting seats or creating a seat hold.

Seat availability must be validated again during checkout to prevent double booking.

A booking can contain any number of seats, limited only by availability.

There is no fixed maximum such as five seats.

## 9. Optional Services

Optional services are managed through a global catalog.

Admin manages:

- Name.
- Description.
- Price.
- Optional per-trip capacity.
- Status.

Capacity rules:

- `null` means unlimited.
- A numeric value means the maximum quantity available per trip.

Optional services can only be purchased during checkout.

They cannot be purchased after successful payment.

Service pricing is snapshotted when a trip is generated.

Optional service capacity must be held during the payment period and released when an unpaid booking expires or is cancelled.

Services never used in historical bookings can be permanently deleted.

Historically used services cannot be permanently deleted. They must be marked INACTIVE.

## 10. Booking

A booking can contain multiple tickets.

Each ticket represents exactly one seat.

Each ticket has:

- One seat.
- One passenger name.
- One ticket code.
- One unique QR token.

Every passenger name is required.

The default passenger name comes from the account name, but it can be edited individually for each ticket.

### Booking Cutoff

Booking closes two hours before departure.

### Payment Hold

A booking has a 15-minute payment hold.

If payment is not completed before expiration:

- The booking expires.
- Held seats are released.
- Held optional service capacity is released.

## 11. Ticket

Ticket status:

```prisma
enum TicketStatus {
  VALID
  CANCELLED
}
```

Boarding status:

```prisma
enum BoardingStatus {
  NOT_BOARDED
  BOARDED
}
```

Lifecycle:

| Event               | Ticket Status | Boarding Status |
| ------------------- | ------------- | --------------- |
| Ticket created      | VALID         | NOT_BOARDED     |
| Successful boarding | VALID         | BOARDED         |
| Ticket cancelled    | CANCELLED     | NOT_BOARDED     |

There is no NO_SHOW status.

One seat produces one ticket and one QR Code.

## 12. Booking and Ticket Codes

Booking code format:

`PKH-XXXXXXXX`

Ticket code format:

`TKT-XXXXXXXX`

Rules:

- Eight random alphanumeric characters after the prefix.
- Unique database constraints.
- No sequential IDs.
- Handle collisions using retry logic.

The booking code identifies a transaction.

The ticket code identifies an individual passenger ticket.

## 13. Cancellation

Passengers may request booking cancellation until departure.

### Unpaid Booking

- No refund.
- Booking is cancelled.
- Inventory is released.

### Paid Booking

- Follow the Midtrans refund policy.
- No automatic cancellation fee.
- Use automatic refunds when supported.
- Admin handles manual refunds when automatic refunds are unsupported or fail.

### Admin Cancels a Trip

- Trip status becomes CANCELLED.
- Passengers receive transactional email.
- Related bookings and tickets are cancelled.
- Unpaid inventory is released.
- Paid bookings enter the refund process.

## 14. Staff Assignment

Staff and Trip have a many-to-many relationship.

Rules:

- One trip can have multiple Staff members.
- One Staff member can be assigned to multiple trips.
- Admin can change assignments at any time.
- Assignment changes only affect access permissions.
- Staff can only view manifests and scan tickets for assigned trips.
- DISABLED Staff cannot access the dashboard or scan tickets.

## 15. Resource Deletion

Fleet, Route, and Optional Service records that have historical usage must be preserved.

Use INACTIVE status to prevent future usage.

Passenger account deletion is not part of the MVP.

Audit logs are not part of the MVP.
