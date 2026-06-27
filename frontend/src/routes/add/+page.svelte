<script lang="ts">
  import { onDestroy } from 'svelte';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { get } from 'svelte/store';
  import { Button, Input, Textarea, Card, Badge } from '$lib/components/ui';
  import { isOnline } from '$lib/stores';
  import { addPendingPost } from '$lib/offline/sync-queue';
  import {
    buildPendingResourcePayloadFromFormValues,
    readAddResourceFormValues,
    toPendingPhotoReference
  } from '$lib/offline/create-resource-payload';
  import { getLocation, getLocationErrorMessage } from '$lib/utils/geolocation';
  import type { LocationAccuracy, ResourceCategory, ResourceStatus } from '$lib/types';

  type LocationMethod = 'gps' | 'map' | 'manual';
  type LocationUiState = 'idle' | 'loading' | 'success' | 'error';

  type AddPageForm = {
    success?: boolean;
    message?: string;
    warning?: string;
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
  let queueMessage = $state('');
  let photoName = $state('');
  let photoNotice = $state('');
  let photoInput: HTMLInputElement | null = null;
  let processedPhotoFile: File | null = null;

  const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
  const MAX_PHOTO_DIMENSION = 1600;
  const PHOTO_QUALITY = 0.82;
  const SUPPORTED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

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
      locationMessage = 'موقعیت GPS فعلی ثبت شد.';

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
      locationMessage = 'نشانگر نقشه تنظیم شد.';
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
      locationMessage = 'لطفا عرض و طول جغرافیایی معتبر برای مرکز تقریبی وارد کنید.';
      return;
    }

    locationAccuracy = 'area_only';
    locationState = 'success';
      locationMessage = 'موقعیت تقریبی دستی ذخیره شد.';
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
    queueMessage = '';
  }

  function setPhotoInputFile(file: File | null) {
    processedPhotoFile = file;

    if (!photoInput) return;

    const dataTransfer = new DataTransfer();
    if (file) {
      dataTransfer.items.add(file);
    }

    photoInput.files = dataTransfer.files;
  }

  async function compressPhoto(file: File): Promise<File> {
    if (typeof window === 'undefined') {
      return file;
    }

    const imageUrl = URL.createObjectURL(file);

    try {
      const image = new Image();
      image.decoding = 'async';

      const loaded = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Could not load image.'));
      });

      image.src = imageUrl;
      await loaded;

      const targetWidth = image.width > MAX_PHOTO_DIMENSION ? MAX_PHOTO_DIMENSION : image.width;
      const targetHeight = image.height > MAX_PHOTO_DIMENSION ? MAX_PHOTO_DIMENSION : image.height;
      const scale = Math.min(targetWidth / image.width, targetHeight / image.height, 1);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas is not available.');
      }

      context.drawImage(image, 0, 0, width, height);

      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, outputType, outputType === 'image/png' ? undefined : PHOTO_QUALITY);
      });

      if (!blob) {
        throw new Error('Photo compression failed.');
      }

      const compressedFileName = file.name.replace(/\.[^.]+$/, '') + (outputType === 'image/png' ? '.png' : '.jpg');
      return new File([blob], compressedFileName, {
        type: blob.type || outputType,
        lastModified: Date.now()
      });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  function isLikelyNetworkFailure(error: unknown): boolean {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true;
    }

    if (!(error instanceof Error)) {
      return false;
    }

    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('network request failed') ||
      message.includes('fetch')
    );
  }

  async function queuePendingCreate(formData: FormData, reason: 'offline' | 'network_failure') {
    const values = readAddResourceFormValues(formData);
    const payload = buildPendingResourcePayloadFromFormValues(values);

    const photoEntry = formData.get('photo');
    const photo = photoEntry instanceof File && photoEntry.size > 0 ? toPendingPhotoReference(photoEntry) : undefined;

    await addPendingPost({
      payload,
      photo
    });

    isSubmitting = false;
    isRedirecting = false;
    queueMessage =
      reason === 'offline'
        ? 'شما آفلاین هستید. این منبع به‌صورت محلی ذخیره شد و پس از اتصال دوباره همگام‌سازی می‌شود.'
        : 'مشکل شبکه شناسایی شد. این منبع به‌صورت محلی ذخیره شد و پس از اتصال دوباره همگام‌سازی می‌شود.';
  }

  const submitWithOfflineQueue: SubmitFunction = ({ formData, cancel }) => {
    if (processedPhotoFile) {
      formData.set('photo', processedPhotoFile);
    }

    if (!get(isOnline)) {
      cancel();
      void queuePendingCreate(formData, 'offline');
      return;
    }

    return async ({ result, update }) => {
      if (result.type === 'error' && isLikelyNetworkFailure(result.error)) {
        await queuePendingCreate(formData, 'network_failure');
        return;
      }

      await update();
    };
  };

  function handlePhotoChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    photoNotice = '';

    if (!file) {
      photoName = '';
      setPhotoInputFile(null);
      return;
    }

    if (!SUPPORTED_PHOTO_TYPES.has(file.type)) {
      photoName = '';
      photoNotice = 'لطفا یک تصویر JPG، PNG یا WebP انتخاب کنید.';
      input.value = '';
      setPhotoInputFile(null);
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      photoName = '';
      photoNotice = 'لطفا تصویری با حجم ۵ مگابایت یا کمتر انتخاب کنید.';
      input.value = '';
      setPhotoInputFile(null);
      return;
    }

    photoName = file.name;

    void (async () => {
      try {
        const compressedFile = await compressPhoto(file);

        if (compressedFile.size > MAX_PHOTO_SIZE_BYTES) {
          photoName = '';
          photoNotice = 'این تصویر پس از فشرده‌سازی هنوز بزرگ است، بنابراین نادیده گرفته می‌شود.';
          input.value = '';
          setPhotoInputFile(null);
          return;
        }

        photoName = compressedFile.name;
        setPhotoInputFile(compressedFile);
      } catch {
        photoName = '';
        photoNotice = 'پردازش عکس ناموفق بود، بنابراین منبع بدون عکس ثبت می‌شود.';
        input.value = '';
        setPhotoInputFile(null);
      }
    })();
  }
