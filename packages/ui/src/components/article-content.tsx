import { cn } from '../lib/utils';

export interface ArticleContentProps {
  content: string;
  className?: string;
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  return (
    <article
      className={cn(
        'prose prose-neutral max-w-none',
        'prose-headings:font-display prose-headings:font-semibold',
        'prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline',
        'prose-img:rounded-lg',
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
