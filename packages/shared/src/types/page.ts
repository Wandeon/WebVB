export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  parentId: string | null;
  menuOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageWithChildren extends Page {
  parent: Pick<Page, 'id' | 'title' | 'slug'> | null;
  children: Pick<Page, 'id' | 'title' | 'slug' | 'menuOrder'>[];
}
