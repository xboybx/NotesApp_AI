import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Cleft AI Notes",
        short_name: "Cleft Notes",
        description: "AI-powered notes and rich-text editing.",
        start_url: "/",
        display: "standalone",
        background_color: "#f4f4f4",
        theme_color: "#f4f4f4",
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}