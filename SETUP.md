# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Quick Start

### 1. Run Setup Script (Windows PowerShell)
```powershell
.\scripts\setup.ps1
```

### 2. Manual Setup

#### Install Dependencies
```bash
npm run install:all
```

#### Configure Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/devzora_int_tracker?schema=public"
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:8080
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

#### Setup Database
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npm run db:seed
cd ..
```

#### Start Development Servers

From root directory:
```bash
npm run dev
```

Or separately:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Access the Application

- Frontend: http://localhost:8080
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Default Login Credentials

- **Email**: `admin@devzora.com`
- **Password**: `password`

## UI Libraries Integration

The app is built with Tailwind CSS and is ready to integrate components from:
- **Kokonut UI**: https://kokonutui.com
- **Blocks.so**: https://blocks.so
- **Dice UI**: https://diceui.com

These libraries provide copy-paste ready components that work with Tailwind CSS and React. You can replace existing components with components from these libraries as needed.

## Project Structure

```
Devzora_int_tracker/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   └── prisma/       # Database schema
├── frontend/         # React/Vite app
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── store/
└── scripts/          # Setup scripts
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database `devzora_int_tracker` exists

### Port Already in Use
- Backend default: 3001
- Frontend default: 8080
- Change ports in respective .env files if needed

### Prisma Issues
```bash
cd backend
npx prisma generate
npx prisma migrate reset  # WARNING: This will delete all data
```

## Next Steps

1. Review and customize the UI components
2. Add more features as needed
3. Integrate UI components from Kokonut UI, Blocks.so, or Dice UI
4. Set up production environment variables
5. Configure email notifications for reminders
6. Add file upload functionality if needed


