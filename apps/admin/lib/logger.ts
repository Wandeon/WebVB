import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
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
