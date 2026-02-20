import { useState, useEffect } from "react";

export function useUserPreferences() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("sidebar_collapsed");
            return stored === "true";
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem("sidebar_collapsed", sidebarCollapsed.toString());
    }, [sidebarCollapsed]);

    return {
        sidebarCollapsed,
        setSidebarCollapsed
    };
}
