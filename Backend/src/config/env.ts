const requiredEnvVariables = [
  "DATABASE_URL",
  "JWT_SECRET",
  "GEMINI_API_KEY",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
];

const MIN_JWT_SECRET_LENGTH = 32;

const PLACEHOLDER_SECRETS = new Set([
  "secret",
  "changeme",
  "change-me",
  "password",
  "jwt_secret",
  "jwt-secret",
  "your-secret",
  "your_secret_here",
]);

export const validateEnvironment = () => {
  const missingVariables = requiredEnvVariables.filter(
    (variable) => !process.env[variable],
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
  }

  const secret = process.env.JWT_SECRET ?? "";

  const weakSecret =
    secret.length < MIN_JWT_SECRET_LENGTH ||
    PLACEHOLDER_SECRETS.has(secret.toLowerCase());

  if (weakSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long and not a placeholder in production`,
      );
    }

    console.warn(
      `WARNING: JWT_SECRET is weak (use ${MIN_JWT_SECRET_LENGTH}+ random characters). This is refused in production.`,
    );
  }
};
