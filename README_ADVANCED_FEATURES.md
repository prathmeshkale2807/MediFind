# MediFind Advanced Features

Included in this version:
- Doctor profile with rating/reviews and available slots
- Proper appointment slot picker
- Doctor working-hours management
- Patient dashboard
- Digital prescriptions for doctors and patients
- Existing notification system retained
- Existing SmartMatch and Doctor Discovery retained

## Database
Run `my-backend/hel/advanced_features.sql` once in pgAdmin.
Existing doctors use a safe fallback schedule of 09:00–17:00 hourly slots until a doctor saves custom working hours.

## Run
Backend: `cd my-backend && npm install && npm run dev`
Frontend: `cd hospital-portal && npm install && npm run dev`
