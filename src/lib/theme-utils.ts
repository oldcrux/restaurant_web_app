// Store reference to the system theme listener for cleanup
let systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null;
let systemThemeMediaQuery: MediaQueryList | null = null;

// Function to apply theme based on system preference
function applySystemTheme() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  return isDark;
}

export function updateThemeMode(value: "light" | "dark" | "system") {
  const doc = document.documentElement;
  doc.classList.add("disable-transitions");

  // Clean up any existing system theme listener
  if (systemThemeListener && systemThemeMediaQuery) {
    systemThemeMediaQuery.removeEventListener('change', systemThemeListener);
    systemThemeListener = null;
    systemThemeMediaQuery = null;
  }

  if (value === "system") {
    // Apply system theme immediately
    const isDark = applySystemTheme();

    // Create and store listener for system theme changes
    systemThemeListener = () => {
      doc.classList.add("disable-transitions");
      applySystemTheme();
      void doc.offsetWidth;
      doc.classList.remove("disable-transitions");
    };

    systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemThemeMediaQuery.addEventListener('change', systemThemeListener);
  } else {
    // For explicit light/dark themes, apply the theme directly
    doc.classList.toggle("dark", value === "dark");
  }

  // Force reflow to ensure transition works
  void doc.offsetWidth;
  doc.classList.remove("disable-transitions");
}

export function updateThemePreset(value: string) {
  document.documentElement.setAttribute("data-theme-preset", value);
}
