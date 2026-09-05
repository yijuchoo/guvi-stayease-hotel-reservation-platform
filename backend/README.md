# StayEase — Backend

Hotel Reservation Platform backend, built with Spring Boot and MongoDB. Inspired by Booking.com — supports hotel search & booking for customers, property management for hotel managers, and platform oversight for admins.

**Live API:** https://stayease-backend-gbsv.onrender.com

**API Docs (Swagger):** https://stayease-backend-gbsv.onrender.com/swagger-ui/index.html

> Note: the backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity. The first request after a period of inactivity may take 30–60 seconds while the service wakes up.

---

## Tech Stack

- **Backend:** Spring Boot 4, Spring Security, Spring Data MongoDB
- **Database:** MongoDB Atlas (cloud-hosted)
- **Auth:** JWT (stateless, role-based access control)
- **Email:** Brevo (transactional email API)
- **SMS:** Twilio
- **API Docs:** springdoc-openapi (Swagger UI)
- **Testing:** JUnit 5 + Mockito
- **Deployment:** Docker container on Render

## Features

1. User Authentication & Account Management (register, login, JWT, password recovery, profile management)
2. Hotel Management (CRUD, ownership-restricted to the owning Hotel Manager)
3. Room Management (inventory, pricing, capacity, per-hotel ownership enforcement)
4. Hotel Search & Discovery (filter by city, price, rating, amenities, real-time date availability)
5. Hotel Booking (date-overlap availability checking, automatic price calculation)
6. Payment Management (simulated payment flow — no real payment gateway integrated)
7. Booking History (customer's own bookings; hotel manager's bookings for owned properties)
8. Reviews & Ratings (one review per customer per hotel, tied to a real booking, auto-updates hotel's star rating)
9. Notifications (email via Brevo, SMS via Twilio — booking, payment, cancellation, and account events)
10. Dashboards & Reports (role-specific: Customer, Hotel Manager, Admin)

## Roles

| Role | Access |
|---|---|
| `CUSTOMER` | Search/book hotels, manage own bookings, leave reviews, own dashboard |
| `HOTEL_MANAGER` | Manage own hotels/rooms, view bookings for own properties, own dashboard |
| `ADMIN` | Platform-wide dashboard and oversight |

Customers and Hotel Managers can self-register via `/api/auth/register` (with `role` set to `CUSTOMER` or `HOTEL_MANAGER`). **Admin accounts cannot be self-registered** — this is a deliberate security decision to prevent privilege escalation. To create an admin account, register normally, then manually promote the account's `roles` field in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { roles: ["ADMIN"] } }
)
```

---

## Running Locally

### Prerequisites
- Java 17
- Maven (or use the bundled `mvnw` wrapper)
- A MongoDB instance (local or Atlas)
- Gmail app password is **not** used — email runs through Brevo (see note below)
- A Twilio trial account (for SMS)
- A Brevo account (for email)

### Setup

1. Clone the repo and navigate to `backend/`
2. Create `src/main/resources/application.properties` (this file is gitignored and never committed) with the following:

```properties
spring.application.name=backend
spring.data.mongodb.uri=mongodb://localhost:27017
spring.data.mongodb.database=stayease
server.port=8080

jwt.secret=your-long-random-secret-at-least-256-bits
jwt.expiration-ms=86400000

brevo.api-key=your-brevo-api-key
brevo.sender-email=your-verified-brevo-sender-email

twilio.account-sid=your-twilio-sid
twilio.auth-token=your-twilio-auth-token
twilio.phone-number=your-twilio-phone-number
```

3. Run `BackendApplication.java` from your IDE, or:
```bash
mvn spring-boot:run
```
4. API available at `http://localhost:8080`, Swagger UI at `http://localhost:8080/swagger-ui.html`

### Running tests

