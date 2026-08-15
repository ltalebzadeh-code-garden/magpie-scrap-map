<script lang="ts">
  import { onMount } from 'svelte';
  import { mapTabHref } from '$lib/navigation/tabs';

  type WaitlistState = 'idle' | 'success';

  const primaryCtaLabel = 'مشاهده نقشه و ثبت ابزار/مصالح';

  const features = [
    {
      id: 'quick-register',
      title: 'ثبت سریع',
      text: 'ابزار یا موادی که دیگر نیاز ندارید را روی نقشه علامت‌گذاری کنید تا رها نشود و دیگران از آن استفاده کنند.'
    },
    {
      id: 'cheap-resources',
      title: 'دسترسی بی‌واسطه به منابع',
      text: 'مواد و امکانات مورد نیاز خود را در اطرافتان کشف کنید؛ راهکاری برای دسترسی سریع و کاهش هزینه‌های اضافی.'
    },
    {
      id: 'social-impact',
      title: 'مسئولیت اجتماعی',
      text: 'با بازچرخانی منابع، به محیط‌زیست و تاب‌آوری شهر به خصوص در شرایط بحران کمک کنید.'
    }
  ];

  let contact = $state('');
  let waitlistState = $state<WaitlistState>('idle');
  let scrollY = $state(0);
  let sectionElements: HTMLElement[] = [];

  function registerReveal(node: HTMLElement) {
    sectionElements.push(node);

    return {
      destroy() {
        sectionElements = sectionElements.filter((element) => element !== node);
      }
    };
  }

  onMount(() => {
    if (typeof IntersectionObserver === 'undefined') {
      for (const element of sectionElements) {
        element.classList.add('is-visible');
      }

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    for (const element of sectionElements) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  });
</script>

<svelte:head>
  <title>مگ‌پای | بازچرخانی ابزار و مواد مازاد </title>
  <meta
    name="description"
    content="مگ‌پای پلتفرمی ساده برای ثبت و یافتن مصالح ساختمانی، ابزار و قطعات قابل‌استفاده روی نقشه تهران است."
  />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap"
  />
</svelte:head>

<svelte:window bind:scrollY />

<div class="landing" lang="fa" dir="rtl">
  <header class="topbar" class:is-scrolled={scrollY > 8}>
    <div class="shell">
      <span class="wordmark">مگ‌پای</span>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="shell hero-shell">
        <div class="hero-copy reveal" use:registerReveal>
          <h1>مواد مازاد را به چرخه بازگردانید.</h1>
          <p class="lead">
            پلتفرمی برای رساندن مواد مازاد و دورریختنی‌های غیرمعمول به کسانی که می‌توانند دوباره از آنها استفاده کنند؛ به ساده‌ترین و کم‌هزینه‌ترین شکل.
          </p>
          <div class="cta-row">
            <a class="btn btn-primary" href={mapTabHref}>{primaryCtaLabel}</a>
          </div>
        </div>

        <div class="hero-art reveal" use:registerReveal>
          <svg viewBox="0 0 520 360" role="img" aria-label="تصویر انتزاعی نقشه با نشانگرهای مکان">
            <defs>
              <linearGradient id="mapSurface" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#f0fdf9" />
                <stop offset="100%" stop-color="#dcfce7" />
              </linearGradient>
              <linearGradient id="pinFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10b981" />
                <stop offset="100%" stop-color="#0f766e" />
              </linearGradient>
            </defs>

            <rect x="8" y="8" width="504" height="344" rx="28" fill="url(#mapSurface)" />
            <g stroke="#a7f3d0" stroke-width="2" opacity="0.9">
              <path d="M8 96h504M8 184h504M8 268h504" />
              <path d="M132 8v344M264 8v344M392 8v344" />
            </g>
            <path
              d="M40 300c70-18 92-96 168-104s108 60 178 34 74-92 96-104"
              fill="none"
              stroke="#5eead4"
              stroke-width="10"
              stroke-linecap="round"
              opacity="0.75"
            />
            <rect x="60" y="120" width="86" height="58" rx="14" fill="#ffffff" opacity="0.85" />
            <rect x="300" y="212" width="120" height="70" rx="16" fill="#ffffff" opacity="0.85" />
            <circle cx="150" cy="255" r="34" fill="#bbf7d0" opacity="0.85" />

            <g fill="url(#pinFill)">
              <path d="M148 82c-19 0-34 15-34 33 0 24 34 55 34 55s34-31 34-55c0-18-15-33-34-33z" />
              <path d="M356 128c-15 0-27 12-27 26 0 19 27 44 27 44s27-25 27-44c0-14-12-26-27-26z" />
              <path d="M244 216c-13 0-23 10-23 22 0 16 23 37 23 37s23-21 23-37c0-12-10-22-23-22z" />
            </g>
            <g fill="#ecfdf5">
              <circle cx="148" cy="114" r="12" />
              <circle cx="356" cy="153" r="10" />
              <circle cx="244" cy="237" r="9" />
            </g>
          </svg>
        </div>
      </div>
    </section>

    <section class="section why">
      <div class="shell">
        <h2 class="section-title reveal" use:registerReveal>چرا مگ‌پای؟</h2>
        <div class="cards">
          {#each features as feature (feature.id)}
            <article class="card reveal" use:registerReveal>
              <span class="card-icon" aria-hidden="true">
                {#if feature.id === 'quick-register'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
                    <path
                      d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"
                      stroke-linejoin="round"
                    />
                    <path d="M12 7v6M9 10h6" stroke-linecap="round" />
                  </svg>
                {:else if feature.id === 'cheap-resources'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M20.5 20.5 16 16" stroke-linecap="round" />
                    <path d="M8.5 11h5M11 8.5v5" stroke-linecap="round" />
                  </svg>
                {:else}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
                    <path
                      d="M12 20.5S4.5 16 4.5 10.2A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.6c0 5.8-7.5 10.3-7.5 10.3z"
                      stroke-linejoin="round"
                    />
                    <path d="M3 4.5c3.4-.4 5.6.8 6.6 3.6" stroke-linecap="round" />
                  </svg>
                {/if}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          {/each}
        </div>
      </div>
    </section>

    <section class="section" id="waitlist">
      <div class="shell">
        <div class="mvp reveal" use:registerReveal>
          <h2>این یک نسخه اولیه است (MVP)</h2>
          <p>
            ما در حال تست ایده «مگ‌پای» در هستیم. در این نسخه، امکاناتی مثل حساب کاربری و
            ویرایش محدود است، چون تمرکز ما بر سنجش نیاز واقعی شماست. اگر این ابزار برای شما مفید
            است، با ثبت یک مورد آزمایشی به ما کمک کنید تا آن را کامل‌تر کنیم.
          </p>
        </div>
      </div>
    </section>

    <section class="section final-cta">
      <div class="shell">
        <div class="final-box reveal" use:registerReveal>
          <p>برای شروع، نزدیک‌ترین ابزار و مصالح را پیدا کنید یا موردی را ثبت کنید.</p>
          <a class="btn btn-primary" href={mapTabHref}>{primaryCtaLabel}</a>
        </div>
      </div>
    </section>
  </main>
</div>

<style>
  .landing {
    --ink: #0f172a;
    --ink-soft: #475569;
    --accent: #0d9488;
    --accent-strong: #0f766e;
    --accent-soft: #ecfdf5;
    --line: #e2e8f0;
    --radius: 20px;
    --shadow: 0 18px 40px -24px rgba(15, 23, 42, 0.35);

    font-family:
      'Vazirmatn',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Tahoma,
      sans-serif;
    color: var(--ink);
    background: #ffffff;
    min-height: 100vh;
    line-height: 1.85;
  }

  .shell {
    width: min(1120px, 100% - 2.5rem);
    margin: 0 auto;
  }

  .topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid transparent;
    transition:
      border-color 0.25s ease,
      box-shadow 0.25s ease;
  }

  .topbar.is-scrolled {
    border-bottom-color: var(--line);
    box-shadow: 0 10px 30px -26px rgba(15, 23, 42, 0.6);
  }

  .topbar .shell {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-height: 68px;
  }

  .wordmark {
    font-size: 1.45rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--accent-strong);
  }

  main {
    display: block;
  }

  .hero {
    background:
      radial-gradient(1100px 460px at 88% -10%, #d1fae5 0%, rgba(209, 250, 229, 0) 65%),
      linear-gradient(180deg, #f8fffc 0%, #f1f5f9 100%);
    padding: clamp(3rem, 7vw, 5.5rem) 0 clamp(3.5rem, 8vw, 6rem);
  }

  .hero-shell {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: clamp(2rem, 5vw, 3.5rem);
    align-items: center;
  }

  h1 {
    margin: 0 0 1.1rem;
    font-size: clamp(1.9rem, 4.4vw, 3rem);
    font-weight: 800;
    line-height: 1.45;
    letter-spacing: -0.01em;
  }

  .lead {
    margin: 0 0 2rem;
    max-width: 34rem;
    font-size: clamp(1rem, 1.7vw, 1.15rem);
    color: var(--ink-soft);
  }

  .cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.9rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.95rem 1.7rem;
    border-radius: 999px;
    border: 1px solid transparent;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2;
    text-decoration: none;
    cursor: pointer;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      background-color 0.18s ease,
      color 0.18s ease;
  }

  .btn:hover {
    transform: translateY(-2px);
  }

  .btn:focus-visible {
    outline: 3px solid rgba(13, 148, 136, 0.45);
    outline-offset: 3px;
  }

  .btn-primary {
    background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
    color: #ffffff;
    box-shadow: 0 16px 32px -18px rgba(13, 148, 136, 0.95);
  }

  .btn-primary:hover {
    box-shadow: 0 20px 38px -18px rgba(13, 148, 136, 1);
  }

  .btn-ghost {
    background: transparent;
    color: var(--accent-strong);
    border-color: rgba(13, 148, 136, 0.4);
  }

  .btn-ghost:hover {
    background: var(--accent-soft);
  }

  .btn-compact {
    padding: 0.85rem 1.4rem;
    font-size: 0.95rem;
  }

  .hero-art svg {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 26px;
    box-shadow: var(--shadow);
  }

  .section {
    padding: clamp(3rem, 7vw, 5rem) 0;
  }

  .section-title {
    margin: 0 0 2.2rem;
    font-size: clamp(1.5rem, 3vw, 2.1rem);
    font-weight: 800;
    text-align: center;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .card {
    background: #ffffff;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 1.9rem 1.6rem;
    box-shadow: var(--shadow);
    transition:
      transform 0.22s ease,
      box-shadow 0.22s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 26px 48px -26px rgba(15, 23, 42, 0.45);
  }

  .card-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: var(--accent-soft);
    color: var(--accent-strong);
    margin-bottom: 1.1rem;
  }

  .card-icon svg {
    width: 27px;
    height: 27px;
  }

  .card h3 {
    margin: 0 0 0.6rem;
    font-size: 1.2rem;
    font-weight: 700;
  }

  .card p {
    margin: 0;
    color: var(--ink-soft);
    font-size: 0.98rem;
  }

 .mvp {
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-radius: var(--radius);
    padding: clamp(1.6rem, 4vw, 2.6rem);
    box-shadow: 0 18px 40px -30px rgba(180, 83, 9, 0.7);
    /* برای مرکزگرایی و نظم بهتر */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.mvp h2 {
    margin: 0 0 1rem 0;
    font-size: clamp(1.3rem, 2.6vw, 1.8rem);
    font-weight: 800;
    color: #78350f;
}

.mvp p {
    margin: 0;
    color: #7c4a10;
    line-height: 1.6;
    text-align: justify;
    max-width: 56rem;
}

  .badge {
    display: inline-block;
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    background: #f59e0b;
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .waitlist {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.6rem;
  }

  .waitlist input {
    flex: 1 1 18rem;
    padding: 0.9rem 1.1rem;
    border-radius: 14px;
    border: 1px solid #fcd34d;
    background: #ffffff;
    font-family: inherit;
    font-size: 1rem;
    color: var(--ink);
  }

  .waitlist input::placeholder {
    color: #b48a4a;
  }

  .waitlist input:focus-visible {
    outline: 3px solid rgba(245, 158, 11, 0.35);
    outline-offset: 2px;
    border-color: #f59e0b;
  }

  .waitlist-success {
    margin: 1rem 0 0;
    font-weight: 700;
    color: #166534;
  }

  .final-cta .final-box {
    text-align: center;
    background: linear-gradient(160deg, #f0fdfa 0%, #ecfdf5 100%);
    border: 1px solid #ccfbf1;
    border-radius: 28px;
    padding: clamp(2.2rem, 6vw, 3.4rem) 1.5rem;
    box-shadow: var(--shadow);
  }

  .final-box p {
    margin: 0 0 1.6rem;
    font-size: clamp(1.05rem, 2.2vw, 1.4rem);
    font-weight: 700;
  }

  .reveal {
    opacity: 0;
    transform: translateY(26px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }

  .reveal:global(.is-visible) {
    opacity: 1;
    transform: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 900px) {
    .hero-shell {
      grid-template-columns: 1fr;
    }

    .cards {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .shell {
      width: min(1120px, 100% - 1.75rem);
    }

    .cta-row .btn {
      width: 100%;
    }

    .waitlist .btn {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal {
      opacity: 1;
      transform: none;
      transition: none;
    }

    .btn:hover,
    .card:hover {
      transform: none;
    }
  }
</style>
