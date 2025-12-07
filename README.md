# Rest-Express MVP

This project is a scheduling and staffing prediction MVP built using:
- **Drizzle ORM** for database schema management.
- **PostgreSQL (or Neon)** for database storage.
- **Vite** for the development environment.
- **TypeScript** for type-safe application development.

---

## 🚀 Features
- Staff scheduling and dynamic availability tracking.
- Demand forecasting per time slot.
- AI-powered recommendations for optimization.
- PostgreSQL backend (or SQLite for local development).
- Lightweight architecture for quick deployment.

---

## 📂 Folder Structure
```
.
├── shared/             # Shared utilities (schema, validators)
├── scripts/            # Seed and CLI scripts
├── migrations/         # Database migration files
├── server/             # App server (entry: index.ts)
```

---

## 🛠️ Environment Setup

### 1️⃣ Install Dependencies
This project uses `pnpm` and `Node.js 20`. To install all dependencies, run:
```bash
pnpm install
```

---

### 2️⃣ Database Setup
Set up your database:
1. Create a PostgreSQL database (e.g., via Neon or a local Postgres instance).
2. Add the `pgcrypto` extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```
3. Add your `DATABASE_URL` in a `.env` file:
   ```
   DATABASE_URL=postgres://username:password@hostname:5432/database_name
   ```

---

### 3️⃣ Apply Migrations
Run Drizzle migrations to apply the database schema:
```bash
drizzle-kit push
```

---

### 4️⃣ Seed the Database (Optional)
Seed the database with sample data:
```bash
pnpm seed
```
> **Note**: The seeding script uses the `DATABASE_URL` from your `.env` file, so ensure it is set properly.

---

## 🧑‍💻 Development Instructions

### Start the Dev Server
Run the app locally (using Vite):
```bash
pnpm dev
```

The server should be available at `http://localhost:3000`.

### Build for Production
To create a production build, run:
```bash
pnpm build
```

---

## 🐛 Troubleshooting
### Common Issues
1. **`Error: DATABASE_URL is not set`**
   - Ensure your `.env` file is properly configured.

2. **Issues with Native Addons (`better-sqlite3`)**
   - Ensure system build tools (`gcc`, `make`, etc.) are installed. These are pre-configured in the `replit.nix`.

3. **Invalid `tsconfig.json`**
   - Run a JSON linter:
     ```bash
     node -c tsconfig.json
     ```

---

## 🛠️ Tech Stack
- **Drizzle ORM**: Lightweight TypeScript ORM.
- **Neon Database**: Serverless PostgreSQL hosting.
- **Vite**: Dev server and build tool.
- **TypeScript**: Strict type-checking and high developer productivity.

---

## 🧹 Project Roadmap
- ✅ Initial MVP with scheduling features
- 🏗️ Add user authentication & role-based access controls.
- 📊 Integrate reporting dashboards.
- 🌐 Deploy on Vercel/Netlify with database hosting on Neon/Supabase.

---

## 📄 License
This project is licensed under the MIT License.