```bash
mvn test
```
17 tests in total:
- **16 unit tests** (JUnit 5 + Mockito) covering the core business logic in `BookingService`, `UserService`, and `PaymentService` — availability/overlap calculations, duplicate-registration prevention, payment status guards, and password reset token validation, all with dependencies mocked so no real database is touched.
- **1 context-load test** (`BackendApplicationTests.contextLoads()`) confirming the full Spring application context — all beans, repositories, and security configuration — wires up correctly.

---

## Architecture Notes

### Why `MongoConfig` manually builds the `MongoTemplate` bean

Spring Boot 4.1.0 / Spring Data MongoDB 5.1.0 has an auto-configuration bug where `spring.data.mongodb.database` is silently ignored when `spring.data.mongodb.uri` doesn't include the database name in its path, causing the driver to fall back to Mongo's default `test` database. `MongoConfig` works around this by explicitly constructing the `MongoDatabaseFactory` and `MongoTemplate` beans from the two properties directly, bypassing the buggy auto-configuration path.

### Ownership model

Resources (`Hotel`, `Room`) store an `ownerId`/reference to the `User._id` of the Hotel Manager who owns them (not their email, which is mutable). All create/update endpoints for these resources check both **role** (`@PreAuthorize("hasRole('HOTEL_MANAGER')")`) and **ownership** (does this specific user own this specific resource) — role alone is not sufficient, since two different managers can hold the same role but must not be able to edit each other's properties.

### Payment flow

Bookings are created with status `PENDING`. A separate `POST /api/payments` call (simulated — no real payment gateway) transitions the booking to `CONFIRMED` on success. This models a realistic two-step flow without requiring live payment gateway credentials for a project of this scope.

### Notification failures never block business operations

`NotificationService` catches and logs all email/SMS failures internally rather than propagating them. A booking or payment should never fail just because a downstream notification service had an outage — this mirrors how production systems typically decouple core transactions from side-effect notifications.

---

## Deployment Notes (Render)

### Environment variables required

```
SPRING_PROFILES_ACTIVE=prod
MONGODB_URI=<Atlas connection string, no database in path>
MONGODB_DATABASE=stayease
JWT_SECRET=<long random secret>
JWT_EXPIRATION_MS=86400000
BREVO_API_KEY=<brevo api key>
BREVO_SENDER_EMAIL=<verified brevo sender>
TWILIO_ACCOUNT_SID=<twilio sid>
TWILIO_AUTH_TOKEN=<twilio auth token>
TWILIO_PHONE_NUMBER=<twilio phone number>
```

### Known third-party service constraints (encountered and resolved during deployment)

- **Render's free tier blocks outbound SMTP ports (25, 465, 587).** Email originally used Gmail SMTP via `JavaMailSender`, which worked locally but silently failed on Render with a connection timeout. Switched to **Brevo's HTTP API** (port 443, not blocked) — no SMTP involved.
- **Brevo blocks API calls from unauthorized IP addresses by default.** Since Render's free tier does not provide a static outbound IP (dedicated static IPs are a paid Render add-on), IP whitelisting is incompatible with this hosting setup. Resolved by disabling "Block unauthorized IP addresses for API keys" in Brevo's Security settings — the API key itself remains the sole authentication factor, kept out of source control via environment variables.
- **Twilio trial accounts restrict SMS to verified recipient numbers and predefined message templates** (custom message bodies are not available on trial accounts). The current implementation sends a fixed template (`sms_order_confirmation`); dynamic booking details are delivered via email instead, which has no such restriction. Upgrading the Twilio account removes both restrictions.

### Docker

The backend deploys as a Docker container (`backend/Dockerfile`), since Render has no native Java buildpack — the Dockerfile handles both the Maven build and the runtime JRE image in a multi-stage build to keep the final image lean.

---

## API Documentation

Full interactive API documentation is available via Swagger UI at `/swagger-ui.html` (locally or on the deployed URL above). Every endpoint requiring authentication accepts a `Bearer <token>` via the "Authorize" button in the Swagger UI, obtained from `POST /api/auth/login`.
