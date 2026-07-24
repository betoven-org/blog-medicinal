"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { applyPatch, type Operation } from "fast-json-patch";
import { SectionRenderer } from "./SectionRenderer";
import type { SectionBlock } from "@/lib/cms";

type Props = {
  initialBlocks: SectionBlock[];
};

/**
 * LivePreviewWrapper — wraps SectionRenderer and listens for
 * `brasa:live-update` messages from the CMS editor.
 *
 * When the editor sends JSON Patch operations, this component applies
 * them to the sections array and re-renders instantly — no iframe reload.
 */
export function LivePreviewWrapper({ initialBlocks }: Props) {
  const [blocks, setBlocks] = useState<SectionBlock[]>(initialBlocks);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const handleMessage = useCallback((event: MessageEvent) => {
    const msg = event.data;
    if (!msg || typeof msg.type !== "string") return;

    switch (msg.type) {
      case "brasa:live-update": {
        const { patches, blocks: fullBlocks } = msg as {
          patches: Operation[];
          blocks: SectionBlock[];
        };

        if (patches && patches.length > 0) {
          try {
            // Apply JSON Patch to current state for instant update
            const cloned = structuredClone(blocksRef.current);
            const result = applyPatch(cloned, patches);
            setBlocks(result.newDocument);
          } catch {
            // Fallback: use full blocks if patch fails
            if (fullBlocks) setBlocks(fullBlocks);
          }
        } else if (fullBlocks) {
          setBlocks(fullBlocks);
        }
        break;
      }

      case "brasa:sections-update": {
        // Legacy full-replace fallback
        const { blocks: newBlocks } = msg as { blocks: SectionBlock[] };
        if (newBlocks) setBlocks(newBlocks);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // Sync with new server data on navigation
  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  return <SectionRenderer blocks={blocks} />;
}
