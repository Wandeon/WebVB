import * as webpush from 'web-push';

export type { PushSubscription, RequestOptions, SendResult, WebPushError } from 'web-push';

export { webpush };

export const isWebPushError = (error: unknown): error is webpush.WebPushError =>
  error instanceof webpush.WebPushError;
