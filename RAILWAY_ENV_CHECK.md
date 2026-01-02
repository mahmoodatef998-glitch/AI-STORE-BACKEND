# ✅ قائمة التحقق من متغيرات البيئة في Railway

## 🔍 المتغيرات المطلوبة في Railway (Backend):

### 1️⃣ Supabase Configuration (مطلوب)
```
SUPABASE_URL=https://nueufozblbymuvzlbywf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
```

### 2️⃣ Server Configuration (مطلوب)
```
PORT=3001
NODE_ENV=production
```

### 3️⃣ FRONTEND_URL (اختياري)
```
FRONTEND_URL=https://ai-store-frontend.vercel.app
```

---

## 🔧 خطوات التحقق:

### 1. اذهب إلى Railway Dashboard
- Backend Service → Variables tab

### 2. تحقق من وجود المتغيرات التالية:

| Name | Value | Required | Status |
|------|-------|----------|--------|
| `SUPABASE_URL` | `https://nueufozblbymuvzlbywf.supabase.co` | ✅ Yes | ⬜ |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (JWT token) | ✅ Yes | ⬜ |
| `SUPABASE_ANON_KEY` | `eyJ...` (JWT token) | ✅ Yes | ⬜ |
| `PORT` | `3001` | ✅ Yes | ⬜ |
| `NODE_ENV` | `production` | ✅ Yes | ⬜ |
| `FRONTEND_URL` | `https://ai-store-frontend.vercel.app` | ⚠️ Optional | ⬜ |

### 3. إذا كان أي متغير مفقود:
1. اضغط "New Variable"
2. أضف Name و Value
3. اضغط "Add"
4. اضغط "Redeploy" بعد إضافة/تحديث المتغيرات

---

## 🧪 اختبار الاتصال:

بعد التحقق من المتغيرات، افتح Railway Logs وابحث عن:
- ✅ `🚀 Server running on port 3001` - يعني أن الـ server بدأ
- ❌ `Missing Supabase environment variables` - يعني أن هناك متغيرات مفقودة
- ❌ `Error connecting to Supabase` - يعني أن هناك مشكلة في الاتصال

---

## 📋 ملاحظات:

1. **SUPABASE_SERVICE_ROLE_KEY**: يجب أن يبدأ بـ `eyJ` (JWT token)
2. **SUPABASE_ANON_KEY**: يجب أن يبدأ بـ `eyJ` (JWT token)
3. **لا تضع trailing slash** في URLs
4. **بعد تحديث المتغيرات**: يجب إعادة نشر (Redeploy)

