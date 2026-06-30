function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  lumaApiKey: () => requireEnv("LUMA_API_KEY"),
  lumaEventId: () => requireEnv("LUMA_EVENT_ID"),
  resendApiKey: () => requireEnv("RESEND_API_KEY"),
  emailFrom: () => requireEnv("RESEND_FROM_EMAIL"),
};
