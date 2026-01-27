import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children }) => {
      if (href?.startsWith('/')) {
        return <Link href={href}>{children}</Link>;
      }
      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    },
    img: ({ src, alt }) => (
      <Image
        src={src ?? ''}
        alt={alt ?? ''}
        width={800}
        height={450}
        className="rounded-lg"
      />
    ),
    ...components,
  };
}
