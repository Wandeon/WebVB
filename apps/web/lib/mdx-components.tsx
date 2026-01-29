import Image from 'next/image';
import Link from 'next/link';

import type { MDXComponents } from 'mdx/types';
import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({
      href,
      children,
    }: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) => {
      if (href?.startsWith('/')) {
        return <Link href={href}>{children}</Link>;
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    img: ({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) => (
      <Image
        src={typeof src === 'string' ? src : ''}
        alt={alt ?? ''}
        width={800}
        height={450}
        className="rounded-lg"
      />
    ),
    ...components,
  };
}
