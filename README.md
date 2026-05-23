# Study App - Smart Study Hub

**Study App** is a premium, full-stack, production-ready study management application designed for students and educators. Built using React on the frontend, Node.js + Express on the backend, and MongoDB for database persistence, it provides a comprehensive workspace to organize courses, track targets, sketch on an interactive whiteboard, write rich notes in markdown, and manage study documents.

---

## 🚀 Key Features

1. **Authentication Flow (JWT-secured)**
   - Secure Register and Login portals using email and password.
   - Encrypted passwords via `bcryptjs` on the server.
   - Authentication tokens (JSON Web Tokens) stored locally in `localStorage`.
   - Complete route protection in React Router v6 (redirects to `/login` if unauthenticated) and pre-configured Axios interceptors injecting auth headers.

2. **Course Management Dashboard**
   - High-fidelity visual cards for each course.
   - Overall target completion progress bars dynamically calculated and animated based on checklists.
   - Modern course creation modal and cascading deletions (removes targets, whiteboard sketches, notes, document lists, and deletes stored files from the server).

3. **Tab 1: Targets & Goals Hub**
   - Interactive, checklist-based learning milestones.
   - Toggle completion status with instant visual updates.
   - Responsive overall course completion progress bar at the top of the course.

4. **Tab 2: Whiteboard Sketchpad**
   - Freehand responsive drawing canvas using HTML5 Canvas inside React.
   - Advanced tools: Custom Pen brush, Size Slider (2px - 20px), Eraser (using destination-out operations to erase actual strokes regardless of background color), Canvas Clear with warnings, and Undo action to pop the last stroke.
   - **Autosave Engine**: Automatically serializes canvas drawings as JSON and auto-saves to MongoDB on mouseup/mouseleave, displaying custom cloud sync indicators ("Syncing..." and "Saved").

5. **Tab 3: Course Notes Markdown Workspace**
   - Split-screen workspace on desktop (Editor on the left, rendered output on the right) with tabbed selectors for mobile screens.
   - **Custom regex Markdown-to-HTML parser**: Translates headings (`#`, `##`, `###`), bold (`**`), italic (`*`), dividers (`---`), bullet points, checklist items (`- [ ]`, `- [x]`), inline code, and fenced code blocks into responsive, styled components with zero heavy dependencies!
   - **Autosave Engine**: Debounces writing changes, auto-saving note content to MongoDB 1.2 seconds after you stop typing. Includes an interactive formatting cheatsheet guide.

6. **Tab 4: Study Documents Manager**
   - Interactive file drag-and-drop zone with size limits (up to 15MB).
   - Backend file handling powered by **Multer**, storing uploads in local server storage (`/server/uploads`).
   - Dynamic file extension mapping to distinct custom icons (PDFs, Word docs, Images, Scripts, Zips, others).
   - **Secure JWT File Downloads**: Feeds the download binary stream via Axios as a blob (ensures files can never be accessed without a valid auth token) and triggers dynamic browser downloads preserving the original uploaded file name.
   - Cascading deletions purging database metadata and removing files from server disks.

7. **Theme & Responsiveness**
   - Full dark/light mode toggle with preferences saved in `localStorage`.
   - Glassmorphic panels, glowing focus states, Outfit typography, and dynamic animations.
   - Beautiful loaders/spinners and rich Empty State blocks.
   - Real-time success and error toast notifications using `react-hot-toast`.

---

## 🛠️ Technology Stack

- **Frontend**: React, React Router v6, Axios, Lucide-React, Tailwind CSS v3, React Hot Toast, Vite
- **Backend**: Node.js, Express, Mongoose, Multer, bcryptjs, jsonwebtoken, cors, dotenv
- **Database**: MongoDB (Local community server or MongoDB Atlas)

---

## 📁 Directory Structure

