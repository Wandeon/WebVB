import { APP_NAME } from '@repo/shared';
import { Footer } from '@repo/ui';
import Image from 'next/image';
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
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/images/logo.png"
                        alt="Grb Općine Veliki Bukovec"
                        width={50}
                        height={64}
                        className="h-16 w-auto"
                    />
                    <span className="text-lg font-bold text-white uppercase tracking-wider">
                        {APP_NAME}
                    </span>
                </Link>
            }
        />
    );
}
