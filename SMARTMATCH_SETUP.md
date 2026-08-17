# MediFind SmartMatch - Updated

This version includes the SmartMatch improvements discussed:

- Specialization matching
- Budget ranges including **₹1200+**
- Exact preferred-hospital matching
- Alternative doctors when no exact result exists
- Alternative hospitals ranked by match quality
- Nearby-hospital distance when hospital coordinates are available
- Ranking based on specialization, budget, experience, location and availability
- Today's availability based on existing non-cancelled appointments and 09:00-17:00 hourly slots
- Available appointment times shown on doctor cards
- Exact results are shown first; alternatives are shown only when no exact result is found
- If no doctor meets the requested budget, SmartMatch can still show the closest useful alternatives instead of a blank result

## Start

Backend:
```bash
cd connected-project/my-backend
npm run dev
```

Frontend:
```bash
cd connected-project/hospital-portal
npm run dev
```

Open:
`http://localhost:5173/smart-match`

## SmartMatch ranking

The target score is based on:

- Specialization: 35 points
- Budget: 25 points
- Experience: up to 20 points
- Hospital/location: up to 10 points
- Availability: 10 points

The final score is capped at 100.

## Budget behavior

- `₹300–₹500`, `₹500–₹800`, and `₹800–₹1200` require the doctor fee to be inside the selected range for an exact match.
- `₹1200+` means the doctor fee must be at least ₹1200 for an exact match.
- If no exact doctor exists, alternatives are ranked by how closely they fit the requested budget along with experience, hospital/location and availability.
- `Any budget` removes the fee restriction.

## Hospital behavior

When a hospital is selected, an exact result must actually belong to that hospital. If no exact result exists, SmartMatch returns ranked alternatives from other hospitals and/or near-budget doctors.

## Availability

The current schema has appointments but no separate doctor working-hours table. SmartMatch therefore treats one of the hourly slots from 09:00 to 17:00 as available when that slot is not occupied by a non-cancelled appointment.

No new database table or migration is required for these SmartMatch changes.
