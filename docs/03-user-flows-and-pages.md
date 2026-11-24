# Pikashu — User Flows and Pages

## 1. Public Pages

The following pages are accessible without authentication.

### 1.1 Landing Page

The landing page provides:

- Platform introduction.
- Public trip search form.
- Origin city.
- Destination city.
- Departure date.
- Number of seats.
- Seat tier.

Trip search must be available directly from the landing page.

### 1.2 Search Results

Display trips matching the search criteria.

Only show trips that:

- Have `SCHEDULED` status.
- Have available seats.
- Have not passed the booking cutoff.

Default sorting:

- Earliest departure first.

Additional sorting options:

- Lowest price.
- Highest price.
- Earliest departure.
- Latest departure.

Pagination:

- Use the existing `useApiPaginate`.
- Default page size: 10 trips.

### 1.3 Trip Details

Trip detail pages are publicly accessible.

Display:

- Route information.
- Departure and arrival times.
- Ticket price.
- Fleet information.
- Seat tier.
- Facilities.
- Static Leaflet route map.
- Seat availability.
- Seat layout.

Visitors can view seat layouts and availability.

Authentication is required before selecting seats.

## 2. Authentication Pages

Reuse the existing login and registration pages.

Supported authentication methods:

- Credentials.
- Google.

Rules:

- Public registration creates Passenger accounts only.
- Email verification is not required for authentication.
- Google authentication must link to an existing account when the verified email matches.

## 3. Passenger Pages

Passenger pages should stunning and must not using dashboard style like staff and admin.

### 3.1 Passenger Dashboard

Displays a summary of the Passenger's bookings and upcoming journeys.

### 3.2 Booking History

Display:

- Upcoming bookings.
- Completed bookings.
- Cancelled bookings.
- Expired bookings.

Each booking should display:

- Booking code.
- Trip information.
- Payment status.
- Refund status.
- Ticket details.

### 3.3 Booking Search

Passengers can search for their bookings using the booking code.

Search results must be restricted to the authenticated Passenger's own bookings.

### 3.4 Booking Details

Authentication is mandatory.

Only the booking owner can access the booking.

Display:

- Booking code.
- Trip information.
- Payment information.
- Ticket list.
- Ticket statuses.
- Refund information, when applicable.

### 3.5 Ticket Details

Each ticket must display:

- Ticket code.
- QR Code.
- Passenger name.
- Seat number.
- Route.
- Departure date.
- Departure time.
- Arrival time.
- Fleet.
- Seat tier.
- Ticket status.
- Boarding status.

QR Codes are generated on demand.

Ticket pages require authentication and ownership verification.

Email ticket links must redirect unauthenticated users to login and return them to the requested ticket after successful authentication.

### 3.6 Passenger Profile

Passengers can update:

- Full name.
- Phone number.

Email cannot be changed in the MVP.

Credentials users can manage their passwords.

Avatar rules:

- Google users use their Google avatar.
- Credentials users use the default system avatar.

Avatar uploads are not supported.

Passenger account deletion is not supported.

## 4. Booking Flow

1. Passenger opens the landing page.
2. Passenger enters search criteria.
3. Passenger views search results.
4. Passenger opens a trip detail page.
5. Passenger views seat layouts and availability.
6. Passenger logs in if not authenticated.
7. Passenger selects seats.
8. Passenger enters the name for each passenger.
9. Passenger selects optional services.
10. Passenger reviews the checkout summary.
11. Passenger creates a booking.
12. The system validates seat availability again.
13. The system creates a 15-minute payment hold.
14. Passenger proceeds to Midtrans payment.
15. Successful payment confirms the booking.
16. Tickets become available according to the ticket lifecycle.
17. Passenger accesses tickets through the dashboard and email.

## 5. Payment Page

Display:

- Booking summary.
- Ticket summary.
- Optional services.
- Total payment.
- Fifteen-minute countdown.
- Payment action.

The countdown must use the server-provided expiration timestamp.

It must not rely exclusively on a client-side timer.

When the payment hold expires:

- The booking expires.
- Held seats are released.
- Optional service capacity is released.
- The expired booking cannot be paid again.

## 6. Passenger Cancellation Flow

Passengers can request cancellation until departure.

For unpaid bookings:

