import { Response } from "express";

export class AIServiceError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AIServiceError";
    this.status = status;
  }
}

export const sendAIError = (
  res: Response,
  error: unknown,
  fallbackMessage: string
) => {
  if (error instanceof AIServiceError) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};