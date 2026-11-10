<div dir="rtl" lang="ar">

<p><strong>ملاحظة:</strong> هذه الترجمة بمساعدة آلية. النسخة الإنجليزية هي المرجع المعتمد.</p>

</div>

‎اللغات: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **[العربية](README.ar.md)** · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

<div dir="rtl" lang="ar">

<h1><span dir="ltr">B and S</span></h1>

<p>الحلاقون والصالونات. احجز كرسيًا، واختر خدمة وشخصًا أو أول وقت متاح، وادفع عربونًا أو قيمة الزيارة كاملة.</p>

<p>المحلات التجريبية تقع حول <span dir="ltr">Powell</span> و<span dir="ltr">Columbus</span>. في وضع التجربة يبقى الدفتر والمدفوعات والاستوديو على هذا الجهاز.</p>

<h2>ما يمكنك فعله</h2>

<ul>
<li>اختر خدمة لها سعر ومدة وهوامش زمنية</li>
<li>اختر شخصًا أو أي كرسي متاح</li>
<li>خذ موعدًا مفتوحًا حقيقيًا لا يُحجز مرتين</li>
<li>ادفع عربونًا أو قيمة الزيارة كاملة، مع إكرامية جاهزة أو بمبلغ تحدده</li>
<li>ادفع بالبطاقة أو عبر <span dir="ltr">Venmo</span>. <span dir="ltr">Apple Pay</span> دفعة تجريبية موسومة، وتبقى متوقفة عندما تكون مفاتيح البطاقة المباشرة مفعّلة</li>
<li>افتح رابط الزيارة لإعادة الجدولة أو الإلغاء</li>
<li>لا يُرد مبلغ بطاقة مباشر إلا من رابط تلك الزيارة، أو من مالك سجّل دخوله، وداخل مهلة المحل فقط</li>
<li>افتح الاستوديو: تقويم اليوم والأسبوع، ساعات العاملين، الخدمات، الوقت المحجوز، الزبائن، وسياسات الإلغاء وعدم الحضور</li>
</ul>

<p>وضع التجربة هو الوضع الافتراضي عند غياب مفاتيح البطاقة. يعمل أيضًا عندما تكون <span dir="ltr"><code>VITE_DEMO_MODE=1</code></span> أو عند فتح الصفحة بـ <span dir="ltr"><code>?demo=1</code></span>. يدخل الزوار كضيف تجريبي. لا توجد شاشة لتسجيل الدخول. اضبط <span dir="ltr"><code>VITE_DEMO_MODE=0</code></span> وأضف المفاتيح أدناه لاستخدام دفع البطاقة المباشر وتسجيل دخول المالك.</p>

<p>تُفحص أرقام البطاقات في المتصفح ثم تُرمى. يحتفظ الدفتر برمز مميز وعلامة البطاقة وآخر أربعة أرقام فقط.</p>

<p>يُسعَّر خصم البطاقة المباشر على الخادم من الخدمة المنشورة، وسياسة العربون في المحل، وإكرامية لا تزيد على <span dir="ltr">$500</span>. أي مبلغ يرسله المتصفح ولا يطابق يُرفض. يحتاج الاسترداد إلى سجل الدفع الموقَّع إضافة إلى رابط الزيارة أو جلسة المالك، ولا يجوز أن يتجاوز ما دُفع.</p>

<h2>البيئة</h2>

<table>
<thead>
<tr><th>المتغير</th><th>المكان</th><th>الغرض</th></tr>
</thead>
<tbody>
<tr><td><span dir="ltr"><code>VITE_DEMO_MODE</code></span></td><td>عام</td><td><span dir="ltr"><code>1</code></span> يفرض وضع التجربة. <span dir="ltr"><code>0</code></span> يوقفه. إن لم يُضبط، يتبع المفاتيح.</td></tr>
<tr><td><span dir="ltr"><code>VITE_STRIPE_PUBLISHABLE_KEY</code></span></td><td>عام</td><td>حقل البطاقة. يُستخدم <span dir="ltr">Stripe</span> عند ضبط هذا المفتاح.</td></tr>
<tr><td><span dir="ltr"><code>STRIPE_SECRET_KEY</code></span></td><td>الخادم</td><td>ينشئ الخصومات ويردّها. لا يُكشف للمتصفح أبدًا.</td></tr>
<tr><td><span dir="ltr"><code>VITE_SQUARE_APPLICATION_ID</code></span></td><td>عام</td><td>معرّف تطبيق الدفع عبر الويب، ويُستخدم عندما لا يكون <span dir="ltr">Stripe</span> مضبوطًا.</td></tr>
<tr><td><span dir="ltr"><code>VITE_SQUARE_LOCATION_ID</code></span></td><td>عام</td><td>موقع ذلك التطبيق.</td></tr>
<tr><td><span dir="ltr"><code>SQUARE_ACCESS_TOKEN</code></span></td><td>الخادم</td><td>يخصم ويرد. لا يُكشف للمتصفح أبدًا.</td></tr>
<tr><td><span dir="ltr"><code>OWNER_EMAIL</code></span></td><td>الخادم</td><td>تسجيل الدخول إلى الاستوديو، فقط عندما يكون وضع التجربة متوقفًا.</td></tr>
<tr><td><span dir="ltr"><code>OWNER_PASSWORD</code></span></td><td>الخادم</td><td>كلمة مرور تسجيل الدخول إلى الاستوديو.</td></tr>
<tr><td><span dir="ltr"><code>OWNER_NAME</code></span></td><td>الخادم</td><td>الاسم الذي يظهر بعد تسجيل الدخول.</td></tr>
<tr><td><span dir="ltr"><code>OWNER_SESSION_SECRET</code></span></td><td>الخادم</td><td>اختياري. يوقّع جلسة المالك. إن غاب، تُستخدم كلمة مرور المالك.</td></tr>
<tr><td><span dir="ltr"><code>PAYMENT_TICKET_SECRET</code></span></td><td>الخادم</td><td>اختياري. يوقّع سجل الدفع المستخدم في الاسترداد. إن غاب، يُستخدم سرّ جهة المعالجة.</td></tr>
</tbody>
</table>

<p><span dir="ltr"><code>?demo=1</code></span> يشغّل وضع التجربة حتى عند وجود المفاتيح.</p>

<h2>التثبيت</h2>

<p>على <span dir="ltr">iPhone</span>: مشاركة، ثم إضافة إلى الشاشة الرئيسية. على <span dir="ltr">Android</span>: قائمة المتصفح، ثم تثبيت التطبيق.</p>

<p>للمترجمين: <a href="docs/TRANSLATIONS.md"><span dir="ltr">docs/TRANSLATIONS.md</span></a>.</p>

</div>
