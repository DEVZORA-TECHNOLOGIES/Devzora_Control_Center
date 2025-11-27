# Troubleshooting Guide

## 1. Render Deployment Failure (Fixed)
**Issue:** The Render build failed with `Property 'budget' does not exist...`
**Cause:** The `prisma generate` command wasn't running before the build, so the backend didn't know about the new Budget model.
**Fix:** I added a `postinstall` script to `backend/package.json` and pushed it. Render will now automatically run `prisma generate` after installing dependencies.
**Status:** ✅ Fix pushed. A new deployment should start automatically on Render.

## 2. Local "EPERM: operation not permitted" Error
**Issue:** You saw `EPERM: operation not permitted` when running `npx prisma generate`.
**Cause:** The backend server (`npm run dev`) is running and locking the Prisma Client files. Windows doesn't allow modifying files that are in use.
**Fix:**
1. Stop the running server (Ctrl+C in the terminal where `npm run dev` is running).
2. Run `npx prisma generate`.
3. Start the server again with `npm run dev`.

## 3. Production 404 Errors
**Issue:** `GET .../api/budgets 404 (Not Found)`
**Cause:** The production backend hasn't finished deploying the new code yet.
**Fix:** Wait for the Render deployment (triggered by my recent push) to complete. Once it says "Live", the 404s will disappear.
