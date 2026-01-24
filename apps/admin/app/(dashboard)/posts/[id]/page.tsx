import { db } from '@repo/database';
import { type PostCategory } from '@repo/shared';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/layout';
import { PostForm } from '@/components/posts';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  const post = await db.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
      category: true,
      isFeatured: true,
      publishedAt: true,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Uredi objavu
        </h1>
        <Breadcrumbs
          items={[
            { label: 'Objave', href: '/posts' },
            { label: post.title },
          ]}
          className="mt-1"
        />
      </div>

      <PostForm
        initialData={{
          id: post.id,
          title: post.title,
          content: post.content,
          ...(post.excerpt && { excerpt: post.excerpt }),
          category: post.category as PostCategory,
          isFeatured: post.isFeatured,
          publishedAt: post.publishedAt,
        }}
      />
    </div>
  );
}
