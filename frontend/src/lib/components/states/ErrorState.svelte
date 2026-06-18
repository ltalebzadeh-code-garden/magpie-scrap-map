<script lang="ts">
  import { Button } from '$lib/components/ui';

  type ErrorStateProps = {
    message: string;
    onRetry?: () => void;
  };

  let { message, onRetry }: ErrorStateProps = $props();
</script>

<div class="error-state" role="alert" aria-live="assertive">
  <p>{message}</p>

  {#if onRetry}
    <Button type="button" variant="ghost" size="small" on:click={onRetry}>Retry</Button>
  {/if}
</div>

<style>
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem;
    color: #742a2a;
    background: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 0.5rem;
    text-align: center;
  }

  p {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
  }
</style>
