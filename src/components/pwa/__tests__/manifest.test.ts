import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
  "public"
);

interface ManifestIcon {
  src: string;
  sizes: string;
  type?: string;
  purpose?: string;
}

interface WebManifest {
  name: string;
  short_name: string;
  id?: string;
  start_url: string;
  scope: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: ManifestIcon[];
}

function loadManifest(): WebManifest {
  return JSON.parse(readFileSync(path.join(PUBLIC_DIR, "manifest.webmanifest"), "utf8")) as WebManifest;
}

describe("manifest.webmanifest installability", () => {
  const manifest = loadManifest();

  it("keeps the fields Chrome requires for the install prompt", () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.id).toBe("/");
  });

  it("declares hex colors (theme + splash background) for the platform UI", () => {
    expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(manifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("still offers the raster icons every installer wants", () => {
    const sized = (size: number, purpose: string) =>
      manifest.icons.some(
        (icon) =>
          icon.sizes.split(" ").includes(`${size}x${size}`) &&
          (icon.purpose ?? "any").split(" ").includes(purpose)
      );
    // 192px "any" covers modern Chrome; the 512px maskable covers Android's
    // adaptive-icon masking; iOS relies on the linked apple-touch-icon
    // instead and ignores the manifest entirely.
    expect(sized(512, "any")).toBe(true);
    expect(sized(512, "maskable")).toBe(true);
  });

  it("references icon files that actually exist in /public", () => {
    for (const icon of manifest.icons) {
      const file = path.join(PUBLIC_DIR, icon.src.replace(/^\//, ""));
      expect(() => readFileSync(file), `missing icon ${icon.src}`).not.toThrow();
    }
  });
});
