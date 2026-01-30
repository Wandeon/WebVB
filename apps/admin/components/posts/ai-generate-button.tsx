'use client';

import type { PostCategory } from '@repo/shared';
import { Button, toast } from '@repo/ui';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AiGenerateDialog } from './ai-generate-dialog';

// =============================================================================
// Types
// =============================================================================

interface AiGenerateButtonProps {
  onGenerated: (result: { title: string; content: string; excerpt: string }) => void;
  category?: PostCategory;
  disabled?: boolean;
}

interface StatsResponse {
  success: boolean;
  data?: {
    ollamaConfigured: boolean;
  };
}

// =============================================================================
// Component
// =============================================================================

export function AiGenerateButton({
  onGenerated,
  category = 'aktualnosti',
  disabled = false,
}: AiGenerateButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  // Check if AI is configured on mount
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/ai/queue/stats');
        const data = (await response.json()) as StatsResponse;
        setIsConfigured(data.data?.ollamaConfigured ?? false);
      } catch {
        setIsConfigured(false);
      }
    };

    void checkConfig();
  }, []);

  const handleClick = () => {
    if (!isConfigured) {
      toast({
        title: 'AI nije dostupan',
        description: 'Ollama Cloud nije konfiguriran. Kontaktirajte administratora.',
        variant: 'destructive',
      });
      return;
    }
    setDialogOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled || isConfigured === false}
        title={isConfigured === false ? 'AI nije konfiguriran' : 'Generiraj sadržaj s AI'}
      >
        <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
        Generiraj s AI
      </Button>

      <AiGenerateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onGenerated={onGenerated}
        defaultCategory={category}
      />
    </>
  );
}
