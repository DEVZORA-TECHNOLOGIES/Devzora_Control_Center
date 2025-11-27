# Development Environment Configuration

## Frontend (.env)
Make sure your `frontend/.env` file does NOT have `VITE_API_URL` set, or set it to:
```
# Leave empty or comment out for local development
# VITE_API_URL=
```

This will allow Vite's proxy to work correctly and route `/api` requests to `http://localhost:3001`.

## Backend (.env)
Your backend should have the database connection string and other necessary environment variables.

## Testing Budget Routes

After restarting the server, you can test the budget routes:

### Using curl:
```bash
# Get all budgets (requires authentication token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/budgets

# Health check (no auth required)
curl http://localhost:3001/health
```

### In the browser:
1. Navigate to http://localhost:8080
2. Login with: admin@devzora.com / password
3. Click on "Budgets" in the sidebar
4. The page should load without 404 errors

## Troubleshooting

If you see 404 errors for `/api/budgets`:
1. Make sure the backend server is running (check terminal for "Server running on port 3001")
2. Check that `frontend/.env` doesn't have `VITE_API_URL` pointing to production
3. Restart the dev server: `npm run dev`
4. Clear browser cache and reload

## Current Status
✅ Backend routes registered and running
✅ Frontend configured to use Vite proxy
✅ Budget model created in database
✅ All pages upgraded with premium UI
