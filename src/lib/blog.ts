import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIRECTORY = path.join(process.cwd(), 'src/content/blog');

export type PostMetadata = {
  title: string;
  publishedAt: string;
  summary: string;
  author: string;
  image?: string;
  slug: string;
};

export async function getBlogPosts(): Promise<PostMetadata[]> {
  const files = fs.readdirSync(BLOG_DIRECTORY);

  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const filePath = path.join(BLOG_DIRECTORY, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);

      return {
        ...data,
        slug: file.replace('.mdx', ''),
      } as PostMetadata;
    });

  return posts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getBlogPostBySlug(slug: string) {
  const filePath = path.join(BLOG_DIRECTORY, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return {
    metadata: {
      ...data,
      slug,
    } as PostMetadata,
    content,
  };
}
