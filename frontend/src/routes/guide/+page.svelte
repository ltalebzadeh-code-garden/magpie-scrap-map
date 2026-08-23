<script>
  import { tabRoutes } from '$lib/navigation/tabs';

  const benefits = [
    {
      title: 'کاهش دورریز:',
      text: 'وسیله‌های قابل‌استفاده دوباره وارد چرخه استفاده می‌شوند.'
    },
    {
      title: 'صرفه‌جویی:',
      text: 'پیدا کردن منابع موردنیاز می‌تواند ساده‌تر و کم‌هزینه‌تر باشد.'
    },
    {
      title: 'همیاری محلی:',
      text: 'چیزی که برای شما اضافه است، ممکن است برای فردی در همان نزدیکی مفید باشد.'
    }
  ];

  const registerSteps = [
    {
      title: 'ثبت کنید:',
      text: 'عنوان، عکس، دسته‌بندی و توضیح کوتاهی از مورد خود وارد کنید.'
    },
    {
      title: 'مکان را مشخص کنید:',
      text: 'موقعیت تقریبی و شرایط تحویل را روی نقشه تعیین کنید.'
    },
    {
      title: 'هماهنگ کنید:',
      text: 'پس از پیدا شدن دریافت‌کننده، زمان و روش تحویل را با او هماهنگ کنید.'
    }
  ];

  const findSteps = [
    'نقشه را باز کنید و موارد نزدیک را ببینید.',
    'با جست‌وجو یا دسته‌بندی، مورد مناسب را پیدا کنید.',
    'جزئیات و وضعیت مورد را بررسی کنید.',
    'با صاحب مورد برای تحویل هماهنگ شوید.'
  ];

  const registerExamples = [
    'مصالح و پایه‌ها (چوب و الوار، آجر، کاشی، سیمان)',
    'فلزات، لوله‌کشی و اتصالات (آهن، ضایعات فلزی، لوله و شیرآلات)',
    'ابزارآلات، تجهیزات برقی و فنی (دستی، برقی، کابل، قطعات)',
    'مخازن، سوخت و سایر ملزومات (بشکه، گالن، هیزم، پالت)'
  ];

  const finalTips = [
    'عکس واقعی و واضح بگذارید.',
    'وضعیت، تعداد و ابعاد را شفاف بنویسید.',
    'پس از تحویل، وضعیت مورد را به «واگذار شد» تغییر دهید.',
    'اطلاعات تماس و جزئیات دقیق تحویل را فقط در حد نیاز به اشتراک بگذارید.'
  ];
</script>

