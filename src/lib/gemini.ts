/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { TaxAnalysisResult } from "../types";

let aiClient: GoogleGenAI | null = null;

function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing!");
      throw new Error("GEMINI_API_KEY is required. Please set it in your environment variables.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const TAX_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        totalIncome: { type: Type.NUMBER },
        taxLiabilityOld: { type: Type.NUMBER },
        taxLiabilityNew: { type: Type.NUMBER },
        balanceTax: { type: Type.NUMBER },
        incomeSources: {
          type: Type.OBJECT,
          properties: {
            salary: { type: Type.NUMBER },
            stcg: { type: Type.NUMBER },
            ltcg: { type: Type.NUMBER },
            dividends: { type: Type.NUMBER },
            other: { type: Type.NUMBER },
          },
          required: ["salary", "stcg", "ltcg", "dividends", "other"],
        },
      },
      required: ["totalIncome", "taxLiabilityOld", "taxLiabilityNew", "balanceTax", "incomeSources"],
    },
    itrGuidance: {
      type: Type.OBJECT,
      properties: {
        formType: { type: Type.STRING },
        reason: { type: Type.STRING },
        deadline: { type: Type.STRING },
      },
      required: ["formType", "reason", "deadline"],
    },
    advanceTaxSchedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dueDate: { type: Type.STRING },
          percentage: { type: Type.NUMBER },
          amount: { type: Type.NUMBER },
        },
        required: ["dueDate", "percentage", "amount"],
      },
    },
    detailedBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER },
        },
        required: ["title", "description"],
      },
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    foreignAssets: {
      type: Type.OBJECT,
      properties: {
        detected: { type: Type.BOOLEAN },
        details: { type: Type.STRING },
        scheduleFA: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              countryName: { type: Type.STRING },
              institutionName: { type: Type.STRING },
              assetType: { type: Type.STRING },
              initialValue: { type: Type.NUMBER },
              peakValue: { type: Type.NUMBER },
              closingValue: { type: Type.NUMBER },
            },
            required: ["countryName", "institutionName", "assetType", "initialValue", "peakValue", "closingValue"]
          }
        }
      },
    },
  },
  required: ["summary", "itrGuidance", "advanceTaxSchedule", "detailedBreakdown", "recommendations"],
};

export async function analyzeTaxDocuments(files: { data: string; mimeType: string }[], financialYear: string): Promise<TaxAnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a Senior Indian Chartered Accountant. Analyze the provided documents for FY ${financialYear}. 
  Extract Salary (Form 16), STCG (Equity/Debt), LTCG (Equity 12.5% rule), Dividends, Crypto, Real Estate, and 80C/80D deductions. 
  Calculate tax for both Old Regime and New Regime. 
  Return a structured JSON object. 
  Be precise with Indian tax laws, including the latest budget changes (e.g., LTCG 12.5% for equity).
  For advance tax schedule, ensure the percentages are cumulative (15%, 45%, 75%, 100%) and the amounts are calculated correctly based on the total tax liability minus TDS. Note that advance tax is only applicable if the estimated tax liability (after TDS) is ₹10,000 or more. If it's less, the schedule should reflect 0 amounts.
  Ensure perfect grammatical accuracy in all text responses. Do not use a comma immediately after an ampersand (e.g., use "A & B" not "A &, B").
  You support all major Indian fintech brokers (Zerodha, Upstox, Groww, Angel One, Paytm Money, ICICI Direct, HDFC Securities, etc.), crypto exchanges, real estate transactions, and foreign asset proofs. Parse their specific statement formats accurately. If foreign assets are detected, provide a pre-filled Schedule FA.`;

  const parts = files.map(f => ({
    inlineData: {
      data: f.data.split(',')[1] || f.data, // Remove data:image/png;base64, if present
      mimeType: f.mimeType
    }
  }));

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [...parts, { text: "Analyze these tax documents and provide a detailed report in JSON format." }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: TAX_ANALYSIS_SCHEMA,
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    try {
      return JSON.parse(jsonStr) as TaxAnalysisResult;
    } catch (parseErr: any) {
      console.error("JSON Parse Error:", parseErr, "Raw response:", response.text);
      throw new Error("Failed to parse the AI response. Please try again.");
    }
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    throw new Error(error?.message || "Failed to analyze the documents. Please ensure they are valid tax documents (Form 16, P&L statements) and try again.");
  }
}

export async function chatWithTaxAssistant(message: string, context: TaxAnalysisResult | null) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a helpful Indian Tax Assistant. 
  You have access to the user's tax analysis report: ${JSON.stringify(context)}. 
  Answer questions based on this data and Indian tax laws. 
  Be professional, clear, and helpful.`;

  const ai = getAI();
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: message }] }],
    config: {
      systemInstruction,
    },
  });

  return response.text;
}
