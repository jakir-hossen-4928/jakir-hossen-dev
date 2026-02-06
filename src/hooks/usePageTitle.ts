import { useEffect } from 'react';

const APP_NAME = "Jakir's Digital Canvas";

/**
 * Custom hook to update the document title dynamically.
 * @param title - The specific title for the current page.
 * @param includeSuffix - Whether to append the default app name suffix.
 */
export const usePageTitle = (title: string, includeSuffix = true) => {
    useEffect(() => {
        const fullTitle = includeSuffix ? `${title} | ${APP_NAME}` : title;
        document.title = fullTitle;
    }, [title, includeSuffix]);
};
