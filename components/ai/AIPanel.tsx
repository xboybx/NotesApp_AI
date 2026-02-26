// ============================================================
// components/ai/AIPanel.tsx
// Floating AI panel that shows results from AI operations.
//
// This panel appears when the user triggers any AI feature
// (Summarize, Improve, Tags). It shows:
//   - Loading state while AI is processing
//   - The AI result when done
//   - Action buttons (Accept, Copy, Dismiss)
//
// The panel is a Card that floats in the editor area.
// ============================================================

"use client";

import { useState } from "react";
import {
    Sparkles,
    X,
    Copy,
    Check,
    Loader2,
    ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// What type of AI result are we showing?
type AIResultType = "summary" | "improve" | "tags" | null;

interface AIPanelProps {
    // What type of result to display
    type: AIResultType;

    // The AI result — string for summary/improve, string[] for tags
    result: string | string[] | null;

    // Is the AI still processing?
    isLoading: boolean;

    // Callback when user clicks "Accept" (apply the AI result)
    onAccept?: (result: string | string[]) => void;

    // Callback when user dismisses the panel
    onDismiss: () => void;
}

export function AIPanel({
    type,
    result,
    isLoading,
    onAccept,
    onDismiss,
}: AIPanelProps) {
    const [copied, setCopied] = useState(false);

    // If there's nothing to show, don't render
    if (!type && !isLoading) return null;

    // Copy the result text to clipboard
    async function handleCopy() {
        if (!result) return;

        const textToCopy = Array.isArray(result) ? result.join(", ") : result;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    }

    // Get the title based on the AI feature type
    function getTitle() {
        switch (type) {
            case "summary":
                return "✨ AI Summary";
            case "improve":
                return "✨ Improved Text";
            case "tags":
                return "🏷️ Generated Tags";
            default:
                return "✨ AI Result";
        }
    }

    return (
        <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {getTitle()}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onDismiss}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {/* Loading state */}
                {isLoading ? (
                    <div className="flex items-center gap-3 py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                            AI is thinking...
                        </span>
                    </div>
                ) : result ? (
                    <div className="space-y-3">
                        {/* Result display */}
                        <div className="max-h-[300px] overflow-y-auto pr-2">
                            {type === "tags" && Array.isArray(result) ? (
                                // Tags: show as badge chips
                                <div className="flex flex-wrap gap-2">
                                    {result.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                // Summary or Improve: show as scrollable text
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {result as string}
                                </p>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t">
                            {onAccept && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => onAccept(result)}
                                    className="gap-1"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Accept
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="gap-1"
                            >
                                {copied ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                                {copied ? "Copied" : "Copy"}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDismiss}
                                className="ml-auto text-muted-foreground"
                            >
                                Dismiss
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No result yet.</p>
                )}
            </CardContent>
        </Card>
    );
}
