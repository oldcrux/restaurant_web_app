"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { updateThemeMode } from "@/lib/theme-utils";
import { setValueToCookie } from "@/server/server-actions";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { useHydration } from "../../hooks/use-hydration";
import { useEffect } from "react";

export function ThemeSwitcher() {
  const hydrated = useHydration();
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);

  useEffect(() => {
    if (!hydrated) return;
    // If themeMode is not set, default to "system"
    if (!themeMode) {
      setThemeMode("system");
      updateThemeMode("system");
    } else if (themeMode === "system") {
      updateThemeMode("system");
    }
  }, [hydrated, themeMode, setThemeMode]);

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    console.log("Changing theme to:", newTheme);
    updateThemeMode(newTheme);
    setThemeMode(newTheme);
    await setValueToCookie("theme_mode", newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {hydrated && themeMode === "system" && <AutoThemeBadge />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AutoThemeBadge() {
  return (
    <span className="absolute -right-2 -top-2 flex h-4 items-center rounded-full bg-secondary px-1.5 text-[0.6rem] text-secondary-foreground ring-2 ring-background duration-300 animate-in zoom-in-50">
      auto
    </span>
  );
}
