# Rendering Architecture

Public discovery and detail routes use Server Components by default. The homepage and listing can use static generation with revalidation; homestay details use ISR and dynamic metadata. Booking status is server-rendered and privately resolved. Interactive filters, calendars, booking forms, galleries, payment redirects, favorites, and AI chat are focused Client Components.

Admin routes are protected and CSR-heavy, with server components providing the shell and initial authorization. Editors, tables, forms, drag-and-drop, theme previews, and dashboard widgets run as client islands.

Layout builder state is client-side, but save and publish mutations are server-authorized. Booking and payment business logic always executes in services on the server. AI chat uses a client widget backed by a rate-limited API route.

Publishing homestay content, rooms, pricing, images, theme, or layout revalidates `/`, `/homestays`, the affected homestay path, and room paths. Public metadata includes canonical URLs, Open Graph content, cover images, and lodging structured data where complete.

Heavy admin libraries must not enter public bundles. Dynamic imports are appropriate for chat, builders, charts, and rich galleries.
