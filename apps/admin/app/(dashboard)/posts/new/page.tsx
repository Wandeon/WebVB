import { Toaster } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';
import { PostForm } from '@/components/posts';

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Nova objava
        </h1>
        <Breadcrumbs
          items={[
            { label: 'Objave', href: '/posts' },
            { label: 'Nova objava' },
          ]}
          className="mt-1"
        />
      </div>

      <PostForm />
      <Toaster />
    </div>
  );
}
