<script lang="ts">
  import { page } from '$app/stores';
  import { isOnline } from '$lib/stores';
</script>

<header>
  <div class="container">
    <h1>Magpie</h1>
    <div class="status">
      {#if $isOnline}
        <span class="online">●</span>
      {:else}
        <span class="offline">●</span>
      {/if}
    </div>
  </div>
</header>

<style>
  header {
    background: #2d3748;
    color: white;
    padding: 1rem;
    border-bottom: 2px solid #4a5568;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .online {
    color: #48bb78;
  }

  .offline {
    color: #f56565;
  }
</style>
