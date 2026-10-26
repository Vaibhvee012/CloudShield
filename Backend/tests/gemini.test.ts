import { beforeEach, describe, expect, it, vi } from "vitest";

// The real geminiService runs here. Only Google's client is replaced.
const { generateContent } = vi.hoisted(() => {
  // Read by geminiService when it is first imported.
  process.env.GEMINI_TIMEOUT_MS = "50";

  return { generateContent: vi.fn() };
});

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent };
    }
  },
}));

import { AIServiceError } from "../src/lib/aiErrors";
import { generateAIResponse } from "../src/services/geminiService";

const answer = (text: string) => ({ response: { text: () => text } });

const upstreamError = (message: string, status?: number) =>
  Object.assign(new Error(message), status === undefined ? {} : { status });

beforeEach(() => {
  generateContent.mockReset();
  vi.restoreAllMocks();
});

describe("generateAIResponse", () => {
  it("returns the model's answer without surrounding whitespace", async () => {
    generateContent.mockResolvedValue(answer("  Hello there.  \n"));

    await expect(generateAIResponse("Say hello")).resolves.toBe(
      "Hello there."
    );
  });

  it("rejects an empty prompt without calling Gemini", async () => {
    await expect(generateAIResponse("   ")).rejects.toThrow(
      "AI prompt cannot be empty"
    );

    expect(generateContent).not.toHaveBeenCalled();
  });

  it("reports an empty answer as a 502", async () => {
    generateContent.mockResolvedValue(answer("   "));

    const failure = generateAIResponse("Say hello");

    await expect(failure).rejects.toBeInstanceOf(AIServiceError);
    await expect(failure).rejects.toMatchObject({ status: 502 });
  });

  it("maps Gemini's rate limit to a friendly 429", async () => {
    generateContent.mockRejectedValue(upstreamError("quota exceeded", 429));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const failure = generateAIResponse("Say hello");

    await expect(failure).rejects.toMatchObject({ status: 429 });
    await expect(failure).rejects.toThrow(/busy/i);
  });

  it.each([
    ["a server error", upstreamError("internal failure", 500)],
    ["a missing model", upstreamError("model not found", 404)],
    ["a network failure with no status", upstreamError("socket hang up")],
  ])("maps %s to a 503", async (_name, error) => {
    generateContent.mockRejectedValue(error);
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(generateAIResponse("Say hello")).rejects.toMatchObject({
      status: 503,
    });
  });

  it("gives up with a 504 when Gemini does not answer in time", async () => {
    // Never resolves: the 50 ms timeout set above must fire.
    generateContent.mockImplementation(() => new Promise(() => {}));

    await expect(generateAIResponse("Say hello")).rejects.toMatchObject({
      status: 504,
    });
  });

  it("never shows raw upstream error text to the caller", async () => {
    generateContent.mockRejectedValue(
      upstreamError("UPSTREAM-SECRET-DETAIL key=abc123", 500)
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const failure = await generateAIResponse("Say hello").catch(
      (error: unknown) => error
    );

    expect(String((failure as Error).message)).not.toContain(
      "UPSTREAM-SECRET-DETAIL"
    );
  });

  it("never writes the prompt to the logs", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    generateContent.mockRejectedValue(upstreamError("failure", 500));

    await generateAIResponse("PROMPT-WITH-CUSTOMER-DATA").catch(() => {});

    expect(log).toHaveBeenCalled();
    expect(JSON.stringify(log.mock.calls)).not.toContain(
      "PROMPT-WITH-CUSTOMER-DATA"
    );
  });
});
