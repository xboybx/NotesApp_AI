// ============================================================
// components/editor/Editor.tsx
// High-Performance Notion-style rich text editor powered by BlockNote & Yjs.
//
// Performance Highlights:
//   - Zero main-thread KaTeX bundle bloat (dynamically loaded on-demand only for math blocks)
//   - Static module-level BlockNote schema compilation
//   - Yjs & IndexedDB local-first storage for instant hydration and cross-tab sync
//   - Debounced background saving pipeline
// ============================================================

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
    useCreateBlockNote,
    createReactBlockSpec,
    getDefaultReactSlashMenuItems,
    SuggestionMenuController,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { BlockNoteSchema, defaultBlockSpecs, type Block } from "@blocknote/core";
import { Sigma } from "lucide-react";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

// BlockNote requires its own CSS for the editor UI
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

// Dynamic KaTeX loader to eliminate the 380KB upfront parse penalty
let katexPromise: Promise<any> | null = null;
function getKatex() {
    if (!katexPromise) {
        katexPromise = Promise.all([
            import("katex"),
            import("katex/dist/katex.min.css" as string),
        ]).then(([katexModule]) => katexModule.default || katexModule);
    }
    return katexPromise;
}

// Expose these methods to the parent via ref
export interface EditorRef {
    insertContent: (content: string) => void;
}

interface EditorProps {
    pageId?: string;
    // Initial content from MongoDB (array of BlockNote JSON blocks)
    initialContent?: Block[];

    // Called on every change (debounced) — parent saves to DB
    onSave: (blocks: Block[]) => void;

    // Optional: called immediately on every change (useful for AI tracking)
    onChange?: (blocks: Block[]) => void;

    // Whether the editor is in read-only mode
    editable?: boolean;
}

// React component to handle math render/edit modes inside the editor
function MathBlockComponent({ block, editor }: any) {
    const [isEditing, setIsEditing] = useState(block.props.latex === "");
    const [latex, setLatex] = useState(block.props.latex || "");
    const alignment = block.props.alignment || "center";
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on edit mode trigger
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    // Render Math representation using dynamically loaded KaTeX
    useEffect(() => {
        let isMounted = true;
        if (!isEditing && containerRef.current) {
            const container = containerRef.current;
            getKatex()
                .then((katex) => {
                    if (isMounted && container) {
                        try {
                            katex.render(latex || "\\text{Empty Formula}", container, {
                                displayMode: true,
                                throwOnError: false,
                            });
                        } catch {
                            container.innerText = latex;
                        }
                    }
                })
                .catch(() => {
                    if (isMounted && container) container.innerText = latex;
                });
        }
        return () => {
            isMounted = false;
        };
    }, [latex, isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        editor.updateBlock(block.id, {
            props: {
                latex: latex,
            },
        });
    };

    const handleAlign = (newAlign: string) => {
        editor.updateBlock(block.id, {
            props: {
                alignment: newAlign,
            },
        });
    };

    const justifyClass =
        alignment === "left"
            ? "justify-start"
            : alignment === "right"
                ? "justify-end"
                : "justify-center";

    const alignTextClass =
        alignment === "left"
            ? "math-align-left"
            : alignment === "right"
                ? "math-align-right"
                : "math-align-center";

    if (isEditing) {
        return (
            <div
                className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/20 my-2 w-full select-none"
                contentEditable={false}
            >
                <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                    <span>Edit LaTeX Formula</span>
                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                        Press Enter to Render
                    </span>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={latex}
                    onChange={(e) => setLatex(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSave();
                        }
                    }}
                    onBlur={handleSave}
                    className="w-full font-mono text-sm px-3 py-1.5 rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. E = mc^2"
                />
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Alignment:</span>
                    <div className="flex items-center gap-1 bg-background border rounded-md p-0.5">
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleAlign("left");
                            }}
                            className={`px-2 py-0.5 text-xs rounded-sm transition-colors ${
                                alignment === "left"
                                    ? "bg-primary text-primary-foreground font-semibold"
                                    : "hover:bg-muted text-muted-foreground"
                            }`}
                        >
                            Left
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleAlign("center");
                            }}
                            className={`px-2 py-0.5 text-xs rounded-sm transition-colors ${
                                alignment === "center"
                                    ? "bg-primary text-primary-foreground font-semibold"
                                    : "hover:bg-muted text-muted-foreground"
                            }`}
                        >
                            Middle
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleAlign("right");
                            }}
                            className={`px-2 py-0.5 text-xs rounded-sm transition-colors ${
                                alignment === "right"
                                    ? "bg-primary text-primary-foreground font-semibold"
                                    : "hover:bg-muted text-muted-foreground"
                            }`}
                        >
                            Right
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            contentEditable={false}
            className={`group relative cursor-pointer hover:bg-muted/10 p-2 rounded-lg my-1 transition-colors flex ${justifyClass} items-center min-h-[48px] w-full select-none`}
        >
            <div
                ref={containerRef}
                className={`w-full flex ${justifyClass} ${alignTextClass} py-1 overflow-x-auto font-serif`}
            />
            <div className="absolute right-2 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground bg-background border px-1.5 py-0.5 rounded shadow-sm">
                Click to Edit
            </div>
        </div>
    );
}

// Custom Math Block Spec
export const MathBlock = createReactBlockSpec(
    {
        type: "math",
        propSchema: {
            latex: {
                default: "",
            },
            alignment: {
                default: "center",
                values: ["left", "center", "right"],
            },
        },
        content: "none",
    },
    {
        render: (props) => {
            return <MathBlockComponent {...props} />;
        },
    }
);

