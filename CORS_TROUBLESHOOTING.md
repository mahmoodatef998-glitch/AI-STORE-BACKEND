# 🔍 CORS Troubleshooting Guide

## المشكلة الحالية:
Railway لا يزال يرسل `https://ai-store-frontend.vercel.app/` بدلاً من الـ origin الفعلي من الـ request.

## ✅ الحلول المطبقة:

### 1. CORS Middleware هو الأول
- CORS middleware الآن هو **أول middleware** في الكود
- يأتي قبل `helmet()`, `morgan()`, `express.json()`, إلخ

### 2. استخدام Origin من Request
- الكود يستخدم `req.headers.origin` مباشرة
- لا يستخدم `FRONTEND_URL` environment variable

### 3. Logging مفصل
- كل request يتم logg
- كل CORS header يتم logg

## 🔍 خطوات التحقق:

### 1. تحقق من Railway Logs
بعد النشر، افتح Railway Dashboard → Backend Service → Logs وابحث عن:
```
[CORS] OPTIONS /api/equipments | Origin: https://ai-store-frontend-xxx.vercel.app
[CORS] ✅ Allowing Vercel origin: https://ai-store-frontend-xxx.vercel.app
[CORS] ✅ Set Access-Control-Allow-Origin to: "https://ai-store-frontend-xxx.vercel.app"
[CORS] ✅ Preflight (OPTIONS) - returning 204
```

### 2. إذا لم تظهر Logs
- انتظر 2-3 دقائق بعد النشر
- Refresh صفحة Logs
- تحقق من أن Service يعمل (Status: Running)

### 3. إذا رأيت Logs لكن المشكلة لا تزال موجودة
- تحقق من أن الـ origin في Logs يطابق الـ origin في المتصفح
- امسح cache المتصفح (Ctrl+Shift+R)
- جرب في Incognito/Private window

## ⚠️ إذا استمرت المشكلة:

### الحل البديل: استخدام `cors` package
إذا استمرت المشكلة، يمكننا استخدام `cors` package بدلاً من manual CORS:

```typescript
import cors from 'cors';

app.use(cors({
  origin: (origin, callback) => {
    // Allow all Vercel deployments
    if (!origin || origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

لكن الكود الحالي يجب أن يعمل بشكل صحيح.

