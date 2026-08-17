# MediFind Connected Project

The existing frontend design/layout was preserved. The frontend now reads hospital, doctor, bed and appointment data from the Express/PostgreSQL backend with only minimal page-level changes.

## 1. Backend

Open `my-backend` in VS Code.

Create `.env` from `.env.example` and enter your PostgreSQL password/database details.

Then run:

```bash
npm install
npm run dev
```

Backend: `http://localhost:3000`

If the database tables do not exist, use `hel/full_schema.sql` in pgAdmin. If your tables already exist, do not recreate them.

## 2. Frontend

Open `hospital-portal` in another terminal.

```bash
npm install
npm run dev
```

The frontend automatically uses `http://localhost:3000`. To change it, create `.env` with:

```env
VITE_API_URL=http://localhost:3000
```

## 3. What is connected

- Hospital list -> PostgreSQL
- Hospital details -> PostgreSQL
- Doctor list -> PostgreSQL
- Doctors by hospital -> PostgreSQL
- Bed availability -> PostgreSQL
- Appointment booking -> PostgreSQL
- Existing authentication/admin backend remains available

## 4. Design

No Tailwind layout classes, card design, navigation design, animations, colors or overall page structure were intentionally changed. The changes are primarily data fetching and form submission.
