import Link from "next/link";
import type { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Quran Memorization Tips & Guides",
  description:
    "Expert tips on Quran memorization, tajweed rules, hifz schedules, and reviews of the best Quran apps. Start your memorization journey with confidence.",
  keywords: [
    "quran memorization tips",
    "hifz guide",
    "tajweed tutorial",
    "quran blog",
    "islamic learning",
  ],
  openGraph: {
    title: "Blog — Wholly Quran",
    description:
      "Expert tips on Quran memorization, tajweed rules, and hifz schedules.",
    url: "https://whollyquran.me/blog",
  },
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Quran Memorization Blog
        </h1>
        <p className="mt-3 text-lg text-stone-500 dark:text-stone-400">
          Tips, guides, and resources to help you memorize the Quran effectively.
        </p>
      </header>

      <div className="space-y-8">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="group rounded-xl border border-stone-200 bg-white p-6 transition-colors hover:border-amber-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-amber-700"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="text-xl font-bold tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-stone-500 dark:text-stone-400">
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
                <span className="ml-auto flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  Read
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
