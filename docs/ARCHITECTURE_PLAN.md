# Architecture Plan

1. Foundation: design docs, tokens, strict tooling, shared primitives, and route shells.
2. Domain: Prisma schema, repositories/adapters, validation, availability, pricing, and booking services.
3. Public product: server-rendered discovery/detail pages and client booking interactions.
4. Operations: protected admin dashboard and CRUD workflows.
5. Integrations: payment, storage, AI, notifications, and audit adapters with mock defaults.
6. Customization: validated theme and section layout configuration with draft/publish.
7. Quality: unit/integration coverage, accessibility review, performance checks, and deployment documentation.

Service interfaces isolate infrastructure. Route handlers and server actions validate input, authorize the actor, call a service, and map domain errors to stable responses. UI never imports Prisma.
