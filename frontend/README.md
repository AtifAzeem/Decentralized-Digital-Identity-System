# DecentralID — React Frontend

A government-style React (Vite) frontend for the DecentralID decentralised identity system.

## Prerequisites

- Node.js 18+
- Your backend running at `http://localhost:3000`

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Project Structure

```
src/
├── services/
│   └── api.js              # All API calls (signup, login, addData, getData)
├── styles/
│   ├── global.css          # Design system (CSS variables, fonts, base)
│   ├── auth.css            # Auth page styles
│   ├── setup.css           # Setup page styles
│   └── dashboard.css       # Dashboard styles
├── components/
│   ├── InfoCard.jsx        # Reusable display card + InfoRow + InfoBadgeList
│   ├── MainView.jsx        # MAIN tab: display + add form
│   ├── MedicalView.jsx     # MEDICAL tab: display + add form
│   └── TripView.jsx        # TRIP tab: display + add form
├── pages/
│   ├── AuthPage.jsx        # Login / Signup toggle
│   ├── SetupPage.jsx       # Initial MAIN identity setup (new users)
│   └── DashboardPage.jsx   # Tab controller + nav + logout
├── App.jsx                 # Router: Auth → Setup → Dashboard
└── main.jsx                # Entry point
```

## Pages & Flow

1. **Auth Page** — Login or Register. `userId` stored in `localStorage`.
2. **Setup Page** — First-time users fill their MAIN identity (name, DOB, contact, address). Redirects to dashboard.
3. **Dashboard** — Three tabs:
   - **Identity (MAIN)** — Personal, contact, address cards + update form
   - **Medical** — Health, medications, doctor, emergency contact + update form
   - **Trip** — Travel, schedule, transport, stay + update form

## API Config

Backend URL is set in `src/services/api.js`:

```js
const BASE_URL = 'http://localhost:3000/api';
```

Change this if your backend runs on a different port.

## Build for Production

```bash
npm run build
```

Output goes to `dist/`.
