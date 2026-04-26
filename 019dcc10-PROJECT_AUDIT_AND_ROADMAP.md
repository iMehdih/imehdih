# سند جامع وضعیت پروژه و نقشه راه — پلتفرم مهدی حاتم‌پور

> **مخاطب اصلی:** Claude Code (یا توسعه‌دهنده) — این سند context کامل پروژه را در اختیار قرار می‌دهد تا بدون نیاز به بازخوانی تاریخچه چت بتواند کار را ادامه دهد.
>
> **زبان:** فارسی برای توضیحات + انگلیسی برای اصطلاحات فنی و نام فایل‌ها.

---

## بخش ۱ — معرفی و context پروژه

### ۱.۱ — هدف کسب‌وکار

پلتفرم شخصی **مهدی حاتم‌پور** با موقعیت‌یابی «**مدیر آنلاین کسب‌وکار شما** / مدیر حضور دیجیتال». این یک گپ شناسایی‌شده در بازار ایرانی است.

پلتفرم چند نقش را در یک سیستم یکپارچه ترکیب می‌کند:
- فروشگاه محصولات دیجیتال (قالب وردپرس، افزونه، فایل، دوره)
- ارائه‌دهنده خدمات (پروژه‌های پروژه‌ای + سرویس‌های مستمر ماهانه)
- ارائه‌دهنده زیرساخت (هاست + دامنه از طریق رجیسترارهای ایرانی)
- پلتفرم آموزشی (دوره‌های ویدیویی)
- اشتراک Pro (بسته premium)
- بستر مدیریت کارمندان و گردش کار داخلی

### ۱.۲ — Stack فنی

| لایه | تکنولوژی |
|------|----------|
| Framework | Next.js 15.5.15 با App Router |
| زبان | TypeScript |
| Database | MongoDB با Mongoose |
| Auth | OTP موبایل + JWT با کتابخانه `jose` (سازگار با Edge Runtime) |
| پرداخت | زرین‌پال (sandbox فعلاً) |
| SMS | کاوه‌نگار |
| Hosting Provider | لیارا (هدف deploy) |
| Object Storage | لیارا S3-compatible |
| Domain APIs | فراسو (.ir) + ایران‌سرور (بین‌المللی) |
| فونت | Vazirmatn (Google Fonts) |
| RTL/جهت | راست‌چین کامل |

### ۱.۳ — تصمیمات معماری مهم (نباید تغییر کند)

این تصمیمات بعد از فاز system design قطعی شدند:

**۱. ساختار محصول** — ۹ نوع:
- `theme` — قالب وردپرس
- `plugin` — افزونه وردپرس
- `course` — دوره آموزشی ویدیویی
- `file` — فایل دیجیتال
- `service_project` — خدمت پروژه‌ای (تک‌بار)
- `service_recurring` — سرویس مستمر ماهانه
- `hosting` — هاست
- `domain` — دامنه
- `subscription_pro` — اشتراک Pro

**۲. Process Engine برای خدمات:**
- Template-based و بدون کد
- بعد از پرداخت سفارش، اتوماتیک پروژه + تسک ساخته می‌شود
- تسک‌های blocking (تسک بعدی قفل تا تکمیل قبلی)
- تسک‌های recurring (هفتگی/ماهیانه برای service_recurring)
- فیلدهای پویا per task (text/number/image/url/select/...)
- گزارش اتوماتیک از فیلدهای `usedInReport: true`

**۳. مدل کارمندان:**
- ساختار pull نه push: کارمندان از لیست پروژه‌های موجود انتخاب می‌کنند (claim) — اول کسی که می‌گیرد.
- حقوق ثابت ماهانه + سهم تسک (commission percent)
- Wallet داخلی با حداقل برداشت ۵ میلیون تومان
- رتبه‌بندی performance + leaderboard

**۴. سیستم تیکت:**
- ۳ مرحله: انتخاب دپارتمان → انتخاب محصول/سفارش (در صورت لزوم) → نوشتن متن
- ۹ دپارتمان: 5 پشتیبانی (theme_plugin, course, hosting_domain, service, subscription) + 4 عمومی (finance, service_support, presale, management)
- چک پشتیبانی فعال (support window) برای دپارتمان‌های فنی
- ۱۰ وضعیت تیکت
- assign اول‌گیر
- تیکت بسته قابل بازگشایی نیست — تیکت جدید لازم
- دامنه فقط نمایش (از Domain model)، در تیکت قابل ویرایش نیست
- تنها امکان تغییر دامنه: حداکثر ۳ بار از طریق پنل اختصاصی

