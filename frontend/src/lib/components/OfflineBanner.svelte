<script lang="ts">
  import { isOnline } from '$lib/stores';
</script>

{#if !$isOnline}
  <div class="offline-banner" role="status" aria-live="polite">
    <span class="dot" aria-hidden="true">●</span>
    <span class="message">آفلاین — تغییرات به‌صورت محلی ذخیره می‌شوند</span>
  </div>
{/if}

<style>
  .offline-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: #fffaf0;
    color: #7b341e;
    border-bottom: 1px solid #f6ad55;
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    /* Keep banner sticky so it's always visible on scroll */
    position: sticky;
    top: 0;
    z-index: 900;
  }

  .dot {
    color: #dd6b20;
    font-size: 0.625rem;
    line-height: 1;
  }

  .message {
    /* Avoid awkward wrapping on tiny screens */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (min-width: 480px) {
    .offline-banner {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
    }

    .message {
      white-space: normal;
    }
  }
</style>
