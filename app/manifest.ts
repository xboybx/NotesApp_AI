import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "Cleft AI Notes",
        short_name: "Cleft Notes",
        description: "AI-powered notes and rich-text editing.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#f4f4f4",
        theme_color: "#f4f4f4",
        categories: ["productivity", "utilities", "notes"],
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-maskable-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
        shortcuts: [
            {
                name: "New Page",
                short_name: "New Page",
                description: "Create or open a note",
                url: "/dashboard",
                icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
            },
            {
                name: "Create Account",
                short_name: "Sign Up",
                description: "Register a new Cleft account",
                url: "/register",
                icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
            },
        ],
    };
}