**۵. مشتری حقیقی/حقوقی:**
- فقط در فاکتور تأثیر دارد
- در سایر بخش‌ها یکسان عمل می‌کند

**۶. زیرساخت:**
- هاست: هشدار از ۷ روز قبل، تعلیق پس از انقضا، حذف ۷ روز پس از تعلیق
- دامنه: همان چرخه با تفاوت در provider API
- Cron job روزانه ساعت ۸ صبح برای چک expirations

**۷. Object Storage جداگانه:**
- bucket ویدیوهای دوره (محدود به اشتراک‌داران)
- bucket فایل‌های محصول
- bucket ضمائم تیکت
- bucket تصاویر عمومی

**۸. Theme system:**
- ۳ حالت: light / dark / system
- پیش‌فرض dark
- رنگ تأکید: gold #C8A96E
- پس‌زمینه dark: #06060A
- فونت: Vazirmatn
- جهت: RTL

### ۱.۴ — ساختار فعلی پروژه

```
hatampour-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/auth/login/         # ورود با OTP
│   │   ├── (public)/                  # صفحات عمومی
│   │   │   ├── page.tsx               # صفحه اصلی
│   │   │   ├── themes/, plugins/, courses/, files/, services/  # آرشیوها
│   │   │   ├── products/[slug]/       # صفحه محصول
│   │   │   ├── cart/                  # سبد خرید
│   │   │   └── blog/
│   │   ├── dashboard/                 # پنل مشتری
│   │   ├── admin/                     # پنل ادمین
│   │   ├── staff/                     # پنل کارمند
│   │   ├── api/                       # 60+ endpoint
│   │   ├── layout.tsx                 # Root layout با ThemeProvider
│   │   └── globals.css                # 720 خط CSS
│   ├── components/
│   │   ├── ui/                        # ThemeProvider, ThemeSwitcher, NotificationBell, AddToCartButton
│   │   ├── layout/                    # SiteHeader, SiteFooter
│   │   ├── dashboard/                 # Sidebar, Topbar, ProfileForm, TicketChat, TicketNewForm
│   │   ├── admin/                     # AdminSidebar, AdminTopbar, TemplateBuilder, AdminTicketActions, AdminHostingActions
│   │   └── staff/                     # StaffSidebar, StaffTopbar, StaffTaskManager, ClaimProjectButton
│   ├── lib/
│   │   ├── auth/                      # jwt, otp, middleware
│   │   ├── db/mongoose.ts
│   │   ├── payment/zarinpal.ts
│   │   ├── sms/kavenegar.ts
│   │   ├── infrastructure/            # farasoo, iransrv, index
│   │   └── utils/                     # notify, processEngine
│   ├── models/                        # 15 model
│   └── middleware.ts
├── scripts/                           # seed.ts, seed-append.ts, create-staff.ts
├── public/
└── package.json
```

تعداد فایل: **144 فایل سورس** (78 .tsx + 66 .ts)

---

## بخش ۲ — وضعیت فعلی: چه ساخته شده

### ✅ بخش‌های کارکرد کامل

| بخش | وضعیت | ملاحظات |
|------|--------|---------|
| Auth (OTP + JWT/jose) | ✅ کامل | OTP موبایل، JWT با jose، session 7 روزه |
| Models (15 عدد) | ✅ کامل | User, Product, Order, Ticket, Project, ServiceTemplate, Notification, Coupon, CouponUse, Domain, Hosting, DomainRecord, Expense, WalletTransaction, AuditLog |
| API Routes (60+) | ✅ پیاده‌شده | همه CRUD های پایه پوشش داده شده |
| سیستم تیکت | ✅ کامل | فرم ۳ مرحله‌ای، assign، sidebar تاریخچه، ۱۰ وضعیت |
| Process Engine | ✅ کامل | TemplateBuilder بصری، blocking/recurring tasks |
| پنل کارمند پایه | ✅ پیاده‌شده | داشبورد، available projects، task manager |
| سیستم مالی | ✅ پیاده‌شده | finance dashboard, expenses, wallet |
| اعلان‌ها | ✅ پیاده‌شده | داخلی + broadcast + SMS toggle |
| زیرساخت هاست/دامنه | ✅ پیاده‌شده | provision flow، cron expiration |
| Theme system | ✅ پیاده‌شده | ولی باگ‌دار — بخش ۳ |

### ⚠️ بخش‌های Placeholder (فقط "در حال توسعه")

این صفحات فقط یک متن "در حال توسعه..." دارند:

