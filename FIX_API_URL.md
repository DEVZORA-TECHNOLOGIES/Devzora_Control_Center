# Frontend Environment Configuration

## The Issue
Your `frontend/.env` file currently has:
```env
VITE_API_URL=https://devzora-control-center.onrender.com
```

This is causing the frontend to make API calls to the production server instead of your local backend.

## The Fix

**Option 1: Edit the existing `.env` file**

Open `frontend/.env` and comment out or remove the `VITE_API_URL` line:

```env
# VITE_API_URL=https://devzora-control-center.onrender.com
```

**Option 2: Use PowerShell to update it**

Run this command from the project root:

```powershell
# Navigate to frontend directory
cd frontend

# Create/update .env file for local development
@"
# API URL - Leave empty for local development to use Vite proxy
# VITE_API_URL=

# For production deployment, set this to your backend URL:
# VITE_API_URL=https://devzora-control-center.onrender.com
"@ | Out-File -FilePath .env -Encoding utf8

# Go back to root
cd ..
```

## After Updating

1. **Stop the dev server** (Ctrl+C in the terminal running `npm run dev`)
2. **Restart it**: `npm run dev`
3. **Refresh your browser** at `http://localhost:8080`
4. The Budgets page should now work correctly

## Why This Happens

- Vite reads environment variables at build/dev server start time
- Changes to `.env` files require a server restart
- When `VITE_API_URL` is not set in development, the Vite proxy automatically routes `/api` requests to `http://localhost:3001`

## Verification

After restarting, open browser DevTools and check the Network tab. API requests should go to:
- ✅ `http://localhost:8080/api/budgets` (proxied to localhost:3001)
- ❌ NOT `https://devzora-control-center.onrender.com/api/budgets`
