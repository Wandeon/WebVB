'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Textarea,
  toast,
} from '@repo/ui';
import {
  AlertCircle,
  Calendar,
  FileText,
  Loader2,
  Megaphone,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface DraftItem {
  type: 'post' | 'announcement' | 'event';
  id: string;
  addedAt: string;
  title?: string;
  excerpt?: string;
}

interface Draft {
  id: string;
  introText: string | null;
  items: DraftItem[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

const TYPE_LABELS: Record<DraftItem['type'], string> = {
  post: 'Vijest',
  announcement: 'Obavijest',
  event: 'Događanje',
};

const TYPE_ICONS: Record<DraftItem['type'], typeof FileText> = {
  post: FileText,
  announcement: Megaphone,
  event: Calendar,
};

export function NewsletterCompose() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [introText, setIntroText] = useState('');
  const [itemDetails, setItemDetails] = useState<Record<string, { title: string; excerpt: string }>>({});

  // Fetch draft and subscriber count
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [draftRes, countRes] = await Promise.all([
        fetch('/api/newsletter/draft'),
        fetch('/api/newsletter/subscribers/count'),
      ]);

      const draftData = (await draftRes.json()) as ApiResponse<Draft>;
      const countData = (await countRes.json()) as ApiResponse<{ count: number }>;

      if (draftData.success && draftData.data) {
        setDraft(draftData.data);
        setIntroText(draftData.data.introText || '');

        // Fetch item details
        await fetchItemDetails(draftData.data.items);
      }

      if (countData.success && countData.data) {
        setSubscriberCount(countData.data.count);
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati podatke.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch details for each item (title, excerpt)
  const fetchItemDetails = useCallback(async (items: DraftItem[]) => {
    const details: Record<string, { title: string; excerpt: string }> = {};

    for (const item of items) {
      try {
        let endpoint = '';
        if (item.type === 'post') {
          endpoint = `/api/posts/${item.id}`;
        } else if (item.type === 'announcement') {
          endpoint = `/api/announcements/${item.id}`;
        } else if (item.type === 'event') {
          endpoint = `/api/events/${item.id}`;
        }

        const response = await fetch(endpoint);
        const result = (await response.json()) as ApiResponse<{
          title: string;
          excerpt?: string;
          description?: string;
        }>;

        if (result.success && result.data) {
          details[`${item.type}-${item.id}`] = {
            title: result.data.title,
            excerpt: result.data.excerpt || result.data.description || '',
          };
        }
      } catch {
        // Skip failed items
      }
    }

    setItemDetails(details);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Save intro text
  const handleSaveIntro = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/newsletter/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ introText: introText || null }),
      });

      const result = (await response.json()) as ApiResponse<Draft>;

      if (result.success) {
        toast({
          title: 'Spremljeno',
          description: 'Uvodni tekst je spremljen.',
          variant: 'success',
        });
      } else {
        throw new Error(result.error?.message);
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće spremiti uvodni tekst.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [introText]);

  // Remove item from draft
  const handleRemoveItem = useCallback(async (type: DraftItem['type'], id: string) => {
    try {
      const response = await fetch('/api/newsletter/draft/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });

      const result = (await response.json()) as ApiResponse<Draft>;

      if (result.success && result.data) {
        setDraft(result.data);
        toast({
          title: 'Uklonjeno',
          description: 'Stavka je uklonjena iz newslettera.',
          variant: 'success',
        });
      } else {
        throw new Error(result.error?.message);
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće ukloniti stavku.',
        variant: 'destructive',
      });
    }
  }, []);

  // Clear draft
  const handleClearDraft = useCallback(async () => {
    if (!confirm('Jeste li sigurni da želite obrisati cijeli nacrt?')) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch('/api/newsletter/draft', {
        method: 'DELETE',
      });

      const result = (await response.json()) as ApiResponse<{ cleared: boolean }>;

      if (result.success) {
        setDraft({ id: 'singleton', introText: null, items: [] });
        setIntroText('');
        setItemDetails({});
        toast({
          title: 'Obrisano',
          description: 'Nacrt newslettera je obrisan.',
          variant: 'success',
        });
      } else {
        throw new Error(result.error?.message);
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće obrisati nacrt.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  }, []);

  // Send newsletter
  const handleSend = useCallback(async () => {
    if (subscriberCount === 0) {
      toast({
        title: 'Nema pretplatnika',
        description: 'Nema potvrđenih pretplatnika za slanje.',
        variant: 'destructive',
      });
      return;
    }

    if (!draft || draft.items.length === 0) {
      toast({
        title: 'Newsletter je prazan',
        description: 'Dodajte sadržaj prije slanja.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Newsletter će biti poslan na ${subscriberCount} pretplatnika. Nastaviti?`)) {
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
      });

      const result = (await response.json()) as ApiResponse<{
        sent: number;
        failed: number;
        message: string;
      }>;

      if (result.success && result.data) {
        toast({
          title: 'Poslano',
          description: result.data.message,
          variant: 'success',
        });
        // Refresh data after successful send
        void fetchData();
      } else {
        throw new Error(result.error?.message);
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description: error instanceof Error ? error.message : 'Nije moguće poslati newsletter.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  }, [draft, subscriberCount, fetchData]);

  // Get badge style based on type
  const getTypeBadgeClass = (type: DraftItem['type']) => {
    switch (type) {
      case 'post':
        return 'bg-blue-100 text-blue-800';
      case 'announcement':
        return 'bg-amber-100 text-amber-800';
      case 'event':
        return 'bg-purple-100 text-purple-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const itemCount = draft?.items.length || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column - 2/3 width */}
      <div className="lg:col-span-2 space-y-6">
        {/* Intro text editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uvodni tekst</CardTitle>
            <CardDescription>
              Opcionalni tekst koji će se prikazati na početku newslettera
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder="Poštovani sugrađani, donosimo vam najnovije vijesti iz naše općine..."
              rows={4}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => void handleSaveIntro()}
                disabled={isSaving}
                variant="outline"
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Spremanje...
                  </>
                ) : (
                  'Spremi uvodni tekst'
                )}
              </Button>
              <Button variant="ghost" size="sm" disabled>
                <Sparkles className="mr-2 h-4 w-4" />
                AI generiranje
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Items list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sadržaj newslettera</CardTitle>
            <CardDescription>
              {itemCount === 0
                ? 'Dodajte sadržaj iz popisa vijesti, obavijesti ili događanja'
                : `${itemCount} stavki u newsletteru`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {itemCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-neutral-300 mb-4" />
                <p className="text-neutral-500 mb-2">Newsletter je prazan</p>
                <p className="text-sm text-neutral-400">
                  Dodajte vijesti, obavijesti ili događanja klikom na &quot;Dodaj u newsletter&quot; u
                  odgovarajućem popisu.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {draft?.items.map((item) => {
                  const details = itemDetails[`${item.type}-${item.id}`];
                  const IconComponent = TYPE_ICONS[item.type];

                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <IconComponent className="h-5 w-5 text-neutral-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getTypeBadgeClass(item.type)}>
                            {TYPE_LABELS[item.type]}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-neutral-900 truncate">
                          {details?.title || 'Učitavanje...'}
                        </h4>
                        {details?.excerpt && (
                          <p className="text-sm text-neutral-500 line-clamp-2 mt-1">
                            {details.excerpt}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleRemoveItem(item.type, item.id)}
                        className="flex-shrink-0 text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Ukloni</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right column - 1/3 width */}
      <div className="space-y-6">
        {/* Send card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pošalji newsletter</CardTitle>
            <CardDescription>
              {subscriberCount === 0
                ? 'Nema potvrđenih pretplatnika'
                : `${subscriberCount} potvrđenih pretplatnika`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => void handleSend()}
              disabled={isSending || itemCount === 0 || subscriberCount === 0}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Slanje...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Pošalji newsletter
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleClearDraft()}
              disabled={isClearing || itemCount === 0}
              className="w-full"
            >
              {isClearing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Brisanje...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Obriši nacrt
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* AI placeholder card */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              AI asistent
            </CardTitle>
            <CardDescription>Uskoro dostupno</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-500">
              AI asistent će vam pomoći generirati uvodni tekst i sažetke za newsletter.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