**Admin:**
- `/admin/settings/page.tsx` — ❌ کاملاً خالی، حیاتی
- `/admin/staff/page.tsx` — ❌ مدیریت کارمندان وجود ندارد
- `/admin/coupons/page.tsx` — ❌
- `/admin/blog/page.tsx` — ❌
- `/admin/audit/page.tsx` — ❌
- `/admin/domains/page.tsx` — ❌
- `/admin/invoices/page.tsx` — ❌
- `/admin/projects/page.tsx` — ❌

**Customer:**
- `/dashboard/courses/page.tsx` — ❌
- `/dashboard/downloads/page.tsx` — ❌
- `/dashboard/subscription/page.tsx` — ❌
- `/dashboard/invoices/page.tsx` — ❌

**Staff (در Sidebar اشاره شده ولی صفحه ندارد):**
- `/staff/tickets` — ❌
- `/staff/customers` — ❌
- `/staff/blog` — ❌
- `/staff/leaderboard` — ❌
- `/staff/performance` — ❌
- `/staff/notifications` — ❌

### ❌ بخش‌های کاملاً غایب

این‌ها در پروژه اصلاً وجود ندارند — Claude Code باید بسازدشان:

1. **Categories/Taxonomies model** — هیچ ساختاری برای دسته‌بندی محصولات، تگ‌ها، یا taxonomy‌های وبلاگ وجود ندارد. صفحات آرشیو فعلاً hardcoded اسامی دسته‌ها رو دارن (`shop`, `business`, ...).

2. **Blog/Article model** — وبلاگ کاملاً غایب است. مدل، API، صفحه عمومی، صفحه ادمین — هیچ‌کدام وجود ندارد.

3. **Settings model + page** — هیچ سیستم تنظیمات global وجود ندارد. تنظیمات SMTP, SMS sender, invoice header, ... فقط در `.env.local` هستند.

4. **Roles & Permissions granular** — فقط ۳ role hardcoded است (customer/staff/admin). هیچ امکان تعریف role سفارشی، permission per resource نیست.

5. **Add User flow برای ادمین** — ادمین نمی‌تواند از پنل، کاربر/کارمند/ادمین جدید اضافه کند. کارمند فقط با اجرای `npx tsx scripts/create-staff.ts` ساخته می‌شود.

6. **File Upload واقعی** — همه جا فقط URL متنی پذیرفته می‌شود. هیچ component آپلود به Object Storage لیارا پیاده نشده.

7. **Order Detail page** — مشتری در `/dashboard/orders` لیست را می‌بیند ولی صفحه `/dashboard/orders/[id]` برای جزئیات + گزارش پروژه غایب است.

8. **Invoice generation** — مدل وجود ندارد، PDF generation غایب است، فقط placeholder صفحه.

9. **Reviews/Ratings** — `Product` model فیلد `rating` و `reviewCount` دارد ولی هیچ مدل review، API، یا UI برای نوشتن نظر وجود ندارد.

10. **Course player** — برای دوره ویدیویی player، tracking پیشرفت، quiz غایب است.

11. **Search system** — هیچ search global، autocomplete، یا حتی full-text search روی محصولات نیست.

12. **Admin: Manage Customers Detail** — `/admin/customers/[id]/page.tsx` که جزئیات کامل + سفارشات + تیکت‌ها + edit رو نشون بده غایب است.

13. **SEO Infrastructure** — `seoTitle`, `seoDescription` در Product model هست ولی در صفحات استفاده نشده. sitemap.xml، robots.txt، structured data (JSON-LD) غایب است.

14. **Public Service Detail page** — `/services/[slug]` و `/special-service` که در موکاپ بود.

15. **Email system** — `nodemailer` در dependencies است ولی `lib/email/` وجود ندارد.

16. **API Documentation/Swagger** — برای پروژه واقعی لازم است.

17. **Tests** — هیچ تست (unit, integration, e2e) وجود ندارد.

18. **Error Boundaries + Loading states** — صفحات `error.tsx`, `loading.tsx`, `not-found.tsx` غایب هستند.

---

## بخش ۳ — مشکلات شناسایی‌شده در audit

### 🔴 بحرانی — مسائل امنیتی

**B-1: نبود Rate Limiting روی OTP**
- `src/app/api/auth/send-otp/route.ts` — هر کسی می‌تواند بی‌نهایت بار OTP درخواست کند.
- خطر: حمله SMS bombing → هزینه مالی + DDoS برای کاوه‌نگار.
- **راه حل:** رد limit به ازای IP و mobile (مثلاً ۳ بار در ۱۵ دقیقه). استفاده از Redis یا حداقل MongoDB با TTL index.

**B-2: OTP در DB به‌صورت plaintext ذخیره می‌شود**
- در `User.ts` فیلد `otp: String` — اگر DB لیک شود، OTPها قابل سواستفاده هستند.
- **راه حل:** هش کردن OTP با SHA-256 قبل از ذخیره. در verify هم همین هش رو مقایسه کن.

