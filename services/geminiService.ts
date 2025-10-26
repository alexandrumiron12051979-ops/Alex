
import { GoogleGenAI, Type } from "@google/genai";
import { InsurancePolicy, PolicyType, PremiumFrequency } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. The actual key is expected to be in the environment.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export interface ExtractedPolicyData {
    provider?: string;
    policyNumber?: string;
    policyType?: PolicyType;
    premium?: number;
    premiumFrequency?: PremiumFrequency;
    startDate?: string;
    endDate?: string;
    licensePlate?: string;
    address?: string;
    insuredPersonName?: string;
}

export const analyzeContractDocument = async (base64Data: string, mimeType: string): Promise<ExtractedPolicyData> => {
    if (!base64Data || !mimeType) {
        throw new Error("File data and MIME type are required for analysis.");
    }
     if (!mimeType.startsWith('image/')) {
        // Simple check, can be expanded for other types like PDF if supported.
        console.warn(`Unsupported MIME type for analysis: ${mimeType}. The model works best with images.`);
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };
    
    const textPart = {
      text: `Analyze the provided insurance policy document image. Extract the following details and return them in a JSON object. Use the exact keys provided in the schema. If a piece of information cannot be found, omit the key from the JSON response. Format all dates as YYYY-MM-DD. For policyType and premiumFrequency, use one of the provided enum values. Also extract context-specific fields like licensePlate (for Auto), address (for Home), or insuredPersonName (for Health/Life).`
    };

    const policySchema = {
        type: Type.OBJECT,
        properties: {
            provider: { type: Type.STRING, description: 'The name of the insurance company or provider.' },
            policyNumber: { type: Type.STRING, description: 'The unique identifier for the policy.' },
            policyType: {
                type: Type.STRING,
                description: 'The type of insurance.',
                enum: Object.values(PolicyType),
            },
            premium: { type: Type.NUMBER, description: 'The cost of the premium.' },
            premiumFrequency: {
                type: Type.STRING,
                description: 'How often the premium is paid.',
                enum: Object.values(PremiumFrequency),
            },
            startDate: { type: Type.STRING, description: 'The policy effective start date in YYYY-MM-DD format.' },
            endDate: { type: Type.STRING, description: 'The policy expiration date in YYYY-MM-DD format.' },
            licensePlate: { type: Type.STRING, description: 'The vehicle license plate number for Auto insurance.' },
            address: { type: Type.STRING, description: 'The full property address for Home insurance.' },
            insuredPersonName: { type: Type.STRING, description: "The full name of the primary person insured for Health or Life insurance." },
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: policySchema,
            },
        });
        
        const jsonStr = response.text.trim();
        const parsedJson = JSON.parse(jsonStr);

        return parsedJson as ExtractedPolicyData;

    } catch (error) {
        console.error("Error in analyzeContractDocument with Gemini:", error);
        throw new Error("Failed to analyze the document with the AI model. Please check the file and try again.");
    }
};


export const analyzeCoverage = async (policies: InsurancePolicy[]): Promise<string> => {
    if (!policies || policies.length === 0) {
        return "No policies available to analyze. Please add your insurance policies first.";
    }

    const prompt = `
        Based on the following list of insurance policies, provide a concise analysis for the policyholder.

        Policies:
        ${JSON.stringify(policies, null, 2)}

        Your analysis should include:
        1. **Overall Summary:** A brief overview of the total number of policies and the total calculated annual premium.
        2. **Potential Gaps:** Identify any common types of insurance that are missing (e.g., life, disability, renters/homeowners) and briefly explain their importance.
        3. **Coverage Observations:** Point out any potential areas for review, such as policies nearing their expiration date or opportunities to bundle policies for discounts.
        4. **Actionable Suggestions:** Provide 2-3 clear, actionable tips for the user to improve their insurance portfolio.

        Format your response as clean markdown, using headings and bullet points for readability.
    `;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing coverage with Gemini:", error);
        return "An error occurred while analyzing your coverage. Please ensure your API key is configured correctly and try again.";
    }
};
