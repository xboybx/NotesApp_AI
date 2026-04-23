// ============================================================
// lib/hono/routes/upload.routes.ts
// Handles file uploads for the editor (images, etc.)
// ============================================================

import { Hono } from "hono";
import { authMiddleware } from "@/lib/hono/middlewares/auth.middleware";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const uploadRoutes = new Hono();

// Protect all upload routes
uploadRoutes.use("*", authMiddleware);

uploadRoutes.post("/image", async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body["file"];

        if (!(file instanceof File)) {
            return c.json({ success: false, error: "No file uploaded" }, 400);
        }

        // 1. Ensure public/uploads exists
        const uploadDir = join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // 2. Create a unique filename
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const filePath = join(uploadDir, filename);

        // 3. Save the file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // 4. Return the public URL
        const url = `/uploads/${filename}`;
        
        return c.json({ 
            success: true, 
            data: { url } 
        });
    } catch (error) {
        console.error("Upload error:", error);
        return c.json({ success: false, error: "Failed to upload image" }, 500);
    }
});

export default uploadRoutes;