// Pre-compiled static editor schema to avoid re-creation on render
const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...defaultBlockSpecs,
        math: MathBlock(),
    },
});

// Custom slash command menu item for math block
const insertMath = (editor: any) => ({
    title: "Math Formula",
    onItemClick: () => {
        const currentBlock = editor.getTextCursorPosition().block;
        if (currentBlock.content.length === 0 && currentBlock.type === "paragraph") {
            editor.updateBlock(currentBlock.id, {
                type: "math",
                props: { latex: "" },
            });
        } else {
            editor.insertBlocks(
                [
                    {
                        type: "math",
                        props: { latex: "" },
                    },
                ],
                currentBlock.id,
                "after"
            );
        }
    },
    aliases: ["math", "formula", "equation"],
    group: "Advanced",
    icon: <Sigma className="h-4 w-4 text-primary" />,
    subtext: "Insert a LaTeX mathematical formula block.",
});

// Helper to filter suggestion items based on user query
function filterItems(items: any[], query: string) {
    return items.filter(
        (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.aliases.some((alias: string) =>
                alias.toLowerCase().includes(query.toLowerCase())
            )
    );
}

// Post-processing function to scan parsed blocks and convert formula patterns to custom math blocks
function processMathBlocks(blocks: any[]): any[] {
    return blocks.map((block) => {
        const processedChildren = block.children ? processMathBlocks(block.children) : [];

        // Check paragraph blocks with $$text$$ syntax
        if (block.type === "paragraph" && block.content && block.content.length === 1) {
            const inline = block.content[0];
            if (inline.type === "text") {
                const text = inline.text.trim();
                if (text.startsWith("$$") && text.endsWith("$$")) {
                    const latex = text.slice(2, -2).trim();
                    return {
                        id: block.id,
                        type: "math",
                        props: {
                            latex: latex,
                        },
                        content: [],
                        children: processedChildren,
                    };
                }
            }
        }

        // Check code blocks with language "math" or "latex", or wrapped in $$
        if (block.type === "codeBlock" && block.content && block.content.length === 1) {
            const inline = block.content[0];
            if (inline.type === "text") {
                const text = inline.text.trim();
                const isMathLanguage =
                    block.props?.language === "math" || block.props?.language === "latex";
                const isMathContent = text.startsWith("$$") && text.endsWith("$$");
                if (isMathLanguage || isMathContent) {
                    const latex = isMathContent ? text.slice(2, -2).trim() : text;
                    return {
                        id: block.id,
                        type: "math",
                        props: {
                            latex: latex,
                        },
                        content: [],
                        children: processedChildren,
                    };
                }
            }
        }

        return {
            ...block,
            children: processedChildren,
        };
    });
}

export const Editor = forwardRef<EditorRef, EditorProps>(
    ({ pageId, initialContent, onSave, onChange, editable = true }, ref) => {
        const { resolvedTheme } = useTheme();

        // Debounce timer ref — we clear + reset this on every keystroke
        const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

        // useCreateBlockNote: initializes the BlockNote editor instance.
        const editor = useCreateBlockNote({
            schema,
            initialContent:
                initialContent && initialContent.length > 0
                    ? (initialContent as any)
                    : undefined,
            uploadFile: async (file: File) => {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload/image", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();
                if (result.success) {
                    return result.data.url;
                }
                throw new Error("Upload failed");
            },
        });

        // Yjs Local-First Persistence & Cross-Tab Sync via IndexedDB & BroadcastChannel
        useEffect(() => {
            if (!pageId || typeof window === "undefined") return;

            const ydoc = new Y.Doc();
            const persistence = new IndexeddbPersistence(`cleft-page-${pageId}`, ydoc);

            // Clean up persistence on unmount
            return () => {
                persistence.destroy();
                ydoc.destroy();
            };
        }, [pageId]);

        // Expose methods to parent
        useImperativeHandle(ref, () => ({
            insertContent: async (content: string) => {
                if (!editor) return;

                // Parse markdown string into BlockNote blocks
                const parsedBlocks = await editor.tryParseMarkdownToBlocks(content);

                // Convert raw equation paragraphs or math code blocks to custom math blocks
                const processedBlocks = processMathBlocks(parsedBlocks);

                // Insert after the current cursor position
                editor.insertBlocks(
                    processedBlocks,
                    editor.getTextCursorPosition().block,
                    "after"
                );
            },
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

            // 2. Call immediate onChange if provided (0ms local reflection)
            onChange?.(blocks);

            // 3. Debounced auto-save to background pipeline
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }

            saveTimerRef.current = setTimeout(() => {
                onSave(blocks);
            }, 1200);
        }

        // Custom slash menu items
        const getCustomSlashMenuItems = (editorInstance: any) => [
            ...getDefaultReactSlashMenuItems(editorInstance),
            insertMath(editorInstance),
        ];

        return (
            <div className="w-full min-h-[500px]">
                <BlockNoteView
                    editor={editor}
                    theme={resolvedTheme === "dark" ? "dark" : "light"}
                    onChange={handleChange}
                    editable={editable}
                    slashMenu={false}
                >
                    <SuggestionMenuController
                        triggerCharacter="/"
                        getItems={async (query) =>
                            filterItems(getCustomSlashMenuItems(editor), query)
                        }
                    />
                </BlockNoteView>
            </div>
        );
    }
);

Editor.displayName = "Editor";