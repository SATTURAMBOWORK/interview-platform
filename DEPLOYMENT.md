# Deployment Guide (Frontend + Backend + C++ Judge)

This project is now prepared for:
- Frontend: **Vercel** (`client/platform`)
- Backend API + C++ execution: **Render (Docker)** (`server`)
- Database: **MongoDB Atlas**

## 1) Push latest code to GitHub
From repo root:

```bash
git add .
git commit -m "chore: production deployment setup"
git push origin main
```

---

## 2) Deploy backend on Render (Docker)

### Why Docker for backend?
Your DSA execution compiles C++ (`g++`) on server side. Docker ensures every deployment has the compiler installed.

### Steps
1. Go to Render Dashboard -> **New +** -> **Blueprint**.
2. Connect this GitHub repo.
3. Render auto-detects `render.yaml` at repo root.
4. Create service `interview-prep-api`.
5. Add environment variables in Render:
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET` = long random string
   - `GROQ_API_KEY` = your Groq API key
   - `CLIENT_URL` = your frontend URL (after Vercel deploy)

6. Deploy and copy backend URL (example):
   - `https://interview-prep-api.onrender.com`

7. Verify health:
   - `https://interview-prep-api.onrender.com/health`

---

## 3) Deploy frontend on Vercel

1. Go to Vercel -> **Add New Project**.
2. Import this same GitHub repo.
3. Set **Root Directory** to `client/platform`.
4. Framework preset: Vite (auto-detected).
5. Add environment variable:
   - `VITE_API_URL` = `https://interview-prep-api.onrender.com/api`
6. Deploy.

---

## 4) Final CORS wiring (important)
After frontend URL is ready, update Render env:

- `CLIENT_URL=https://your-vercel-domain.vercel.app`

If you also want preview domains, you can comma-separate:

```env
CLIENT_URL=https://your-vercel-domain.vercel.app,https://your-vercel-preview.vercel.app
```

Then redeploy backend.

---

## 5) Smoke test checklist

- Open frontend and register/login.
- Solve one DSA problem and click **Run** and **Submit**.
- Confirm backend logs show compile/run flow.
- Check MongoDB collections are updating.

---

## 6) GitHub Student / Education benefits you can use
Benefits change over time, but usually useful options include cloud credits/free tiers from partners.

Best practical approach today:
1. Open GitHub Education Pack offers.
2. Use any available cloud credits/free-tier offer for:
   - Render / DigitalOcean / Azure / similar
3. Keep Vercel Hobby for frontend and use credits for backend/database scaling.

---

## 7) Production notes

- Rotate secrets if any real keys were ever committed.
- Keep `server/.env` only for local dev; use platform env vars in production.
- For higher security at scale, move C++ runs into an isolated sandbox worker.
