# Important Notes

## API Routing (Production vs Local)

The app is designed to work with both production and local URLs automatically:

- **In Development** (`npm run dev`): Uses Vite proxy to route `/api` → `http://localhost:3001`
- **In Production** (Netlify): Uses `VITE_API_URL` environment variable

### Current Issue with Budgets
The production backend (`https://devzora-control-center.onrender.com`) doesn't have the budget routes yet because:
1. The budget feature was just added locally
2. Production backend needs to be deployed with the new code

### Solutions:
1. **For Local Development**: The backend is running with budget routes - everything works
2. **For Production**: You'll need to deploy the backend changes to Render.com

The routing logic in `apiService.ts` is correct and doesn't need changes.

## Design Changes Made

### Removed "AI-Looking" Elements:
1. **Gradient Text** → Changed to solid colors
   - Before: `bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent`
   - After: `text-gray-900`

2. **Border Radius** → Reduced from 0.75rem to 0.5rem
   - Cards now use `rounded-lg` instead of `rounded-2xl`
   - Icons use `rounded-lg` instead of `rounded-xl`

3. **Glassmorphism** → Replaced with standard borders
   - Before: `bg-white/70 backdrop-blur-lg border-white/20`
   - After: `bg-white border-gray-200`

4. **Primary Color** → Made more subtle
   - Before: HSL(249, 95%, 60%) - Very vibrant
   - After: HSL(249, 58%, 52%) - Professional blue-purple

### What Remains:
- Inter font (professional, widely used)
- Clean spacing and layout
- Recharts for data visualization
- Smooth transitions (subtle, not excessive)

## Next Steps

1. **Test locally** - Budget page should work now
2. **Deploy backend** to production when ready
3. **Continue upgrading** remaining pages with the new, more professional design system
