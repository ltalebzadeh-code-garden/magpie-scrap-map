<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type ButtonVariant = 'primary' | 'secondary' | 'ghost';
  type ButtonSize = 'small' | 'medium' | 'large';

  type ButtonProps = HTMLButtonAttributes & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    children?: Snippet;
  };

  let {
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    children,
    ...restProps
  }: ButtonProps = $props();
</script>

<button
  class="btn"
  class:primary={variant === 'primary'}
  class:secondary={variant === 'secondary'}
  class:ghost={variant === 'ghost'}
  class:small={size === 'small'}
  class:medium={size === 'medium'}
  class:large={size === 'large'}
  class:full-width={fullWidth}
  {...restProps}
  on:click
>
  {@render children?.()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 600;
    border-radius: 0.375rem;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    font-family: inherit;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Sizes */
  .small {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    min-height: 32px;
  }

  .medium {
    padding: 0.625rem 1.25rem;
    font-size: 0.9375rem;
    min-height: 40px;
  }

  .large {
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
    min-height: 48px;
  }

  /* Variants */
  .primary {
    background: #4299e1;
    color: white;
    border-color: #4299e1;
  }

  .primary:hover:not(:disabled) {
    background: #3182ce;
    border-color: #3182ce;
  }

  .primary:active:not(:disabled) {
    background: #2c5282;
    border-color: #2c5282;
    transform: scale(0.98);
  }

  .secondary {
    background: #2d3748;
    color: white;
    border-color: #2d3748;
  }

  .secondary:hover:not(:disabled) {
    background: #1a202c;
    border-color: #1a202c;
  }

  .secondary:active:not(:disabled) {
    background: #000000;
    border-color: #000000;
    transform: scale(0.98);
  }

  .ghost {
    background: transparent;
    color: #4299e1;
    border-color: #4299e1;
  }

  .ghost:hover:not(:disabled) {
    background: rgba(66, 153, 225, 0.1);
    color: #3182ce;
    border-color: #3182ce;
  }

  .ghost:active:not(:disabled) {
    background: rgba(66, 153, 225, 0.2);
    transform: scale(0.98);
  }

  .full-width {
    width: 100%;
  }

  /* Focus styles for accessibility */
  .btn:focus-visible {
    outline: 2px solid #4299e1;
    outline-offset: 2px;
  }
</style>
