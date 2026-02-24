// ============================================================
// components/layout/ThemeToggle.tsx
// A button that toggles between dark and light mode.
// Uses "next-themes" which adds/removes class="dark" on <html>.
// shadcn/ui + Tailwind then respond to that class automatically.
// ============================================================

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // We need to wait for the component to mount before rendering.
    // Why? On the server, we don't know the user's theme preference.
    // If we render Sun/Moon before mounting, it might flicker.
    useEffect(() => setMounted(true), []);

    if (!mounted) return null; // don't render anything on server

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
    );
}
