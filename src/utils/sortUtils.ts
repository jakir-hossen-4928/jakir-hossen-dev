import { AppEntry } from '../lib/db';
import { Timestamp } from 'firebase/firestore';

export enum SortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  STATUS = 'status'
}

export const sortLabels: Record<SortOption, string> = {
  [SortOption.NEWEST]: 'Newest First',
  [SortOption.OLDEST]: 'Oldest First',
  [SortOption.NAME_ASC]: 'A → Z',
  [SortOption.NAME_DESC]: 'Z → A',
  [SortOption.STATUS]: 'Status'
};

// Helper to convert Timestamp to Date
function toDate(timestamp: Timestamp | Date | undefined): Date {
  if (!timestamp) return new Date(0);
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

// Sort apps based on selected option
export function sortApps(apps: AppEntry[], sortBy: SortOption): AppEntry[] {
  const sorted = [...apps];

  switch (sortBy) {
    case SortOption.NEWEST:
      return sorted.sort((a, b) => {
        const dateA = toDate(a.createdAt);
        const dateB = toDate(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

    case SortOption.OLDEST:
      return sorted.sort((a, b) => {
        const dateA = toDate(a.createdAt);
        const dateB = toDate(b.createdAt);
        return dateA.getTime() - dateB.getTime();
      });

    case SortOption.NAME_ASC:
      return sorted.sort((a, b) => a.appName.localeCompare(b.appName));

    case SortOption.NAME_DESC:
      return sorted.sort((a, b) => b.appName.localeCompare(a.appName));

    case SortOption.STATUS:
      return sorted.sort((a, b) => {
        // Production first, then testing
        if (a.status === b.status) return 0;
        return a.status === 'production' ? -1 : 1;
      });

    default:
      return sorted;
  }
}
