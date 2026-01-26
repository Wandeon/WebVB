import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { pagesRepository } from './pages';
import { db } from '../client';

vi.mock('../client', () => ({
  db: {
    page: {
      findMany: vi.fn(),
    },
  },
}));

const mockedDb = db as unknown as {
  page: {
    findMany: Mock;
  };
};

describe('pagesRepository', () => {
  beforeEach(() => {
    mockedDb.page.findMany.mockReset();
  });

  describe('findPublished', () => {
    it('returns all pages ordered by menuOrder', async () => {
      const mockPages = [
        { id: '1', slug: 'organizacija', title: 'Organizacija', menuOrder: 0 },
        { id: '2', slug: 'kontakt', title: 'Kontakt', menuOrder: 1 },
      ];
      mockedDb.page.findMany.mockResolvedValue(mockPages);

      const result = await pagesRepository.findPublished();

      expect(mockedDb.page.findMany).toHaveBeenCalledWith({
        select: { id: true, slug: true, title: true, menuOrder: true },
        orderBy: { menuOrder: 'asc' },
      });
      expect(result).toEqual(mockPages);
    });

    it('returns empty array when no pages exist', async () => {
      mockedDb.page.findMany.mockResolvedValue([]);

      const result = await pagesRepository.findPublished();

      expect(result).toEqual([]);
    });
  });

  describe('findSiblingsBySlug', () => {
    it('returns sibling pages for a child page', async () => {
      // Mock returns all pages with the parent prefix
      const mockAllWithPrefix = [
        { id: '1', slug: 'organizacija/uprava', title: 'Uprava', menuOrder: 0 },
        { id: '2', slug: 'organizacija/vijecnici', title: 'Vijecnici', menuOrder: 1 },
        { id: '3', slug: 'organizacija/uprava/nested', title: 'Nested', menuOrder: 2 },
      ];
      mockedDb.page.findMany.mockResolvedValue(mockAllWithPrefix);

      const result = await pagesRepository.findSiblingsBySlug('organizacija/uprava');

      expect(mockedDb.page.findMany).toHaveBeenCalledWith({
        where: {
          slug: {
            startsWith: 'organizacija/',
          },
        },
        select: { id: true, slug: true, title: true, menuOrder: true },
        orderBy: { menuOrder: 'asc' },
      });
      // Should filter to only same depth (2 segments)
      expect(result).toEqual([
        { id: '1', slug: 'organizacija/uprava', title: 'Uprava', menuOrder: 0 },
        { id: '2', slug: 'organizacija/vijecnici', title: 'Vijecnici', menuOrder: 1 },
      ]);
    });

    it('returns top-level pages for a root page', async () => {
      const mockRootPages = [
        { id: '1', slug: 'organizacija', title: 'Organizacija', menuOrder: 0 },
        { id: '2', slug: 'kontakt', title: 'Kontakt', menuOrder: 1 },
      ];
      mockedDb.page.findMany.mockResolvedValue(mockRootPages);

      const result = await pagesRepository.findSiblingsBySlug('organizacija');

      expect(mockedDb.page.findMany).toHaveBeenCalledWith({
        where: {
          NOT: {
            slug: {
              contains: '/',
            },
          },
        },
        select: { id: true, slug: true, title: true, menuOrder: true },
        orderBy: { menuOrder: 'asc' },
      });
      expect(result).toEqual(mockRootPages);
    });

    it('handles deeply nested pages correctly', async () => {
      const mockAllWithPrefix = [
        { id: '1', slug: 'org/sub/page1', title: 'Page 1', menuOrder: 0 },
        { id: '2', slug: 'org/sub/page2', title: 'Page 2', menuOrder: 1 },
        { id: '3', slug: 'org/sub/page1/deep', title: 'Deep', menuOrder: 2 },
      ];
      mockedDb.page.findMany.mockResolvedValue(mockAllWithPrefix);

      const result = await pagesRepository.findSiblingsBySlug('org/sub/page1');

      expect(mockedDb.page.findMany).toHaveBeenCalledWith({
        where: {
          slug: {
            startsWith: 'org/sub/',
          },
        },
        select: { id: true, slug: true, title: true, menuOrder: true },
        orderBy: { menuOrder: 'asc' },
      });
      // Should filter to only same depth (3 segments)
      expect(result).toEqual([
        { id: '1', slug: 'org/sub/page1', title: 'Page 1', menuOrder: 0 },
        { id: '2', slug: 'org/sub/page2', title: 'Page 2', menuOrder: 1 },
      ]);
    });

    it('returns empty array for invalid slugs without querying the database', async () => {
      const result = await pagesRepository.findSiblingsBySlug('Organizacija');

      expect(mockedDb.page.findMany).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