**B-3: signup بدون محدودیت — هر کسی می‌تواند admin شود اگر باگ بیاید**
- در `verify-otp/route.ts` خط `if (!user.role) user.role = 'customer'` فقط در صورت نبودن role کار می‌کند، ولی در `send-otp` می‌بینیم: `$setOnInsert: { role: 'customer', ... }` — این درست است.
- **ولی:** دستور `await User.findOneAndUpdate` با `upsert: true` می‌تواند باعث شود کسی با موبایل ادمین دیگری OTP بگیرد و در صورت leak شدن OTP وارد شود.
- **راه حل:** قبل از send-otp، چک کن user existing است یا نه. اگر existing است، فقط برای same role اجازه بده.

**B-4: JWT secret پیش‌فرض ضعیف**
- در `.env.local` فعلاً JWT_SECRET هست ولی در production باید بسیار قوی‌تر و rotate شود.
- **راه حل:** مستندسازی الزامات + script تولید secret + JWT versioning برای rotate.

**B-5: SQL/NoSQL injection در search**
- در `/api/admin/customers` (و سایر جاها): `filter.firstName = { $regex: search, $options: 'i' }` — اگر search شامل `^.*$` یا regex خاص باشد، می‌تواند query را خراب کند یا performance attack کند.
- **راه حل:** escape regex character ها قبل از استفاده. یا بهتر استفاده از text index.

**B-6: نبود CSRF protection**
- middleware فعلی فقط token check می‌کند، ولی روی `same-origin` چک نمی‌کنه.
- **راه حل:** Next.js 15 با Server Actions تا حدی محافظت می‌کند ولی برای API routes نیاز به CSRF token یا origin check است.

**B-7: عدم اعتبارسنجی permissions در سطح resource**
- مثلاً در `/api/projects/[id]/tasks/[taskId]` چک می‌شود `assignedTo === auth.userId` ولی در API های دیگر نه.
- **راه حل:** middleware یا helper برای resource-level permission check.

**B-8: Cookie های session بدون CSRF token**
- Cookie فقط `httpOnly` و `sameSite: 'lax'` — برای حملات CSRF کافی نیست.
- **راه حل:** `sameSite: 'strict'` برای admin/staff routes.

**B-9: Webhook endpoint های زرین‌پال بدون signature verification**
- در `verify/route.ts` فقط `Authority` و `Status` چک می‌شود.
- **راه حل:** زرین‌پال signature header دارد — باید اعتبارسنجی شود.

**B-10: نبود audit log برای عملیات حساس**
- `AuditLog` model هست ولی فقط در broadcast استفاده می‌شود.
- **راه حل:** audit برای: تغییر role، حذف سفارش، تأیید برداشت، تغییر تنظیمات.

### 🔴 بحرانی — مسائل عملکرد و architecture

**A-1: Duplicate Schema Index warnings**
- در logs نشان داده شده: `Duplicate schema index on {"orderNumber":1}` و `{"slug":1}`.
- علت: هم `index: true` در field و هم `Schema.index({field:1})`.
- **راه حل:** یکی از این دو را حذف کن در همه models.

**A-2: نبود Connection Pooling tuning**
- `connectDB` فعلاً ساده است — برای production نیاز به maxPoolSize، socketTimeoutMS، و reconnect logic.

**A-3: استفاده از `await connectDB()` در هر request**
- در همه API routes تکرار می‌شود — باید singleton باشد.
- بررسی کن `lib/db/mongoose.ts` آیا واقعاً connection را cache می‌کند.

**A-4: نبود pagination در همه جا**
- `/api/admin/customers` pagination دارد ولی `/api/admin/wallet/route.ts` همه staff رو می‌گیره. در scale نمی‌چرخد.

**A-5: N+1 queries**
- مثلاً در admin dashboard: `Promise.all` برای 8 query موازی + populate ها — برای dataset بزرگ کند می‌شود.
- **راه حل:** aggregation pipeline یا lookup ها.

**A-6: نبود caching strategy**
- صفحات public (همه‌شان) با هر request DB query می‌زنند — باید ISR/revalidate یا Redis cache باشد.

### 🟠 مهم — مسائل UI/UX

**U-1: Theme system شکسته**
- در گزارش کاربر: «تم‌های روشن و تیره و سیستم به درستی انجام نشده و در هم بر هم شده»
- در globals.css هم `[data-theme="dark"]` و هم `[data-theme="light"]` تعریف شده ولی:
  - بسیاری از rule های CSS از hex مستقیم استفاده می‌کنند نه `var(--bg)`.
  - مثلاً در `admin.css` مشخصاً `background: '#06060A'` و رنگ‌های hardcoded زیادی است.
  - وقتی light mode فعال می‌شود، این بخش‌ها dark می‌مانند → tear کردن UI.
