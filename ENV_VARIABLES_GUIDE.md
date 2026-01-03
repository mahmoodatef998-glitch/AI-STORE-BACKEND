# 📋 Environment Variables Guide - دليل المتغيرات

## ✅ المتغيرات المطلوبة في Railway:

### 🔴 **CRITICAL (مطلوبة):**
1. **`SUPABASE_URL`** - رابط Supabase Database
2. **`SUPABASE_SERVICE_ROLE_KEY`** - Service Role Key من Supabase
3. **`SUPABASE_ANON_KEY`** - Anonymous Key من Supabase (اختياري لكن مستحسن)
4. **`PORT`** - عادة Railway يضيفها تلقائياً

### 🟡 **OPTIONAL (اختيارية لكن مستحسنة):**
5. **`FRONTEND_URL`** - رابط Frontend (Vercel)
   - مثال: `https://ai-store-frontend.vercel.app`
   - بدون `/` في النهاية

6. **`CORS_ORIGIN`** - نفس `FRONTEND_URL` (للتوافق مع مشاريع أخرى)
   - مثال: `https://ai-store-frontend.vercel.app`
   - بدون `/` في النهاية

7. **`NODE_ENV`** - Environment
   - `production` أو `development`

---

## 🔍 الفرق بين المشروعين:

### **AI-STORE-BACKEND** (المشروع الحالي):
- ✅ `FRONTEND_URL` - مستخدم
- ✅ `CORS_ORIGIN` - **الآن مدعوم أيضاً**
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `PORT`
- ✅ `NODE_ENV`

### **ATA-BACKEND** (مشروع آخر):
- ✅ `CORS_ORIGIN` - مستخدم
- ✅ `DATABASE_URL` - مختلف (Supabase vs PostgreSQL مباشر)
- ✅ `NEXTAUTH_SECRET` - للـ authentication
- ✅ `NEXTAUTH_URL` - للـ authentication
- ✅ `GROQ_API_KEY` - لـ AI features

---

## 🎯 الحل:

الكود الآن يدعم **كلا المتغيرين**:
- `FRONTEND_URL` ✅
- `CORS_ORIGIN` ✅

**يمكنك إضافة أي منهما في Railway Variables.**

---

## 📝 خطوات إضافة المتغيرات في Railway:

1. Railway Dashboard → Project → Service
2. Variables Tab
3. Add Variable:
   - **Name:** `CORS_ORIGIN`
   - **Value:** `https://ai-store-frontend.vercel.app` (بدون `/`)
4. Save
5. Redeploy

---

## ✅ التحقق من المتغيرات:

بعد Redeploy، اختبر:
```
https://ai-store-backend-production.up.railway.app/health/detailed
```

سترى:
```json
{
  "environment": {
    "FRONTEND_URL": "✅ Set" أو "not set",
    "CORS_ORIGIN": "✅ Set" أو "not set",
    ...
  }
}
```

---

## 🚨 ملاحظات مهمة:

1. **لا تضع `/` في نهاية URL:**
   - ❌ `https://ai-store-frontend.vercel.app/`
   - ✅ `https://ai-store-frontend.vercel.app`

2. **CORS_ORIGIN و FRONTEND_URL:**
   - يمكنك إضافة أي منهما أو كلاهما
   - الكود يستخدم كلاهما تلقائياً

3. **Vercel Preview URLs:**
   - الكود يدعم جميع Vercel URLs تلقائياً
   - لا حاجة لإضافة كل preview URL يدوياً

