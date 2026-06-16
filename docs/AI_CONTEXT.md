# AI Context

StayFlow is a multi-tenant short-stay management and booking platform for guests, owners, and super admins. Core entities are users, homestays, rooms, hourly/overnight/daily bookings, payments, pricing rules, availability blocks, content/layout configuration, and support knowledge.

The server is authoritative for availability, prices, permissions, booking state, and payment state. A conflicting booking exists when `existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn` and its status is pending payment, paid, confirmed, or checked in. Hourly bookings use exact datetimes, not calendar-day occupancy.

Guest booking URLs include a separate random access token. A booking reference alone must not
grant access to private booking details or mutations. Chat status lookup requires the reference
and matching booking email.

Payment starts after the server creates a pending booking and provider session. Only a verified webhook may mark payment paid and advance the booking. Redirect pages never establish payment truth.

AI answers from approved knowledge and allowed backend tools. It cannot invent availability or pricing, expose private data, confirm a booking, or execute admin mutations without authenticated authorization.

UI uses semantic tokens, shared primitives, a common container, responsive layouts, and accessible states. Public routes are server-first; admin routes are interaction-heavy client islands. Layout JSON maps only to trusted React sections and never accepts scripts or arbitrary HTML.
