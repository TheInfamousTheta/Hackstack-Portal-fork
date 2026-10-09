# Hackstack Portal 🚀

A modern Learning Management System (LMS) built by the **Student Web Committee** for hosting educational modules, quizzes, progress tracking, and leaderboards.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Cloud: MongoDB Atlas)
- **Authentication:** GitHub OAuth 2.0 + JWT
- **Package Manager:** npm

### Frontend
- **Framework:** React 19
- **Router:** React Router DOM v7
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Package Manager:** npm

---

## 📁 Project Structure

```
Hackstack-Portal/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection config
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── moduleController.js
│   │   ├── userController.js
│   │   ├── progressController.js
│   │   └── quizController.js
│   ├── middleware/               # Express middleware
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── adminMiddleware.js    # Admin role check
│   ├── models/                   # MongoDB schemas
│   │   ├── User.js
│   │   ├── Module.js
│   │   ├── Quiz.js
│   │   └── Progress.js
│   ├── routes/                   # API endpoints
│   │   ├── authRoutes.js
│   │   ├── moduleRoutes.js
│   │   ├── userRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── quizRoutes.js
│   │   └── adminRoutes.js
│   ├── .env.example              # Environment template
│   ├── package.json
│   └── server.js                 # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── assets/               # Images, icons, etc.
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state
│   │   ├── pages/                # Page components
│   │   │   ├── Login.jsx
│   │   │   └── AuthCallback.jsx
│   │   ├── services/
│   │   │   └── authService.js    # API client for auth
│   │   ├── App.jsx               # Main app + routing
│   │   ├── main.jsx              # React entry point
│   │   └── index.css
│   ├── public/                   # Static assets
│   ├── .env.example              # Environment template
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
│
├── .gitignore
├── README.md                     # This file
└── CODE_REVIEW_REPORT.md         # Detailed code review
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB Account** (MongoDB Atlas recommended - free tier available)
- **GitHub OAuth App** (for authentication)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Hackstack-Portal
```

### Step 2: Set Up GitHub OAuth

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name:** Hackstack Portal
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:5000/api/auth/github/callback`
4. Copy your **Client ID** and **Client Secret**

### Step 3: Set Up MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user with a strong password
4. Get your connection URI (looks like: `mongodb+srv://username:password@cluster.mongodb.net/hackstack`)

### Step 4: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: Generate a random secret (e.g., openssl rand -hex 32)
# - GITHUB_CLIENT_ID: Your GitHub OAuth Client ID
# - GITHUB_CLIENT_SECRET: Your GitHub OAuth Client Secret
# - FRONTEND_URL: http://localhost:5173 (for development)

# Start the server
npm run dev
```

Server runs on `http://localhost:5000`

### Step 5: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Verify VITE_API_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### Step 6: Test Authentication

1. Navigate to `http://localhost:5173/login`
2. Click "Continue with GitHub"
3. You should be redirected to login and then to the dashboard
4. ✅ If you see the dashboard, authentication is working!

---

## 💻 Development

### Backend Commands

```bash
cd backend

# Start development server (with hot reload via nodemon)
npm run dev

# Run linting (if configured)
npm run lint

# Note: Test suite not yet implemented
```

### Frontend Commands

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting
npm run lint
```

### Key Environment Variables

**Backend (.env):**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hackstack
JWT_SECRET=your_random_secret_here
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
FRONTEND_URL=http://localhost:5173
PORT=5000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| POST | `/api/auth/admin/login` | Admin username/password login, returns JWT | ❌ |
| GET | `/api/auth/github` | Redirect to GitHub OAuth | ❌ |
| GET | `/api/auth/github/callback` | OAuth callback handler | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Module Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/api/modules` | List all modules | ❌ |
| GET | `/api/modules/:slug` | Get module by slug | ❌ |
| POST | `/api/modules/:id/register` | Register for module | ✅ |
| POST | `/api/modules` | Create module | ✅ Admin |
| PUT | `/api/modules/:id` | Update module | ✅ Admin |
| DELETE | `/api/modules/:id` | Delete module | ✅ Admin |

### Quiz Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/api/quizzes` | List all quizzes | ❌ |
| GET | `/api/quizzes/:id` | Get quiz by ID | ❌ |
| POST | `/api/quizzes/:id/submit` | Submit quiz answers | ✅ |
| POST | `/api/quizzes` | Create quiz | ✅ Admin |
| PATCH | `/api/quizzes/:id` | Update quiz | ✅ Admin |
| DELETE | `/api/quizzes/:id` | Delete quiz | ✅ Admin |

### Progress Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/api/progress` | List progress records | ❌ |
| GET | `/api/progress/:id` | Get progress record | ❌ |
| PATCH | `/api/progress/:id` | Update progress | ✅ |

### Certificate Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/api/certificates/module/:moduleId` | Get or issue certificate for completed module | ✅ |
| GET | `/api/certificates/verify/:certCode` | Public certificate verification by unique code | ❌ |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/api/users` | List all users | ❌ |
| GET | `/api/users/:id` | Get user by ID | ❌ |
| POST | `/api/users` | Create user | ❌ |
| PATCH | `/api/users/:id` | Update user | ❌ |
| DELETE | `/api/users/:id` | Delete user | ❌ |

### Admin Endpoints

All admin endpoints require `auth` + `admin` middleware:
- `GET /api/admin/modules` - List modules
- `POST /api/admin/modules` - Create module
- `PUT /api/admin/modules/:id` - Update module
- `DELETE /api/admin/modules/:id` - Delete module
- Similar endpoints for `/admin/quizzes`, `/admin/progress`, `/admin/users`

---

### Before Submitting a Pull Request

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and test thoroughly

3. **Lint your code:**
   ```bash
   # Frontend
   cd frontend && npm run lint
   
   # Backend (if linting is configured)
   cd backend && npm run lint
   ```

4. **Commit with clear messages:**
   ```bash
   git add .
   git commit -m "feat: describe your changes"
   ```

5. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub with a clear description

### Code Style Guidelines

- **JavaScript:** Use ES6+ syntax
- **React:** Use functional components with hooks
- **Naming:** Use camelCase for variables/functions, PascalCase for components
- **Imports:** Organize imports (React, third-party, local)
- **Comments:** Add comments for complex logic

---

## 🐛 Troubleshooting

### "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

```bash
# Backend (Port 5000)
lsof -i :5000
kill -9 <PID>

# Frontend (Port 5173)
lsof -i :5173
kill -9 <PID>
```

### MongoDB connection failed

- Verify connection URI in `.env`
- Check MongoDB Atlas IP whitelist (add your IP or 0.0.0.0)
- Ensure database user has correct credentials
- Test connection: `mongo "your-connection-string"`

### GitHub OAuth not working

- Verify Client ID and Client Secret in `.env`
- Check OAuth redirect URL matches `http://localhost:5000/api/auth/github/callback`
- Ensure FRONTEND_URL is correctly set

### CORS errors

- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that CORS middleware in `server.js` allows your frontend domain

### Vite not loading styles

```bash
# Rebuild Vite cache
rm -rf frontend/node_modules/.vite
npm run dev
```

---

## 🎯 Roadmap

- [ ] Complete Dashboard component
- [ ] Module detail pages with content rendering
- [ ] Quiz taking interface
- [ ] Progress tracking dashboard
- [ ] Leaderboard implementation
- [ ] Admin panel UI
- [ ] User profile pages
- [ ] Notification system
- [ ] Test suite (Jest + Supertest for backend, Vitest for frontend)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Production deployment guide
