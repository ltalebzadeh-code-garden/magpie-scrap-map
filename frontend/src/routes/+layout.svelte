<script lang="ts">
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
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
      sans-serif;
    background: #f7fafc;
    color: #2d3748;
  }

  :global(*) {
    box-sizing: border-box;
  }

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
    padding: 1rem 1rem 5rem 1rem; /* Extra bottom padding for nav clearance */
  }

  @media (max-width: 768px) {
    main {
      padding: 0.75rem 0.75rem 5rem 0.75rem;
    }
  }

  /* Desktop: wider max-width and centered content */
  @media (min-width: 769px) {
    main {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      padding: 1.5rem 1.5rem 1.5rem 1.5rem; /* No bottom clearance on desktop */
    }

    .app {
      /* On desktop, nav can be positioned differently if needed */
      /* For now keeping bottom nav consistent across devices */
    }
  }

  /* Prevent body scroll when content is smaller than viewport */
  :global(html) {
    overflow-y: scroll;
    overflow-x: hidden;
  }

  :global(body) {
    overflow-x: hidden;
  }
</style>