```text
/student dashboard
├── package.json               # Root scripts to orchestrate backend & frontend
├── .env.example               # Template environment variables sheet
├── README.md                  # Comprehensive setup instructions
├── /server
│   ├── package.json           # Node API server package definitions
│   ├── server.js              # Server entry point, middlewares, and route registrations
│   ├── .env                   # Local backend configuration details (ignored in git)
│   ├── /config
│   │   └── db.js              # Mongoose MongoDB connection establishment
│   ├── /middleware
│   │   └── auth.js            # JWT validation middleware
│   ├── /models                # Mongoose Database Schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Target.js
│   │   ├── Note.js
│   │   ├── WhiteboardState.js
│   │   └── Document.js
│   ├── /routes                # Express API endpoint routers
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── targets.js
│   │   ├── notes.js
│   │   ├── whiteboard.js
│   │   └── docs.js
│   └── /uploads               # Local file storage for documents
└── /client
    ├── package.json           # Frontend dependencies & Vite setup
    ├── index.html             # App shell with Outfit typography imports
    ├── vite.config.js         # Vite configuration with local proxy definitions
    ├── tailwind.config.js     # Tailwind design system definitions (brand colors, dark class, font)
    ├── postcss.config.js      # PostCSS configurations for compiling styles
    └── /src                   # React source workspace
        ├── main.jsx           # App mounting with AuthContext and React Hot Toast
        ├── App.jsx            # Route declarations and path definitions
        ├── index.css          # Tailwind directives, custom scrollbars, and transition classes
        ├── /components        # Reusable custom UI components
        │   ├── ProtectedRoute.jsx
        │   ├── Navbar.jsx
        │   ├── Spinner.jsx
        │   ├── EmptyState.jsx
        │   ├── TabTargets.jsx
        │   ├── TabWhiteboard.jsx
        │   ├── TabNotes.jsx
        │   └── TabDocuments.jsx
        ├── /context
        │   └── AuthContext.jsx # Global user auth session provider
        ├── /pages             # Top-level Page views
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   └── CourseDetail.jsx
        └── /utils
            └── api.js         # Interceptor-enabled Axios API service instance
```

---

## ⚙️ Local Setup Guide

### Prerequisites
- Make sure you have **Node.js** (v18 or higher recommended) and **npm** installed.
- Ensure **MongoDB** is running locally on your system (`mongodb://127.0.0.1:27017`) or have a MongoDB Atlas connection URI ready.

### Installation Steps

1. **Clone the repository** (or navigate to the workspace directory):
   ```bash
   cd "student dashboard"
   ```

2. **Install all dependencies** (installs root, client, and server packages concurrently):
   ```bash
   npm run install-all
   ```
   *(Alternatively, you can run `npm install` inside the root, `cd server && npm install`, and `cd client && npm install` manually.)*

3. **Configure Environment Variables**
   - The `/server` directory contains a pre-configured `.env` file pointing to a local MongoDB instance.
   - If you need to make changes (e.g. point to MongoDB Atlas or modify ports), update the values in `/server/.env` matching the `/package.json` setup:
     ```env
     PORT=5000
     MONGO_URI=mongodb://127.0.0.1:27017/studyapp
     JWT_SECRET=supersecretjwtkey12345!
     ```

### 🚀 Running the Application

To run the backend server and frontend React client concurrently in development mode, run the following command from the **root folder**:

```bash
npm run dev
```

This launches:
- **Express Backend Server** on `http://localhost:5000`
- **Vite React Client** on `http://localhost:3000` (which automatically proxies requests to `/api` directly to port `5000`).

Open **[http://localhost:3000](http://localhost:3000)** in your web browser, register your account, and start managing your learning journey!

---

## 🌐 Deployment (Vercel + Render)

### Backend on Render

1. Create a **Web Service** with **Root Directory** set to `server`.
2. **Build command:** `npm install` · **Start command:** `npm start`
3. **MongoDB Atlas (required for registration to work):**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com) → create a free cluster.
   - **Database Access** → add a user with password (remember it).
   - **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).
   - **Database** → **Connect** → **Drivers** → copy the connection string.
   - Replace `<password>` with your user password and add database name:  
     `mongodb+srv://user:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/studyapp?retryWrites=true&w=majority`
4. In Render → **Environment**, add:
   - `MONGO_URI` — the Atlas string from step 3 (required; without this, register/login will fail)
   - `JWT_SECRET` — long random string (32+ characters)
   - `CLIENT_URL` — `https://study-app-liart.vercel.app`
5. Health check path: `/api/health` — must return `"db": "connected"` after deploy

### Frontend on Vercel

1. Import the repo; leave **Root Directory** empty (repo root) so root `vercel.json` is used, **or** set Root Directory to `client` and use the rewrites from `client/vercel.json` if you add one.
2. Add environment variable:
   - `VITE_API_URL` = `https://study-app-1-dyv3.onrender.com` (your Render URL, no trailing slash)
3. Redeploy after changing env vars.

### Common issues

| Symptom | Fix |
|--------|-----|
| Login/register fails / network error | Set `VITE_API_URL` on Vercel; confirm Render service is awake (free tier cold start ~30–60s) |
| CORS error in browser console | Set `CLIENT_URL` on Render to your exact Vercel URL |
| Server error during registration | `MONGO_URI` missing or wrong on Render. Open `/api/health` — if `db` is not `connected`, fix Atlas URI and IP whitelist (`0.0.0.0/0`) |
| 500 on auth | Check `MONGO_URI` on Render and Atlas IP whitelist |
| Refresh on `/course/...` shows 404 | Ensure `vercel.json` rewrites are deployed |
