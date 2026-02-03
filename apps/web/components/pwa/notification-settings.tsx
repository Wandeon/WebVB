'use client';

import { getPublicEnv } from '@repo/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';
import { Bell, Calendar, Loader2, Megaphone, Newspaper, Settings, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const { NEXT_PUBLIC_API_URL } = getPublicEnv();
const API_URL = NEXT_PUBLIC_API_URL;

type Topic = 'all' | 'waste' | 'news' | 'events' | 'announcements';

interface TopicConfig {
  id: Topic;
  label: string;
  description: string;
  icon: typeof Bell;
}

const TOPIC_CONFIGS: TopicConfig[] = [
  { id: 'waste', label: 'Odvoz otpada', description: 'Podsjetnici za odvoz otpada', icon: Trash2 },
  { id: 'announcements', label: 'Važne obavijesti', description: 'Hitne i službene obavijesti', icon: Megaphone },
  { id: 'events', label: 'Događanja', description: 'Nova događanja u općini', icon: Calendar },
  { id: 'news', label: 'Novosti', description: 'Vijesti i novosti', icon: Newspaper },
];

interface Preferences {
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

interface SubscriptionData {
  topics: Topic[];
  preferences: Preferences | null;
  locale: string;
  createdAt: string;
}

interface SubscriptionKeys {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotificationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionKeys: SubscriptionKeys | null;
  onUnsubscribe: () => void;
}

export function NotificationSettings({
  open,
  onOpenChange,
  subscriptionKeys,
  onUnsubscribe,
}: NotificationSettingsProps) {
  const [topics, setTopics] = useState<Topic[]>(['all']);
  const [preferences, setPreferences] = useState<Preferences>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current settings when dialog opens
  useEffect(() => {
    if (!open || !subscriptionKeys) return;

    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/api/push/me?endpoint=${encodeURIComponent(subscriptionKeys.endpoint)}`
        );
        const data = (await response.json()) as ApiResponse<SubscriptionData>;

        if (data.success && data.data) {
          setTopics(data.data.topics || ['all']);
          setPreferences(data.data.preferences || {});
        }
      } catch {
        setError('Nije moguće učitati postavke.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSettings();
  }, [open, subscriptionKeys]);

  const handleTopicToggle = useCallback((topicId: Topic) => {
    setTopics((prev) => {
      // If toggling 'all', just set it
      if (topicId === 'all') {
        return ['all'];
      }

      // Remove 'all' if it was selected
      const withoutAll = prev.filter((t) => t !== 'all');

      if (withoutAll.includes(topicId)) {
        // Remove this topic
        const newTopics = withoutAll.filter((t) => t !== topicId);
        // If no topics left, default to 'all'
        return newTopics.length === 0 ? ['all'] : newTopics;
      } else {
        // Add this topic
        return [...withoutAll, topicId];
      }
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!subscriptionKeys) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/push/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscriptionKeys.endpoint,
          p256dh: subscriptionKeys.p256dh,
          auth: subscriptionKeys.auth,
          topics,
          preferences: Object.keys(preferences).length > 0 ? preferences : undefined,
        }),
      });

      const data = (await response.json()) as ApiResponse<unknown>;

      if (data.success) {
        onOpenChange(false);
      } else {
        setError(data.error?.message || 'Spremanje nije uspjelo.');
      }
    } catch {
      setError('Spremanje nije uspjelo.');
    } finally {
      setIsSaving(false);
    }
  }, [subscriptionKeys, topics, preferences, onOpenChange]);

  const handleUnsubscribe = useCallback(() => {
    onUnsubscribe();
    onOpenChange(false);
  }, [onUnsubscribe, onOpenChange]);

  const handleDeleteData = useCallback(async () => {
    if (!subscriptionKeys) return;

    const confirmed = window.confirm(
      'Jeste li sigurni da želite trajno izbrisati sve podatke o pretplati? Ova radnja se ne može poništiti.'
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/push/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscriptionKeys.endpoint,
          p256dh: subscriptionKeys.p256dh,
          auth: subscriptionKeys.auth,
        }),
      });

      const data = (await response.json()) as ApiResponse<unknown>;

      if (data.success) {
        onUnsubscribe();
        onOpenChange(false);
      } else {
        setError(data.error?.message || 'Brisanje podataka nije uspjelo.');
      }
    } catch {
      setError('Brisanje podataka nije uspjelo.');
    }
  }, [subscriptionKeys, onUnsubscribe, onOpenChange]);

  const isTopicSelected = useCallback(
    (topicId: Topic) => {
      if (topics.includes('all')) return true;
      return topics.includes(topicId);
    },
    [topics]
  );

  const allSelected = topics.includes('all') || topics.length === TOPIC_CONFIGS.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Postavke obavijesti
          </DialogTitle>
          <DialogDescription>
            Odaberite koje obavijesti želite primati.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All Option */}
            <button
              onClick={() => handleTopicToggle('all')}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                allSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  allSelected ? 'bg-primary-100' : 'bg-neutral-100'
                }`}
              >
                <Bell className={`h-5 w-5 ${allSelected ? 'text-primary-600' : 'text-neutral-500'}`} />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${allSelected ? 'text-primary-900' : 'text-neutral-900'}`}>
                  Sve obavijesti
                </p>
                <p className="text-sm text-neutral-500">Primaj sve vrste obavijesti</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 ${
                  allSelected
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-neutral-300'
                }`}
              >
                {allSelected && (
                  <svg className="h-full w-full text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>

            {/* Individual Topics */}
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Ili odaberite pojedinačno
              </p>
              <div className="grid gap-2">
                {TOPIC_CONFIGS.map((topic) => {
                  const Icon = topic.icon;
                  const selected = isTopicSelected(topic.id);

                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicToggle(topic.id)}
                      disabled={allSelected}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                        selected && !allSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      } ${allSelected ? 'opacity-50' : ''}`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          selected ? 'bg-primary-100' : 'bg-neutral-100'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            selected ? 'text-primary-600' : 'text-neutral-500'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium ${
                            selected ? 'text-primary-900' : 'text-neutral-900'
                          }`}
                        >
                          {topic.label}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">{topic.description}</p>
                      </div>
                      <div
                        className={`h-4 w-4 shrink-0 rounded border ${
                          selected
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-neutral-300'
                        }`}
                      >
                        {selected && (
                          <svg
                            className="h-full w-full text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={() => void handleSave()} disabled={isSaving || isLoading} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Spremanje...
              </>
            ) : (
              'Spremi postavke'
            )}
          </Button>
          <div className="flex items-center justify-between w-full pt-2 border-t">
            <button
              onClick={handleUnsubscribe}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Odjavi se s obavijesti
            </button>
            <button
              onClick={() => void handleDeleteData()}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Izbriši moje podatke
            </button>
          </div>
          <p className="text-xs text-neutral-400 text-center">
            Vaši podaci se koriste isključivo za slanje obavijesti.{' '}
            <a href="/privatnost#push-obavijesti" className="underline hover:text-neutral-600">
              Saznaj više
            </a>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
