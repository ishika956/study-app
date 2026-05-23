# Fix "Database not connected" — 2 steps only

## Why this happens

Your `server/.env` uses **`127.0.0.1`** = database on **your PC only**.

The live website (Vercel + Render) runs in the **cloud** and **cannot** use your PC.

You need **MongoDB Atlas** (free cloud database).

---

## Step 1 — Atlas connection string (5 min)

1. Open **https://cloud.mongodb.com** (free account).
2. **Network Access** → **Add IP** → **Allow from anywhere** (`0.0.0.0/0`).
3. **Database Access** → create user + password.
4. **Database** → **Connect** → **Drivers** → copy string.
5. Edit it:
   - Replace `<password>` with your password.
   - Add `studyapp` before `?`:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/studyapp?retryWrites=true&w=majority
```

6. In project folder run:

```bash
cd server
npm run setup-atlas
```

Paste the string when asked.

---

## Step 2 — Render (required for live site)

1. **https://dashboard.render.com** → your backend service.
2. **Environment** → add:

| Key | Value |
|-----|--------|
| `MONGO_URI` | **Same** Atlas string from Step 1 |
| `JWT_SECRET` | Long random secret |

3. **Save** → wait 2–5 min for redeploy.

---

## Check it works

Open: **https://study-app-1-dyv3.onrender.com/api/health**

Must show: `"db": "connected"`

Then register on your Vercel app.

---

**`.env` on your PC does NOT go to Render.** You must paste `MONGO_URI` in Render Environment.
