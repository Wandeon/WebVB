import { APP_NAME } from '@repo/shared';
import { Footer } from '@repo/ui';
import Link from 'next/link';

import { footerLinks } from '../../lib/navigation';

import type { FooterLinkGroup } from '@repo/ui';

// Transform footerLinks to match FooterLinkGroup interface if needed
// In this case, they match exactly: { title: string, items: { title: string, href: string }[] }[]
const groups: FooterLinkGroup[] = footerLinks;

export function SiteFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <Footer
            groups={groups}
            copyright={`© ${currentYear} ${APP_NAME}. Sva prava pridržana.`}
            logo={
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-white uppercase tracking-wider">
                        {APP_NAME}
                    </span>
                </Link>
            }
        />
    );
}
