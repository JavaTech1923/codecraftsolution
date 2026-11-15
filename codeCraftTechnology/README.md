# Aether Systems digital experience

A premium, dark-theme software engineering consultancy website and lead-management platform. The repository is a small monorepo: an Angular 19 standalone frontend and a Spring Boot 3 REST API, backed by PostgreSQL and Flyway. The brand and all editable marketing content are seeded in the API database and can be changed through the authenticated admin workspace.

> **Before launch:** Aether Systems and the sample project outcomes, client names, ratings, uptime and team metrics are fictional sample content. Replace or verify them with approved company information in Admin → Site settings and content sections. Do not publish illustrative case-study results as customer claims.

## Project structure

```text
.
├── src/                                  # Angular 19 application
│   └── app/
│       ├── components/                   # Navbar, hero, services, work, contact, footer, etc.
│       ├── core/models/                  # API response and request contracts
│       ├── core/services/                # HttpClient APIs, auth, SEO
│       └── pages/                        # Home and admin routes
├── backend/
│   ├── src/main/java/dev/aether/api/
│   │   ├── content/                      # Site content controller/service/repository/entity
│   │   ├── leads/                        # Contact lead DTO/entity/mapper/repository/service/controller
│   │   ├── security/                     # JWT, roles, authentication, bootstrap provisioning
│   │   ├── admin/                        # Role-protected content and lead management
│   │   └── common/                       # API validation errors
│   └── src/main/resources/db/migration/  # PostgreSQL Flyway schema and seed content
├── Dockerfile                            # Angular + Nginx image
├── backend/Dockerfile                    # Spring Boot image
├── docker-compose.yml                    # Local PostgreSQL + API + website
└── nginx.conf.template                   # SPA fallback and API reverse proxy
```

## Technology

- **Web:** Angular 19, standalone components, signals, strict TypeScript, reactive forms, RxJS, Tailwind CSS, PrimeNG, Angular animations provider, GSAP.
- **API:** Java 21, Spring Boot 3.4, Spring Security, stateless JWT, Spring Data JPA, Bean Validation.
- **Data:** PostgreSQL 16, Flyway migrations, JSONB-backed editable page sections plus relational lead/account schema.
- **Operations:** Docker, Nginx, Azure App Service containers and Azure Front Door.

## Run locally

### Prerequisites

- Node.js 20 LTS and npm
- Java 21 and Maven 3.9 (or Docker Desktop with Compose)
- PostgreSQL 16 if running the API outside Compose

### Option A — Docker Compose

Create a local `.env` file (never commit it) with a fresh Base64-encoded random key of at least 32 bytes, a database password, and optional initial super-admin credentials. `ADMIN_BOOTSTRAP_PASSWORD` must contain at least 14 characters. Example variable names:

```dotenv
DATABASE_PASSWORD=replace-with-a-local-only-password
JWT_SECRET_BASE64=replace-with-a-random-base64-encoded-32-byte-key
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
ADMIN_BOOTSTRAP_PASSWORD=replace-with-a-long-unique-password
```

Start the services with `docker compose up --build`. Open `http://localhost:8081`; use `http://localhost:8081/admin` for the admin workspace. The first boot applies Flyway migrations and optionally provisions the first `SUPER_ADMIN`. Leave both bootstrap variables empty to disable account provisioning. Create/rotate credentials through a secure operational process before production deployment.

### Option B — Angular development server

Run `npm install`, then `npm start`. The UI is at `http://localhost:4200`. The development API URL is configured in `src/environments/environment.ts` as `http://localhost:8080/api/v1`; start the backend and PostgreSQL separately. Production builds replace it with the same-origin `/api/v1` URL.

### Run the API

Set `DATABASE_URL` (a PostgreSQL URI or JDBC URL), `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET_BASE64` and `CORS_ALLOWED_ORIGINS` in the environment. When run from `backend`, the application also imports the ignored repo-root `.env.local` file created by Neon CLI. It prefers `DATABASE_URL_UNPOOLED` for Flyway migrations and converts Neon PostgreSQL URIs to JDBC URLs without printing credentials. Run `mvn spring-boot:run` from `backend`. Flyway creates the schema and loads starter content automatically. To initialize an administrator, set both `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` for the first run. The bootstrap account is a `SUPER_ADMIN`; remove bootstrap credentials from the environment after it has been created.

