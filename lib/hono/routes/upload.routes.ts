// ============================================================
// lib/hono/routes/upload.routes.ts
// Handles file uploads for the editor (images, etc.) using ImageKit.io
// ============================================================

import { Hono } from "hono";
import { authMiddleware } from "@/lib/hono/middlewares/auth.middleware";
import ImageKit from "imagekit";

// Initialize ImageKit with environment variables
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

const uploadRoutes = new Hono();

// Protect all upload routes
uploadRoutes.use("*", authMiddleware);

uploadRoutes.post("/image", async (c) => {
    try {
        console.log("Received upload request (ImageKit)");

        const body = await c.req.parseBody();
        const file = body["file"];

        if (!(file instanceof File)) {
            console.error("Invalid file:", file);
            return c.json({ success: false, error: "No file uploaded or invalid file" }, 400);
        }

        console.log("File received:", file.name, file.size, file.type);

        // Convert File to buffer for ImageKit upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to ImageKit
        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: `${Date.now()}-${file.name.replace(/\s+/g, "-")}`,
            folder: "/notes-app" // Organize uploads in a specific folder
        });

        console.log("ImageKit upload successful:", uploadResponse.url);

        return c.json({
            success: true,
            data: { url: uploadResponse.url }
        });
    } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error details:", errorMessage);
        return c.json({ success: false, error: `Failed to upload image: ${errorMessage}` }, 500);
    }
});

// Optional: Add endpoint to delete images from ImageKit
uploadRoutes.delete("/:fileId", async (c) => {
    try {
        const fileId = c.req.param("fileId");
        await imagekit.deleteFile(fileId);
        return c.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        return c.json({ success: false, error: "Failed to delete file" }, 500);
    }
});

export default uploadRoutes;