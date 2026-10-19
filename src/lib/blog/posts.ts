import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
  keywords: string[];
  readingTime: string;
}

interface ParsedPost extends BlogPost {
  /** Listing order (frontmatter `weight: 1` = first). Never surfaced to pages. */
  weight: number;
}

/**
 * Posts live as plain markdown with frontmatter in content/blog/, so future
 * posts are content PRs instead of TypeScript edits. Everything below parses
 * at import time — the blog pages and sitemap consume the same sync API as
 * before (BLOG_POSTS, getPostBySlug, getAllSlugs).
 *
 * The directory must be shipped to the server: next.config.ts declares it in
 * outputFileTracingIncludes, because serverless file tracing cannot know a
 * readdirSync() will look there at request time.
 */
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseMarkdown(markdown: string, slug: string): ParsedPost {
  const split = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(markdown);
  if (!split) {
    throw new Error(`content/blog/${slug}.md is missing its frontmatter block`);
  }

  const meta: Record<string, string> = {};
  const lists: Record<string, string[]> = {};
  let lastListKey: string | null = null;

  for (const rawLine of split[1].split(/\r?\n/)) {
    if (!rawLine.trim()) continue;

    const listItem = /^\s+-\s+(.+)$/.exec(rawLine);
    if (listItem && lastListKey) {
      (lists[lastListKey] ??= []).push(unquote(listItem[1]));
      continue;
    }

    const kv = /^([A-Za-z-]+):\s*(.*)$/.exec(rawLine.trim());
    if (!kv) continue;
    if (kv[2]) {
      meta[kv[1]] = unquote(kv[2]);
      lastListKey = null;
    } else {
      lastListKey = kv[1];
    }
  }

  const title = meta.title;
  const description = meta.description;
  const publishedAt = meta.publishedAt;
  const readingTime = meta.readingTime;
  if (!title || !description || !publishedAt || !readingTime) {
    throw new Error(
      `content/blog/${slug}.md needs a title, description, publishedAt, and readingTime`
    );
  }

  return {
    slug,
    title,
    description,
    content: split[2].trim(),
    publishedAt,
    updatedAt: meta.updatedAt,
    keywords: lists.keywords ?? [],
    readingTime,
    weight: meta.weight ? Number(meta.weight) : Number.POSITIVE_INFINITY,
  };
}

function loadPosts(): BlogPost[] {
  try {
    return readdirSync(BLOG_DIR)
      .filter((file) => file.endsWith(".md"))
      .map((file) => ({
        parsed: parseMarkdown(readFileSync(path.join(BLOG_DIR, file), "utf8"), file.replace(/\.md$/, "")),
      }))
      // weight orders the listing (frontmatter, 1 = first); posts without one
      // sort last, then by slug, so new files cannot shuffle the lineup.
      .sort((a, b) => a.parsed.weight - b.parsed.weight || a.parsed.slug.localeCompare(b.parsed.slug))
      .map(({ parsed: { weight: _weight, ...post } }) => post);
  } catch (err) {
    // An empty blog here means the content directory did not make it onto
    // the server (usually an outputFileTracingIncludes gap in
    // next.config.ts). Dropping this error silently would silently take the
    // blog and sitemap down — surface it so builds catch the miss.
    console.warn("[blog] unable to read content/blog:", err);
    return [];
  }
}

export const BLOG_POSTS: BlogPost[] = loadPosts();

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
