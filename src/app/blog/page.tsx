import Link from 'next/link';
import { getBlogPosts, PostMetadata } from '@/lib/blog';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LandingHeader } from '@/components/layout/landing-header';
import { LandingFooter } from '@/components/layout/landing-footer';

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16 px-4">
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-6 break-words leading-none">
              Our <span className="text-primary italic">Journal</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Deep dives into building premium SAAS products and design patterns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: PostMetadata) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="group relative h-full overflow-hidden border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="p-8">
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary border border-border">
                          <Calendar className="size-3" /> {post.publishedAt}
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary border border-border">
                          <User className="size-3" /> {post.author}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors uppercase break-words leading-tight">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground line-clamp-3 mb-6 font-medium text-sm leading-relaxed break-words">
                        {post.summary}
                      </p>
                      <div className="flex items-center text-xs font-black uppercase tracking-widest text-primary gap-2">
                        Read Post <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
