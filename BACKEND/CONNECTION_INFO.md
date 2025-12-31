# معلومات اتصال قاعدة البيانات

## معلومات الاتصال المتوفرة:

**Connection String:**
```
postgresql://postgres:Mm002435400m@db.nueufozblbymuvzlbywf.supabase.co:5432/postgres
```

**Supabase Project URL:**
```
https://nueufozblbymuvzlbywf.supabase.co
```

## خطوات الحصول على API Keys:

1. اذهب إلى: https://supabase.com/dashboard
2. اختر مشروعك
3. اذهب إلى: Settings > API
4. انسخ:
   - **Project URL** (موجود بالفعل)
   - **anon/public key** → ضعه في `SUPABASE_ANON_KEY`
   - **service_role key** → ضعه في `SUPABASE_SERVICE_ROLE_KEY` (⚠️ سري جداً!)

## ملاحظات مهمة:

- ⚠️ **لا تشارك service_role key** - إنه يعطي صلاحيات كاملة
- ✅ anon key آمن للاستخدام في Frontend
- 🔒 احفظ هذه المعلومات بشكل آمن

