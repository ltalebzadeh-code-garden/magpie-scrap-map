<script lang="ts">
  import { page } from '$app/stores';
  import { tabItems } from '$lib/navigation/tabs';

  const navItems = tabItems;
</script>

<nav>
  {#each navItems as item}
    <a
      href={item.path}
      class:active={$page.url.pathname === item.path}
      aria-current={$page.url.pathname === item.path ? 'page' : undefined}
    >
      {item.label}
    </a>
  {/each}
</nav>

<style>
  nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #1a202c;
    border-top: 1px solid #4a5568;
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    padding: 0;
    z-index: 1000;
    padding-bottom: env(safe-area-inset-bottom);
  }

  a {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.875rem 0.5rem;
    min-height: 56px;
    text-align: center;
    color: #a0aec0;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
    border-top: 3px solid transparent;
    transition: all 0.15s ease-in-out;
    position: relative;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  a.active {
    color: white;
    border-top-color: #4299e1;
    background: rgba(66, 153, 225, 0.1);
  }

  @media (hover: hover) {
    a:hover {
      background: #2d3748;
      color: white;
    }

    a.active:hover {
      background: rgba(66, 153, 225, 0.15);
    }
  }

  a:active {
    background: #2d3748;
    transform: scale(0.96);
  }

  @media (max-width: 400px) {
    a {
      font-size: 0.8125rem;
      padding: 0.75rem 0.25rem;
    }
  }

  @media (min-width: 769px) {
    a {
      min-height: 60px;
      font-size: 0.9375rem;
    }
  }
</style>
