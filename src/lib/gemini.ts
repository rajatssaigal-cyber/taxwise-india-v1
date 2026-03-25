/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { TaxAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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
    detailedBreakdown: { type: Type.STRING },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    foreignAssets: {
      type: Type.OBJECT,
      properties: {
        detected: { type: Type.BOOLEAN },
        details: { type: Type.STRING },
      },
    },
  },
  required: ["summary", "itrGuidance", "advanceTaxSchedule", "detailedBreakdown", "recommendations"],
};

export async function analyzeTaxDocuments(files: { data: string; mimeType: string }[], financialYear: string): Promise<TaxAnalysisResult> {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are a Senior Indian Chartered Accountant. Analyze the provided documents for FY ${financialYear}. 
  Extract Salary (Form 16), STCG (Equity/Debt), LTCG (Equity 12.5% rule), Dividends, and 80C/80D deductions. 
  Calculate tax for both Old Regime and New Regime. 
  Return a structured JSON object. 
  Be precise with Indian tax laws, including the latest budget changes (e.g., LTCG 12.5% for equity).`;

  const parts = files.map(f => ({
    inlineData: {
      data: f.data.split(',')[1] || f.data, // Remove data:image/png;base64, if present
      mimeType: f.mimeType
    }
  }));

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

  return JSON.parse(response.text) as TaxAnalysisResult;
}

export async function chatWithTaxAssistant(message: string, context: TaxAnalysisResult | null) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a helpful Indian Tax Assistant. 
  You have access to the user's tax analysis report: ${JSON.stringify(context)}. 
  Answer questions based on this data and Indian tax laws. 
  Be professional, clear, and helpful.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: message }] }],
    config: {
      systemInstruction,
    },
  });

  return response.text;
}
