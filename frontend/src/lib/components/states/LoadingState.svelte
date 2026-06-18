<script lang="ts">
  type LoadingStateProps = {
    message?: string;
  };

  let { message = 'Loading…' }: LoadingStateProps = $props();
</script>

<div class="loading-state" role="status" aria-live="polite">
  <span class="spinner" aria-hidden="true"></span>
  <p>{message}</p>
</div>

<style>
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 0.875rem 1rem;
    color: #4a5568;
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
  }

  .spinner {
    width: 0.95rem;
    height: 0.95rem;
    border-radius: 50%;
    border: 2px solid #cbd5e0;
    border-top-color: #4299e1;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  p {
    margin: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
