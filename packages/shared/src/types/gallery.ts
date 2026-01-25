export interface GalleryImage {
  id: string;
  galleryId: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  sortOrder: number;
  createdAt: Date;
}

export interface Gallery {
  id: string;
  name: string;
  slug: string;
  eventDate: Date | null;
  description: string | null;
  coverImage: string | null;
  createdAt: Date;
}

export interface GalleryWithImages extends Gallery {
  images: GalleryImage[];
  _count?: { images: number };
}
