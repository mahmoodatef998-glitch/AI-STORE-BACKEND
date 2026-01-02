# 🔧 إصلاح مشكلة Railway Deployment

## ❌ المشكلة:
```
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

## ✅ الحل:

### 1. تأكد من إعدادات Railway:

في Railway Dashboard → Service Settings:

#### **Root Directory:**
```
BACKEND
```

#### **Build Command:**
```
npm install && npm run build
```

#### **Start Command:**
```
npm start
```

---

### 2. تأكد من وجود الملفات:

- ✅ `package.json` (موجود)
- ✅ `tsconfig.json` (موجود)
- ✅ `nixpacks.toml` (تم إنشاؤه)
- ✅ `railway.toml` (تم إنشاؤه)

---

### 3. Environment Variables:

تأكد من إضافة كل المتغيرات:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `PORT` (Railway يضيفه تلقائياً)
- `NODE_ENV=production`
- `FRONTEND_URL`

---

### 4. إذا لم يعمل:

#### Option 1: استخدام Nixpacks يدوياً

في Railway → Service → Settings → Build:
- **Builder:** Nixpacks
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

#### Option 2: استخدام Dockerfile

إذا استمرت المشكلة، يمكن إنشاء Dockerfile.

---

### 5. تحقق من Logs:

في Railway → Service → Deployments → View Logs

ابحث عن:
- ✅ `npm install` نجح
- ✅ `npm run build` نجح
- ✅ `npm start` يعمل
- ❌ أي أخطاء في Logs

---

## 📝 خطوات إعادة Deploy:

1. **حذف Service الحالي** (إن وجد)
2. **إنشاء Service جديد**
3. **Root Directory:** `BACKEND`
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npm start`
6. **أضف Environment Variables**
7. **Deploy**

---

## ✅ التحقق:

بعد Deploy، افتح:
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

**إذا استمرت المشكلة، أرسل Logs من Railway!**


