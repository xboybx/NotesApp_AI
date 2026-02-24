// ============================================================
// lib/utils/blocknote-to-text.ts
// Converts BlockNote JSON blocks into plain text.
//
// WHY? OpenAI can't understand BlockNote's JSON format.
// It needs plain text. So before sending content to AI,
// we extract the text from the blocks.
//
// Example conversion:
//   BlockNote JSON:
//     [{ type: "heading", content: [{ text: "Hello" }] },
//      { type: "paragraph", content: [{ text: "World" }] }]
//
//   Plain text output:
//     "Hello\nWorld"
// ============================================================

// Each BlockNote block has this rough shape:
// {
//   type: "paragraph" | "heading" | "bulletListItem" | etc.,
//   content: [{ type: "text", text: "actual text here" }],
//   children: [ ...nested blocks... ]
// }

interface InlineContent {
    type: string;
    text?: string;
    content?: InlineContent[];
}

interface Block {
    type?: string;
    content?: InlineContent[];
    children?: Block[];
}

// ---- Extract text from a single inline content item ----
function extractInlineText(inline: InlineContent): string {
    if (inline.text) {
        return inline.text;
    }
    if (inline.content) {
        return inline.content.map(extractInlineText).join("");
    }
    return "";
}

// ---- Main function: extract all text from all blocks ----
export function extractTextFromBlocks(
    blocks: Record<string, unknown>[]
): string {
    if (!blocks || blocks.length === 0) {
        return "";
    }

    const lines: string[] = [];

    for (const block of blocks as Block[]) {
        // Extract text from this block's inline content
        if (block.content && Array.isArray(block.content)) {
            const lineText = block.content.map(extractInlineText).join("");
            if (lineText.trim()) {
                lines.push(lineText);
            }
        }

        // Recursively extract text from nested child blocks
        // (e.g., indented list items inside a list item)
        if (block.children && Array.isArray(block.children)) {
            const childText = extractTextFromBlocks(
                block.children as Record<string, unknown>[]
            );
            if (childText.trim()) {
                lines.push(childText);
            }
        }
    }

    return lines.join("\n");
}
