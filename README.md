# 🛡️ Sudo Academy - Digital Forensics & Cyber Security Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Firebase](https://img.shields.io/badge/backend-Firebase-orange.svg)
![Security](https://img.shields.io/badge/Security-Authorized%20Access-green.svg)

**Sudo Academy** هي منصة تعليمية متخصصة في علوم التحقيق الجنائي الرقمي والأمن السيبراني، صُممت لتوفير محتوى تعليمي آمن ومنظم للطلاب المهتمين بمجال الـ Digital Forensics.

## 🚀 المميزات التقنية (Core Features)

* **Authentication & Privacy:** نظام تسجيل دخول آمن باستخدام **Google OAuth 2.0**. المحتوى التعليمي مخفي تماماً ولا يمكن الوصول إليه إلا بعد تسجيل الدخول.
* **Security Roles:** نظام صلاحيات متطور (Admin/User) للتحكم في من يمكنه رفع الكورسات وإدارة الطلاب.
* **Account Management:** صفحة مستقلة لكل طالب (Account Information) لتحديث بياناته الشخصية (الاسم، السن، رقم التواصل).
* **Course Management System (CMS):** لوحة تحكم GUI كاملة للأدمن لإضافة الكورسات، وتفعيل الوصول (Access Control) للطلاب في الكورسات المدفوعة.
* **Real-time Communication:** ميزة التواصل المباشر مع الطلاب عبر واتساب بضغطة زر واحدة من لوحة التحكم.
* **Device Security:** نظام حماية لمنع الدخول المتعدد وتأمين جلسات المستخدمين (Single Session Management).

## 🛠️ التقنيات المستخدمة (Tech Stack)

* **Frontend:** HTML5, CSS3 (Neon Cyberpunk UI), JavaScript (ES6+).
* **Backend as a Service (BaaS):** [Firebase](https://firebase.google.com/).
    * **Firestore:** لتخزين بيانات الكورسات والطلاب في قاعدة بيانات Real-time.
    * **Authentication:** لإدارة هويات المستخدمين.
    * **Security Rules:** لتأمين قاعدة البيانات ومنع الوصول غير المصرح به.
* **Animations:** [AOS Library](https://michalsnik.github.io/aos/) للتنقلات السلسة والأنيميشن الاحترافي.

## 📁 هيكل المشروع (Project Structure)

```text
├── index.html       # الصفحة الرئيسية (بوابة الطالب)
├── profile.html     # صفحة إدارة بيانات الحساب
├── admin.html       # لوحة تحكم الإدارة (خاصة بمروان)
├── style.css        # التصميم الرئيسي ونظام الإضاءة (Neon Glow)
├── app.js           # منطق التشغيل، التوجيه، والخصوصية
├── admin.js         # منطق لوحة التحكم وإدارة الطلاب
└── config.js        # إعدادات الربط مع Firebase