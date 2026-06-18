# UI Components

A small, lightweight collection of reusable UI components for Magpie. Built with plain CSS, no external dependencies.

## Components

### Button

Reusable button with multiple variants and sizes.

**Props:**
- `variant`: `'primary' | 'secondary' | 'ghost'` (default: `'primary'`)
- `size`: `'small' | 'medium' | 'large'` (default: `'medium'`)
- `disabled`: `boolean` (default: `false`)
- `type`: `'button' | 'submit' | 'reset'` (default: `'button'`)
- `fullWidth`: `boolean` (default: `false`)

**Example:**
```svelte
<Button variant="primary" size="large" on:click={handleClick}>
  Submit
</Button>
```

### Input

Single-line text input with various types.

**Props:**
- `value`: `string` (bindable)
- `type`: `'text' | 'email' | 'tel' | 'number' | 'url' | 'search'` (default: `'text'`)
- `placeholder`: `string`
- `disabled`: `boolean`
- `required`: `boolean`
- `maxlength`: `number`
- Standard HTML input attributes

**Example:**
```svelte
<Input
  bind:value={email}
  type="email"
  placeholder="Enter your email"
  required
/>
```

### Textarea

Multi-line text input.

**Props:**
- `value`: `string` (bindable)
- `placeholder`: `string`
- `rows`: `number` (default: `4`)
- `maxlength`: `number`
- `resize`: `'none' | 'vertical' | 'horizontal' | 'both'` (default: `'vertical'`)
- `disabled`: `boolean`
- `required`: `boolean`

**Example:**
```svelte
<Textarea
  bind:value={description}
  rows={5}
  placeholder="Describe the resource..."
  maxlength={500}
/>
```

### Card

Container component with padding variants and optional interactions.

**Props:**
- `padding`: `'none' | 'small' | 'medium' | 'large'` (default: `'medium'`)
- `hover`: `boolean` - Adds hover elevation effect
- `clickable`: `boolean` - Makes card clickable with press feedback

**Example:**
```svelte
<Card padding="large" hover clickable on:click={handleClick}>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### Badge

Display status, category, or informational badges with automatic coloring.

**Props:**
- `variant`: `'status' | 'category' | 'info' | 'warning' | 'success' | 'error'` (default: `'info'`)
- `status`: `ResourceStatus` - Automatically sets variant and label
- `category`: `ResourceCategory` - Automatically sets variant and label
- `size`: `'small' | 'medium'` (default: `'medium'`)

**Example:**
```svelte
<!-- Status badge -->
<Badge status="available" />

<!-- Category badge -->
<Badge category="scrap_metal" size="small" />

<!-- Generic badge -->
<Badge variant="warning">Low Stock</Badge>
```

## Status Colors

- **Available**: Green background
- **Claimed**: Blue background
- **Possibly Gone**: Orange/yellow background
- **Expired**: Gray background

## Category Colors

Each of the 9 resource categories has a distinct color:
- Scrap Metal: Gray
- Wood: Brown/orange
- Tools: Blue
- Electrical: Yellow
- Plumbing: Indigo
- Containers: Purple
- Building Materials: Red
- Fuel: Pink
- Other: Gray

## Design Principles

- **Mobile-first**: 16px font size on mobile inputs prevents iOS zoom
- **Touch-optimized**: Comfortable tap targets, proper press feedback
- **Accessible**: Focus states, keyboard navigation, ARIA attributes
- **Lightweight**: Plain CSS, no external dependencies
- **Consistent**: Shared color palette and spacing scale
- **Responsive**: Adapts to different screen sizes

## Import

```svelte
import { Button, Input, Textarea, Card, Badge } from '$lib/components/ui';
```

## Notes

- All components forward events (e.g., `on:click`, `on:input`, `on:change`)
- Input and Textarea prevent iOS zoom with 16px font size on mobile
- Badge automatically displays labels for status and category types
- Card supports both decorative and interactive use cases
