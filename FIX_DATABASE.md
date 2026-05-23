# Database setup checklist (all code fixes applied)

## Code fixes already done in this repo

- `loadEnv.js` — server `.env` overrides root `.env` (`override: true`)
- Root `.env` — **no `MONGO_URI`** (avoids localhost override)
- `server/.env` — uses `/studyapp` database name
- `client/.env.production` — `VITE_API_URL` set
- `render.yaml` — documents required manual `MONGO_URI`

## You still must do (one-time)

### 1. MongoDB Atlas

1. [cloud.mongodb.com](https://cloud.mongodb.com) → free cluster
2. **Network Access** → `0.0.0.0/0` (allow everywhere — required for Render)
3. **Database Access** → user + password
4. **Connect** → copy string → add `/studyapp` before `?`:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/studyapp?retryWrites=true&w=majority
```

### 2. Local (`server/.env`)

```bash
cd server
npm run setup-atlas
```

Or paste into `MONGO_URI_ATLAS=` in `server/.env`.

### 3. Render Dashboard → Environment

| Key | Value |
|-----|--------|
| `MONGO_URI` | Same Atlas `mongodb+srv://...` string |
| `JWT_SECRET` | Long random secret |
| `CLIENT_URL` | `https://study-app-liart.vercel.app` |

Save → redeploy.

### 4. Vercel Dashboard → Environment

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://study-app-1-dyv3.onrender.com` |

Redeploy frontend.

### 5. Verify

`https://study-app-1-dyv3.onrender.com/api/health` → `"db": "connected"`
