<script lang="ts">
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { Button, Input, Textarea, Card, Badge } from '$lib/components/ui';
  import { isOnline } from '$lib/stores';
  import { getLocation, getLocationErrorMessage } from '$lib/utils/geolocation';
  import type { LocationAccuracy, ResourceCategory, ResourceStatus } from '$lib/types';

  type LocationMethod = 'gps' | 'map' | 'manual';
  type LocationUiState = 'idle' | 'loading' | 'success' | 'error';

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
      location_method?: string;
      manual_area?: string;
      location_accuracy?: string;
      photo_url?: string;
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
  let locationMethod = $state<LocationMethod>((form?.values?.location_method as LocationMethod) ?? 'gps');
  let manualArea = $state(form?.values?.manual_area ?? '');
  let locationAccuracy = $state<LocationAccuracy>(
    (form?.values?.location_accuracy as LocationAccuracy) ?? 'approximate'
  );

  let locationMessage = $state('');
  let locationState = $state<LocationUiState>('idle');
  let isSubmitting = $state(false);
  let isRedirecting = $state(false);
  let photoName = $state('');

  let mapContainer: HTMLDivElement | null = null;
  let leaflet: typeof import('leaflet') | null = null;
  let map: import('leaflet').Map | null = null;
  let pinMarker: import('leaflet').CircleMarker | null = null;
  let mapReady = $state(false);

  const defaultMapCenter: [number, number] = [35.6892, 51.389];

  const fieldErrors = $derived(form?.fieldErrors ?? {});

  const latitudeNumber = $derived(Number.parseFloat(latitude));
  const longitudeNumber = $derived(Number.parseFloat(longitude));
  const hasCoordinateLocation = $derived(
    Number.isFinite(latitudeNumber) &&
      Number.isFinite(longitudeNumber) &&
      latitudeNumber >= -90 &&
      latitudeNumber <= 90 &&
      longitudeNumber >= -180 &&
      longitudeNumber <= 180
  );
  const hasManualLocation = $derived(Boolean(manualArea.trim()) && hasCoordinateLocation);
  const hasValidLocation = $derived(
    locationMethod === 'manual' ? hasManualLocation : hasCoordinateLocation
  );

  const canSubmit = $derived(Boolean(title.trim()) && Boolean(description.trim()) && hasValidLocation);

  $effect(() => {
    if (!form?.success || !form?.created?.id) {
      return;
    }

    isSubmitting = false;
    isRedirecting = true;

    const timeout = setTimeout(() => {
      goto(`/resource/${form.created!.id}`);
    }, 900);

    return () => {
      clearTimeout(timeout);
    };
  });

  async function requestGpsLocation() {
    locationState = 'loading';
    locationMessage = '';

    try {
      const result = await getLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });

      latitude = result.latitude.toFixed(6);
      longitude = result.longitude.toFixed(6);
      locationAccuracy = 'exact';
      locationState = 'success';
      locationMessage = 'Current GPS location captured.';

      if (map && leaflet) {
        setMapPin(result.latitude, result.longitude);
        map.setView([result.latitude, result.longitude], 15);
      }
    } catch (error) {
      locationState = 'error';
      locationMessage = getLocationErrorMessage(error as GeolocationPositionError | Error);
    }
  }

  function resetLocationForMethod(nextMethod: LocationMethod) {
    if (locationMethod === nextMethod) return;

    locationMethod = nextMethod;
    locationState = 'idle';
    locationMessage = '';
    latitude = '';
    longitude = '';

    if (nextMethod !== 'manual') {
      manualArea = '';
    }

    locationAccuracy = nextMethod === 'manual' ? 'area_only' : 'approximate';

    if (pinMarker) {
      pinMarker.remove();
      pinMarker = null;
    }
  }

  function setMapPin(lat: number, lng: number) {
    if (!map || !leaflet) return;

    if (pinMarker) {
      pinMarker.remove();
    }

    pinMarker = leaflet.circleMarker([lat, lng], {
      radius: 8,
      color: '#2563eb',
      fillColor: '#2563eb',
      fillOpacity: 0.3,
      weight: 2
    });

    pinMarker.addTo(map);
    latitude = lat.toFixed(6);
    longitude = lng.toFixed(6);
    locationAccuracy = 'exact';
    locationState = 'success';
    locationMessage = 'Map pin set.';
  }

  async function ensureMapReady() {
    if (mapReady || !mapContainer) return;

    leaflet = await import('leaflet');

    map = leaflet.map(mapContainer, {
      center: hasCoordinateLocation ? [latitudeNumber, longitudeNumber] : defaultMapCenter,
      zoom: hasCoordinateLocation ? 14 : 11,
      zoomControl: true
    });

    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      })
      .addTo(map);

    map.on('click', (event: import('leaflet').LeafletMouseEvent) => {
      setMapPin(event.latlng.lat, event.latlng.lng);
    });

    if (hasCoordinateLocation) {
      setMapPin(latitudeNumber, longitudeNumber);
    }

    mapReady = true;
  }

  $effect(() => {
    if (locationMethod === 'map' && mapContainer) {
      ensureMapReady();
    }
  });

  function applyManualApproximateCenter() {
    const lat = Number.parseFloat(latitude);
    const lng = Number.parseFloat(longitude);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      locationState = 'error';
      locationMessage = 'Please enter a valid approximate center latitude/longitude.';
      return;
    }

    locationAccuracy = 'area_only';
    locationState = 'success';
    locationMessage = 'Approximate manual location saved.';
  }

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });

  function handleSubmit() {
    isSubmitting = true;
    isRedirecting = false;
  }

  function handlePhotoChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    photoName = file?.name ?? '';
  }
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

    <form method="POST" action="?/create" enctype="multipart/form-data" onsubmit={handleSubmit}>
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

      <!-- Location Section -->
      <div class="form-section">
        <h3 class="section-title">Location <span class="required">*</span></h3>
        <p class="section-description">
          Choose how to set the resource location. You can use your device GPS, drop a pin on a map, or enter an approximate area manually.
        </p>

        <input type="hidden" name="location_method" value={locationMethod} />
        <input type="hidden" name="location_accuracy" value={locationAccuracy} />
        <input type="hidden" name="manual_area" value={manualArea} />

        <div class="location-method-picker">
          <button
            type="button"
            class="method-button"
            class:active={locationMethod === 'gps'}
            onclick={() => resetLocationForMethod('gps')}
          >
            <span class="method-icon">📍</span>
            <span class="method-label">Use GPS</span>
          </button>
          <button
            type="button"
            class="method-button"
            class:active={locationMethod === 'map'}
            onclick={() => resetLocationForMethod('map')}
          >
            <span class="method-icon">🗺️</span>
            <span class="method-label">Drop Pin</span>
          </button>
          <button
            type="button"
            class="method-button"
            class:active={locationMethod === 'manual'}
            onclick={() => resetLocationForMethod('manual')}
          >
            <span class="method-icon">✏️</span>
            <span class="method-label">Manual</span>
          </button>
        </div>

        <div class="location-picker-panel">
          {#if locationMethod === 'gps'}
            <div class="location-mode-body">
              <p class="mode-hint">Use your current device position.</p>
              <Button
                type="button"
                variant="secondary"
                size="medium"
                on:click={requestGpsLocation}
                disabled={locationState === 'loading'}
              >
                {locationState === 'loading' ? 'Getting location…' : 'Use current location'}
              </Button>
            </div>
          {:else if locationMethod === 'map'}
            <div class="location-mode-body">
              <p class="mode-hint">Tap on the map to drop a pin.</p>
              <div class="map-picker" bind:this={mapContainer}></div>
            </div>
          {:else}
            <div class="location-mode-body">
              <label for="manual_area">Approximate area <span class="required">*</span></label>
              <Input
                id="manual_area"
                placeholder="e.g. Near East Gate, Industrial Block B"
                maxlength={200}
                bind:value={manualArea}
              />
              <p class="mode-hint">
                Manual mode stores an approximate area and approximate center coordinates.
              </p>
              <div class="temp-location-inputs">
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="Approximate latitude"
                  bind:value={latitude}
                />
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="Approximate longitude"
                  bind:value={longitude}
                />
              </div>
              <Button type="button" variant="ghost" size="small" on:click={applyManualApproximateCenter}>
                Save approximate location
              </Button>
            </div>
          {/if}
        </div>

        {#if locationMethod !== 'manual'}
          <input type="hidden" id="latitude" name="latitude" value={latitude} />
          <input type="hidden" id="longitude" name="longitude" value={longitude} />
        {/if}

        <div class="method-indicator">
          <Badge variant="info">Method: {locationMethod === 'gps' ? 'GPS' : locationMethod === 'map' ? 'Map pin' : 'Manual area'}</Badge>
          <Badge variant={hasValidLocation ? 'success' : 'warning'}>
            {hasValidLocation ? 'Location ready' : 'Location required'}
          </Badge>
        </div>

        {#if hasCoordinateLocation}
          <div class="location-preview">
            <Badge variant="success">Location Set</Badge>
            <span class="location-coords">
              {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
            </span>
            {#if locationMethod === 'manual' && manualArea.trim()}
              <span class="location-manual-label">({manualArea.trim()})</span>
            {/if}
          </div>
        {/if}

        {#if locationMessage}
          <span class:field-error={locationState === 'error'} class="helper-text">{locationMessage}</span>
        {/if}

        {#if fieldErrors.location}
          <span class="field-error">{fieldErrors.location}</span>
        {/if}
        {#if fieldErrors.manual_area}
          <span class="field-error">{fieldErrors.manual_area}</span>
        {/if}

        {#if fieldErrors.latitude || fieldErrors.longitude}
          <span class="field-error">
            {fieldErrors.latitude || fieldErrors.longitude}
          </span>
        {/if}
      </div>

      <!-- Photo Section -->
      <div class="form-section">
        <h3 class="section-title">Photo (Optional)</h3>
        <p class="section-description">
          Add a photo to help others identify the resource. Photos are optional but recommended.
        </p>

        <div class="photo-picker-placeholder">
          <div class="location-mode-body">
            <label for="photo">Choose image (JPG, PNG, or WebP, up to 5MB)</label>
            <Input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onchange={handlePhotoChange}
            />
            <p class="helper-text">
              {photoName ? `Selected: ${photoName}` : 'No file selected. You can submit without a photo.'}
            </p>
            {#if fieldErrors.photo}
              <span class="field-error">{fieldErrors.photo}</span>
            {/if}
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="contact_method">Contact Method (Optional)</label>
        <Input
          id="contact_method"
          name="contact_method"
          placeholder="e.g. Available at site, or contact at meeting point"
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
          disabled={!canSubmit || isSubmitting || isRedirecting}
        >
          {#if isSubmitting}
            Creating resource…
          {:else if isRedirecting}
            Redirecting to details…
          {:else}
            Add Resource
          {/if}
        </Button>
        <Button type="button" variant="ghost" size="medium" fullWidth on:click={() => history.back()} disabled={isSubmitting || isRedirecting}>
          Cancel
        </Button>
      </div>

      {#if form?.success && form?.created?.id}
        <div class="submit-result success-message">
          <p>Opening resource details…</p>
          <a class="detail-link" href={`/resource/${form.created.id}`}>Go now</a>
        </div>
      {/if}
    </form>
  </Card>
</div>

<style>
  .add-page {
    max-width: 48rem;
    margin: 0 auto;
    padding: 1rem;
  }

  h1 {
    margin: 0 0 1rem 0;
    font-size: 2rem;
    font-weight: 700;
    color: #1a202c;
  }

  .offline-notice {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .offline-notice p {
    margin: 0;
    font-size: 0.875rem;
    color: #4a5568;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding: 1.25rem;
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
  }

  .section-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1a202c;
  }

  .section-description {
    margin: 0;
    font-size: 0.875rem;
    color: #718096;
    line-height: 1.5;
  }

  .location-method-picker {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .method-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: white;
    border: 2px solid #cbd5e0;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }

  .method-button:hover {
    border-color: #a0aec0;
    background: #f7fafc;
  }

  .method-button.active {
    border-color: #4299e1;
    background: #ebf8ff;
  }

  .method-icon {
    font-size: 1.5rem;
  }

  .method-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #2d3748;
  }

  .location-picker-panel,
  .photo-picker-placeholder {
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
  }

  .placeholder-content,
  .location-mode-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .placeholder-content p {
    margin: 0;
    font-size: 0.875rem;
    color: #4a5568;
  }

  .placeholder-hint {
    font-size: 0.8125rem;
    color: #a0aec0;
  }

  .temp-location-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin: 0.25rem 0;
  }

  .map-picker {
    width: 100%;
    height: 260px;
    border-radius: 0.5rem;
    border: 1px solid #cbd5e0;
    overflow: hidden;
  }

  .mode-hint {
    margin: 0;
    font-size: 0.875rem;
    color: #4a5568;
  }

  .method-indicator {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .location-preview {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border: 1px solid #9ae6b4;
    border-radius: 0.375rem;
  }

  .location-coords {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    color: #2d3748;
  }

  .location-manual-label {
    font-size: 0.8125rem;
    color: #4a5568;
  }

  label {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #2d3748;
  }

  .required {
    color: #e53e3e;
  }

  .select {
    padding: 0.625rem;
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

  .detail-link {
    display: inline-flex;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: #2b6cb0;
    text-decoration: underline;
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

  @media (max-width: 768px) {
    h1 {
      font-size: 1.5rem;
    }

    .location-method-picker {
      grid-template-columns: 1fr;
    }

    .temp-location-inputs {
      grid-template-columns: 1fr;
    }
  }
</style>
