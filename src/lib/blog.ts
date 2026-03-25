import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { buildCacheKey, CACHE_TTL, getOrSetCache } from "@/lib/cache";

const BLOG_DIRECTORY = path.join(process.cwd(), "src/content/blog");

export type PostMetadata = {
  title: string;
  publishedAt: string;
  summary: string;
  author: string;
  image?: string;
  slug: string;
};

export async function getBlogPosts(): Promise<PostMetadata[]> {
  const cacheKey = buildCacheKey("blog", "posts");

  return getOrSetCache(
    cacheKey,
    async () => {
      const files = fs.readdirSync(BLOG_DIRECTORY);

      const posts = files
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => {
          const filePath = path.join(BLOG_DIRECTORY, file);
          const fileContent = fs.readFileSync(filePath, "utf8");
          const { data } = matter(fileContent);

          return {
            ...data,
            slug: file.replace(".mdx", ""),
          } as PostMetadata;
        });

      return posts.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    },
    { ttlSeconds: CACHE_TTL.BLOG_LIST_SECONDS },
  );
}

export async function getBlogPostBySlug(slug: string) {
  const cacheKey = buildCacheKey("blog", "post", slug);

  return getOrSetCache(
    cacheKey,
    async () => {
      const filePath = path.join(BLOG_DIRECTORY, `${slug}.mdx`);
      if (!fs.existsSync(filePath)) return null;

      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContent);

      return {
        metadata: {
          ...data,
          slug,
        } as PostMetadata,
        content,
      };
    },
    { ttlSeconds: CACHE_TTL.BLOG_POST_SECONDS },
  );
}
