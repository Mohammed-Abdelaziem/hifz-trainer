import { describe, expect, it } from "vitest";
import { BLOG_POSTS, getPostBySlug, getAllSlugs } from "@/lib/blog/posts";

// The loader reads content/blog/*.md off disk (vitest runs from the repo
// root), so these assertions double as a CI check that the markdown + the
// frontmatter parser stay in step.
describe("blog posts loader", () => {
  it("lists every markdown post in weight order", () => {
    expect(getAllSlugs()).toEqual([
      "how-to-memorize-quran-fast",
      "tajweed-rules-beginners-guide",
      "best-quran-memorization-apps-2026",
    ]);
  });

  it("parses scalar and list frontmatter", () => {
    const post = getPostBySlug("how-to-memorize-quran-fast");
    expect(post?.title).toBe("How to Memorize the Quran Fast: A Complete Guide");
    expect(post?.description).toMatch(/^Learn proven techniques/);
    expect(post?.publishedAt).toBe("2026-09-08");
    expect(post?.readingTime).toBe("8 min");
    expect(post?.keywords).toContain("hifz tips");
    expect(post?.keywords).toHaveLength(5);
    expect(post?.updatedAt).toBeUndefined();
  });

  it("keeps the markdown body intact (headings, tables, lists)", () => {
    const post = getPostBySlug("how-to-memorize-quran-fast");
    expect(post?.content).toMatch(/^## Why Memorize the Quran\?$/m);
    expect(post?.content).toContain("| Time | Activity |");
    expect(post?.content).toContain("1. **Memorizing too much at once**");

    const comparison = getPostBySlug("best-quran-memorization-apps-2026");
    expect(comparison?.content).toContain("| Feature | Wholly Quran | Quran.com | Tarteel AI |");
  });

  it("splits frontmatter from the body without leaking metadata lines", () => {
    const post = getPostBySlug("tajweed-rules-beginners-guide");
    expect(post?.content).toMatch(/^## What is Tajweed\?$/m);
    expect(post?.content).not.toContain("readingTime:");
    expect(post?.content).not.toContain("keywords:");
  });

  it("rehydrates BLOG_POSTS consistently from the same files", () => {
    expect(BLOG_POSTS.map((p) => p.slug)).toEqual(getAllSlugs());
  });
});
