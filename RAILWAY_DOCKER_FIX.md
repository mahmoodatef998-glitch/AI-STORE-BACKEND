# 🔧 إصلاح مشكلة Docker Build في Railway

## ❌ المشكلة:
```
/bin/bash: line 1: npm: command not found
ERROR: Docker build failed
```

## ✅ الحل:

### Option 1: استخدام Nixpacks (موصى به) ⭐

في Railway Dashboard → Service → Settings:

1. **Builder:** اختر **Nixpacks** (ليس Docker)
2. **Root Directory:** `BACKEND`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`

---

### Option 2: إصلاح Dockerfile

إذا أردت استخدام Docker، تم إنشاء `Dockerfile` صحيح.

لكن **الأفضل هو استخدام Nixpacks** لأنه أسهل.

---

## 🚀 خطوات Deploy مع Nixpacks:

### 1. في Railway Dashboard:

**Service Settings → Build & Deploy:**

- **Builder:** `Nixpacks` (اختر من القائمة)
- **Root Directory:** `BACKEND`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### 2. Environment Variables:

تأكد من إضافة:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
PORT=3001
NODE_ENV=production
FRONTEND_URL=...
```

### 3. Deploy:

- Save Settings
- Railway سيبدأ Build تلقائياً
- انتظر حتى يكتمل

---

## 📝 ملاحظات:

1. **Nixpacks أفضل من Docker** للمشاريع Node.js
2. **Root Directory مهم:** يجب أن يكون `BACKEND`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`

---

## ✅ التحقق:

بعد Deploy:
```
https://your-app.railway.app/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

**استخدم Nixpacks بدلاً من Docker! 🚀**


