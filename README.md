# StayEase — Hotel Reservation Platform

A Booking.com-inspired hotel reservation platform. Customers search and book hotels; Hotel Managers list and manage their properties; Admins oversee the platform.

## Live Deployment

| | URL |
|---|---|
| **Frontend (Vercel)** | https://guvi-stayease-hotel-reservation-pla.vercel.app |
| **Backend API (Render)** | https://stayease-backend-gbsv.onrender.com |
| **API Docs (Swagger)** | https://stayease-backend-gbsv.onrender.com/swagger-ui/index.html |

> The backend runs on Render's free tier and sleeps after 15 minutes of inactivity — the first request after a period of inactivity can take up to a couple of minutes to wake up. This is expected; the frontend shows a message asking you to stay on the page rather than refresh during long waits.

## Repository Structure

```
stayease/
├── backend/     → Spring Boot REST API — see backend/README.md
└── frontend/    → React + TypeScript SPA — see frontend/README.md
```

Each folder has its own detailed README covering local setup, architecture decisions, and deployment notes specific to that half of the stack.

## Tech Stack

**Backend:** Spring Boot, Spring Security, Spring Data MongoDB, JWT auth, MongoDB Atlas, Brevo (email), Twilio (SMS), springdoc-openapi, JUnit 5 + Mockito, Docker, deployed on Render.

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, React Router, Axios, deployed on Vercel.

## Features

1. **User Authentication & Account Management** — registration (Customer or Hotel Manager self-serve; Admin seeded manually), JWT login, password recovery, profile management
2. **Hotel Management** — create and edit listings, ownership-restricted to the owning manager
3. **Room Management** — create and edit room inventory, pricing, and capacity per hotel
4. **Hotel Search & Discovery** — filter by city, price, rating, amenities, and real-time date availability
5. **Hotel Booking** — availability checking with date-overlap detection, automatic pricing, cancellation and payment cut off once check-in has passed, stale unpaid bookings auto-cancelled on a schedule
6. **Payment Management** — simulated payment flow modelling a real two-step booking → payment → confirmation lifecycle
7. **Booking History** — customers see their own bookings enriched with hotel and room details; managers see bookings for their properties enriched with customer name and room type
8. **Reviews & Ratings** — one review per booking (repeat guests can review each stay), tied to a completed reservation, auto-updates the hotel's star rating
9. **Notifications** — email (Brevo) and SMS (Twilio) for registration, booking, payment, and cancellation events
10. **Dashboards & Reports** — role-specific summaries for Customers, Hotel Managers, and Admins

## Roles

| Role | Can do |
|---|---|
| `CUSTOMER` | Search/book hotels, manage own bookings and payments, leave reviews, view own dashboard |
| `HOTEL_MANAGER` | Manage own hotels and rooms, view bookings for owned properties, view own dashboard |
| `ADMIN` | View platform-wide dashboard; cannot be self-registered (seeded manually for security) |

## Getting Started Locally

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for full setup instructions, including required environment variables and third-party accounts (MongoDB Atlas, Brevo, Twilio).

Quick summary:
1. Set up the backend first (needs MongoDB, a JWT secret, Brevo and Twilio credentials) and confirm it runs at `http://localhost:8080`
2. Point the frontend's `.env` at that backend URL and run it at `http://localhost:5173`

## Testing

The backend includes 17 automated tests (16 Mockito-based unit tests covering core business logic in `BookingService`, `UserService`, and `PaymentService`, plus a Spring context-load test). Run with `mvn test` from `backend/`.

## Notable Engineering Decisions

A few things worth knowing if reviewing this project, detailed further in each subfolder's README:
- **`MongoConfig`** manually constructs the Mongo beans to work around a Spring Boot 4.1.0 / Spring Data MongoDB 5.1.0 auto-configuration bug that silently ignored `spring.data.mongodb.database`.
- **Ownership checks** are layered on top of role checks throughout (`@PreAuthorize` alone isn't sufficient — a Hotel Manager can only edit *their own* properties, not any property).
- **Email switched from Gmail SMTP to Brevo's HTTP API** after discovering Render's free tier blocks outbound SMTP ports.
- **Date-based booking lifecycle rules** (no paying or cancelling once check-in has passed) plus an hourly scheduled job that auto-cancels stale unpaid bookings.
