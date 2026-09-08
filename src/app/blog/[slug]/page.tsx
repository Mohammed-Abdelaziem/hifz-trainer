import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { getPostBySlug, getAllSlugs } from "@/lib/blog/posts";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://whollyquran.me/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      tags: post.keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarkdown(content: string): string {
  let html = escapeHtml(content);

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="mt-6 mb-2 text-lg font-semibold">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="mt-8 mb-3 text-xl font-bold">$1</h2>');

  // Bold and italic (must escape after to avoid conflicts)
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Blockquote
  html = html.replace(
    /^&gt; (.+)$/gm,
    '<blockquote class="border-l-4 border-amber-400 pl-4 italic text-stone-600 dark:text-stone-300">$1</blockquote>'
  );

  // Tables — wrap in <table>
  html = html.replace(
    /((?:^\|.+\|$\n?)+)/gm,
    (block) => {
      const rows = block.trim().split("\n");
      const bodyRows = rows.filter((r) => !r.match(/^\|[\s-|]+$/));
      if (bodyRows.length === 0) return "";
      const trs = bodyRows
        .map((row) => {
          const cells = row
            .split("|")
            .filter((c) => c.trim())
            .map((c) => c.trim());
          return `<tr>${cells.map((c) => `<td class="border border-stone-200 px-3 py-1.5 dark:border-stone-700">${c}</td>`).join("")}</tr>`;
        })
        .join("\n");
      return `<table class="my-4 w-full border-collapse">${trs}</table>`;
    }
  );

  // Ordered lists — wrap consecutive li in ol
  html = html.replace(
    /((?:^<li class="ml-4 list-decimal">.*<\/li>\n?)+)/gm,
    (block) => `<ol class="my-2 ml-6 list-decimal space-y-1">${block.trim()}</ol>`
  );

  // Unordered lists — wrap consecutive li in ul
  html = html.replace(
    /((?:^<li class="ml-4 list-disc">.*<\/li>\n?)+)/gm,
    (block) => `<ul class="my-2 ml-6 list-disc space-y-1">${block.trim()}</ul>`
  );

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr class="my-6 border-stone-200 dark:border-stone-700" />');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">');
  html = html.replace(/\n/g, "<br />");

  return html;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Organization",
      name: "Wholly Quran",
      url: "https://whollyquran.me",
    },
    publisher: {
      "@type": "Organization",
      name: "Wholly Quran",
      url: "https://whollyquran.me",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://whollyquran.me/blog/${post.slug}`,
    },
    keywords: post.keywords.join(", "),
  };

  const htmlContent = renderMarkdown(post.content);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Blog
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-lg text-stone-500 dark:text-stone-400">
            {post.description}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-stone-400 dark:text-stone-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>
        </header>

        <div
          className="prose prose-stone max-w-none text-base dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <div className="mt-12 rounded-xl border border-stone-200 bg-stone-50 p-6 text-center dark:border-stone-800 dark:bg-stone-900">
          <p className="text-lg font-semibold">Ready to start memorizing?</p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Wholly Quran uses spaced repetition to help you memorize the Quran efficiently.
          </p>
          <Link
            href="/quran"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            Start Reading →
          </Link>
        </div>
      </article>
    </>
  );
}
