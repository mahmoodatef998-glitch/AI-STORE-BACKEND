# 🚀 إنشاء حساب Admin في Supabase

## 📋 Script بسيط:

### الملف:
```
BACKEND/create_admin_user_simple.js
```

### الاستخدام:
```bash
cd BACKEND
node create_admin_user_simple.js
```

---

## 📋 بيانات المستخدم:

- **Username:** `admin`
- **Email:** `admin@local`
- **Password:** `00243540000`
- **Role:** `admin`
- **Email Confirmed:** ✅ `true` (تلقائياً)

---

## ✅ ما يفعله Script:

1. يتحقق من Environment Variables
2. ينشئ مستخدم جديد بـ:
   - Email: `admin@local`
   - Password: `00243540000`
   - Email Confirmed: `true`
   - User Metadata: `{username: "admin", role: "admin"}`

---

## 🔧 إذا واجهت مشكلة:

### 1️⃣ تحقق من Environment Variables:

في `BACKEND/.env`:
```
SUPABASE_URL=https://nueufozblbymuvzlbywf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXVmbG9zYmxieW11dnpsYnl3ZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NjY5OTU2MTMsImV4cCI6MjA4MjU3MTYxM30.lyQmQcns6mkNl9h37GsGbT1mXTqHc02rMJUNMNchprA
```

### 2️⃣ إذا كان المستخدم موجود بالفعل:

Script سيعطي خطأ. استخدم:
```bash
node check_and_create_admin.js
```
(هذا يتحقق من وجود المستخدم ويحدثه)

---

## 📋 بيانات تسجيل الدخول:

```
Username: admin
Password: 00243540000
```

أو

```
Username: admin@local
Password: 00243540000
```

---

**بعد تشغيل Script، يمكنك تسجيل الدخول! ✅**


