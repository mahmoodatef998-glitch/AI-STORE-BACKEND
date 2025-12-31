# 🔧 إصلاح مشكلة nixpacks.toml

## ❌ المشكلة:
```
error: undefined variable 'nodejs-20_x'
```

**السبب:** الصيغة في `nixpacks.toml` خاطئة.

---

## ✅ الحل:

### تم حذف `nixpacks.toml`

**Railway سيستخدم:**
- `.nvmrc` (Node.js 20)
- `package.json` (لتحديد Node.js version)

---

## 🚀 إعدادات Railway:

### Service Settings → Build & Deploy:

| Setting | Value |
|---------|-------|
| **Builder** | `Nixpacks` |
| **Root Directory** | `BACKEND` ⚠️ |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

---

## 📝 ملاحظات:

1. ✅ **تم حذف `nixpacks.toml`** - Railway سيستخدم `.nvmrc` تلقائياً
2. ✅ **`.nvmrc` موجود** - يحتوي على `20`
3. ✅ **Railway سيكتشف Node.js 20** من `.nvmrc`

---

## ✅ بعد Deploy:

افتح:
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

**الآن جرب Deploy مرة أخرى! 🚀**

