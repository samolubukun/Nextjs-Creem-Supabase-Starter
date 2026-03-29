import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { Callout } from "@/components/blog/callout";
import { LandingFooter } from "@/components/layout/landing-footer";
import { LandingHeader } from "@/components/layout/landing-header";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";

const components = {
  Callout,
};

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: "one-dark-pro",
        },
      ],
    ],
  },
};

type MdxOptions = NonNullable<MDXRemoteProps["options"]>;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.metadata.title} | saasxcreem`,
    description: post.metadata.summary,
    alternates: {
      canonical: `/blog/${post.metadata.slug}`,
    },
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.summary,
      type: "article",
      publishedTime: post.metadata.publishedAt,
      url: `/blog/${post.metadata.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metadata.title,
      description: post.metadata.summary,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <LandingHeader />
      <main className="flex-1 pt-24 pb-20 px-0">
        <article className="max-w-3xl mx-auto px-4 md:px-8">
          <Link href="/blog">
            <Button
              variant="ghost"
              size="sm"
              className="mb-8 font-black uppercase tracking-widest text-xs gap-2"
            >
              <ArrowLeft className="size-3" /> Back to Journal
            </Button>
          </Link>

          <div className="mb-12">
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary border border-border whitespace-nowrap">
                <Calendar className="size-3" /> {post.metadata.publishedAt}
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary border border-border whitespace-nowrap">
                <User className="size-3" /> {post.metadata.author}
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary border border-border whitespace-nowrap">
                <Clock className="size-3" /> 5 min read
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-[0.95] mb-8 break-words">
              {post.metadata.title}
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground font-medium leading-tight break-words">
              {post.metadata.summary}
            </p>
          </div>

          <div
            className="prose prose-invert max-w-none 
            prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
            prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted-foreground
            prose-strong:text-foreground prose-strong:font-black
            prose-code:text-primary prose-pre:bg-card/50 prose-pre:backdrop-blur-sm prose-pre:border prose-pre:border-border/50
            prose-pre:overflow-x-auto prose-pre:w-full
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-2xl prose-img:border prose-img:border-border/50"
          >
            <MDXRemote
              source={post.content}
              components={components}
              options={mdxOptions as MdxOptions}
            />
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
