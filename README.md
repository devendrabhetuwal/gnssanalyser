# OrbitView Pro

Act as a Senior Full-Stack Software Architect and WebGL Specialist. Build a high-performance web platform designed for GNSS (Global Navigation Satellite Systems) and IGS (International GNSS Service) scientific research, graph plotting, and dataset management.

### 1. Technology Stack

- Framework: Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI.

- Visualization & Computation: Three.js / React Three Fiber (3D satellite trajectories & Earth models), Plotly.js / D3.js (high-density time-series plots, ionospheric curves, PPP residuals, SNR plots), Web Workers / WebAssembly for client-side data parsing.

- Database & Auth: PostgreSQL with Prisma ORM; NextAuth.js supporting Google OAuth and GitHub OAuth.

- Cloud Infrastructure: Google Cloud Storage (GCP SDK) integration for user data persistence.

### 2. Core Functional Requirements

#### A. Authentication & Access Control (RBAC)

- Multi-provider Auth: Google and GitHub sign-in.

- User Roles: `USER` and `ADMIN`.

- Dynamic Route Guards: Middleware restricting `/dashboard` to authenticated users and `/admin` strictly to administrators.

#### B. User Workspace & High-Performance Plotting

- Data Parser: Engine for importing GNSS/IGS standard formats (RINEX, SP3, SINEX, CLK, IONEX).

- Scientific Graphics Suite: Ultra-fast canvas/WebGL rendering for multi-variable scatter plots, clock-bias curves, orbit error plots, and carrier-phase residuals.

- Google Cloud Connection: Direct GCP integration interface where users link their GCP project/bucket credentials to save, load, and compute heavy GNSS project files seamlessly.

#### C. Administration Panel (/admin)

- User Management: Table displaying all registered users, authentication methods, project counts, and role editing options.

- Global Data Monitoring: Oversight pane showing all user-created projects, uploaded GNSS files, active cloud transfer status, and platform compute load.

- Resource Analytics: Central telemetry tracking total GCP storage usage and graph rendering metrics across the platform.

### 3. UI/UX Design

- Aesthetic: Modern scientific dark mode with high-contrast data visualization colors, dynamic resizable panels, and glassmorphism cards.

Generate the project architecture, directory tree, Prisma schema, NextAuth configuration, GCP storage connection helper, and the primary dashboard component with interactive Plotly curve demo data.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://gnssanalyser.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5af16e0b-d2c7-439f-98b8-91213b14aef5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
