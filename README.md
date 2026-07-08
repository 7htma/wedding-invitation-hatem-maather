# دعوة زفاف رقمية - حاتم ومآثر

مشروع Static Website لدعوة زفاف رقمية باللغة العربية واتجاه RTL.

رابط الدعوة المتوقع بعد نشر GitHub Pages:
https://7htma.github.io/wedding-invitation-hatem-maather/

## الملفات

- `index.html` صفحة الدعوة الرئيسية
- `admin.html` صفحة إدارة تأكيد الحضور
- `css/style.css` تنسيقات الموقع مع مناطق THEME START / THEME END
- `js/config.js` ملف الإعدادات الرئيسي
- `js/script.js` وظائف الدعوة والعد التنازلي والتقويم و RSVP
- `js/admin.js` وظائف صفحة الإدارة والتصدير CSV
- `google-apps-script/Code.gs` كود Google Sheets
- `.github/workflows/pages.yml` نشر تلقائي على GitHub Pages

## تعديل البيانات

كل البيانات الأساسية موجودة في `js/config.js`:

```js
window.CONFIG = {
  groom: "حاتم",
  bride: "مآثر",
  displayDate: "٦ أغسطس ٢٠٢٦",
  weddingDate: "2026-08-06T19:30:00+04:00",
  venue: "قاعة المرايا",
  location: "سوق الخوض",
  hosts: ["ربيعة بنت خالد الحارثية", "سميرة بنت يحيى الشبيبية"],
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=قاعة+المرايا+سوق+الخوض",
  rsvpEndpoint: "",
  whatsappNumber: ""
};
```

## ربط Google Sheets

1. أنشئ Google Sheet جديد.
2. افتح Extensions ثم Apps Script.
3. الصق كود `google-apps-script/Code.gs`.
4. اختر Deploy ثم New deployment.
5. اختر Web app.
6. اجعل access: Anyone.
7. انسخ رابط Web App وضعه في `CONFIG.rsvpEndpoint` داخل `js/config.js`.

إذا لم يتم وضع رابط Google Apps Script، سيحفظ الموقع بيانات RSVP محليًا في المتصفح باستخدام localStorage.

## النشر

تم إضافة Workflow للنشر على GitHub Pages. إذا لم يعمل الرابط مباشرة، افتح إعدادات المستودع ثم Pages واختر GitHub Actions كمصدر للنشر.
