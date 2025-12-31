# إعداد جداول الطلبات - Orders Setup

## 📋 خطوات الإعداد:

### 1️⃣ تشغيل Schema الجديد

في Supabase Dashboard → **SQL Editor**:

1. افتح ملف: `BACKEND/database/orders_schema.sql`
2. انسخ المحتوى كاملاً
3. الصقه في SQL Editor
4. اضغط **Run**

### 2️⃣ التحقق من الجداول

بعد التشغيل، تحقق من إنشاء الجداول التالية:

- ✅ `orders` - الطلبات
- ✅ `order_materials` - مواد الطلب
- ✅ `stock_movements` - سجل حركات المخزون

### 3️⃣ التحقق من Indexes

تأكد من إنشاء جميع الـ indexes لتحسين الأداء.

---

## 📊 الجداول المنشأة:

### orders
- id, generator_model, order_reference
- receiver_name, notes
- created_by, created_at, updated_at

### order_materials
- id, order_id, equipment_id
- quantity, unit, created_at

### stock_movements
- id, equipment_id, type (IN/OUT)
- quantity, related_order_id
- receiver_name, created_by, created_at

---

## ✅ بعد الإعداد:

1. ✅ الجداول جاهزة
2. ✅ RLS policies مفعلة
3. ✅ Indexes منشأة
4. ✅ جاهز للاستخدام

---

**شغّل `orders_schema.sql` في Supabase الآن!**

