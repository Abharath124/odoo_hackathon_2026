# TravelLoop

A full-stack travel management platform built for the Odoo Hackathon 2026. TravelLoop provides a secure, minimal and modern web application with role-based access, OTP email verification, dynamic branding, and an admin control panel.

---

## Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS v4
- Redux Toolkit
- React Router v7
- React Hook Form + Zod
- Axios
- Lucide React

### Backend
- Node.js + Express
- Sequelize ORM + MySQL
- JWT Authentication
- Bcrypt password hashing
- Nodemailer (SMTP)
- Multer (file uploads)

---

## Features

### Authentication
- Register with profile photo upload
- Email OTP verification on signup
- JWT login with role-based redirect
- Forgot password via OTP email
- Reset password with OTP
- Auto-login after OTP verification

### Role-Based Access
| Role | Access |
|------|--------|
| `user` | `/home` dashboard |
| `admin` | `/admin/*` panel |

- Protected routes redirect unauthenticated users to `/login`
- Guest routes redirect authenticated users to their dashboard
- Admin routes block non-admin users

### Admin Panel
- **Users** — View all non-admin users, edit name/email, reset password
- **Settings** — Manage branding, colors, SMTP, JWT, logo

### Dynamic Settings
All settings are configured through the Admin Panel and stored in the `Settings` DB table — no `.env` required for these:
- `site_name`, `site_tagline` — shown on landing page
- `primary_color`, `secondary_color` — applied as CSS variables across the entire UI
- `logo` — shown on auth pages and sidebars
- `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_from` — used for sending OTP emails
- `jwt_secret`, `jwt_expires_in` — used for signing tokens

### Public Pages
- Landing page
- Terms & Conditions
- Privacy Policy
- FAQ

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL running locally

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` in the `server/` directory and fill in:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=odoo_hackathon
DB_USER=root
DB_PASSWORD=

CLIENT_URL=http://localhost:5173
```

**Admin Credentials:** 

Email = admin@travelloop.com
Password = Admin@1234

> **Note:** JWT secret and SMTP credentials are configured through the Admin Panel → Settings, not via `.env`.

### 3. Create MySQL Database

```sql
CREATE DATABASE odoo_hackathon;
```

### 4. Seed Admin User & Settings

```bash
cd server

# Seed admin user
npm run seed:admin

# Seed default settings (JWT, SMTP, branding etc.)
npm run seed:settings

# Or seed both at once
npm run seed
```

### 5. Start the Servers

```bash
# Start backend (from server/)
npm run dev

# Start frontend (from client/)
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## API Endpoints

### Auth — `/api/auth`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Register with optional avatar |
| POST | `/verify-otp` | Verify email OTP → returns token |
| POST | `/login` | Login → returns token |
| POST | `/forgot-password` | Send reset OTP |
| POST | `/reset-password` | Reset password with OTP |
| POST | `/logout` | Logout (auth required) |
| GET | `/me` | Get current user (auth required) |

### Admin — `/api/admin` (auth + admin role required)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/users` | List all non-admin users |
| PUT | `/users/:id` | Update user name/email |
| PUT | `/users/:id/reset-password` | Reset user password |
| GET | `/settings` | Get all settings (sensitive masked) |
| PUT | `/settings` | Update settings |
| POST | `/settings/logo` | Upload logo image |
| GET | `/settings/public` | Public settings (no auth) |

---

## Scripts

### Server
```bash
npm run dev            # Start with nodemon
npm run start          # Start with node
npm run seed:admin     # Seed admin user
npm run seed:settings  # Seed default settings
npm run seed           # Seed admin + settings
```

### Client
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## License

MIT — Built for Odoo Hackathon 2026
