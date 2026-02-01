'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from '@repo/ui';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  History,
  Loader2,
  Megaphone,
  Newspaper,
  Send,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Topic = 'all' | 'waste' | 'news' | 'events' | 'announcements';

interface SendResult {
  sent: number;
  failed: number;
  total: number;
  message: string;
}

interface NotificationSend {
  id: string;
  topic: string;
  title: string;
  body: string;
  sentAt: string;
  recipientCount: number;
  successCount: number;
  failureCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

const TOPICS: { value: Topic; label: string; description: string; icon: typeof Bell }[] = [
  { value: 'all', label: 'Sve', description: 'Svi pretplatnici', icon: Bell },
  { value: 'waste', label: 'Odvoz otpada', description: 'Pretplatnici na odvoz', icon: Trash2 },
  { value: 'news', label: 'Vijesti', description: 'Pretplatnici na vijesti', icon: Newspaper },
  { value: 'events', label: 'Događanja', description: 'Pretplatnici na događanja', icon: Calendar },
  { value: 'announcements', label: 'Obavijesti', description: 'Pretplatnici na obavijesti', icon: Megaphone },
];

const TEMPLATES = [
  {
    name: 'Važna obavijest',
    title: 'Važna obavijest',
    body: '',
    topic: 'announcements' as Topic,
  },
  {
    name: 'Nova vijest',
    title: 'Nova vijest na stranici',
    body: '',
    topic: 'news' as Topic,
  },
  {
    name: 'Podsjetnik na događanje',
    title: 'Podsjetnik',
    body: 'Sutra se održava',
    topic: 'events' as Topic,
  },
];

export function NotificationsSend() {
  const [topic, setTopic] = useState<Topic>('all');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [recentSends, setRecentSends] = useState<NotificationSend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch subscriber count and recent sends
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const historyRes = await fetch('/api/push/send');
      const historyData = (await historyRes.json()) as ApiResponse<NotificationSend[]>;

      if (historyData.success && historyData.data) {
        setRecentSends(historyData.data.slice(0, 10));
        // Estimate subscriber count from recent sends
        const latestSend = historyData.data[0];
        if (latestSend) {
          setSubscriberCount(latestSend.recipientCount);
        }
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: 'Nedostaju podaci',
        description: 'Naslov i poruka su obavezni.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    setShowConfirm(false);

    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          title: title.trim(),
          body: body.trim(),
          ...(url.trim() && { url: url.trim() }),
        }),
      });

      const data = (await response.json()) as ApiResponse<SendResult>;

      if (data.success && data.data) {
        toast({
          title: 'Obavijest poslana',
          description: data.data.message,
        });
        // Reset form
        setTitle('');
        setBody('');
        setUrl('');
        // Refresh history
        fetchData();
      } else {
        toast({
          title: 'Greška',
          description: data.error?.message || 'Nije moguće poslati obavijest.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće poslati obavijest.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const applyTemplate = (template: (typeof TEMPLATES)[number]) => {
    setTitle(template.title);
    setBody(template.body);
    setTopic(template.topic);
  };

  const selectedTopic = TOPICS.find((t) => t.value === topic);
  const TopicIcon = selectedTopic?.icon || Bell;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Send Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Nova obavijest
            </CardTitle>
            <CardDescription>
              Pošalji push obavijest na mobilne uređaje pretplatnika
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Templates */}
            <div>
              <Label className="text-sm text-neutral-500">Predlošci</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {TEMPLATES.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Tema</Label>
              <Select value={topic} onValueChange={(v) => setTopic(v as Topic)}>
                <SelectTrigger id="topic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOPICS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{t.label}</span>
                          <span className="text-neutral-400">- {t.description}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Naslov</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Naslov obavijesti..."
                maxLength={100}
              />
              <p className="text-xs text-neutral-500">{title.length}/100 znakova</p>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Poruka</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tekst obavijesti..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-neutral-500">{body.length}/500 znakova</p>
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">Link (opcionalno)</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://velikibukovec.hr/..."
              />
              <p className="text-xs text-neutral-500">
                Klik na obavijest otvara ovaj link
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Users className="h-4 w-4" />
                <span>{subscriberCount} pretplatnika</span>
              </div>

              {showConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Jeste li sigurni?
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
                    Odustani
                  </Button>
                  <Button size="sm" onClick={handleSend} disabled={isSending}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Da, pošalji
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={!title.trim() || !body.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Pošalji obavijest
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {(title || body) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pregled</CardTitle>
              <CardDescription>Kako će obavijest izgledati</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-neutral-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                    <TopicIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 truncate">
                      {title || 'Naslov obavijesti'}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600 line-clamp-3">
                      {body || 'Tekst obavijesti...'}
                    </p>
                    {url && (
                      <p className="mt-2 text-xs text-primary-600 truncate">{url}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* History Sidebar */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" />
              Povijest slanja
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSends.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">
                Nema poslanih obavijesti
              </p>
            ) : (
              <div className="space-y-3">
                {recentSends.map((send) => (
                  <div
                    key={send.id}
                    className="rounded-lg border p-3 text-sm space-y-1"
                  >
                    <p className="font-medium truncate">{send.title}</p>
                    <p className="text-neutral-500 line-clamp-2">{send.body}</p>
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant="outline" className="text-xs">
                        {TOPICS.find((t) => t.value === send.topic)?.label || send.topic}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Clock className="h-3 w-3" />
                        {new Date(send.sentAt).toLocaleDateString('hr-HR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        {send.successCount}
                      </span>
                      {send.failureCount > 0 && (
                        <span className="flex items-center gap-1 text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          {send.failureCount}
                        </span>
                      )}
                      <span className="text-neutral-400">
                        / {send.recipientCount} primatelja
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
