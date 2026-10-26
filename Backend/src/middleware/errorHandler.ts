import { NextFunction, Request, Response } from "express";

type HttpError = {
  status?: number;
  statusCode?: number;
};

/*
 * Global error handler.
 * Problems with the request itself (broken JSON, body too large) are the
 * caller's fault and get a 4xx. Anything else is a 500 with no details.
 */
export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const details = (error ?? {}) as HttpError;
  const status = details.status ?? details.statusCode;

  if (typeof status === "number" && status >= 400 && status < 500) {
    return res.status(status).json({
      success: false,
      message:
        status === 413
          ? "Request body is too large"
          : status === 400
            ? "The request could not be read. Check that it is valid JSON."
            : "The request could not be processed",
    });
  }

  console.error("Unhandled server error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
