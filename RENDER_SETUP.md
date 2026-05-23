# Fix "Database is not connected" on Render

Your API runs on Render, but **MongoDB must be hosted separately** (MongoDB Atlas free tier).

## Step 1 — MongoDB Atlas (5 minutes)

1. Open [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in.
2. **Build a Database** → choose **M FREE** → create.
3. **Database Access** → **Add New Database User**
   - Username: `studyapp` (or any name)
   - Password: click **Autogenerate** and **copy it**
   - Role: **Read and write to any database**
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) → Confirm.
5. **Database** → **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://studyapp:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Edit the string:
   - Replace `<password>` with your real password.
   - If the password contains `@`, `#`, `:`, `/`, or `%`, [URL-encode it](https://www.urlencoder.org/) first.
   - Add database name `studyapp` before the `?`:
   ```
   mongodb+srv://studyapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/studyapp?retryWrites=true&w=majority
   ```

## Step 2 — Render environment variables

1. [Render Dashboard](https://dashboard.render.com) → your web service → **Environment**.
2. Add or update:

| Key | Value |
|-----|--------|
| `MONGO_URI` | Full Atlas string from Step 1 |
| `JWT_SECRET` | Any long random string (32+ characters) |
| `CLIENT_URL` | `https://study-app-liart.vercel.app` |

3. Click **Save Changes** → Render will redeploy automatically.

## Step 3 — Verify

After deploy finishes (2–5 min), open:

**https://study-app-1-dyv3.onrender.com/api/health**

Success:
```json
{ "status": "ok", "db": "connected" }
```

If it still fails, read the `hint` and `error` fields in the JSON response.

## Step 4 — Test registration

Open your Vercel app and register again.

---

**Local development:** keep `MONGO_URI` in `server/.env` pointing to local MongoDB or the same Atlas string.
