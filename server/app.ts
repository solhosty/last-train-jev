import express, { type ErrorRequestHandler } from 'express';
import { resolve } from 'node:path';
import { hotelRouter } from './hotel';
import { trainRouter } from './train';
import { rateLimit, WindowLimiter } from './rate-limit';
import type { ServerConfig } from './config';

export async function createApp(config: ServerConfig) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxyHops);
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  // Health checks never consume the gameplay budget.
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    const origin = req.headers.origin;
    if (
      origin &&
      origin !== `http://${req.headers.host}` &&
      origin !== `https://${req.headers.host}`
    ) {
      res.status(403).json({ error: 'Cross-origin requests are not allowed.' });
      return;
    }
    next();
  });
  app.use('/api', rateLimit(new WindowLimiter(config.apiRequestsPerWindow, 10 * 60_000)));
  app.use(express.json({ limit: '8kb' }));
  app.post(
    ['/api/act', '/api/train/act'],
    rateLimit(new WindowLimiter(config.modelRequestsPerWindow, 10 * 60_000)),
    rateLimit(new WindowLimiter(config.globalModelRequestsPerHour, 60 * 60_000), 'global'),
  );
  app.use('/api/train', trainRouter);
  app.use('/api', hotelRouter);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown API route.' }));

  if (config.production) {
    app.use(express.static(resolve('dist')));
    app.get(['/', '/hotel'], (_req, res) => res.sendFile(resolve('dist/index.html')));
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }

  const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error?.type === 'entity.too.large') {
      res.status(413).json({ error: 'Request body is too large.' });
    } else if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({ error: 'Request body must be valid JSON.' });
    } else {
      // Do not return stack traces or provider internals to the browser.
      console.error(
        'Unhandled server error:',
        error instanceof Error ? error.name : 'UnknownError',
      );
      res.status(500).json({ error: 'The server could not complete this request.' });
    }
  };
  app.use(handleError);
  return app;
}
