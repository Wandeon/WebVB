export { postsRepository } from './posts';
export type {
  PostWithAuthor,
  FindAllPostsOptions,
  FindAllPostsResult,
  CreatePostData,
  UpdatePostData,
} from './posts';

export { documentsRepository } from './documents';
export type {
  DocumentWithUploader,
  FindAllDocumentsOptions,
  FindAllDocumentsResult,
  CreateDocumentData,
  UpdateDocumentData,
} from './documents';

export {
  pagesRepository,
  type PageWithRelations,
  type FindAllPagesOptions,
  type FindAllPagesResult,
  type CreatePageData,
  type UpdatePageData,
} from './pages';

export {
  eventsRepository,
  type FindAllEventsOptions,
  type FindAllEventsResult,
  type CreateEventData,
  type UpdateEventData,
} from './events';

export {
  galleriesRepository,
  type GalleryWithImages,
  type GalleryWithCount,
  type FindAllGalleriesOptions,
  type FindAllGalleriesResult,
  type CreateGalleryData,
  type UpdateGalleryData,
  type AddImageData,
} from './galleries';

export {
  usersRepository,
  type UsersQueryOptions,
  type CreateUserData,
  type UpdateUserData,
} from './users';
