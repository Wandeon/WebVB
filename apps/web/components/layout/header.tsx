import { APP_NAME } from '@repo/shared';
import { MobileDrawer, NavMenu } from '@repo/ui';
import { mainNav } from '../../lib/navigation';
import Link from 'next/link';

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <MobileDrawer items={mainNav} logo={<span className="font-bold text-lg text-primary-700">{APP_NAME}</span>} />
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="hidden font-display text-lg font-bold text-primary-700 md:inline-block uppercase tracking-tight">
                            {APP_NAME}
                        </span>
                        <span className="md:hidden font-display text-lg font-bold text-primary-700 uppercase tracking-tight">
                            Veliki Bukovec
                        </span>
                    </Link>
                </div>

                <div className="hidden lg:flex">
                    <NavMenu items={mainNav} />
                </div>

                <div className="flex items-center gap-4">
                    {/* Placeholder for Search Trigger */}
                    {/* <Button variant="ghost" size="sm" className="w-9 px-0">
              <Search className="h-5 w-5" />
              <span className="sr-only">Pretraži</span>
            </Button> */}
                </div>
            </div>
        </header>
    );
}
