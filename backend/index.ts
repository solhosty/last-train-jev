import { createApp } from './app';
import { readConfig } from './config';

const config = readConfig();
const app = await createApp(config);
const server = app.listen(config.port, config.host, () => {
  console.log(`The Last Train → http://${config.host}:${config.port}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
