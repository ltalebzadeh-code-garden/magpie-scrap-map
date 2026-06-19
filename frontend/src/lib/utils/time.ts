/**
 * Format a timestamp as a relative time string
 * @param timestamp ISO 8601 timestamp string
 * @returns Formatted relative time (e.g., "just now", "5 minutes ago", "2 days ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param text Raw text string
 * @returns HTML-safe string
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
