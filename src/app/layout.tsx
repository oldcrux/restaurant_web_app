import { ReactNode } from "react";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "@/config/app-config";
import { getPreference } from "@/server/server-actions";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import { THEME_MODE_VALUES, THEME_PRESET_VALUES, type ThemePreset, type ThemeMode } from "@/types/preferences/theme";

import "./globals.css";
import { SuperTokensProvider } from "@/auth/supertokens/components/supertokens-provider";
// import { ThemeProvider } from "@/stores/preferences/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const themeMode = await getPreference<ThemeMode>("theme_mode", THEME_MODE_VALUES, "system");
  const themePreset = await getPreference<ThemePreset>("theme_preset", THEME_PRESET_VALUES, "default");

  "use client";
  return (
    // <>
    //   <html lang="en" suppressHydrationWarning>
    //     <head />
    //     <body>
    //       <ThemeProvider
    //         attribute="class"
    //         defaultTheme="system"
    //         enableSystem
    //         disableTransitionOnChange
    //       >
    //         {children}
    //       </ThemeProvider>
    //     </body>
    //   </html>
    // </>
    <html
      lang="en"
      className={themeMode === "dark" ? "dark" : ""}
      data-theme-preset={themePreset}
      suppressHydrationWarning
    >
      
      <body className={`${inter.className} min-h-screen antialiased`}>
        <SuperTokensProvider>
        <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset}>
          {children}
          <Toaster />
        </PreferencesStoreProvider>
        </SuperTokensProvider>
      </body>
    </html>
  );
}