- **راه حل:** audit کامل تمام `style={{ background: '#xxx' }}` های inline و جایگزینی با `var(--xxx)`.

**U-2: Responsive design نامناسب**
- در گزارش: «ریسپانسیو نیست».
- بسیاری از layouts با `gridTemplateColumns: '1fr 380px'` یا `'2fr 1fr'` بدون breakpoint کار می‌کنند.
- در موبایل sidebar admin مخفی می‌شود ولی toggle ندارد.
- **راه حل:** mobile menu، breakpoint ها در همه layouts، تبدیل sidebar به drawer در موبایل.

**U-3: عدم همخوانی Public Site با موکاپ‌های تأیید شده**
- در گزارش: «بخش پابلیک سایت اصلاً به هیچ عنوان مشابه اون موکاپ‌هایی که زدیم نیست»
- صفحه اصلی فعلی فقط hero ساده + 3 grid محصول دارد. موکاپ شامل بسیار بیشتر بود.
- **راه حل:** بازخوانی موکاپ‌های HTML و بازنویسی صفحات با همان ساختار.

**U-4: عدم یکپارچگی منوها**
- در گزارش: «منوهای حساب های کاربری یکپارچه نیست»
- Customer Sidebar (11 آیتم flat) vs Staff Sidebar (10 آیتم flat با رنگ آبی) vs Admin Sidebar (sectioned با ۷ گروه).
- باعث experience از هم پاشیده می‌شود.
- **راه حل:** یک Sidebar component مشترک با sectioning consistent + رنگ accent role-based.

**U-5: صفحه داخلی محصولات ناقص**
- در گزارش: «صفحه داخلی محصولات کلاً اون چیزی نیست که باید باشه»
- موکاپ شامل بود: video review، doctor recommendation، installment price، gallery، features، tabs (description/reviews/specs/FAQ).
- صفحه فعلی فقط: thumbnail + description + buy box.
- **راه حل:** بازنویسی کامل با ساختار موکاپ.

**U-6: NotificationBell در مسیرهای مختلف**
- در `DashboardTopbar-v2`، `AdminTopbar-v2`، `StaffTopbar` (ساخت نشده در zip) — هر کدوم متفاوت.
- بعضی href به `/dashboard/notifications` می‌رن حتی برای ادمین.

**U-7: نبود loading states**
- `loading.tsx` در هیچ route ای وجود ندارد.
- بعضی client components خودشون state دارن، بعضی ندارند.

**U-8: نبود animations مدرن**
- در گزارش: «انیمیشن های مدرن و پیشرفته برای بارگذاری... نداره»
- transitions ساده هست ولی page transition، micro-interaction، skeleton loader نیست.

**U-9: Image optimization غیرفعال**
- در next.config.js (نگاه نکردم ولی) احتمالاً `<img>` معمولی استفاده می‌شود.
- باید `next/image` استفاده شود.

**U-10: عدم وجود Empty States consistent**
- بعضی جاها `db-empty` class، بعضی جاها inline style، بعضی جاها هیچی.

### 🟡 متوسط — مسائل DX و Maintenance

**D-1: globals.css 720 خط — غیرقابل maintain**
- باید به ماژول‌های جداگانه تقسیم شود: `themes.css`, `dashboard.css`, `admin.css`, `public.css`, `forms.css`.

**D-2: عدم وجود design system component**
- `Button`, `Input`, `Card`, `Badge`, `Alert`, `Modal` به‌صورت reusable component نیستند.
- هر صفحه inline style خودش را دارد.

**D-3: Inline styles بسیار زیاد**
- در `StaffTaskManager.tsx` و سایرین، `style={{...}}` فراوان است.
- مزیت سرعت توسعه ولی هزینه maintainability.

**D-4: Component naming inconsistent**
- `DashboardTopbar` vs `Topbar` — نام در فایل و export متفاوت.
- `AdminSidebar` در `components/admin/` ولی `Sidebar` در `components/dashboard/`.

**D-5: Type coverage ضعیف**
- بسیاری از API responses به‌صورت `any` cast می‌شوند.
- باید Zod schemas به‌جای `as any` در client استفاده شوند.

**D-6: Error handling قابل بهبود**
- در client بعضی جاها `catch { setError('خطای اتصال') }` — اطلاعات کافی نیست.
- باید error boundary + sentry یا logging service باشد.

