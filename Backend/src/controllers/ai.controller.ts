import { Request, Response } from "express";
import {
  buildAIContextPrompt,
  buildSecurityContext,
} from "../services/aiContextService";
import {
  buildCloudShieldPrompt,
  generateAIResponse,
} from "../services/geminiService";

export const chatWithAI = async (
  req: Request,
  res: Response
) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const securityContext = await buildSecurityContext();

    const prompt = buildCloudShieldPrompt(
      question,
      securityContext
    );

    const response = await generateAIResponse(prompt);

    return res.status(200).json({
      success: true,
      data: {
        response,
      },
    });
  } catch (error) {
    console.error("CloudShield AI error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI response",
    });
  }
};