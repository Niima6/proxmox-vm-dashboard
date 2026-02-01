/**
 * Format bytes to human-readable format
 */
export const formatBytes = (bytes: number | undefined): string => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number | undefined): string => {
  if (!value) return '0%';
  return `${(value * 100).toFixed(1)}%`;
};

/**
 * Format uptime in seconds to human-readable format
 */
export const formatUptime = (seconds: number): string => {
  if (!seconds || seconds === 0) return 'Down';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Format date to locale string
 */
export const formatDate = (date: Date | string | number): string => {
  return new Date(date).toLocaleString();
};