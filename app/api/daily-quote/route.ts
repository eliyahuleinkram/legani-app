import { GoogleGenAI } from "@google/genai";

export const maxDuration = 30;

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { data } = await req.json();
    const chassidus = data?.chassidus || "None";
    const name = data?.name || "the user";

    const prompt = `Select a single, profoundly inspiring, short REAL and EXACT quote (1-2 sentences) from an authentic traditional Jewish source (e.g., Torah, Psalms, Talmud, Mishnah, Tanya, Likutey Moharan, or other authentic Rabbinic/Chassidic text) that would resonate with a user named "${name}" to start their day. 
The quote should align with the spiritual lens of: ${chassidus}. 
CRITICAL: Do not make up or generate a new quote. It MUST be a direct, verbatim translation of an actual, existing text from the specified tradition.
Return ONLY a valid JSON object with two fields: "quote" (the exact text of the quote) and "source" (the specific book/author it is from, e.g. "Psalms 23:1", "Tanya, Chapter 41", "Rabbi Nachman of Breslov").
Do not include markdown code block formatting like \`\`\`json. Just return the raw JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return new Response(response.text, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
