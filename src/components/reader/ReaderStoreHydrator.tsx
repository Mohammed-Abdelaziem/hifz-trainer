"use client";

import { useEffect } from "react";
import { useReaderStore } from "@/stores/reader-store";

export function ReaderStoreHydrator() {
  useEffect(() => {
    useReaderStore.persist.rehydrate();
  }, []);
  return null;
}
