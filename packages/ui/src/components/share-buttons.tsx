'use client';

import { Check, Facebook, Link2 } from 'lucide-react';
import { useState } from 'react';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';

export interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareButtons({ url, title: _title, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, 'facebook-share', 'width=580,height=296');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-neutral-500">Podijeli:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleFacebookShare}
        aria-label="Podijeli na Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => void handleCopyLink()}
        aria-label={copied ? 'Kopirano' : 'Kopiraj poveznicu'}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span className="ml-1">Kopirano!</span>
          </>
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
