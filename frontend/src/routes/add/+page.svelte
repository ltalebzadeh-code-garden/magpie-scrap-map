<script lang="ts">
  import { Button, Input, Textarea, Card, Badge } from '$lib/components/ui';
  import { isOnline } from '$lib/stores';
  import type { ResourceCategory, ResourceStatus } from '$lib/types';

  type AddPageForm = {
    success?: boolean;
    message?: string;
    created?: {
      id: string;
      title: string;
    };
    values?: {
      title?: string;
      description?: string;
      category?: string;
      status?: string;
      latitude?: string;
      longitude?: string;
      contact_method?: string;
    };
    fieldErrors?: Record<string, string>;
  };

  let { form } = $props<{ form?: AddPageForm }>();

  let title = $state(form?.values?.title ?? '');
  let description = $state(form?.values?.description ?? '');
  let category = $state<ResourceCategory>((form?.values?.category as ResourceCategory) ?? 'other');
  let status = $state<ResourceStatus>((form?.values?.status as ResourceStatus) ?? 'available');
  let latitude = $state(form?.values?.latitude ?? '');
  let longitude = $state(form?.values?.longitude ?? '');
  let contactMethod = $state(form?.values?.contact_method ?? '');

  const fieldErrors = $derived(form?.fieldErrors ?? {});
</script>

<div class="add-page">
  <h1>Add Resource</h1>

  {#if !$isOnline}
    <Card padding="medium">
      <div class="offline-notice">
        <Badge variant="warning">Offline</Badge>
        <p>You're offline. Your resource will be saved locally and synced when you're back online.</p>
      </div>
    </Card>
  {/if}

  <Card padding="large">
    {#if form?.success && form?.created}
      <div class="submit-result success-message">
        <Badge variant="success">Created</Badge>
        <p>
          Resource <strong>{form.created.title}</strong> was created successfully.
        </p>
      </div>
    {:else if form?.message}
      <div class="submit-result error-message">
        <Badge variant="error">Error</Badge>
        <p>{form.message}</p>
      </div>
    {/if}

    <form method="POST" action="?/create">
      <div class="form-group">
        <label for="title">Title <span class="required">*</span></label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Steel beams, 3m length"
          required
          maxlength={100}
          bind:value={title}
        />
        {#if fieldErrors.title}
          <span class="field-error">{fieldErrors.title}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="description">Description <span class="required">*</span></label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the resource, condition, quantity..."
          required
          rows={5}
          maxlength={1000}
          bind:value={description}
        />
        <span class="helper-text">{description.length}/1000 characters</span>
        {#if fieldErrors.description}
          <span class="field-error">{fieldErrors.description}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="category">Category <span class="required">*</span></label>
        <select id="category" name="category" bind:value={category} class="select">
          <option value="scrap_metal">Scrap Metal</option>
          <option value="wood">Wood / Lumber</option>
          <option value="tools">Tools</option>
          <option value="electrical">Electrical</option>
          <option value="plumbing">Plumbing</option>
          <option value="containers">Containers / Storage</option>
          <option value="building_materials">Building Materials</option>
          <option value="fuel">Fuel / Energy</option>
          <option value="other">Other</option>
        </select>
        <div class="category-preview">
          <span class="preview-label">Preview:</span>
          <Badge {category} />
        </div>
        {#if fieldErrors.category}
          <span class="field-error">{fieldErrors.category}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="status">Status <span class="required">*</span></label>
        <select id="status" name="status" bind:value={status} class="select">
          <option value="available">Available</option>
          <option value="claimed">Claimed</option>
          <option value="possibly_gone">Possibly Gone</option>
          <option value="expired">Expired</option>
        </select>
        {#if fieldErrors.status}
          <span class="field-error">{fieldErrors.status}</span>
        {/if}
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="latitude">Latitude <span class="required">*</span></label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            min={-90}
            max={90}
            placeholder="e.g. 35.6892"
            required
            bind:value={latitude}
          />
          {#if fieldErrors.latitude}
            <span class="field-error">{fieldErrors.latitude}</span>
          {/if}
        </div>

        <div class="form-group">
          <label for="longitude">Longitude <span class="required">*</span></label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            min={-180}
            max={180}
            placeholder="e.g. 51.3890"
            required
            bind:value={longitude}
          />
          {#if fieldErrors.longitude}
            <span class="field-error">{fieldErrors.longitude}</span>
          {/if}
        </div>
      </div>

      <div class="form-group">
        <label for="contact">Contact Method (optional)</label>
        <Input
          id="contact"
          name="contact_method"
          type="text"
          placeholder="Phone, address, or meeting point"
          maxlength={200}
          bind:value={contactMethod}
        />
        <span class="helper-text">How can people reach you?</span>
        {#if fieldErrors.contact_method}
          <span class="field-error">{fieldErrors.contact_method}</span>
        {/if}
      </div>

      <div class="form-actions">
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          disabled={!title || !description || !latitude || !longitude}
        >
          Add Resource
        </Button>
        <Button type="button" variant="ghost" size="medium" fullWidth on:click={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  </Card>

  <Card padding="medium" class="info-card">
    <h3>Component Examples</h3>
    <div class="examples">
      <div class="example-section">
        <h4>Buttons</h4>
        <div class="button-group">
          <Button variant="primary" size="small">Primary Small</Button>
          <Button variant="secondary" size="medium">Secondary</Button>
          <Button variant="ghost" size="large">Ghost Large</Button>
        </div>
      </div>

      <div class="example-section">
        <h4>Status Badges</h4>
        <div class="badge-group">
          <Badge status="available" />
          <Badge status="claimed" />
          <Badge status="possibly_gone" />
          <Badge status="expired" />
        </div>
      </div>

      <div class="example-section">
        <h4>Category Badges</h4>
        <div class="badge-group">
          <Badge category="scrap_metal" size="small" />
          <Badge category="wood" size="small" />
          <Badge category="tools" size="small" />
          <Badge category="electrical" size="small" />
          <Badge category="plumbing" size="small" />
        </div>
      </div>

      <div class="example-section">
        <h4>Generic Badges</h4>
        <div class="badge-group">
          <Badge variant="info">Info</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </div>
      </div>
    </div>
  </Card>
</div>

<style>
  .add-page {
    max-width: 600px;
    margin: 0 auto;
  }

  h1 {
    margin: 0 0 1.5rem 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a202c;
  }

  .offline-notice {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .offline-notice p {
    margin: 0;
    color: #4a5568;
    font-size: 0.875rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 600;
    font-size: 0.9375rem;
    color: #2d3748;
  }

  .required {
    color: #e53e3e;
  }

  .select {
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
    cursor: pointer;
  }

  .select:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }

  .select:hover {
    border-color: #a0aec0;
  }

  .category-preview {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .preview-label {
    font-size: 0.875rem;
    color: #718096;
  }

  .helper-text {
    font-size: 0.875rem;
    color: #718096;
  }

  .field-error {
    font-size: 0.8125rem;
    color: #c53030;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .submit-result {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
  }

  .submit-result p {
    margin: 0;
    font-size: 0.875rem;
  }

  .success-message {
    background: #f0fff4;
    border: 1px solid #9ae6b4;
  }

  .error-message {
    background: #fff5f5;
    border: 1px solid #feb2b2;
  }

  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .info-card {
    margin-top: 2rem;
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
  }

  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #4a5568;
  }

  .examples {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .example-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .badge-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.5rem;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .info-card {
      margin-top: 1.5rem;
    }
  }
</style>
