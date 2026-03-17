import { useThemeContext } from "../lib/ThemeContext";

export function useTheme() {
  const { theme, toggleTheme } = useThemeContext();

  const isDark = theme === "dark";
  const toggle = toggleTheme;

  return { isDark, toggle };
}