<div class="page" dir="rtl">
  <div class="guide-card">
    <header class="guide-header">
      <h1>راهنمای مگ‌پای</h1>
      <p class="intro">
        مگ‌پای کمک می‌کند وسایل، ابزار و مصالحی که دیگر به آن‌ها نیاز ندارید، به‌جای دور ریخته شدن
        در نزدیکی شما به دست کسی برسند که می‌تواند از آن‌ها استفاده کند.
      </p>
    </header>

    <!-- بخش ۱: چرا مگ‌پای -->
    <section class="guide-section">
      <h2 class="section-title">چرا مگ‌پای؟</h2>
      <div class="benefit-grid">
        {#each benefits as benefit}
          <div class="benefit-item">
            <p><strong>{benefit.title}</strong> {benefit.text}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- بخش ۲: چگونه ثبت کنیم -->
    <section class="guide-section">
      <h2 class="section-title">چگونه یک مورد ثبت کنم؟</h2>
      <ol class="step-list">
        {#each registerSteps as step}
          <li><strong>{step.title}</strong> {step.text}</li>
        {/each}
      </ol>
    </section>

    <!-- بخش ۳: چگونه پیدا کنیم -->
    <section class="guide-section">
      <h2 class="section-title">چگونه موردی پیدا کنم؟</h2>
      <ul class="plain-list">
        {#each findSteps as step}
          <li>{step}</li>
        {/each}
      </ul>
    </section>

    <!-- بخش ۴: موارد قابل ثبت -->
    <section class="guide-section">
      <h2 class="section-title">چه چیزهایی می‌توان ثبت کرد؟</h2>
      <ul class="chip-list">
        {#each registerExamples as example}
          <li class="chip">{example}</li>
        {/each}
      </ul>
    </section>

    <!-- بخش ۵: نکات تکمیلی -->
    <section class="guide-section guide-section--tips">
      <h3 class="section-title">نکات ثبت بهتر</h3>
      <ul class="plain-list">
        {#each finalTips as tip}
          <li>{tip}</li>
        {/each}
      </ul>
    </section>

    <footer class="guide-footer">
      <a class="cta-button" href={tabRoutes.add}>ثبت مورد جدید</a>
    </footer>
  </div>
</div>

<style>
  .page {
    padding: 1rem 0;
    max-width: 768px;
    margin: 0 auto;
  }

  .guide-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg, var(--radius-md));
    box-shadow: var(--shadow-sm);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .guide-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--space-4);
  }

  h1 {
    margin: 0;
    color: var(--color-text-strong);
    font-size: var(--text-xl, 1.5rem);
    font-weight: 700;
  }

  .intro {
    margin: 0;
    color: var(--color-text);
    opacity: 0.9;
    line-height: var(--line-copy, 1.6);
    font-size: var(--text-md, 1rem);
  }

  /* تفکیک واضح و پررنگ سکشن‌ها */
  .guide-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }

  .guide-section--tips {
    background: rgba(49, 130, 206, 0.04);
    border-color: rgba(49, 130, 206, 0.2);
  }

  .section-title {
    margin: 0;
    color: var(--color-text-strong);
    padding-inline-start: var(--space-2);
    border-inline-start: 3px solid var(--color-primary);
    line-height: 1.2;
  }

  h2.section-title {
    font-size: var(--text-md, 1.1rem);
    font-weight: 700;
  }

  h3.section-title {
    font-size: var(--text-sm, 0.95rem);
    font-weight: 600;
  }

  .benefit-grid {
    display: grid;
    gap: var(--space-3);
  }

  .benefit-item {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
  }

  .benefit-item p {
    margin: 0;
    color: var(--color-text);
    line-height: var(--line-copy, 1.5);
  }

  .step-list {
    margin: 0;
    padding-inline-start: 1.4rem;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    color: var(--color-text);
    line-height: var(--line-copy, 1.5);
  }

  .plain-list {
    list-style: disc;
    margin: 0;
    padding-inline-start: 1.4rem;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    color: var(--color-text);
    line-height: var(--line-copy, 1.5);
  }

  .chip-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .chip {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 999px;
    padding: 0.35rem 0.85rem;
    font-size: var(--text-sm, 0.875rem);
    font-weight: 500;
    color: var(--color-text-strong);
  }

  .notice-box {
    border: 1px solid #fbd38d;
    background: #fffaf0;
    border-radius: var(--radius-md);
    padding: var(--space-3);
    margin-top: var(--space-1);
  }

  .notice-box p {
    margin: 0;
    color: #7b341e;
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--line-copy, 1.5);
  }

  .guide-footer {
    display: flex;
    justify-content: stretch;
    padding-top: var(--space-2);
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    font-weight: 600;
    font-size: var(--text-md, 1rem);
    text-decoration: none;
    transition: background 0.15s ease-in-out;
  }

  .cta-button:hover {
    filter: brightness(0.9);
  }

  .cta-button:active {
    filter: brightness(0.8);
  }

  @media (min-width: 480px) {
    .benefit-grid {
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }
  }

  @media (min-width: 769px) {
    .guide-card {
      padding: var(--space-8);
    }

    .cta-button {
      width: auto;
      padding: var(--space-3) var(--space-8);
    }
  }
</style>
