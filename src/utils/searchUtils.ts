import Fuse from 'fuse.js';
import type { IFuseOptions } from 'fuse.js';
import { AppEntry } from '@/lib/types';

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

// Main Search function
export function searchApps(apps: AppEntry[], query: string): AppEntry[] {
    console.log(`[SearchUtils] Searching ${apps.length} apps with query: "${query}"`);

    if (!query.trim()) {
        console.log('[SearchUtils] Query is empty, returning all apps.');
        return apps;
    }

    const fuse = new Fuse(apps, appSearchOptions);
    const results = fuse.search(query);

    console.log(`[SearchUtils] Search complete. Found ${results.length} matches.`);

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
