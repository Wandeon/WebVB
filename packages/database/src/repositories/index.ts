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
