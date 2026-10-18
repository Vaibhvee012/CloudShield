import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIServiceError } from "../lib/aiErrors";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS) || 20000;

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: modelName,
});

const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }
  return undefined;
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new AIServiceError(
          504,
          "CloudShield AI took too long to respond. Please try again."
        )
      );
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timer);
  });
};

export const generateAIResponse = async (
  prompt: string
): Promise<string> => {
  if (!prompt || !prompt.trim()) {
    throw new Error("AI prompt cannot be empty");
  }

  try {
    const result = await withTimeout(
      model.generateContent(prompt),
      timeoutMs
    );

    const response = result.response.text();

    if (!response || !response.trim()) {
      throw new AIServiceError(
        502,
        "CloudShield AI returned an empty response. Please try again."
      );
    }

    return response.trim();
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }

    const status = getErrorStatus(error);

    // Log the status and message only, never the prompt.
    console.error(
      "Gemini AI generation error:",
      status ?? "no-status",
      error instanceof Error ? error.message : "unknown error"
    );

    if (status === 429) {
      throw new AIServiceError(
        429,
        "CloudShield AI is busy right now. Please try again in a minute."
      );
    }

    throw new AIServiceError(
      503,
      "CloudShield AI is temporarily unavailable. Please try again shortly."
    );
  }
};