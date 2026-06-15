<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Nav from '$lib/components/Nav.svelte';
</script>

<div class="app">
  <Header />
  <Nav />
  <main>
    <slot />
  </main>
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
    display: flex;
    flex-direction: column;
  }

  main {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }
  }
</style>