**D-7: Magic strings فراوان**
- وضعیت‌ها (`'pending_payment'`, `'in_progress'`, ...) به جای enum
- Department names به جای const
- باید همه به یک `lib/constants/` منتقل شوند.

**D-8: Duplicated label maps**
- `statusMap` در `dashboard/orders`, `admin/orders`, `dashboard/page.tsx` تکرار می‌شود.
- باید در `lib/labels.ts` متمرکز شود.

**D-9: لینک به admin برای staff topbar**
- `<a href="/staff/projects/available">+ گرفتن پروژه</a>` در StaffTopbar — fine, ولی استفاده از `<a>` به جای `Link` باعث reload می‌شود.

**D-10: Inconsistent data fetching**
- بعضی صفحات Server Component اند با direct DB call.
- بعضی Client Component با fetch.
- باید pattern یکپارچه باشد.

### 🟢 جزئی — Cleanup

**C-1: کامنت‌های فارسی‌-انگلیسی مخلوط** — برای پروژه واقعی، انگلیسی استاندارد است.

**C-2: TODO های پراکنده** — مثلاً `// در فاز بعد از Product.findById اطلاعات کامل می‌گیریم` در tickets/route.ts.

**C-3: فایل‌های backup قدیمی** — مثل `Topbar-v2.tsx` که اگر هنوز هستند باید پاک شوند.

**C-4: Dependencies غیراستفاده** — `bcryptjs`, `cookies-next` در package.json هستند ولی ممکن است استفاده نشوند.

---

## بخش ۴ — اولویت‌بندی — چی اول، چی بعد

این ترتیب پیشنهادی برای رسیدن به نسخه قابل launch است.

### 🚨 فاز P0 — بدون اینها launch ممنوع (1-2 هفته)

این‌ها deal-breaker هستند:

1. **رفع همه باگ‌های امنیتی B-1 تا B-10**
   - rate limiting روی OTP
   - hash کردن OTP در DB
   - regex escape در search
   - signature verify برای زرین‌پال webhook
   - audit log برای عملیات حساس

2. **ساخت بخش `Settings` در ادمین**
   - متمرکز کردن: SMTP, SMS sender, شماره پشتیبانی، شناسه‌های مالی، رنگ‌های برند
   - باید Settings model + API + UI

3. **ساخت بخش `Add User/Staff/Admin` در ادمین**
   - نمی‌شود تنها از طریق script کاربر اضافه کرد
   - admin باید بتواند: ساخت کارمند جدید، تغییر role، deactivate کاربر، reset password
   - شامل permission management

4. **رفع تم — Audit کامل تمام hardcoded colors**
   - همه `style={{ background: '#xxx' }}` باید با `var(--xxx)` جایگزین شوند
   - تست تمام صفحات در dark/light/system

5. **رفع responsive — حداقل mobile-friendly**
   - mobile menu (drawer)
   - breakpoints در همه grid layouts
   - تست در 375px width

6. **بازنویسی صفحات public طبق موکاپ‌های تأیید شده**
   - صفحه اصلی
   - صفحه داخلی محصول
   - آرشیوها
   - sevice detail

7. **یکپارچگی Sidebar/Topbar در ۳ پنل**
   - یک component مشترک با variant prop
   - permission-based menu

### 🟢 فاز P1 — قبل از launch تجاری (2-3 هفته)

8. **Categories model + Taxonomy management**
   - `Category` model با parent (nested)
   - admin UI برای مدیریت
   - assign category به Product

9. **Blog system کامل**
   - `Article` model با featured image, author, tags, category, SEO
   - admin CRUD UI
   - public listing + single + RSS feed

10. **پر کردن همه placeholder pages**
    - admin: invoices, projects, audit, coupons, blog, domains, staff
    - dashboard: courses, downloads, subscription, invoices, orders/[id]
    - staff: tickets, customers, leaderboard, performance, notifications, blog

11. **File Upload واقعی به لیارا S3**
    - generic uploader component
    - resize/optimize برای تصاویر
    - signed URL برای ویدیوها (course player)

12. **Order Detail Page + Project Report**
    - مشتری در `/dashboard/orders/[id]` بتواند جزئیات سفارش + گزارش پروژه را ببیند

13. **Reviews/Ratings system**
    - `Review` model
    - فرم نظر دهی برای خریداران
    - moderation در ادمین
    - نمایش در صفحه محصول

14. **Search system**
    - global search header
    - autocomplete با debounce
    - filter بر اساس type/category

15. **Course Player**
    - برای دارندگان دوره
    - پیشرفت‌سنجی
    - مارک کردن جلسات کامل

