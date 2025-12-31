# 🔧 إعداد `FRONTEND_URL` في Railway

## ✅ URL الـ Frontend على Vercel:

```
https://ai-store-frontend.vercel.app
```

---

## 🚀 خطوات إضافة `FRONTEND_URL` في Railway:

### 1️⃣ اذهب إلى Railway Dashboard:
- https://railway.app/dashboard
- اختر مشروع **Backend** (AI-STORE-BACKEND)

### 2️⃣ اضغط على **Variables** tab

### 3️⃣ أضف متغير جديد:

#### **Name:**
```
FRONTEND_URL
```

#### **Value:**
```
https://ai-store-frontend.vercel.app
```

**⚠️ مهم:**
- بدون `/` في النهاية
- مع `https://`
- بدون مسافات

### 4️⃣ اضغط **Add** أو **Save**

---

## ✅ التحقق:

بعد إضافة `FRONTEND_URL`:
1. Railway سيعيد Deploy تلقائياً (أو أعد Deploy يدوياً)
2. Backend سيقبل Requests من Frontend على Vercel
3. CORS سيعمل بشكل صحيح

---

## 📋 Environment Variables الكاملة في Railway:

يجب أن تكون هذه المتغيرات موجودة:

```
SUPABASE_URL=https://nueufozblbymuvzlbywf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXVmbG9zYmxieW11dnpsYnl3ZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NjY5OTU2MTMsImV4cCI6MjA4MjU3MTYxM30.lyQmQcns6mkNl9h37GsGbT1mXTqHc02rMJUNMNchprA
FRONTEND_URL=https://ai-store-frontend.vercel.app
```

---

## 🔄 بعد إضافة `FRONTEND_URL`:

1. **Backend على Railway** سيعرف أن Frontend موجود على `https://ai-store-frontend.vercel.app`
2. **CORS** سيعمل بشكل صحيح
3. **Frontend** يمكنه الاتصال بالـ Backend بدون مشاكل

---

**جاهز! بعد إضافة `FRONTEND_URL` في Railway، كل شيء سيعمل! ✅**

