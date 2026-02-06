import Fuse from 'fuse.js';
import type { IFuseOptions } from 'fuse.js';
import { AppEntry } from '../lib/db';

// Fuse.js configuration for app search
export const appSearchOptions: IFuseOptions<AppEntry> = {
    keys: [
        { name: 'appName', weight: 0.7 },
        { name: 'description', weight: 0.3 }
    ],
    threshold: 0.4, // Lower = more strict matching
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true
};

// Create Fuse instance for apps
export function createAppSearchIndex(apps: AppEntry[]): Fuse<AppEntry> {
    return new Fuse(apps, appSearchOptions);
}

// Search apps with fuzzy matching
export function searchApps(apps: AppEntry[], searchTerm: string): AppEntry[] {
    if (!searchTerm.trim()) {
        return apps;
    }

    const fuse = createAppSearchIndex(apps);
    const results = fuse.search(searchTerm);

    return results.map(result => result.item);
}

// Highlight matching text in search results
export function highlightMatches(text: string, searchTerm: string): string {
    if (!searchTerm.trim()) {
        return text;
    }

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-primary/20 text-primary">$1</mark>');
}
