import { Prisma } from '@prisma/client';

import { db } from '../client';

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
   * Add an item to the draft
   */
  async addItem(type: NewsletterItemType, itemId: string): Promise<NewsletterDraftRecord> {
    const draft = await this.get();

    // Check if already exists
    const exists = draft.items.some(item => item.type === type && item.id === itemId);
    if (exists) {
      return draft;
    }

    const newItem: NewsletterDraftItem = {
      type,
      id: itemId,
      addedAt: new Date().toISOString(),
    };

    const newItems = [...draft.items, newItem];
    const updated = await db.newsletterDraft.update({
      where: { id: DRAFT_ID },
      data: {
        items: newItems as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      ...updated,
      items: updated.items as unknown as NewsletterDraftItem[],
    };
  },

  /**
   * Remove an item from the draft
   */
  async removeItem(type: NewsletterItemType, itemId: string): Promise<NewsletterDraftRecord> {
    const draft = await this.get();

    const filteredItems = draft.items.filter(
      item => !(item.type === type && item.id === itemId)
    );

    const updated = await db.newsletterDraft.update({
      where: { id: DRAFT_ID },
      data: {
        items: filteredItems as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      ...updated,
      items: updated.items as unknown as NewsletterDraftItem[],
    };
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
