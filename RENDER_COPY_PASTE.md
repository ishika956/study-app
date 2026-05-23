# Copy this to Render (required)

Your Atlas URI is already in `server/.env` on your PC.
**Render does NOT read that file.** You must paste it in the Render website.

## Steps

1. Open **https://dashboard.render.com**
2. Click your backend service (study-app-1-dyv3 or similar)
3. Click **Environment** in the left menu
4. Find **`MONGO_URI`**:
   - If it says `mongodb://127.0.0.1` → **Delete it** or edit it
5. Set **`MONGO_URI`** to the **same value** as `MONGO_URI_ATLAS` in your `server/.env`  
   (starts with `mongodb+srv://`, ends with `/studyapp?retryWrites=true&w=majority`)
6. Optional: add **`MONGO_URI_ATLAS`** with the same value
7. Set **`JWT_SECRET`** to a long random string
8. Click **Save Changes** → wait for redeploy (2–5 min)
9. Open: `https://study-app-1-dyv3.onrender.com/api/health`  
   → must show `"db": "connected"`

## MongoDB Atlas

**Network Access** → must include **0.0.0.0/0** (Allow from anywhere).

## Security

If your password was shared anywhere public, change it in Atlas → Database Access → Edit user → new password → update `server/.env` and Render `MONGO_URI`.