## Free demo deployment

The local project folders are siblings: `codeCraftTechnology` contains the Angular frontend and `backend` contains the Spring Boot API. Keep both in one clean Git repository at their common parent; do not push from a broader home-directory Git root. The root `.gitignore` excludes build output and local environment files.

For a free demo, deploy the frontend to Cloudflare Pages, the API as a Render Docker web service, and PostgreSQL on Neon. Free services can sleep, have usage limits, and are not suitable for production data or availability guarantees.

1. Push this project-only repository to GitHub. Create the Cloudflare Pages project with root directory `codeCraftTechnology`, build command `npm ci && npm run build`, and output directory `dist/aether-web/browser`.
2. Create a Neon Postgres project in a region near the Render service. Use its pooled connection host and SSL. Configure Render with root directory `backend`, Dockerfile `Dockerfile`, and a free web-service instance.
3. Set Render secrets/environment variables: `DATABASE_URL` to the Neon PostgreSQL connection URI and a newly generated `JWT_SECRET_BASE64` containing at least 32 random bytes. The backend parses Neon URIs to JDBC; if using a JDBC URL, set `DATABASE_JDBC_URL` and provide `DATABASE_USERNAME` and `DATABASE_PASSWORD` separately. Set `CORS_ALLOWED_ORIGINS` to the exact Pages site origin. Use `DB_POOL_SIZE=3` for the free instance.
4. After Render provides the API URL, set that URL in `src/environments/environment.prod.ts` as the API base ending in `/api/v1`, then push the change to trigger the Pages build. Do not put database or JWT secrets in frontend configuration.
5. Optionally set `ADMIN_BOOTSTRAP_EMAIL` and a unique `ADMIN_BOOTSTRAP_PASSWORD` (at least 14 characters) for first-time admin provisioning. Remove both variables after the account is created.
6. Verify the public API, contact form, and admin login. `/actuator/health` returned 403 in a local check; use `/api/v1/hero` as the Render health-check path unless actuator access is fixed.

Render's free web services sleep after 15 minutes without traffic and can take about a minute to wake. Neon Free currently includes 100 CU-hours and 1 GB per project. Check provider limits before each deploy; free tiers and quotas can change.

## Routes and API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/hero` | Public | Hero content and metric values |
| GET | `/api/v1/services` | Public | Service cards |
| GET | `/api/v1/technologies` | Public | Technology marquee |
| GET | `/api/v1/capabilities` | Public | Capability cards |
| GET | `/api/v1/team` | Public | Team member profiles |
| GET | `/api/v1/process` | Public | Delivery timeline |
| GET | `/api/v1/case-studies` | Public | Case-study cards and results |
| GET | `/api/v1/industries` | Public | Industry grid |
| GET | `/api/v1/testimonials` | Public | Client quote carousel |
| GET | `/api/v1/site-settings` | Public | Brand, navigation, footer, inquiry options |
| POST | `/api/v1/contact` | Public | Validated lead submission; returns `201` |
| POST | `/api/v1/auth/login` | Public | Email/password authentication; returns JWT |
| GET/PUT | `/api/v1/admin/content/{key}` | `ADMIN`, `SUPER_ADMIN`, assigned `EDITOR` | Read or replace a managed JSON section |
| GET | `/api/v1/admin/leads` | `ADMIN`, `SUPER_ADMIN` | List inquiries newest-first |
| PATCH | `/api/v1/admin/leads/{id}` | `ADMIN`, `SUPER_ADMIN` | Update status (`NEW`, `IN_PROGRESS`, `QUALIFIED`, `CLOSED`) |
| GET/POST | `/api/v1/admin/editors` | `SUPER_ADMIN` | List editors or create a scoped editor account |
| PUT | `/api/v1/admin/editors/{id}/permissions` | `SUPER_ADMIN` | Change an editor's content access |
| GET | `/actuator/health` | Public | Container health check |

Content keys available to the admin editor: `hero`, `services`, `technologies`, `capabilities`, `team`, `process`, `case-studies`, `industries`, `testimonials`, and `site-settings`. The team editor requires at least 15 profiles, each with a name, photo URL, tech stack, current company, and more than 5 years of experience. Team profiles rotate automatically on the public page and can be browsed with the carousel controls. The seeded team names and portraits are fictional demo content; replace them with approved company information before publishing. The editor accepts JSON; validate the shape against the TypeScript contracts in `src/app/core/models/` before publishing. Changes are persisted in the `site_content` table.

