<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import OfflineBanner from '$lib/components/OfflineBanner.svelte';
  import Nav from '$lib/components/Nav.svelte';
  import { isOnline } from '$lib/stores';
  import { runPendingPostsSync } from '$lib/offline/sync-runner';
  import { page } from '$app/stores';

  const isLanding = $derived($page.url.pathname === '/' || $page.url.pathname === '/landing');

  function triggerSyncIfOnline() {
    if (typeof navigator === 'undefined' || !navigator.onLine) {
      return;
    }

    void runPendingPostsSync();
  }

  function registerServiceWorker() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    if (!('serviceWorker' in navigator)) {
      return;
    }

    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // Keep registration failure non-fatal for app usage.
    });
  }

  onMount(() => {
    registerServiceWorker();

    const unsubscribe = isOnline.subscribe((online) => {
      if (online) {
        triggerSyncIfOnline();
      }
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerSyncIfOnline();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  });
</script>

{#if isLanding}
  <slot />
{:else}
  <div class="app">
    <Header />
    <OfflineBanner />
    <main>
      <slot />
    </main>
    <Nav />
  </div>
{/if}

<style>
  .app {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
    display: flex;
    flex-direction: column;
    direction: rtl;
  }

  main {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    padding: var(--space-3) var(--space-3) 5rem var(--space-3); /* Extra bottom padding for nav clearance */
  }

  @media (max-width: 768px) {
    main {
      padding: var(--space-3) var(--space-3) 5rem var(--space-3);
    }
  }

  /* Desktop: wider max-width and centered content */
  @media (min-width: 769px) {
    main {
      max-width: var(--content-max);
      margin: 0 auto;
      width: 100%;
      padding: var(--space-6); /* No bottom clearance on desktop */
    }
  }
</style>
