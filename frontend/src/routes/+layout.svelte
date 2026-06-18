<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import OfflineBanner from '$lib/components/OfflineBanner.svelte';
  import Nav from '$lib/components/Nav.svelte';
</script>

<div class="app">
  <Header />
  <OfflineBanner />
  <main>
    <slot />
  </main>
  <Nav />
</div>

<style>
  .app {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
    display: flex;
    flex-direction: column;
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
