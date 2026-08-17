# MediFind + Backend Connection

The visual design was kept unchanged. Only data loading and appointment submission were connected to the Express backend.

## Backend

1. Open `my-backend` in a terminal.
2. Make sure PostgreSQL is running and `.env` contains the correct database credentials.
3. Make sure the database contains `users`, `hospitals`, `doctors`, `beds`, and `appointments` tables.
4. Start the backend:

```bash
npm install
npm run dev
```

Backend URL: `http://localhost:3000`

## Frontend

1. Open `hospital-portal` in another terminal.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` if needed.
4. Start Vite:

```bash
npm run dev
```

The frontend uses `VITE_API_URL`, defaulting to `http://localhost:3000`.

## Connected endpoints

- `GET /hospitals`
- `GET /hospitals/:id`
- `GET /doctors`
- `GET /doctors?hospital_id=1`
- `GET /beds`
- `POST /appointments/public`
- Existing authentication/admin endpoints remain available.
