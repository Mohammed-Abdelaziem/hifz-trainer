"use client";

import { useLayoutEffect } from "react";
import { useReaderStore } from "@/stores/reader-store";

// useLayoutEffect: the rehydrate must finish before the rest of the tree's
// effects run, not merely before their paint. Reader descendants register
// scroll/highlight side-effects keyed off store state in their own effects;
// running those against the pre-rehydrate defaults first then flipping mid
// session reintroduced the exact clobber pattern this component exists to
// prevent. Being the FIRST child in the tree keeps it first here too.
export function ReaderStoreHydrator() {
  useLayoutEffect(() => {
    useReaderStore.persist.rehydrate();
  }, []);
  return null;
}
