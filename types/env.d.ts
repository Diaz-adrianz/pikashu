declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_JWT_MAXAGE: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    SEED_USER_PASSWORD: string;
    REDIS_URL?: string;
    APP_URL?: string;
    MIDTRANS_SERVER_KEY?: string;
    MIDTRANS_CLIENT_KEY?: string;
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?: string;
    MIDTRANS_IS_PRODUCTION?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    MAIL_FROM?: string;
  }
}
