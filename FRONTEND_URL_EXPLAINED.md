# 📍 شرح `FRONTEND_URL` في Railway (Backend)

## ❓ ما هو `FRONTEND_URL`؟

`FRONTEND_URL` هو **متغير بيئة في Backend (Railway)** وليس في Frontend.

---

## 🎯 استخدامه:

يستخدم في **CORS configuration** في Backend للسماح للـ Frontend بالاتصال بالـ Backend.

### في الكود (`BACKEND/src/server.ts`):

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

---

## 📋 القيم:

### 1️⃣ Development (محلي):
```
FRONTEND_URL=http://localhost:3000
```

### 2️⃣ Production (Railway):
```
FRONTEND_URL=https://your-frontend-app.vercel.app
```
**⚠️ مهم:** استبدل `your-frontend-app.vercel.app` بـ URL الفعلي لـ Frontend على Vercel!

**مثال:**
```
FRONTEND_URL=https://ai-store-frontend.vercel.app
```

---

## 🔧 أين تضيفه؟

### في Railway (Backend):

1. اذهب إلى: https://railway.app/dashboard
2. اختر مشروع Backend
3. اضغط على **Variables** tab
4. أضف متغير جديد:
   - **Name:** `FRONTEND_URL`
   - **Value:** `https://your-frontend-app.vercel.app` (URL الـ Frontend على Vercel)
5. Save

---

## ⚠️ ملاحظات مهمة:

1. **`FRONTEND_URL` في Backend (Railway)** - ليس في Frontend!
2. **يجب أن يكون URL كامل** - مع `https://` وبدون `/` في النهاية
3. **بعد Deploy Frontend على Vercel:**
   - احصل على URL الـ Frontend (مثل: `https://ai-store-frontend.vercel.app`)
   - أضفه في Railway كـ `FRONTEND_URL`
   - أعد Deploy Backend (أو سيعمل تلقائياً)

---

## 📝 مثال كامل:

### في Railway (Backend Environment Variables):

```
FRONTEND_URL=https://ai-store-frontend.vercel.app
```

### في Vercel (Frontend Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://nueufozblbymuvzlbywf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_API_URL=https://ai-store-backend.railway.app/api
```

---

## 🔄 Workflow:

1. **Deploy Frontend على Vercel** → احصل على URL (مثل: `https://ai-store-frontend.vercel.app`)
2. **أضف `FRONTEND_URL` في Railway** → `https://ai-store-frontend.vercel.app`
3. **Deploy Backend على Railway** → سيعمل CORS بشكل صحيح

---

## ✅ التحقق:

بعد إضافة `FRONTEND_URL` في Railway:
- Frontend على Vercel يمكنه الاتصال بالـ Backend على Railway
- لن تظهر أخطاء CORS في Console

---

**ملخص:** `FRONTEND_URL` هو متغير بيئة في **Backend (Railway)** يحتوي على URL الـ Frontend على Vercel.

