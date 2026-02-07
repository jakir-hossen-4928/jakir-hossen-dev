import { AppEntry } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

// Enum for sorting options
export enum SortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  NAME_AZ = 'name-az',
  NAME_ZA = 'name-za',
  STATUS = 'status'
}

// Labels for sort options
export const SortOptionLabels: Record<SortOption, string> = {
  [SortOption.NEWEST]: 'Newest First',
  [SortOption.OLDEST]: 'Oldest First',
  [SortOption.NAME_AZ]: 'Name (A-Z)',
  [SortOption.NAME_ZA]: 'Name (Z-A)',
  [SortOption.STATUS]: 'Status'
};

// Helper to convert Timestamp, ISO string, or Date to Date object
function toDate(timestamp: any): Date {
  if (!timestamp) return new Date(0);
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  // Handle Firestore Timestamp specifically if it leaks through
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (timestamp.seconds !== undefined) return new Timestamp(timestamp.seconds, timestamp.nanoseconds || 0).toDate();

  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? new Date(0) : date;
}

// Sort apps based on selected option
export function sortApps(apps: AppEntry[], option: SortOption): AppEntry[] {
  console.log(`[SortUtils] Sorting ${apps.length} apps with option: ${option}`);

  const sorted = [...apps].sort((a, b) => {
    switch (option) {
      case SortOption.NEWEST: {
        const dateA = toDate(a.createdAt).getTime();
        const dateB = toDate(b.createdAt).getTime();
        return dateB - dateA;
      }
      case SortOption.OLDEST: {
        const dateA = toDate(a.createdAt).getTime();
        const dateB = toDate(b.createdAt).getTime();
        return dateA - dateB;
      }
      case SortOption.NAME_AZ:
        return a.appName.localeCompare(b.appName);
      case SortOption.NAME_ZA:
        return b.appName.localeCompare(a.appName);
      case SortOption.STATUS:
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  console.log(`[SortUtils] Sorting complete. Sorted ${sorted.length} items.`);
  return sorted;
}
