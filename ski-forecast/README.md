# ⛷️ Ski Forecast Desk

Live snow forecasts, lift status, and private lesson pricing for your chosen ski resorts.
Auto-refreshes 3x daily. Keeps the last 6 forecast runs so you can track how predictions change.

---

## Deploy in 4 steps

### 1. Put this folder on GitHub

- Go to github.com → New repository → call it `ski-forecast`
- On your computer, open a terminal in this folder and run:

```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/YOUR_USERNAME/ski-forecast.git
git push -u origin main
```

---

### 2. Connect to Vercel

- Go to vercel.com → Add New Project
- Import your `ski-forecast` GitHub repo
- Framework will auto-detect as **Next.js** — leave all defaults
- Click **Deploy** (it will fail the first time — that's fine, next step fixes it)

---

### 3. Add Vercel KV (the history database)

- In Vercel dashboard → your project → **Storage** tab
- Click **Create Database** → choose **KV**
- Give it any name (e.g. `ski-kv`) → Create
- Click **Connect to Project** → select your ski-forecast project
- This automatically adds the environment variables your app needs

---

### 4. Redeploy

- Go to **Deployments** tab → click the three dots on the latest deploy → **Redeploy**
- Your app is now live at `your-project.vercel.app` ✅

---

## How it works

| What | How |
|---|---|
| Snow forecasts | Open-Meteo API (free, no key needed) |
| History storage | Vercel KV (Redis) — keeps last 6 runs |
| Auto-refresh | Vercel Cron — runs at 05:00, 11:00, 17:00 UTC daily |
| Manual refresh | Hit the ⟳ Refresh button on the dashboard |
| Export | ↓ Export CSV button — import directly into Google Sheets |

---

## Customise your resorts

Open `lib/resorts.ts` and edit the `RESORTS` array.
Each resort needs a name, country code, and lat/lng coordinates.
Ratings and lesson prices are currently hardcoded — update them there too.

---

## Local development

```bash
npm install
# Create a .env.local file and add your KV credentials from Vercel dashboard
npm run dev
```

Open http://localhost:3000
