
import { GoogleGenAI } from "@google/genai";
import { InsurancePolicy } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. The actual key is expected to be in the environment.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeCoverage = async (policies: InsurancePolicy[]): Promise<string> => {
    if (!policies || policies.length === 0) {
        return "No policies available to analyze. Please add your insurance policies first.";
    }

    const prompt = `
        Based on the following list of insurance policies, provide a concise analysis for the policyholder.

        Policies:
        ${JSON.stringify(policies.map(({id, ...p}) => p), null, 2)}

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
