// ============================================================
// lib/hono/routes/pages.routes.ts
// All API routes for pages (our "notes").
//
// Every route here is PROTECTED — the authMiddleware runs first
// and attaches the logged-in user to the Hono context.
// Routes can then access the user via c.get("user").
//
// Routes:
//   GET    /pages          → list all pages (sidebar data)
//   POST   /pages          → create a new blank page
//   GET    /pages/search   → search pages by title
//   GET    /pages/:id      → get a single page (full content)
//   PATCH  /pages/:id      → update a page (title, content, tags etc.)
//   PATCH  /pages/:id/favorite → toggle favorite
//   PATCH  /pages/:id/archive  → move to/from trash
//   DELETE /pages/:id      → permanently delete a page
// ============================================================

import { Hono } from "hono";
import connectDB from "@/lib/db/mongodb";
import Page from "@/lib/db/page.model";
import { authMiddleware } from "@/lib/hono/middlewares/auth.middleware";
import {
    createPageSchema,
} from "@/lib/validations/page.schema";

// Hono context type — tells TypeScript what's in c.get()
type HonoEnv = {
    Variables: {
        user: { id: string; name: string; email: string };
        session: Record<string, unknown>;
    };
};

// Create a new Hono router for pages.
// This will be mounted on the main app as app.route("/pages", pagesRoutes)
const pagesRoutes = new Hono<HonoEnv>();

// Apply authMiddleware to ALL routes in this router.
// This means every route below requires the user to be logged in.
pagesRoutes.use("*", authMiddleware);

// ---------------------------------------------------------------
// GET /pages — List all pages for the current user
// ---------------------------------------------------------------
// Used by the Sidebar to show the list of pages.
// Returns only metadata (title, icon, favorite, date) — NOT content.
// This keeps the response small and fast.
pagesRoutes.get("/", async (c) => {
    try {
        await connectDB();

        // c.get("user") was set by authMiddleware after verifying the session
        const user = c.get("user");

        // Find all non-archived pages owned by this user
        // .select() picks only the fields we need for the sidebar list
        // .sort() orders by updatedAt descending (newest first)
        // .lean() returns plain JS objects instead of Mongoose documents (faster)
        const pages = await Page.find({
            userId: user.id,
            isArchived: false,
        })
            .select("title icon isFavorite isArchived updatedAt createdAt")
            .sort({ updatedAt: -1 })
            .lean();

        return c.json({ success: true, data: pages });
    } catch (error) {
        console.error("Error fetching pages:", error);
        return c.json({ success: false, error: "Failed to fetch pages" }, 500);
    }
});

// ---------------------------------------------------------------
// POST /pages — Create a new page
// ---------------------------------------------------------------
// Called when user clicks "+ New Page" in the sidebar.
// Creates a page with default title "Untitled" and empty content.
// Returns the new page so the frontend can redirect to /pages/[id].
pagesRoutes.post("/", async (c) => {
    try {
        await connectDB();
        const user = c.get("user");

        // Manually extract fields (avoids Zod version conflict from BlockNote)
        const body = await c.req.json();
        const title = typeof body.title === "string" ? body.title : "Untitled";
        const icon = typeof body.icon === "string" ? body.icon : null;

        // Create the new page document in MongoDB
        const page = await Page.create({
            userId: user.id,
            title,
            icon,
            content: [],
            tags: [],
            isFavorite: false,
            isArchived: false,
        });

        return c.json({ success: true, data: page }, 201); // 201 = Created
    } catch (error) {
        console.error("Error creating page:", error);
        return c.json({ success: false, error: "Failed to create page" }, 500);
    }
});

// ---------------------------------------------------------------
// GET /pages/search?q=keyword — Search pages by title
// ---------------------------------------------------------------
// Used by the search bar / Cmd+K modal.
// Searches title using a case-insensitive regex.
pagesRoutes.get("/search", async (c) => {
    try {
        await connectDB();
        const user = c.get("user");

        // c.req.query("q") reads the query parameter from the URL
        // Example: GET /api/pages/search?q=meeting → query = "meeting"
        const query = c.req.query("q") || "";

        if (!query.trim()) {
            return c.json({ success: true, data: [] });
        }

        // $regex: case-insensitive search on the title field
        // "i" flag means case-insensitive (matches "Meeting" and "meeting")
        const pages = await Page.find({
            userId: user.id,
            isArchived: false,
            title: { $regex: query, $options: "i" },
        })
            .select("title icon isFavorite updatedAt")
            .sort({ updatedAt: -1 })
            .limit(20) // max 20 results for search
            .lean();

        return c.json({ success: true, data: pages });
    } catch (error) {
        console.error("Error searching pages:", error);
        return c.json({ success: false, error: "Failed to search pages" }, 500);
    }
});

// ---------------------------------------------------------------
// GET /pages/trash — Get archived (trashed) pages
// ---------------------------------------------------------------
pagesRoutes.get("/trash", async (c) => {
    try {
        await connectDB();
        const user = c.get("user");

        const pages = await Page.find({
            userId: user.id,
            isArchived: true,
        })
            .select("title icon updatedAt")
            .sort({ updatedAt: -1 })
            .lean();

        return c.json({ success: true, data: pages });
    } catch (error) {
        console.error("Error fetching trash:", error);
        return c.json({ success: false, error: "Failed to fetch trash" }, 500);
    }
});