## Database and migrations

`V1__create_content_and_leads_schema.sql` defines roles, users, hero/metrics, services, technologies, case studies/results, industries, testimonials, capabilities, process steps, contact leads, and JSONB site content. `V2` through `V5` seed initial public content, site settings, and demo team profiles. The public editable sections use `site_content` JSONB so admins can update whole sections without a deployment; lead submissions and account credentials use normalized tables. Keep Flyway as the schema authority (`ddl-auto: validate`). Create future schema changes as new, immutable `V<N>__description.sql` files.

## Admin and security

- Admin UI: `/admin`; login is handled by the page so unauthenticated visitors see the sign-in form.
- JWT access tokens are stored in `sessionStorage` and only attached to `/admin/` API calls. Token lifetime is configurable with `JWT_EXPIRATION_MS` (default 1 hour).
- The bootstrap `SUPER_ADMIN` creates normal editor accounts in Admin → User access; there is no public signup. Each editor receives one or more content-section permissions and cannot access unassigned sections, contact leads, or user management. Section access is checked by the API on every content request, not only hidden in the UI.
- Sign out clears the current browser session. Editors can change their password only through an administrator-managed process; use a secure channel to share temporary credentials.
- Spring Security is stateless, uses BCrypt cost 12, validates signed HS256 tokens, and enforces role and per-section access checks on admin endpoints.
- Configure a strong `JWT_SECRET_BASE64` (at least 32 random bytes), HTTPS, restrictive `CORS_ALLOWED_ORIGINS`, database backups, rate limiting/WAF, and secret storage (Azure Key Vault) in production. Add refresh-token rotation and MFA if the threat model requires them; access tokens currently expire without refresh.
- Do not use the local Compose credentials or sample client data in a production environment.

## SEO and accessibility

The document includes description, Open Graph and Twitter metadata. `SeoService` updates page title, canonical URL, social metadata, and JSON-LD Organization structured data from site settings. The site uses semantic landmarks, accessible button labels, keyboard-operable controls, responsive layouts, and reduced-motion preferences. Provide the production canonical domain and a reviewed Open Graph image before launch.

## Build and validate

- Frontend: `npm ci` then `npm run build`.
- Backend: `cd backend` then `mvn clean verify`.
- Full local stack: `docker compose up --build`.
- Liveness: `/actuator/health`.

## Azure deployment guide

1. Provision Azure Database for PostgreSQL Flexible Server, an Azure Container Registry, two Azure App Services (Linux container: API and web), and Azure Front Door. Use private networking/Private Link for the database where supported.
2. Build and push the API image from `backend/` and web image from the repository root to ACR. Configure each App Service to pull its image and enable managed identity for ACR access.
3. Set API App Service settings: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET_BASE64`, `CORS_ALLOWED_ORIGINS`, `JWT_EXPIRATION_MS`, and `PORT=8080`. Source secrets from Key Vault references; do not check them into source control. Configure the API health probe to `/actuator/health`.
4. Set web App Service `API_UPSTREAM` to the API's reachable HTTPS origin (include `https://` and no `/api` path). Nginx forwards `/api/*` to that upstream, and the Angular production build uses same-origin `/api/v1` requests. Alternatively, configure Front Door to route `/api/*` directly to the API origin and the remaining routes to the web origin.
5. Attach the custom domain and managed TLS at Front Door, enforce HTTPS, configure caching only for static hashed assets, and disable caching for API responses and `index.html`.
6. Configure database firewall/private endpoints, backups, alerting, App Service health checks, Front Door WAF policy, and diagnostic logging. Test contact submission, JWT login, protected role authorization, content editing, failover/restore, and mobile layouts in staging before production traffic.
7. For zero-downtime schema evolution, deploy backward-compatible Flyway migrations first, then roll out the API and frontend images. Keep previous images available for rollback.

## Notes for production hardening

This starter is a modular monolith API organized by content, leads, admin, and security domains; it is not seven separately deployable microservices. Split bounded domains into independently deployed services only when team ownership, scaling, or operational requirements justify the added distributed-system complexity. Add automated integration tests against PostgreSQL, request throttling/bot protection for public contact, email/CRM lead notifications, audit history for admin edits, pagination and retention policies before production scale.
