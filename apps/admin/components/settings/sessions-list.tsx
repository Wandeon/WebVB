'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Laptop, Monitor, Smartphone, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  listSessions,
  revokeOtherSessions,
  revokeSession,
  useSession,
} from '@/lib/auth-client';

interface SessionData {
  token: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
}

function parseUserAgent(ua: string | null | undefined): {
  browser: string;
  device: 'desktop' | 'mobile' | 'tablet';
} {
  if (!ua) {
    return { browser: 'Nepoznat preglednik', device: 'desktop' };
  }

  const lowerUa = ua.toLowerCase();

  // Detect device type
  let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/tablet|ipad/i.test(ua)) {
    device = 'tablet';
  } else if (/mobile|android|iphone|ipod/i.test(ua)) {
    device = 'mobile';
  }

  // Detect browser
  let browser = 'Nepoznat preglednik';
  if (lowerUa.includes('edg/') || lowerUa.includes('edge')) {
    browser = 'Microsoft Edge';
  } else if (lowerUa.includes('chrome') && !lowerUa.includes('chromium')) {
    browser = 'Google Chrome';
  } else if (lowerUa.includes('firefox')) {
    browser = 'Mozilla Firefox';
  } else if (lowerUa.includes('safari') && !lowerUa.includes('chrome')) {
    browser = 'Safari';
  } else if (lowerUa.includes('opera') || lowerUa.includes('opr/')) {
    browser = 'Opera';
  } else if (lowerUa.includes('msie') || lowerUa.includes('trident')) {
    browser = 'Internet Explorer';
  }

  return { browser, device };
}

function DeviceIcon({ device }: { device: 'desktop' | 'mobile' | 'tablet' }) {
  switch (device) {
    case 'mobile':
      return <Smartphone className="h-5 w-5 text-neutral-500" />;
    case 'tablet':
      return <Laptop className="h-5 w-5 text-neutral-500" />;
    case 'desktop':
    default:
      return <Monitor className="h-5 w-5 text-neutral-500" />;
  }
}

export function SessionsList() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const currentSessionToken = session?.session?.token;

  const fetchSessions = useCallback(async () => {
    try {
      const result = await listSessions();

      if (result.error) {
        throw new Error(result.error.message ?? 'Došlo je do greške');
      }

      if (result.data) {
        setSessions(
          result.data.map((s) => ({
            token: s.token,
            createdAt: new Date(s.createdAt),
            expiresAt: new Date(s.expiresAt),
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
          }))
        );
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error ? error.message : 'Došlo je do greške',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (token: string) => {
    if (token === currentSessionToken) {
      toast({
        title: 'Greška',
        description: 'Ne možete opozvati trenutačnu sesiju.',
        variant: 'destructive',
      });
      return;
    }

    setRevokingToken(token);

    try {
      const result = await revokeSession({ token });

      if (result.error) {
        throw new Error(result.error.message ?? 'Došlo je do greške');
      }

      setSessions((prev) => prev.filter((s) => s.token !== token));

      toast({
        title: 'Uspjeh',
        description: 'Sesija je uspješno opozvana.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error ? error.message : 'Došlo je do greške',
        variant: 'destructive',
      });
    } finally {
      setRevokingToken(null);
    }
  };

  const handleRevokeAllOther = async () => {
    setIsRevokingAll(true);

    try {
      const result = await revokeOtherSessions();

      if (result.error) {
        throw new Error(result.error.message ?? 'Došlo je do greške');
      }

      await fetchSessions();

      toast({
        title: 'Uspjeh',
        description: 'Sve ostale sesije su uspješno opozvane.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error ? error.message : 'Došlo je do greške',
        variant: 'destructive',
      });
    } finally {
      setIsRevokingAll(false);
    }
  };

  const currentSession = sessions.find((s) => s.token === currentSessionToken);
  const otherSessions = sessions.filter((s) => s.token !== currentSessionToken);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivne sesije</CardTitle>
        <CardDescription>
          Pregledajte i upravljajte uređajima na kojima ste prijavljeni
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-neutral-500">Učitavanje...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-neutral-500">Nema aktivnih sesija</p>
        ) : (
          <>
            {/* Current session */}
            {currentSession && (
              <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/10 p-4">
                <div className="flex items-center gap-3">
                  <DeviceIcon
                    device={parseUserAgent(currentSession.userAgent).device}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {parseUserAgent(currentSession.userAgent).browser}
                      </span>
                      <Badge variant="success">Trenutna sesija</Badge>
                    </div>
                    <div className="text-sm text-neutral-500">
                      {currentSession.ipAddress && (
                        <span>{currentSession.ipAddress} &bull; </span>
                      )}
                      <span>
                        {formatDistanceToNow(currentSession.createdAt, {
                          addSuffix: true,
                          locale: hr,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other sessions */}
            {otherSessions.map((sessionItem) => {
              const { browser, device } = parseUserAgent(sessionItem.userAgent);

              return (
                <div
                  key={sessionItem.token}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <DeviceIcon device={device} />
                    <div>
                      <span className="font-medium">{browser}</span>
                      <div className="text-sm text-neutral-500">
                        {sessionItem.ipAddress && (
                          <span>{sessionItem.ipAddress} &bull; </span>
                        )}
                        <span>
                          {formatDistanceToNow(sessionItem.createdAt, {
                            addSuffix: true,
                            locale: hr,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleRevokeSession(sessionItem.token)}
                    disabled={revokingToken === sessionItem.token}
                    aria-label={`Opozovi sesiju za ${browser}`}
                  >
                    <Trash2 className="h-4 w-4 text-error" />
                  </Button>
                </div>
              );
            })}

            {/* Revoke all other sessions button */}
            {otherSessions.length > 0 && (
              <div className="pt-4">
                <Button
                  variant="danger"
                  onClick={() => void handleRevokeAllOther()}
                  disabled={isRevokingAll}
                >
                  {isRevokingAll
                    ? 'Opozivanje...'
                    : `Opozovi sve ostale sesije (${otherSessions.length})`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
