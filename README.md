# ⚡ StayFlow

> **StayFlow** is a premium, full-stack short-stay discovery, booking, and operations platform. Tailored for urban/city inventory, StayFlow enables guests to book rooms by the hour, overnight, or daily with real-time quote validation, interactive layout building, and support powered by AI.

---

## 🚀 Key Features

*   **⏱️ Flexible Booking Durations:** Guests can seamlessly reserve rooms hourly, overnight, or daily.
*   **💳 Demo Payment Gateway:** Server-confirmed, mock-provider payments for a fluid booking experience without actual credit cards.
*   **🤖 AI Support Widget:** An intelligent chat assistant to resolve guest queries and retrieve booking statuses locally.
*   **🛠️ Admin Dashboard:** Management portal for tracking bookings, managing homestay listings, customizing themes, and building dynamic UI layouts.
*   **🎨 Dynamic Theme Customizer & Layout Builder:** Personalize the frontend styling and site architecture in real time from the admin panel.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) | React framework for server-rendered page architectures & API routes. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript for robust frontend and backend operations. |
| **Database & ORM** | [Prisma](https://www.prisma.io/) & [PostgreSQL](https://www.postgresql.org/) | Modern ORM with seed scripts, migrations, and schema validation. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS styling for modern, highly responsive components. |
| **Validation** | [Zod](https://zod.dev/) | Strict schema validation for booking configurations and pricing engines. |

---

## 🏃 Getting Started

To spin up a local development server, follow these quick steps:

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/ghuyphan/stay-flow.git
cd stay-flow

# Install project dependencies
npm install
```

### 2. Configure Environment Variables
Create your local `.env` file by copying the example template:
```bash
cp .env.example .env
```
*(Open `.env` and set your preferred admin password, database URLs, and session secrets.)*

### 3. Initialize Database & Seed Demo Data
Ensure your PostgreSQL instance is running, then synchronize the Prisma schema and populate the database:
```bash
# Apply schema to database
npm run db:push

# Seed initial listing, room, and admin account data
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to explore StayFlow!

*   **🔑 Login Credentials:** Sign in to the Admin Dashboard at `/login` using the demo password: `stayflow-demo`.

---

## 📂 Project Structure

```
├── docs/                     # Architecture & layout guidelines
├── prisma/                   # Database schemas and seed scripts
├── src/
│   ├── app/                  # Next.js App Router (Public routes & Admin dashboard)
│   ├── components/           # UI, layout, and domain-specific components
│   ├── lib/                  # Utilities, mock data, and session helpers
│   └── server/               # Database access repositories, AI, and pricing logic
└── data/                     # Local file persistence for demo database
```

---

## 🧪 Quality Assurance & Building

StayFlow includes a complete suite of scripts to maintain code quality:

```bash
# Typecheck TypeScript files
npm run typecheck

# Lint workspace files
npm run lint

# Run unit & integration tests
npm run test

# Build production bundle
npm run build
```

---

## 🛡️ Security & Operations

*   **Server Authority:** Pricing logic, booking rules, payment truth, and user permissions are processed strictly server-side in `src/server/`.
*   **Production Deployment:** For production builds, ensure you configure strong, randomly generated `ADMIN_PASSWORD` and `SESSION_SECRET` variables in your environment config.
