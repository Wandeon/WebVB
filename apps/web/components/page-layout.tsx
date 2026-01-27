import { FadeIn, PageSidebar } from '@repo/ui';
import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  section?: string;
  children: ReactNode;
}

export function PageLayout({ title, section, children }: PageLayoutProps) {
  return (
    <>
      <FadeIn>
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-12 text-white md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
          </div>
        </section>
      </FadeIn>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <article className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:font-semibold prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg">
          {children}
        </article>
      </div>
    </>
  );
}