16. **Email System**
    - lib/email با nodemailer
    - template engine (mjml یا react-email)
    - integration با notify

17. **SEO Infrastructure**
    - متادیتای داینامیک per page
    - sitemap.xml endpoint
    - robots.txt
    - JSON-LD structured data

18. **Invoice PDF generation**
    - مدل Invoice
    - generation با @react-pdf/renderer یا pdfkit
    - حقیقی/حقوقی template

### 🔵 فاز P2 — بعد از launch، رشد (4+ هفته)

19. **Analytics Dashboard پیشرفته**
    - تعداد بازدید، conversion rate، funnel
    - Plausible یا Umami integration

20. **Performance Dashboard کارمند**
    - متریک‌ها: تسک کامل، rate response، rating
    - leaderboard ماهانه

21. **Public Transparency Dashboard**
    - تعداد پروژه فعال، رضایت مشتری، uptime — بدون داده محرمانه
    - برای personal branding

22. **Animations و micro-interactions**
    - framer-motion برای transitions
    - skeleton loaders
    - page transitions

23. **PWA + offline support**
    - manifest.json
    - service worker
    - install prompt

24. **Affiliate/Referral system**
    - کد معرف برای مشتریان
    - commission tracking

25. **Multi-language support**
    - فارسی default
    - انگلیسی برای مخاطبان بین‌المللی (اختیاری)

26. **API Public + Webhooks**
    - external integration
    - webhook برای events مهم

27. **Test Coverage**
    - unit tests برای lib/utils
    - integration برای API routes
    - e2e با Playwright برای critical flows

---

## بخش ۵ — Production Readiness Checklist

این‌ها قبل از deploy واقعی باید tick شوند:

### امنیت
- [ ] همه `.env` secret ها از Liara environment variables (نه commit شده)
- [ ] JWT_SECRET 256-bit random
- [ ] `secure: true` cookies در production
- [ ] `sameSite: 'strict'` برای admin/staff
- [ ] CSRF tokens یا origin check
- [ ] Rate limiting per IP/user
- [ ] OTP hashed
- [ ] Webhook signatures verified
- [ ] HTTPS only redirect
- [ ] Security headers (CSP, X-Frame-Options, ...)
- [ ] Error messages نباید stack trace expose کنند

### عملکرد
- [ ] Indexes drop کردن duplicates
- [ ] Database connection pooling
- [ ] ISR/revalidate برای صفحات public
- [ ] Image optimization (next/image)
- [ ] Lazy loading components
- [ ] Code splitting
- [ ] Bundle analysis < 500kb gzipped initial

### Infrastructure
- [ ] MongoDB Atlas یا Liara Mongo (replicaSet)
- [ ] Object Storage 4 buckets
- [ ] Cron job روزانه برای checkExpirations
- [ ] Log aggregation (Liara logs یا Sentry)
- [ ] Backup strategy روزانه
- [ ] Health check endpoint `/api/health`
- [ ] Status page

### Compliance / تجاری
- [ ] صفحه قوانین و مقررات
- [ ] صفحه حریم خصوصی
- [ ] درگاه پرداخت تأیید شده (نه sandbox)
- [ ] نماد اعتماد الکترونیکی (etrust)
- [ ] فاکتور رسمی صادر شود
- [ ] گزارش به سازمان مالیاتی (در صورت لزوم)

### UX
- [ ] همه صفحات `loading.tsx`, `error.tsx` دارند
- [ ] `not-found.tsx` سفارشی
- [ ] Empty states همه‌جا
- [ ] Toast notification برای actions موفق
- [ ] Keyboard accessibility
- [ ] Focus states قابل دیدن
- [ ] Color contrast WCAG AA
- [ ] alt text برای همه تصاویر
- [ ] Form validation messages واضح

---

## بخش ۶ — دستورالعمل برای Claude Code

### ۶.۱ — اولین کار: Audit دقیق

قبل از تغییر کد، Claude Code این کارها را انجام بدهد:

