import { getBaseEnv, getRuntimeEnv } from '@repo/shared';
import pino from 'pino';

const baseEnv = getBaseEnv();
const runtimeEnv = getRuntimeEnv();
const isDev = baseEnv.NODE_ENV === 'development';

type SerializedError = {
  message: string;
  name?: string;
  code?: string;
};

export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: unknown };
    const code = typeof errorWithCode.code === 'string' ? errorWithCode.code : undefined;

    return {
      name: error.name,
      message: error.message,
      ...(code ? { code } : {}),
    };
  }

  if (typeof error === 'object' && error !== null) {
    const errorRecord = error as Record<string, unknown>;
    const message = typeof errorRecord.message === 'string' ? errorRecord.message : 'Unknown error';
    const code = typeof errorRecord.code === 'string' ? errorRecord.code : undefined;

    return {
      message,
      ...(code ? { code } : {}),
    };
  }

  return {
    message: String(error),
  };
}

export const logger = pino({
  level: runtimeEnv.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  redact: {
    paths: [
      'authorization',
      'headers.authorization',
      'req.headers.authorization',
      'cookie',
      'headers.cookie',
      'req.headers.cookie',
      'set-cookie',
      'password',
      'token',
      'refreshToken',
      'accessToken',
      'idToken',
      'secret',
      'prompt',
      'response',
      'content',
      'documentText',
      'pdfText',
      'body',
      'inputData.prompt',
      'inputData.system',
      'endpoint',
      'p256dh',
      'auth',
      'email',
      'reporterEmail',
      'reporterPhone',
    ],
    censor: '[redacted]',
  },
  serializers: {
    error: serializeError,
  },
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

// Create child loggers for specific domains
export const postsLogger = logger.child({ module: 'posts' });
export const pagesLogger = logger.child({ module: 'pages' });
export const authLogger = logger.child({ module: 'auth' });
export const documentsLogger = logger.child({ module: 'documents' });
export const eventsLogger = logger.child({ module: 'events' });
export const galleriesLogger = logger.child({ module: 'galleries' });
export const usersLogger = logger.child({ module: 'users' });
export const contactLogger = logger.child({ module: 'contact' });
export const problemReportsLogger = logger.child({ module: 'problem-reports' });
export const searchLogger = logger.child({ module: 'search' });
export const announcementsLogger = logger.child({ module: 'announcements' });
export const newsletterLogger = logger.child({ module: 'newsletter' });
export const aiLogger = logger.child({ module: 'ai' });
export const mailLogsLogger = logger.child({ module: 'mail-logs' });