- Cancel the booking.
- Release inventory.
- Do not issue a refund.

For paid bookings:

- Start the applicable refund process.
- Do not charge an automatic cancellation fee.
- Use Admin/manual fallback when automatic refunds are unavailable.

Passengers can view refund status from booking history and booking details.

## 7. Staff Pages

Reuse the existing staff layout and pages.

### 7.1 Staff Dashboard

Display assigned trips with:

- Trip schedule.
- Departure time.
- Arrival time.
- Route.
- Fleet.
- Passenger count.
- Boarded count.
- Not-boarded count.

### 7.2 Staff Manifest

Display:

- Booking code.
- Ticket code.
- Passenger name.
- Seat number.
- Ticket status.
- Boarding status.
- Boarding time, when available.

Do not display:

- Passenger email.
- Passenger phone number.
- Payment information.

### 7.3 QR Scanner

Use the browser Web Camera API.

Rules:

- Online validation is mandatory.
- Only Staff assigned to the trip can scan its tickets.
- Only VALID and NOT_BOARDED tickets can be boarded.
- Successful validation changes boarding status to BOARDED.
- CANCELLED and already BOARDED tickets must be rejected.
- Offline scanning is not supported.

## 8. Admin Pages

Reuse the existing admin layout and pages.

### 8.1 Admin Dashboard

Display:

- Total revenue from successful payments.
- Booking counts by status.
- Seats sold and remaining per trip.
- Occupancy per trip.
- Transaction history.
- Refund history.
- Upcoming trips.
- Operational trip information.

There is no dashboard notification system.

### 8.2 Fleet Management

Admin can:

- Create fleets.
- Update fleets.
- Activate or deactivate fleets.
- Manage fleet images.
- Assign a fixed seat tier.
- Configure pricing for the applicable tier.

There is no seat map editor.

### 8.3 Route Management

Admin can:

- Create routes.
- Update routes.
- Activate or deactivate routes.
- Configure origin and destination.
- Configure GeoJSON route paths.
- Configure estimated duration.

### 8.4 Schedule Management

Admin can:

- Create recurring schedules.
- Update recurring schedules.
- Activate or deactivate schedules.

Schedule changes only affect trips generated after the change.

### 8.5 Trip Management

Admin can:

- View trips.
- Cancel trips.
- Manage Staff assignments.

Trips with active bookings must not be directly modified when the change affects existing passengers.

Use the cancel-and-replace process.

### 8.6 Optional Service Management

Admin can:

- Create services.
- Update services.
- Activate or deactivate services.
- Configure prices.
- Configure optional capacity.

### 8.7 Facility Management

Admin can:

- Create facilities.
- Update facilities.
- Delete facilities.

Each facility has one image, one title, and one description.

Facilities have no categories.

### 8.8 Staff Management

Admin can:

- Create Staff accounts.
- Update Staff names and phone numbers.
- Activate or deactivate Staff.
- Assign Staff to trips.
- Change assignments at any time.

Admin cannot view Staff passwords.

Password resets must use the existing authentication mechanisms.

## 9. Access Control Summary

| Feature             | Public | Passenger    | Staff                    | Admin                 |
| ------------------- | ------ | ------------ | ------------------------ | --------------------- |
| Landing page        | Yes    | Yes          | Yes                      | Yes                   |
| Trip search         | Yes    | Yes          | Yes                      | Yes                   |
| Trip details        | Yes    | Yes          | Yes                      | Yes                   |
| Seat availability   | Yes    | Yes          | Yes                      | Yes                   |
| Seat selection      | No     | Yes          | No                       | No                    |
| Booking             | No     | Yes          | No                       | No                    |
| Ticket access       | No     | Own tickets  | Assigned trip operations | Administrative access |
| Booking history     | No     | Own bookings | No                       | Yes                   |
| Staff manifest      | No     | No           | Assigned trips           | Yes                   |
| QR scanning         | No     | No           | Assigned trips           | No                    |
| Fleet management    | No     | No           | No                       | Yes                   |
| Route management    | No     | No           | No                       | Yes                   |
| Schedule management | No     | No           | No                       | Yes                   |
| Staff management    | No     | No           | No                       | Yes                   |

Authorization must always be enforced on the server.

Hiding UI elements is not sufficient access control.
