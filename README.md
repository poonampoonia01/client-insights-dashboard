# Ledger — Client Insights Dashboard

A dashboard for wealth advisors to manage their client book and see it summarized
at a glance: total clients, the HNI/UHNI split, and aggregate net worth.

Built with **React (Vite)** on the frontend and **Node.js / Express / MongoDB
(Mongoose)** on the backend, with JWT-based authentication.

```
client-insights-dashboard/
├── server/     Express API — auth, client CRUD, search/filter/sort, insights
└── client/     React frontend — login, client table, add/edit modal, insights strip
```

## Quick start

You'll need Node.js 18+ and a MongoDB instance — either installed locally, run via
Docker (`docker run -d -p 27017:27017 mongo`), or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 1. Backend

```bash
cd server
cp .env.example .env    # then edit MONGO_URI and JWT_SECRET
npm install
npm run seed             # creates a demo advisor + 4 sample clients (optional)
npm run dev               # http://localhost:5000
```

Demo login created by `npm run seed`:
- **Email:** `demo.advisor@ledger.app`
- **Password:** `password123`

### 2. Frontend

```bash
cd client
cp .env.example .env    # points at http://localhost:5000/api by default
npm install
npm run dev               # http://localhost:5173
```

Open `http://localhost:5173`, log in (or register a new advisor), and the
dashboard loads.

## Database schema

**Advisor** (`server/src/models/Advisor.js`) — the logged-in user:
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| password | String | required, bcrypt-hashed, never returned by the API |
| firm | String | optional |

**Client** (`server/src/models/Client.js`) — one document per client, scoped to
the advisor who owns them:
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, valid email format |
| phone | String | required, validated pattern |
| netWorth | Number | required, ≥ 0 |
| category | String | required, enum `HNI` \| `UHNI` |
| primaryAssetClass | String | required (e.g. Equity, Real Estate, Startups, Alternatives) |
| interests | [String] | free-text tags, deduplicated |
| onboardingDate | Date | required |
| advisor | ObjectId → Advisor | scopes every client to its owner |

Indexes: `{ advisor, email }` (unique — a client's email only needs to be
unique within one advisor's book), `{ advisor, category }`, `{ advisor,
netWorth }`, and a text index on `name`, so filtering, sorting, and search
all hit an index rather than a full collection scan.

## API reference

All `/api/clients/*` routes require `Authorization: Bearer <token>`.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an advisor account, returns a JWT |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET | `/api/auth/me` | Current advisor (used to restore a session on refresh) |
| GET | `/api/clients` | List clients — supports `?search=&category=&sortBy=&order=&page=&limit=` |
| POST | `/api/clients` | Create a client |
| GET | `/api/clients/:id` | Fetch one client |
| PUT | `/api/clients/:id` | Update a client (partial updates allowed) |
| DELETE | `/api/clients/:id` | Delete a client |
| GET | `/api/clients/insights` | Total clients, HNI/UHNI distribution, aggregate & average net worth, asset-class breakdown |

`GET /api/clients` query parameters:
- `search` — case-insensitive partial match on name
- `category` — `HNI`, `UHNI`, or omitted/`All`
- `sortBy` — `netWorth` \| `name` \| `onboardingDate`
- `order` — `asc` \| `desc`
- `page`, `limit` — pagination (default 20 per page)

## Design decisions & assumptions

- **Multi-advisor by default.** Every client belongs to the advisor who
  created it (`advisor` field + compound indexes), so two advisors can each
  have a client with the same email without colliding. If you only ever need
  a single shared book of clients, this is easy to relax by dropping the
  `advisor` filter in `clientController.js`.
- **Validation runs twice, on purpose.** `express-validator` chains guard the
  API regardless of what client calls it; the React form mirrors the same
  rules so advisors see errors before submitting, not just after.
- **Insights use one aggregation pipeline** (`$facet`) rather than three
  separate queries, so the stats stay consistent and the DB is only hit once
  per dashboard load.
- **Passwords are hashed with bcrypt** and excluded from every response
  (`select: false` on the schema field, plus a `toSafeObject()` helper).
- **UI direction:** built around the idea of an advisor's ledger rather than
  a generic SaaS card layout — a warm paper background, an ink-toned header,
  and a single muted brass accent reserved for primary actions and the UHNI
  marker, with figures set in a serif face the way a statement would.

## Possible next steps

- Role-based access (e.g. a senior partner who can see every advisor's book)
- CSV export of the filtered client list
- Audit log of who edited/deleted a client and when
- Server-side rate limiting on `/api/auth/login`
