import { writable } from 'svelte/store';

export const isOnline = writable(true);

if (typeof window !== 'undefined') {
  isOnline.set(navigator.onLine);
  
  window.addEventListener('online', () => isOnline.set(true));
  window.addEventListener('offline', () => isOnline.set(false));
}
