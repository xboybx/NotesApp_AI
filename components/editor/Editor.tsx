// ============================================================
// components/editor/Editor.tsx
// The Notion-style rich text editor powered by BlockNote.
//
// BlockNote gives us:
//   - Slash commands ("/heading", "/bullet", "/code" etc.)
//   - Drag-and-drop blocks
//   - Real-time editing with a clean, Notion-like UI
//
// HOW AUTO-SAVE WORKS:
//   User types → onChange fires → debounce waits 1.5s of silence
//   → onSave(blocks) is called → parent saves to MongoDB via API
//
// The "blocks" are BlockNote's internal JSON format:
//   [{ id, type: "paragraph", content: [{text: "Hello"}] }, ...]
// We store this JSON directly in MongoDB's content field.
// ============================================================

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";

// BlockNote requires its own CSS for the editor UI
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

import type { Block } from "@blocknote/core";

// Expose these methods to the parent via ref
export interface EditorRef {
    insertContent: (content: string) => void;
}

interface EditorProps {
    // Initial content from MongoDB (array of BlockNote JSON blocks)
    initialContent?: Block[];

    // Called on every change (debounced) — parent saves to DB
    onSave: (blocks: Block[]) => void;

    // Optional: called immediately on every change (useful for AI tracking)
    onChange?: (blocks: Block[]) => void;

    // Whether the editor is in read-only mode
    editable?: boolean;
}

export const Editor = forwardRef<EditorRef, EditorProps>(({
    initialContent,
    onSave,
    onChange,
    editable = true,
}, ref) => {
    const { resolvedTheme } = useTheme();

    // Debounce timer ref — we clear + reset this on every keystroke
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // useCreateBlockNote: initializes the BlockNote editor instance.
    const editor = useCreateBlockNote({
        initialContent:
            initialContent && initialContent.length > 0
                ? initialContent
                : undefined,
    });

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        insertContent: (content: string) => {
            if (!editor) return;

            // Split content by newlines to create multiple paragraph blocks
            const paragraphs = content.split("\n\n").filter(p => p.trim());

            const blocksToInsert = paragraphs.map(p => ({
                type: "paragraph",
                content: p
            }));

            // Insert after the current cursor position
            editor.insertBlocks(
                blocksToInsert as any,
                editor.getTextCursorPosition().block,
                "after"
            );
        }
    }));

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, []);

    // Handle every editor change
    function handleChange() {
        // 1. Get current blocks
        const blocks = editor.document as Block[];

        // 2. Call immediate onChange if provided
        onChange?.(blocks);

        // 3. Debounced auto-save
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = setTimeout(() => {
            onSave(blocks);
        }, 1500);
    }

    return (
        <div className="w-full min-h-[500px]">
            <BlockNoteView
                editor={editor}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                onChange={handleChange}
                editable={editable}
            />
        </div>
    );
});

Editor.displayName = "Editor";
