import { GoogleGenAI } from "@google/genai";

export const maxDuration = 30;

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const { messages, data } = await req.json();

  const userNusach = data?.nusach || "General";
  const userChassidus = data?.chassidus || "None";
  const userLanguage = data?.language || "English";
  const currentVerse = data?.verse || "Unknown verse";

  const systemPrompt = `You are a deeply spiritual, learned, and warm guide.
The user is meditating on the following verse: "${currentVerse}".
They follow the ${userNusach} nusach, and their spiritual lens is ${userChassidus}.
Their preferred language is ${userLanguage}.

Your goal is to provide a brief (1-3 paragraphs maximum), incredibly meaningful, soulful, and poetic explanation of this specific verse. 
Do not give a generic summary. Go deep. Connect it to their soul, to their struggles, to the cosmos.
If their lens is Chabad, weave in concepts of Chabad Chassidus (e.g., Bittul, the Rebbe's teachings, Tanya).
If their lens is Breslov, weave in concepts of Hitbodedut, joy, Rebbe Nachman's teachings.
Keep the tone warm, loving, nourishing, and majestic. Use beautiful prose.`;

  const prompt = messages?.[messages.length - 1]?.content || "";

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: systemPrompt,
    }
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of responseStream) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(chunk.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    }
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    },
  });
}
