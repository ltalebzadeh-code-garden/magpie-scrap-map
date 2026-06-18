<script lang="ts">
  export let padding: 'none' | 'small' | 'medium' | 'large' = 'medium';
  export let hover: boolean = false;
  export let clickable: boolean = false;
</script>

<div
  class="card"
  class:padding-none={padding === 'none'}
  class:padding-small={padding === 'small'}
  class:padding-medium={padding === 'medium'}
  class:padding-large={padding === 'large'}
  class:hover={hover}
  class:clickable={clickable}
  on:click
  role={clickable ? 'button' : undefined}
  tabindex={clickable ? 0 : undefined}
  on:keydown={(e) => clickable && (e.key === 'Enter' || e.key === ' ') && e.currentTarget.click()}
>
  <slot />
</div>

<style>
  .card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.15s ease-in-out;
  }

  /* Padding variants */
  .padding-none {
    padding: 0;
  }

  .padding-small {
    padding: 0.75rem;
  }

  .padding-medium {
    padding: 1rem;
  }

  .padding-large {
    padding: 1.5rem;
  }

  /* Hover effect */
  .hover:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }

  /* Clickable state */
  .clickable {
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .clickable:active {
    transform: scale(0.98);
  }

  .clickable:focus-visible {
    outline: 2px solid #4299e1;
    outline-offset: 2px;
  }

  /* Mobile optimization */
  @media (max-width: 768px) {
    .padding-medium {
      padding: 0.875rem;
    }

    .padding-large {
      padding: 1.25rem;
    }
  }
</style>
