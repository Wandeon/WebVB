import {
  newsletterDraftRepository,
  newsletterRepository,
  newsletterSendRepository,
  postsRepository,
  announcementsRepository,
  eventsRepository,
} from '@repo/database';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { sendNewsletterDigest } from '@/lib/email';
import { newsletterLogger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';

import type { NewsletterDigestItem } from '@/lib/email';
import type { NextRequest } from 'next/server';

const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || 'https://velikibukovec.hr';
const SEND_RATE_LIMIT = 1;
const SEND_RATE_WINDOW = 2 * 60 * 1000; // 2 minutes

// POST /api/newsletter/send - Send the newsletter
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request, { requireAdmin: true });

  if ('response' in authResult) {
    return authResult.response;
  }

  try {
    const rateCheck = checkRateLimit(
      `newsletter-send:${authResult.context.userId}`,
      SEND_RATE_LIMIT,
      SEND_RATE_WINDOW
    );

    if (!rateCheck.allowed) {
      return apiError(
        ErrorCodes.RATE_LIMIT,
        'Newsletter je već u slanju. Pokušajte ponovno za nekoliko minuta.',
        429
      );
    }

    // Get draft
    const draft = await newsletterDraftRepository.get();

    if (draft.items.length === 0) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Newsletter je prazan. Dodajte sadrzaj prije slanja.',
        400
      );
    }

    // Get all confirmed subscribers
    const subscribersResult = await newsletterRepository.findAllConfirmed({ limit: 10000 });
    const subscribers = subscribersResult.subscribers;

    if (subscribers.length === 0) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nema pretplatnika za slanje.',
        400
      );
    }

    // Fetch full item details
    const items: NewsletterDigestItem[] = [];
    const postsIncluded: { id: string; title: string }[] = [];
    const eventsIncluded: { id: string; title: string }[] = [];

    for (const draftItem of draft.items) {
      if (draftItem.type === 'post') {
        const post = await postsRepository.findById(draftItem.id);
        if (post) {
          items.push({
            type: 'post',
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            url: `${PUBLIC_SITE_URL}/vijesti/${post.slug}`,
          });
          postsIncluded.push({ id: post.id, title: post.title });
        }
      } else if (draftItem.type === 'announcement') {
        const announcement = await announcementsRepository.findById(draftItem.id);
        if (announcement) {
          items.push({
            type: 'announcement',
            id: announcement.id,
            title: announcement.title,
            excerpt: announcement.excerpt,
            url: `${PUBLIC_SITE_URL}/obavijesti/${announcement.slug}`,
          });
          postsIncluded.push({ id: announcement.id, title: announcement.title });
        }
      } else if (draftItem.type === 'event') {
        const event = await eventsRepository.findById(draftItem.id);
        if (event) {
          const eventDate = new Date(event.eventDate).toLocaleDateString('hr-HR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          const eventItem: NewsletterDigestItem = {
            type: 'event',
            id: event.id,
            title: event.title,
            excerpt: event.description,
            url: `${PUBLIC_SITE_URL}/dogadanja/${event.id}`,
            date: eventDate,
          };
          if (event.location) {
            eventItem.location = event.location;
          }
          items.push(eventItem);
          eventsIncluded.push({ id: event.id, title: event.title });
        }
      }
    }

    if (items.length === 0) {
      return apiError(
        ErrorCodes.NOT_FOUND,
        'Sadrzaj nije pronaden. Mozda je obrisan.',
        400
      );
    }

    newsletterLogger.info(
      { itemCount: items.length, subscriberCount: subscribers.length },
      'Slanje newslettera zapoceto'
    );

    // Send newsletter
    const result = await sendNewsletterDigest({
      introText: draft.introText,
      items,
      subscribers: subscribers.map(s => ({ id: s.id, email: s.email })),
      siteUrl: PUBLIC_SITE_URL,
    });

    // Record the send
    const sendData: Parameters<typeof newsletterSendRepository.create>[0] = {
      subject: result.subject,
      contentHtml: result.contentHtml,
      contentText: result.contentText,
      recipientCount: result.sent,
      isManual: true,
    };
    if (postsIncluded.length > 0) {
      sendData.postsIncluded = postsIncluded;
    }
    if (eventsIncluded.length > 0) {
      sendData.eventsIncluded = eventsIncluded;
    }
    await newsletterSendRepository.create(sendData);

    // Clear the draft
    await newsletterDraftRepository.clear();

    newsletterLogger.info(
      { sent: result.sent, failed: result.failed },
      'Newsletter uspjesno poslan'
    );

    return apiSuccess({
      sent: result.sent,
      failed: result.failed,
      message: `Newsletter uspjesno poslan ${result.sent} pretplatnika.`,
    });
  } catch (error) {
    newsletterLogger.error({ error }, 'Greska prilikom slanja newslettera');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greska prilikom slanja newslettera.',
      500
    );
  }
}
