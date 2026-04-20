# 📋 Project Requirements

## Smart eLearning Analytics — Next.js Application

---

## 🖥️ System Requirements

| Requirement | Minimum Version | Recommended |
|-------------|----------------|-------------|
| **Node.js** | 18.x | 20.x LTS or later |
| **npm** | 9.x | 10.x or later |
| **OS** | Windows 10 / macOS 12 / Ubuntu 20.04 | Latest stable |
| **RAM** | 4 GB | 8 GB+ |
| **Disk Space** | 500 MB (including node_modules) | 1 GB+ |

> **Note:** This project uses Next.js 16 and React 19. Make sure your Node.js version supports these.

---

## 📦 Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.4 | React framework (App Router) |
| `react` | 19.2.4 | UI library |
| `react-dom` | 19.2.4 | React DOM renderer |
| `next-auth` | ^5.0.0-beta.31 | Authentication (Auth.js v5) |
| `@auth/prisma-adapter` | ^2.11.2 | NextAuth ↔ Prisma adapter |
| `@prisma/client` | ^7.7.0 | Database ORM client |
| `@prisma/adapter-better-sqlite3` | ^7.7.0 | SQLite adapter for Prisma |
| `bcryptjs` | ^3.0.3 | Password hashing |
| `date-fns` | ^4.1.0 | Date formatting utilities |
| `dotenv` | ^17.4.2 | Environment variable loading |
| `googleapis` | ^171.4.0 | Google / YouTube Data API v3 |
| `lucide-react` | ^1.8.0 | Icon library |
| `next-themes` | ^0.4.6 | Dark/light theme support |
| `recharts` | ^3.8.1 | Charts and data visualization |
| `sonner` | ^2.0.7 | Toast notifications |

---

## 🛠️ Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `prisma` | ^7.7.0 | Database schema & migrations CLI |
| `typescript` | ^5 | TypeScript compiler |
| `tailwindcss` | ^4 | Utility-first CSS framework |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind v4 |
| `eslint` | ^9 | Code linting |
| `eslint-config-next` | 16.2.4 | Next.js ESLint ruleset |
| `@types/node` | ^20 | Node.js type definitions |
| `@types/react` | ^19 | React type definitions |
| `@types/react-dom` | ^19 | React DOM type definitions |
| `@types/bcryptjs` | ^2.4.6 | bcryptjs type definitions |

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database (SQLite — file-based, no external server needed)
DATABASE_URL="file:./dev.db"

# NextAuth / Auth.js secret (generate a strong random string for production)
AUTH_SECRET="your-random-secret-here"

# YouTube Data API v3
YOUTUBE_API_KEY="your-youtube-api-key"

# Google OAuth 2.0 (for sign-in with Google)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Base URL of the app (used by NextAuth for callbacks)
NEXTAUTH_URL="http://localhost:3000"
```

### How to obtain credentials

#### YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **YouTube Data API v3**
4. Navigate to **APIs & Services → Credentials → Create API Key**

#### Google OAuth (Sign-in with Google)
1. In Google Cloud Console, go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Set application type to **Web application**
4. Add `http://localhost:3000/api/auth/callback/google` as an **Authorized redirect URI**
5. Copy the **Client ID** and **Client Secret**

#### AUTH_SECRET
Generate a secure random secret using:
```bash
openssl rand -base64 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🗄️ Database

- **Engine**: SQLite (file-based, no external database server required)
- **ORM**: Prisma 7 with `better-sqlite3` adapter
- **Schema**: `prisma/schema.prisma`
- **Database file**: `dev.db` (auto-created on first migration)

---

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
# Copy the example and fill in your values
copy .env.example .env   # Windows
cp .env.example .env     # macOS / Linux
```

### 4. Set up the database
```bash
# Run Prisma migrations to create the SQLite database
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to inspect the database
npx prisma studio
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npx prisma migrate dev` | Apply database migrations |
| `npx prisma studio` | Launch visual database browser |
| `npx prisma generate` | Regenerate Prisma Client after schema changes |

---

## 🌐 External API Dependencies

| Service | Purpose | Required? |
|---------|---------|-----------|
| YouTube Data API v3 | Fetch video metadata & embed playlists | ✅ Yes |
| Google OAuth 2.0 | Sign in with Google | ✅ Yes |
| SQLite (local) | App data storage | ✅ Yes (auto-managed) |

---

## 📁 Key Project Structure

```
project/
├── src/
│   ├── app/            # Next.js App Router pages & layouts
│   ├── components/     # Reusable React components
│   ├── lib/            # Utilities, Prisma client, auth config
│   └── auth.ts         # NextAuth configuration
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Migration history
├── public/             # Static assets
├── .env                # Environment variables (not committed)
├── package.json        # Node.js dependencies
└── REQUIREMENTS.md     # This file
```

---

## ⚠️ Important Notes

- **Do not commit `.env`** — it contains secrets. It is already listed in `.gitignore`.
- **Do not commit `dev.db`** — the SQLite database file contains user data.
- The `AUTH_SECRET` **must be changed** before deploying to production.
- YouTube API has a **daily quota limit** of 10,000 units by default. Monitor usage in the Google Cloud Console.
- `next-auth` v5 (beta) has a different API than v4 — refer to [Auth.js v5 docs](https://authjs.dev/) for guidance.
