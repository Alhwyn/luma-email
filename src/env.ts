function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  lumaWebhookSecret: () => requireEnv("LUMA_WEBHOOK_SECRET"),
  resendApiKey: () => requireEnv("RESEND_API_KEY"),
  emailFrom: () => requireEnv("RESEND_FROM_EMAIL"),
};
