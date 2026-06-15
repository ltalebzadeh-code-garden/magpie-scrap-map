<script lang="ts">
  import { page } from '$app/stores';
  
  const navItems = [
    { path: '/', label: 'Map' },
    { path: '/list', label: 'List' },
    { path: '/add', label: 'Add' },
    { path: '/offline', label: 'Offline' }
  ];
</script>

<nav>
  <div class="container">
    {#each navItems as item}
      <a
        href={item.path}
        class:active={$page.url.pathname === item.path}
      >
        {item.label}
      </a>
    {/each}
  </div>
</nav>

<style>
  nav {
    background: #1a202c;
    border-bottom: 1px solid #2d3748;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    gap: 0;
  }

  a {
    flex: 1;
    padding: 1rem;
    text-align: center;
    color: #a0aec0;
    text-decoration: none;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  a:hover {
    background: #2d3748;
    color: white;
  }

  a.active {
    color: white;
    border-bottom-color: #4299e1;
    background: #2d3748;
  }
</style>
