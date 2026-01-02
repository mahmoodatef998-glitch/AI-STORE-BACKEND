# 🔧 حل مشكلة "type already exists"

## المشكلة:
عند تشغيل `schema.sql` في Supabase، قد تواجه خطأ:
```
ERROR: 42710: type "equipment_type" already exists
```

## الحل:

### الطريقة 1: استخدام الملف المحدث (موصى به)

استخدم ملف `schema_reset.sql` بدلاً من `schema.sql`:

1. في Supabase Dashboard → **SQL Editor**
2. افتح ملف `BACKEND/database/schema_reset.sql`
3. انسخ المحتوى كاملاً
4. الصقه في SQL Editor
5. اضغط **Run**

هذا الملف يتعامل مع الأنواع والجداول الموجودة مسبقاً.

---

### الطريقة 2: حذف الأنواع يدوياً (إذا فشلت الطريقة 1)

إذا كنت تريد البدء من جديد، شغّل هذا SQL أولاً:

```sql
-- حذف الجداول (إذا كانت موجودة)
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS equipment_consumption CASCADE;
DROP TABLE IF EXISTS equipments CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;

-- حذف الأنواع
DROP TYPE IF EXISTS equipment_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- حذف الدوال
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS decrement_equipment_quantity() CASCADE;
DROP FUNCTION IF EXISTS check_low_stock() CASCADE;
DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
```

ثم شغّل `schema.sql` أو `schema_reset.sql`.

---

### الطريقة 3: تشغيل الأجزاء المتبقية فقط

إذا كانت بعض الجداول موجودة بالفعل، شغّل فقط الأجزاء المتبقية من `schema.sql`.

---

## ✅ بعد التشغيل الناجح:

1. تحقق من الجداول في **Table Editor**
2. يجب أن ترى:
   - ✅ equipments
   - ✅ equipment_consumption
   - ✅ notifications
   - ✅ predictions
   - ✅ suppliers

3. تحقق من Triggers في **Database** → **Triggers**

---

## 📝 ملاحظات:

- `schema_reset.sql` آمن للتشغيل عدة مرات
- يستخدم `IF NOT EXISTS` و `DROP IF EXISTS`
- يتعامل مع الأنواع الموجودة مسبقاً

---

**استخدم `schema_reset.sql` للحل السريع! ✅**


