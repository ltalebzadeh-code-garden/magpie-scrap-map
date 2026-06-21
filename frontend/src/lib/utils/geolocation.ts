export type LocationResult = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export function getLocation(options?: PositionOptions): Promise<LocationResult> {
  if (typeof window === 'undefined' || !('navigator' in window) || !navigator.geolocation) {
    return Promise.reject(new Error('Geolocation is not supported by this browser.'));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => reject(error),
      options
    );
  });
}

export function getLocationErrorMessage(error: GeolocationPositionError | Error): string {
  if ('code' in error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location permission was denied. Enable location access to search nearby resources.';
      case error.POSITION_UNAVAILABLE:
        return 'Your location is unavailable right now. Please try again in a moment.';
      case error.TIMEOUT:
        return 'Locating took too long. Try again closer to the outdoors or with better reception.';
      default:
        return 'Unable to determine your location.';
    }
  }

  return error.message || 'Unable to determine your location.';
}