</script>

<div class="add-page">
        <h1>افزودن منبع</h1>

  {#if !$isOnline}
    <Card padding="medium">
      <div class="offline-notice">
        <Badge variant="warning">آفلاین</Badge>
        <p>شما آفلاین هستید. منبع شما به‌صورت محلی ذخیره می‌شود و پس از اتصال دوباره همگام‌سازی خواهد شد.</p>
      </div>
    </Card>
  {/if}

  <Card padding="large">
    {#if form?.success && form?.created}
      <div class="submit-result success-message">
          <Badge variant="success">ایجاد شد</Badge>
        <p>
          منبع <strong>{form.created.title}</strong> با موفقیت ایجاد شد.
        </p>
        {#if form.warning}
          <p class="warning-text">{form.warning}</p>
        {/if}
      </div>
    {:else if queueMessage}
      <div class="submit-result success-message">
        <Badge variant="info">در صف</Badge>
        <p>{queueMessage}</p>
      </div>
    {:else if form?.message}
      <div class="submit-result error-message">
        <Badge variant="error">خطا</Badge>
        <p>{form.message}</p>
      </div>
    {/if}

    <form
      method="POST"
      action="?/create"
      enctype="multipart/form-data"
      onsubmit={handleSubmit}
      use:enhance={submitWithOfflineQueue}
    >
      <div class="form-group">
        <label for="title">عنوان <span class="required">*</span></label>
        <Input
          id="title"
          name="title"
          placeholder="مثلا: تیرآهن، طول ۳ متر"
          required
          maxlength={100}
          bind:value={title}
        />
        {#if fieldErrors.title}
          <span class="field-error">{fieldErrors.title}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="description">توضیحات <span class="required">*</span></label>
        <Textarea
          id="description"
          name="description"
          placeholder="منبع، وضعیت و مقدار را توضیح دهید..."
          required
          rows={5}
          maxlength={1000}
          bind:value={description}
        />
        <span class="helper-text">{description.length}/1000 نویسه</span>
        {#if fieldErrors.description}
          <span class="field-error">{fieldErrors.description}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="category">دسته‌بندی <span class="required">*</span></label>
        <select id="category" name="category" bind:value={category} class="select">
          <option value="scrap_metal">ضایعات فلزی</option>
          <option value="wood">چوب / الوار</option>
          <option value="tools">ابزار</option>
          <option value="electrical">برقی</option>
          <option value="plumbing">لوله‌کشی</option>
          <option value="containers">ظروف / انبار</option>
          <option value="building_materials">مصالح ساختمانی</option>
          <option value="fuel">سوخت / انرژی</option>
          <option value="other">سایر</option>
        </select>
        <div class="category-preview">
          <span class="preview-label">پیش‌نمایش:</span>
          <Badge {category} />
        </div>
        {#if fieldErrors.category}
          <span class="field-error">{fieldErrors.category}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="status">وضعیت <span class="required">*</span></label>
        <select id="status" name="status" bind:value={status} class="select">
          <option value="available">موجود</option>
          <option value="claimed">برداشته‌شده</option>
          <option value="possibly_gone">احتمالاً ناپدید شده</option>
          <option value="expired">منقضی</option>
        </select>
        {#if fieldErrors.status}
          <span class="field-error">{fieldErrors.status}</span>
        {/if}
      </div>

      <!-- Location Section -->
      <div class="form-section">
        <h3 class="section-title">موقعیت <span class="required">*</span></h3>
        <p class="section-description">
          روش تعیین موقعیت منبع را انتخاب کنید. می‌توانید از GPS دستگاه، نشان‌گذاری روی نقشه یا وارد کردن دستی محدوده تقریبی استفاده کنید.
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
            <span class="method-label">استفاده از GPS</span>
          </button>
          <button
            type="button"
            class="method-button"
            class:active={locationMethod === 'map'}
            onclick={() => resetLocationForMethod('map')}
          >
            <span class="method-icon">🗺️</span>
            <span class="method-label">افزودن نشانگر روی نقشه</span>
          </button>
          <button
            type="button"
            class="method-button"
            class:active={locationMethod === 'manual'}
            onclick={() => resetLocationForMethod('manual')}
          >
            <span class="method-icon">✏️</span>
            <span class="method-label">دستی</span>
          </button>
        </div>

        <div class="location-picker-panel">
          {#if locationMethod === 'gps'}
            <div class="location-mode-body">
              <p class="mode-hint">از موقعیت فعلی دستگاه استفاده کنید.</p>
              <Button
                type="button"
                variant="secondary"
                size="medium"
                on:click={requestGpsLocation}
                disabled={locationState === 'loading'}
              >
                {locationState === 'loading' ? 'در حال دریافت موقعیت…' : 'استفاده از موقعیت فعلی'}
              </Button>
            </div>
          {:else if locationMethod === 'map'}
            <div class="location-mode-body">
              <p class="mode-hint">برای ثبت نشانگر، روی نقشه بزنید.</p>
              <div class="map-picker" bind:this={mapContainer}></div>
            </div>
          {:else}
            <div class="location-mode-body">
              <label for="manual_area">محدوده تقریبی <span class="required">*</span></label>
              <Input
                id="manual_area"
                placeholder="مثلا: نزدیک دروازه شرقی، بلوک صنعتی ب"
                maxlength={200}
                bind:value={manualArea}
              />
              <p class="mode-hint">
                حالت دستی، محدوده تقریبی و مختصات مرکز تقریبی را ذخیره می‌کند.
              </p>
              <div class="temp-location-inputs">
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="عرض جغرافیایی تقریبی"
                  bind:value={latitude}
                />
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="طول جغرافیایی تقریبی"
                  bind:value={longitude}
                />
              </div>
              <Button type="button" variant="ghost" size="small" on:click={applyManualApproximateCenter}>
                ذخیره موقعیت تقریبی
              </Button>
            </div>
          {/if}
        </div>

        {#if locationMethod !== 'manual'}
          <input type="hidden" id="latitude" name="latitude" value={latitude} />
          <input type="hidden" id="longitude" name="longitude" value={longitude} />
        {/if}

        <div class="method-indicator">
          <Badge variant="info">روش: {locationMethod === 'gps' ? 'GPS' : locationMethod === 'map' ? 'نشانگر نقشه' : 'محدوده دستی'}</Badge>
          <Badge variant={hasValidLocation ? 'success' : 'warning'}>
            {hasValidLocation ? 'موقعیت آماده است' : 'موقعیت لازم است'}
          </Badge>
        </div>

        {#if hasCoordinateLocation}
          <div class="location-preview">
            <Badge variant="success">موقعیت ثبت شد</Badge>
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
        <h3 class="section-title">عکس (اختیاری)</h3>
        <p class="section-description">
          برای کمک به شناسایی منبع، یک عکس اضافه کنید. عکس اختیاری است اما پیشنهاد می‌شود.
        </p>

        <div class="photo-picker-placeholder">
          <div class="location-mode-body">
            <label for="photo">انتخاب تصویر (JPG، PNG یا WebP، تا ۵ مگابایت)</label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              bind:this={photoInput}
              onchange={handlePhotoChange}
            />
            <p class="helper-text">
              {photoName ? `انتخاب‌شده: ${photoName}` : 'فایلی انتخاب نشده است. می‌توانید بدون عکس ثبت کنید.'}
            </p>
            {#if photoNotice}
              <span class="helper-text">{photoNotice}</span>
            {/if}
            {#if fieldErrors.photo}
              <span class="field-error">{fieldErrors.photo}</span>
            {/if}
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="contact_method">روش تماس (اختیاری)</label>
        <Input
          id="contact_method"
          name="contact_method"
          placeholder="مثلا: در محل موجود است یا برای هماهنگی تماس بگیرید"
          maxlength={200}
          bind:value={contactMethod}
        />
        <span class="helper-text">دیگران چگونه می‌توانند با شما ارتباط بگیرند؟</span>
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
            در حال ثبت منبع…
          {:else if isRedirecting}
            در حال انتقال به جزئیات…
          {:else}
            افزودن منبع
          {/if}
        </Button>
        <Button type="button" variant="ghost" size="medium" fullWidth on:click={() => history.back()} disabled={isSubmitting || isRedirecting}>
          انصراف
        </Button>
      </div>

      {#if form?.success && form?.created?.id}
        <div class="submit-result success-message">
          <p>در حال باز کردن جزئیات منبع…</p>
          <a class="detail-link" href={`/resource/${form.created.id}`}>رفتن به صفحه</a>
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
