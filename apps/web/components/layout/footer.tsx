import { APP_NAME } from '@repo/shared';
import { Footer, FooterLinkGroup } from '@repo/ui';
import { footerLinks } from '../../lib/navigation';
import Link from 'next/link';

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
