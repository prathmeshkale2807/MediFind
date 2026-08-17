# MediFind — Multi Hospital Appointment & Bed Availability Portal (Frontend Only)

This is a **frontend-only** demo. There is no real backend — all hospital,
doctor and bed data lives in `src/data/hospitals.js` as dummy data.

## What's inside

```
src/
├── assets/              (put your own images/logos here)
├── components/          Reusable pieces (Navbar, Footer, cards, etc.)
├── pages/                One file per page/route
├── data/hospitals.js     All dummy data (hospitals, doctors, testimonials, stats)
├── App.jsx               Routes — connects URLs to pages
├── main.jsx              The very first file that starts the app
└── index.css             Tailwind + global styles
```

## How to run this on your own computer (step by step)

Think of this like installing a video game before you can play it.

1. **Install Node.js** (only once, if you don't already have it)
   Go to https://nodejs.org and download the "LTS" version. Click through
   the installer like any normal app.

2. **Open a terminal inside this folder**
   - Windows: open the `hospital-portal` folder, then right-click inside it
     and choose "Open in Terminal".
   - Mac: open Terminal, type `cd `, drag the `hospital-portal` folder into
     the window, then press Enter.

3. **Install the project's tools** (only once)
   ```
   npm install
   ```
   This downloads React, Tailwind, and everything else the project needs.
   It may take a minute or two — that's normal.

4. **Start the website**
   ```
   npm run dev
   ```
   Your terminal will show a link like `http://localhost:5173`.

5. **Open that link in your browser** (Chrome, Edge, etc.)
   You should now see the MediFind homepage!

6. **To stop the site**, click back in the terminal and press `Ctrl + C`.

Every time you save a file, the browser updates automatically — you don't
need to restart anything.

## Where to make changes

- Want to change colors? Edit `tailwind.config.js`.
- Want to change the dummy hospitals/doctors? Edit `src/data/hospitals.js`.
- Want to change a page's layout? Open the matching file in `src/pages/`.
- Want to change something that appears on every page (like the navbar)?
  Edit the matching file in `src/components/`.

## What's NOT included (on purpose)

This is frontend only, so:
- Nothing is actually saved anywhere (refreshing the page resets everything).
- The "Book Appointment" and "Contact" forms only show a success message —
  they don't send real emails or texts.
- Login button is just a placeholder — it doesn't log anyone in yet.

A backend (using something like Node.js + Express + a database) would be
the next step to make bookings and bed counts real and permanent.
