<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  type InputProps = HTMLInputAttributes;

  let {
    value = $bindable(''),
    type = 'text',
    placeholder = '',
    disabled = false,
    required = false,
    id = undefined,
    name = undefined,
    autocomplete = undefined,
    maxlength = undefined,
    min = undefined,
    max = undefined,
    step = undefined,
    ...restProps
  }: InputProps = $props();
</script>

<input
  class="input"
  {type}
  {placeholder}
  {disabled}
  {required}
  {id}
  {name}
  {autocomplete}
  {maxlength}
  {min}
  {max}
  {step}
  {...restProps}
  bind:value
/>

<style>
  .input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    font-size: 0.9375rem;
    font-family: inherit;
    color: #2d3748;
    background: white;
    border: 2px solid #cbd5e0;
    border-radius: 0.375rem;
    transition: all 0.15s ease-in-out;
    min-height: 40px;
  }

  .input::placeholder {
    color: #a0aec0;
  }

  .input:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }

  .input:disabled {
    background: #f7fafc;
    color: #a0aec0;
    cursor: not-allowed;
  }

  .input:hover:not(:disabled):not(:focus) {
    border-color: #a0aec0;
  }

  /* Better mobile input appearance */
  @media (max-width: 768px) {
    .input {
      font-size: 16px; /* Prevents zoom on iOS */
    }
  }
</style>
