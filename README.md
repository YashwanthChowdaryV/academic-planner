# 🎓 AcadPlan AI

AI-Driven Academic Planning Platform built with **React + Firebase + Groq LLM**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/) → Create a project
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** (start in production mode)
4. Register a **Web App** and copy config values

```bash
cp .env.example .env
# Fill in your Firebase values in .env
```

### 3. Apply Firestore Security Rules
Copy the contents of `firestore.rules` into Firebase Console → Firestore → Rules tab.

### 4. Start Dev Server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂 Project Structure

```
src/
├── firebase.js              # Firebase init + auth/profile helpers
├── context/AuthContext.js   # Auth state, login/signup/logout
├── services/
│   ├── apiService.js        # POST /generate-plan (with retry + timeout)
│   ├── planService.js       # Firestore CRUD for plans/progress/notes
│   └── userService.js       # User profile read/write
├── utils/splitPhases.js     # LLM plan text → phase array parser
├── components/
│   ├── Sidebar.js           # Desktop sidebar + mobile bottom nav
│   ├── PhaseCard.js         # Phase display + toggle + notes
│   ├── PlanForm.js          # Plan generation form
│   ├── ProgressBar.js       # Animated progress bar
│   ├── NotesBox.js          # Auto-saving notes textarea
│   ├── StatCard.js          # Dashboard stat tiles
│   ├── HistoryList.js       # Plan history cards
│   ├── Modal.js             # Confirmation modal
│   ├── Toast.js             # Toast notifications
│   ├── Loader.js            # Loading spinner
│   └── ProtectedRoute.js    # Auth guard for routes
├── pages/
│   ├── LoginPage.js         # Sign in
│   ├── SignupPage.js        # Register with level selection
│   ├── DashboardPage.js     # Overview + stats + recent plans
│   ├── PlannerPage.js       # Generate new plan form
│   ├── PlanViewPage.js      # View/track a specific plan
│   ├── HistoryPage.js       # All plans + search/filter + delete
│   ├── AnalyticsPage.js     # Deep-dive progress analytics
│   └── ProfilePage.js       # Edit name, level, sign out
└── styles/
    ├── global.css           # CSS variables, reset, typography
    └── components.css       # All component styles
```

---

## 🔥 Firestore Data Model

```
users/{uid}
  ├── profile: { name, email, academicLevel, createdAt }
  ├── plans/{planId}: { input, output, title, createdAt, meta }
  ├── progress/{planId}: { phases: { "0": true, "1": false, … } }
  └── notes/{planId_phaseIndex}: { text, createdAt, updatedAt }
```

---

## 🧪 Tests

```bash
npm test
```

Unit tests for `splitPhases` are in `src/tests/unit/splitPhases.test.js`.

---

## 📦 Deploy to Vercel

```bash
npm install -g vercel
vercel
# Set REACT_APP_FIREBASE_* env vars in Vercel dashboard
```

Or Netlify:
```bash
npm run build
# Deploy the /build folder
```

---

## 🔑 Backend API

The app calls your FastAPI backend:
```
POST https://haleigh-nonextendible-unduteously.ngrok-free.dev/generate-plan
Content-Type: application/json

{
  "goal": "Learn MERN Stack",
  "level": "intermediate",
  "time_available_days": 90,
  "hours_per_day": 4,
  "constraints": ["I know React basics"]
}
```

Response:
```json
{ "plan": "PHASE 1: ... PHASE 2: ..." }
```

---

## ✅ Features

- 🔐 Firebase Auth (email/password) with protected routes
- 🤖 AI plan generation via Groq LLM (FastAPI backend)
- 📋 Phase-by-phase plan display and progress tracking
- 📝 Per-phase notes with auto-save
- 📊 Dashboard with aggregate stats
- 📚 History with search, filter, and delete
- 📈 Analytics page with level breakdown
- 👤 Profile management
- 📱 Fully responsive (desktop sidebar + mobile bottom nav)
- ♿ Accessible (keyboard nav, ARIA labels, semantic HTML)