```
1. خواندن این سند کامل
2. اجرای `npm install` و `npm run build` — لیست همه errors و warnings
3. اجرای `npm run lint` — لیست همه linting issues
4. خواندن src/app/globals.css و شناسایی همه hex colors
5. grep کردن `style={{` در src/components — لیست همه inline styles با hardcoded color
6. خواندن همه placeholder pages (`grep -l "در حال توسعه" src/app`)
7. تأیید لیست مشکلات این سند با realityی پروژه
8. گزارش متفاوت‌ها — اگر چیزی این سند نگفته ولی Claude Code دید، اضافه کند
```

### ۶.۲ — قانون‌های توسعه

**حتماً رعایت کن:**

1. **هیچ تصمیم معماری بخش ۱.۳ تغییر نکند** — این تصمیمات با کاربر تأیید شده‌اند.
2. **کد فارسی RTL** — همه UI texts فارسی، direction=rtl، Vazirmatn font.
3. **رنگ‌ها از CSS variables** — هرگز hex مستقیم در tsx یا inline style.
4. **هر API route ابتدا auth check** — حتی اگر public است، structure بدهد.
5. **Type safety** — کمتر `as any` استفاده کن. اگر مجبوری، کامنت توضیح بنویس.
6. **Mongoose `.lean()` و serialization** — برای پاس به Client Component، حتماً `JSON.parse(JSON.stringify(...))` یا manual serialization.
7. **هر change در database model** — index ها رو هم آپدیت کن.
8. **تست در سه theme** — dark, light, system — قبل از completion.
9. **mobile-first** — هر page ابتدا برای 375px کار کند.
10. **Persian numbers در UI** — `.toLocaleString('fa')` برای اعداد قابل خواندن.

**حتماً اجتناب کن:**

- نصب dependency جدید بدون نیاز اساسی — اول از موجودی‌ها استفاده کن.
- بازنویسی فایل بدون خواندن کامل و درک context.
- ساخت component جدید اگر مشابه آن قبلاً وجود دارد — refactor کن.
- ترجمه نام variable ها به فارسی — انگلیسی نگه‌دار.
- استفاده از `any` در TypeScript بدون توجیه.

### ۶.۳ — ترتیب کار پیشنهادی

پیشنهاد می‌کنم Claude Code به این ترتیب کار کند:

```
هفته 1 — Stabilization
├── Day 1-2: P0 امنیت (B-1 تا B-10)
├── Day 3: Settings model + admin page
├── Day 4: Add User flow
├── Day 5: Theme audit + fix
├── Day 6-7: Responsive

هفته 2 — Public Site بازنویسی
├── Day 8-9: صفحه اصلی + آرشیوها
├── Day 10-11: صفحه داخلی محصول
├── Day 12: Service detail + special-service
├── Day 13: Sidebar یکپارچه
├── Day 14: تست end-to-end

هفته 3 — Categories + Blog
├── Day 15-16: Category model + admin
├── Day 17-19: Blog full system
├── Day 20-21: تمام placeholder pages

هفته 4 — File Upload + Search + Reviews
├── Day 22-23: File upload به Liara
├── Day 24-25: Search system
├── Day 26-27: Reviews
├── Day 28: Course player

هفته 5 — Polish + Production prep
├── Day 29-30: SEO + sitemap
├── Day 31: Email system
├── Day 32-33: Invoice PDF
├── Day 34: Animations + loading states
├── Day 35: Production deploy
```

### ۶.۴ — وقتی Claude Code گیر می‌کند

اگر در حین کار با ابهام مواجه شد:

1. ابتدا این سند را reference کند.
2. اگر تصمیم با ابهام است، اول از کاربر بپرسد.
3. **هیچ تصمیم business بدون تأیید کاربر گرفته نشود.**
4. اگر فاصله سند با reality کد زیاد بود، update سند را پیشنهاد بدهد.

---

## بخش ۷ — اطلاعات حساس (سری نگه دار)

این اطلاعات در `.env.local` ذخیره می‌شوند:

```
MONGODB_URI=
JWT_SECRET=
KAVENEGAR_API_KEY=
KAVENEGAR_SENDER=
ZARINPAL_MERCHANT_ID=
ZARINPAL_SANDBOX=true
LIARA_ACCESS_KEY=
LIARA_SECRET_KEY=
LIARA_BUCKET_NAME=
LIARA_ENDPOINT=
FARASOO_API_KEY=
FARASOO_API_URL=
IRANSRV_API_KEY=
IRANSRV_API_URL=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
OTP_EXPIRES_IN=120
NODE_ENV=production
```

---

## بخش ۸ — کاربران تستی (بعد از seed)

```
ادمین: 09000000000
کارمند: 09100000001
مشتری: می‌توان با هر شماره موبایل ساخت
```

---

## بخش ۹ — لینک‌های مفید

- موکاپ‌های HTML تأیید شده در history (در فاز اول پروژه)
- ServiceTemplate نمونه: «بهینه‌سازی سرعت سایت» (4 task)
- Process flow: order → payment → project creation → task assignment → completion → report → notification

---

**این سند نسخه 1.0 — تهیه شده در 27 آوریل 2026**

اگر Claude Code تغییرات بزرگی اعمال کرد یا تصمیم جدیدی گرفت، این سند را آپدیت کند و version آن را افزایش دهد.
