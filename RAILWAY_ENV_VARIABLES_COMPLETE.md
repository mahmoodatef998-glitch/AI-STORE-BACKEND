# 🔧 Environment Variables الكاملة لـ Railway (Backend)

## 📋 المتغيرات المطلوبة:

### 1️⃣ `SUPABASE_URL` ⭐ **مطلوب**
```
https://nueufozblbymuvzlbywf.supabase.co
```

### 2️⃣ `SUPABASE_SERVICE_ROLE_KEY` ⭐ **مطلوب**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXVmbG9zYmxieW11dnpsYnl3ZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NjY5OTU2MTMsImV4cCI6MjA4MjU3MTYxM30.lyQmQcns6mkNl9h37GsGbT1mXTqHc02rMJUNMNchprA
```

### 3️⃣ `FRONTEND_URL` ⭐ **مطلوب (بعد Deploy Frontend)**
```
https://your-frontend-app.vercel.app
```
**⚠️ استبدل `your-frontend-app.vercel.app` بـ URL الفعلي لـ Frontend على Vercel!**

**مثال:**
```
https://ai-store-frontend.vercel.app
```

### 4️⃣ `PORT` (اختياري)
```
3001
```
**ملاحظة:** Railway يضيف `PORT` تلقائياً، لكن يمكنك إضافته إذا أردت.

---

## 🚀 خطوات إضافة المتغيرات في Railway:

### 1. اذهب إلى Railway Dashboard:
- https://railway.app/dashboard
- اختر مشروع Backend

### 2. اضغط على **Variables** tab

### 3. أضف المتغيرات:

#### أ) `SUPABASE_URL`:
- **Name:** `SUPABASE_URL`
- **Value:** `https://nueufozblbymuvzlbywf.supabase.co`
- **Add**

#### ب) `SUPABASE_SERVICE_ROLE_KEY`:
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXVmbG9zYmxieW11dnpsYnl3ZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NjY5OTU2MTMsImV4cCI6MjA4MjU3MTYxM30.lyQmQcns6mkNl9h37GsGbT1mXTqHc02rMJUNMNchprA`
- **Add**

#### ج) `FRONTEND_URL` (بعد Deploy Frontend):
- **Name:** `FRONTEND_URL`
- **Value:** `https://your-frontend-app.vercel.app` (URL الـ Frontend على Vercel)
- **Add**

---

## ⚠️ ملاحظات مهمة:

1. **`FRONTEND_URL` يجب أن يكون URL الـ Frontend على Vercel:**
   - ✅ `https://ai-store-frontend.vercel.app`
   - ❌ `http://localhost:3000` (في Production!)

2. **بعد Deploy Frontend على Vercel:**
   - احصل على URL الـ Frontend
   - أضفه في Railway كـ `FRONTEND_URL`
   - Backend سيعمل تلقائياً (أو أعد Deploy)

3. **`SUPABASE_SERVICE_ROLE_KEY` سري جداً:**
   - ⚠️ لا تشاركه أبداً!
   - ⚠️ لا تضعه في Frontend!

---

## 📝 مثال كامل:

```
SUPABASE_URL=https://nueufozblbymuvzlbywf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXVmbG9zYmxieW11dnpsYnl3ZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NjY5OTU2MTMsImV4cCI6MjA4MjU3MTYxM30.lyQmQcns6mkNl9h37GsGbT1mXTqHc02rMJUNMNchprA
FRONTEND_URL=https://ai-store-frontend.vercel.app
```

---

## ✅ التحقق:

بعد إضافة المتغيرات:
- Backend سيعمل على Railway
- Frontend على Vercel يمكنه الاتصال بالـ Backend
- CORS سيعمل بشكل صحيح

---

**جاهز! 🚀**


