import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tipsy Taboo",
    short_name: "Tipsy Taboo",
    description:
      "Say anything. Except that. The word game where the obvious clues are banned — one phone, thousands of cards.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f6fb",
    theme_color: "#f7f6fb",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
