# راه‌اندازی محلی پروژه

## پیش‌نیازها
- Node.js 18+
- MongoDB (محلی یا Atlas)
- npm یا yarn

## مراحل راه‌اندازی

### ۱. نصب dependencies
```bash
npm install
```

### ۲. تنظیم متغیرهای محیطی
فایل `.env.local` را باز کنید و مقادیر را تنظیم کنید:
- `MONGODB_URI`: آدرس MongoDB
- `JWT_SECRET`: یک کلید امنیتی قوی (می‌توانید با `openssl rand -base64 32` بسازید)
- بقیه موارد را می‌توانید برای شروع خالی بگذارید

### ۳. اجرا در حالت development
```bash
npm run dev
```

سایت روی `http://localhost:3000` در دسترس است.

### ۴. تست سیستم Auth
- وارد `/auth/login` شوید
- شماره موبایل وارد کنید
- در dev mode، کد OTP مستقیم در response نمایش داده می‌شود
- بعد از login، صفحه تکمیل پروفایل باز می‌شود

## ساختار پروژه
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # احراز هویت
│   │   ├── users/         # کاربران
│   │   └── ...
│   ├── (public)/          # صفحات عمومی
│   ├── (auth)/            # صفحات ورود
│   ├── dashboard/         # پنل مشتری
│   ├── admin/             # پنل ادمین
│   └── staff/             # پنل کارمند
├── lib/
│   ├── db/                # اتصال MongoDB
│   ├── auth/              # JWT + OTP
│   ├── sms/               # کاوه‌نگار
│   └── utils/             # Notification
├── models/                # MongoDB Models
│   ├── User.ts
│   ├── Product.ts
│   ├── Order.ts
│   ├── Ticket.ts
│   ├── Project.ts
│   ├── ServiceTemplate.ts
│   ├── Notification.ts
│   └── AuditLog.ts
└── types/                 # TypeScript Types
```

## قدم بعدی
- [ ] پنل مشتری کامل
- [ ] سیستم سفارش
- [ ] Process Engine
- [ ] پنل ادمین
- [ ] پنل کارمند
- [ ] سیستم تیکت
- [ ] درگاه پرداخت (زرین‌پال)
- [ ] SMS templates
