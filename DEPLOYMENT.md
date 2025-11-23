# Deployment Guide

## Backend Deployment (Render)

### Environment Variables

Set these in your Render dashboard:

```
DATABASE_URL=your_postgresql_connection_string
PORT=3001
NODE_ENV=production
JWT_SECRET=your-secure-secret-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080,https://devzoracontrolcenter.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Important Notes

- **CORS_ORIGIN**: Use comma-separated values for multiple origins
- **JWT_SECRET**: Use a strong, random secret key in production
- **DATABASE_URL**: Your PostgreSQL connection string from Render or another provider

### Build Command

```
npm install && npm run build && npm start
```

### Start Command

```
npm start
```

## Frontend Deployment (Netlify)

### Environment Variables

Set these in your Netlify dashboard:

```
VITE_API_URL=https://devzora-control-center.onrender.com
```

### Build Settings

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: `frontend` (if deploying from monorepo root)

### Netlify Configuration

The `netlify.toml` file is already configured with:
- Build command
- Publish directory
- SPA redirect rules

## Post-Deployment Checklist

1. ✅ Backend deployed and accessible at `https://devzora-control-center.onrender.com`
2. ✅ Frontend deployed and accessible at `https://devzoracontrolcenter.netlify.app`
3. ✅ Backend CORS configured to allow Netlify origin
4. ✅ Frontend `VITE_API_URL` points to backend URL
5. ✅ Database migrations run on backend
6. ✅ Test login functionality
7. ✅ Test API endpoints from frontend

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that `CORS_ORIGIN` in backend includes your Netlify URL
2. Ensure the URL matches exactly (including https://)
3. Restart the backend after changing CORS_ORIGIN

### API Connection Errors

1. Verify `VITE_API_URL` is set correctly in Netlify
2. Check that backend is running and accessible
3. Test backend health endpoint: `https://devzora-control-center.onrender.com/health`

### Database Connection

1. Verify `DATABASE_URL` is correct
2. Check database is accessible from Render
3. Run migrations: `npm run db:migrate` (if needed)