// ---------------------------------------------------------------
// GET /pages/:id — Get a single page with FULL content
// ---------------------------------------------------------------
// Called when user opens a page in the editor.
// Returns everything including the BlockNote JSON content array.
pagesRoutes.get("/:id", async (c) => {
    try {
        await connectDB();
        const user = c.get("user");
        const pageId = c.req.param("id"); // extract :id from URL

        const page = await Page.findOne({
            _id: pageId,
            userId: user.id, // ensure user can only access their own pages
        }).lean();

        if (!page) {
            return c.json({ success: false, error: "Page not found" }, 404);
        }

        return c.json({ success: true, data: page });
    } catch (error) {
        console.error("Error fetching page:", error);
        return c.json({ success: false, error: "Failed to fetch page" }, 500);
    }
});

// ---------------------------------------------------------------
// PATCH /pages/:id — Update a page
// ---------------------------------------------------------------
// Called by the auto-save in the editor (on every content change).
// Also called when user changes title, icon, or manually saves.
pagesRoutes.patch("/:id", async (c) => {
    try {
        await connectDB();
        const user = c.get("user");
        const pageId = c.req.param("id");

        // Manually whitelist allowed fields instead of Zod.parse()
        // (avoids Zod version conflict introduced by BlockNote packages)

        // 1. Grab everything the frontend sent us
        const body = await c.req.json();

        // 2. SECURITY CHECK: The "Whitelist"
        const allowedFields = ["title", "icon", "coverImage", "content", "tags", "summary"];
        const validatedData: Record<string, unknown> = {};

        // We carefully loop through what the user sent. 
        for (const key of allowedFields) {
            if (key in body) validatedData[key] = body[key];
        }
        if (Object.keys(validatedData).length === 0) {
            return c.json({ success: false, error: "No valid fields to update" }, 400);
        }

        // findOneAndUpdate: finds the document AND updates it in one operation.
        // { new: true } means "return the updated document, not the old one."
        // We also check userId to prevent users from editing someone else's pages.
        const page = await Page.findOneAndUpdate(
            { _id: pageId, userId: user.id },
            { $set: validatedData },
            { new: true }
        ).lean();

        if (!page) {
            return c.json({ success: false, error: "Page not found" }, 404);
        }

        return c.json({ success: true, data: page });
    } catch (error) {
        console.error("Error updating page:", error);
        return c.json({ success: false, error: "Failed to update page" }, 500);
    }
});

// ---------------------------------------------------------------
// PATCH /pages/:id/favorite — Toggle favorite status
// ---------------------------------------------------------------
pagesRoutes.patch("/:id/favorite", async (c) => {
    try {
        await connectDB();
        const user = c.get("user");
        const pageId = c.req.param("id");

        // First, get the current page to read its current isFavorite value
        const existingPage = await Page.findOne({
            _id: pageId,
            userId: user.id,
        });

        if (!existingPage) {
            return c.json({ success: false, error: "Page not found" }, 404);
        }

        // Toggle: if it was true → make false, if false → make true
        existingPage.isFavorite = !existingPage.isFavorite;
        await existingPage.save();

        return c.json({
            success: true,
            data: { isFavorite: existingPage.isFavorite },
        });
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return c.json(
            { success: false, error: "Failed to toggle favorite" },
            500
        );
    }
});

// ---------------------------------------------------------------
// PATCH /pages/:id/archive — Move to / restore from trash
// ---------------------------------------------------------------
pagesRoutes.patch("/:id/archive", async (c) => {
    try {
        await connectDB();
        const user = c.get("user");
        const pageId = c.req.param("id");

        const existingPage = await Page.findOne({
            _id: pageId,
            userId: user.id,
        });

        if (!existingPage) {
            return c.json({ success: false, error: "Page not found" }, 404);
        }

        // Toggle archived status
        existingPage.isArchived = !existingPage.isArchived;

        // If archiving, also unfavorite it (can't be trash + favorite)
        if (existingPage.isArchived) {
            existingPage.isFavorite = false;
        }

        await existingPage.save();

        return c.json({
            success: true,
            data: { isArchived: existingPage.isArchived },
        });
    } catch (error) {
        console.error("Error archiving page:", error);
        return c.json({ success: false, error: "Failed to archive page" }, 500);
    }
});

// ---------------------------------------------------------------
// DELETE /pages/:id — Permanently delete a page
// ---------------------------------------------------------------
// This is a HARD delete — the document is removed from MongoDB forever.
pagesRoutes.delete("/:id", async (c) => {
    try {
        await connectDB();
        const user = c.get("user");
        const pageId = c.req.param("id");

        const result = await Page.findOneAndDelete({
            _id: pageId,
            userId: user.id, // only delete YOUR OWN pages
        });

        if (!result) {
            return c.json({ success: false, error: "Page not found" }, 404);
        }

        return c.json({ success: true, message: "Page deleted permanently" });
    } catch (error) {
        console.error("Error deleting page:", error);
        return c.json({ success: false, error: "Failed to delete page" }, 500);
    }
});

export default pagesRoutes;
