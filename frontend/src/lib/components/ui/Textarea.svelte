<script lang="ts">
  export let value: string = '';
  export let placeholder: string = '';
  export let disabled: boolean = false;
  export let required: boolean = false;
  export let id: string = '';
  export let name: string = '';
  export let rows: number = 4;
  export let maxlength: number | undefined = undefined;
  export let resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical';
</script>

<textarea
  class="textarea"
  class:resize-none={resize === 'none'}
  class:resize-vertical={resize === 'vertical'}
  class:resize-horizontal={resize === 'horizontal'}
  class:resize-both={resize === 'both'}
  {placeholder}
  {disabled}
  {required}
  {id}
  {name}
  {rows}
  {maxlength}
  bind:value
  on:input
  on:change
  on:focus
  on:blur
/>

<style>
  .textarea {
    width: 100%;
    padding: 0.625rem 0.875rem;
    font-size: 0.9375rem;
    font-family: inherit;
    line-height: 1.5;
    color: #2d3748;
    background: white;
    border: 2px solid #cbd5e0;
    border-radius: 0.375rem;
    transition: all 0.15s ease-in-out;
  }

  .textarea::placeholder {
    color: #a0aec0;
  }

  .textarea:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }

  .textarea:disabled {
    background: #f7fafc;
    color: #a0aec0;
    cursor: not-allowed;
  }

  .textarea:hover:not(:disabled):not(:focus) {
    border-color: #a0aec0;
  }

  .resize-none {
    resize: none;
  }

  .resize-vertical {
    resize: vertical;
  }

  .resize-horizontal {
    resize: horizontal;
  }

  .resize-both {
    resize: both;
  }

  /* Better mobile textarea appearance */
  @media (max-width: 768px) {
    .textarea {
      font-size: 16px; /* Prevents zoom on iOS */
    }
  }
</style>
