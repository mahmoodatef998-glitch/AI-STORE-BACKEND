# 🚂 Railway Deployment Guide - Backend

## 📋 Environment Variables المطلوبة

### ⚙️ إضافة Environment Variables في Railway:

1. **اذهب إلى:** Railway Dashboard → Your Project → Backend Service → Variables

2. **أضف المتغيرات التالية:**

---

### 1️⃣ `SUPABASE_URL`
```
https://nueufozblbymuvzlbywf.supabase.co
```

---

### 2️⃣ `SUPABASE_SERVICE_ROLE_KEY`
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXVmbG9zYmxieW11dnpsYnl3ZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NjY5OTU2MTMsImV4cCI6MjA4MjU3MTYxM30.lyQmQcns6mkNl9h37GsGbT1mXTqHc02rMJUNMNchprA
```

⚠️ **مهم:** هذا المفتاح يعطي صلاحيات كاملة! لا تشاركه أبداً.

---

### 3️⃣ `SUPABASE_ANON_KEY`
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXVmbG9zYmxieW11dnpsYnl3ZiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY2OTk1NjEzLCJleHAiOjIwODI1NzE2MTN9.mhM0f4dV2cl7tjznIYzFbgXmmhdUWYDGGT5AXlCPCd8
```

---

### 4️⃣ `PORT`
```
3001
```

**ملاحظة:** Railway يضيف `PORT` تلقائياً، لكن يمكنك تحديده.

---

### 5️⃣ `FRONTEND_URL`
```
https://your-frontend-app.vercel.app
```

**مثال:**
```
https://ai-store-frontend.vercel.app
```

**ملاحظة:** ضع هذا بعد Deploy Frontend على Vercel.

---

### 6️⃣ `NODE_ENV`
```
production
```

---

## 🚀 خطوات Deploy على Railway

### الخطوة 1: إنشاء Project جديد

1. اذهب إلى: https://railway.app
2. Sign in with GitHub
3. Click **"New Project"**
4. اختر **"Deploy from GitHub repo"**
5. اختر Repo: `AI-STORE-BACKEND`

---

### الخطوة 2: إعداد Service

1. بعد Import، Railway سيكتشف تلقائياً
2. **Root Directory:** `BACKEND`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`

---

### الخطوة 3: إضافة Environment Variables

1. في Service → **Variables** tab
2. أضف كل المتغيرات المذكورة أعلاه
3. Save

---

### الخطوة 4: Deploy

1. Railway سيبدأ Build تلقائياً
2. انتظر حتى يكتمل Build
3. ✅ ستحصل على URL مثل: `https://your-app.railway.app`

---

### الخطوة 5: الحصول على URL

1. بعد Deploy، اذهب إلى **Settings** → **Networking**
2. انسخ **Public Domain**
3. مثال: `https://ai-store-backend-production.up.railway.app`
4. **Backend API URL:** `https://your-app.railway.app/api`

---

## 📝 ملخص Environment Variables

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://nueufozblbymuvzlbywf.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXVmbG9zYmxieW11dnpsYnl3ZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NjY5OTU2MTMsImV4cCI6MjA4MjU3MTYxM30.lyQmQcns6mkNl9h37GsGbT1mXTqHc02rMJUNMNchprA` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXVmbG9zYmxieW11dnpsYnl3ZiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY2OTk1NjEzLCJleHAiOjIwODI1NzE2MTN9.mhM0f4dV2cl7tjznIYzFbgXmmhdUWYDGGT5AXlCPCd8` |
| `PORT` | `3001` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` (بعد Deploy Frontend) |
| `NODE_ENV` | `production` |

---

## ✅ التحقق من Deploy

### 1. Health Check:
افتح: `https://your-app.railway.app/health`

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### 2. API Test:
افتح: `https://your-app.railway.app/api/equipments`

يجب أن ترى response (قد يحتاج authentication).

---

## 🔧 Troubleshooting

### Build Fails:
- تحقق من `package.json` scripts
- تأكد من `tsconfig.json` موجود
- تحقق من Logs في Railway

### Runtime Errors:
- تحقق من Environment Variables
- تأكد من `SUPABASE_SERVICE_ROLE_KEY` صحيح
- تحقق من Logs

### Port Issues:
- Railway يضيف `PORT` تلقائياً
- لا حاجة لتحديده يدوياً (لكن يمكنك)

---

## 📞 بعد Deploy

1. ✅ احصل على Railway URL
2. ✅ استخدمه في Frontend: `NEXT_PUBLIC_API_URL`
3. ✅ اختبر Health Check endpoint
4. ✅ اختبر API endpoints

---

**جاهز للـ Deploy! 🚀**


