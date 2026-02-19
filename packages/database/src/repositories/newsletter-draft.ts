import { db } from '../client';

import type { Prisma } from '@prisma/client';

export type NewsletterItemType = 'post' | 'announcement' | 'event';

export interface NewsletterDraftItem {
  type: NewsletterItemType;
  id: string;
  addedAt: string;
}

export interface NewsletterDraftRecord {
  id: string;
  introText: string | null;
  items: NewsletterDraftItem[];
  createdAt: Date;
  updatedAt: Date;
}

const DRAFT_ID = 'singleton';

export const newsletterDraftRepository = {
  /**
   * Get the current draft (creates empty one if doesn't exist)
   */
  async get(): Promise<NewsletterDraftRecord> {
    const draft = await db.newsletterDraft.upsert({
      where: { id: DRAFT_ID },
      create: { id: DRAFT_ID, items: [] },
      update: {},
    });

    return {
      ...draft,
      items: (draft.items as unknown as NewsletterDraftItem[]) || [],
    };
  },

  /**
   * Add an item to the draft (atomic -- no read-modify-write race)
   */
  async addItem(type: NewsletterItemType, itemId: string): Promise<NewsletterDraftRecord> {
    // Ensure the singleton row exists
    await this.get();

    const item = { type, id: itemId, addedAt: new Date().toISOString() };
    const checkPayload = JSON.stringify([{ type, id: itemId }]);
    const appendPayload = JSON.stringify([item]);

    await db.$executeRaw`
      UPDATE newsletter_drafts
      SET items = CASE
        WHEN items @> ${checkPayload}::jsonb THEN items
        ELSE items || ${appendPayload}::jsonb
      END,
      updated_at = NOW()
      WHERE id = ${DRAFT_ID}
    `;

    return this.get();
  },

  /**
   * Remove an item from the draft (atomic -- no read-modify-write race)
   */
  async removeItem(type: NewsletterItemType, itemId: string): Promise<NewsletterDraftRecord> {
    await db.$executeRaw`
      UPDATE newsletter_drafts
      SET items = (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements(items) elem
        WHERE NOT (elem->>'type' = ${type} AND elem->>'id' = ${itemId})
      ),
      updated_at = NOW()
      WHERE id = ${DRAFT_ID}
    `;

    return this.get();
  },

  /**
   * Reorder items in the draft
   */
  async reorderItems(items: NewsletterDraftItem[]): Promise<NewsletterDraftRecord> {
    const updated = await db.newsletterDraft.update({
      where: { id: DRAFT_ID },
      data: { items: items as unknown as Prisma.InputJsonValue },
    });

    return {
      ...updated,
      items: updated.items as unknown as NewsletterDraftItem[],
    };
  },

  /**
   * Update intro text
   */
  async updateIntro(introText: string | null): Promise<NewsletterDraftRecord> {
    const updated = await db.newsletterDraft.update({
      where: { id: DRAFT_ID },
      data: { introText },
    });

    return {
      ...updated,
      items: updated.items as unknown as NewsletterDraftItem[],
    };
  },

  /**
   * Clear the draft (after sending)
   */
  async clear(): Promise<void> {
    await db.newsletterDraft.update({
      where: { id: DRAFT_ID },
      data: {
        introText: null,
        items: [],
      },
    });
  },

  /**
   * Get item count for badge display
   */
  async getItemCount(): Promise<number> {
    const draft = await this.get();
    return draft.items.length;
  },
};
