function integerSetting(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
  minimum = 1,
  maximum = Number.MAX_SAFE_INTEGER,
): number {
  const value = env[name] === undefined ? fallback : Number(env[name]);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}.`);
  }
  return value;
}

export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const production = env.NODE_ENV === 'production';
  return {
    production,
    host: env.HOST || (production ? '0.0.0.0' : '127.0.0.1'),
    port: integerSetting(env, 'PORT', 4317, 0, 65535),
    trustProxyHops: integerSetting(env, 'TRUST_PROXY_HOPS', 0, 0, 10),
    apiRequestsPerWindow: integerSetting(env, 'API_RATE_LIMIT', 120),
    modelRequestsPerWindow: integerSetting(env, 'MODEL_RATE_LIMIT', 30),
    globalModelRequestsPerHour: integerSetting(env, 'MODEL_GLOBAL_LIMIT', 300),
  };
}

export type ServerConfig = ReturnType<typeof readConfig>;
