import "@testing-library/jest-dom";

process.env.RESEND_API_KEY ??= "test_resend_key";
process.env.RESEND_FROM_EMAIL ??= "noreply@example.com";
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
process.env.AUTH_SECRET ??= "test-auth-secret";
process.env.DATABASE_URL ??= "postgresql://user:pass@localhost:5432/feedlyte_test";
