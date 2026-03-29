import { GoogleGenAI } from "@google/genai";

export const maxDuration = 30;

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY });

import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

export async function POST(req: Request) {
  const { messages, data, generationId } = await req.json();

  const userNusach = data?.nusach || "General";
  const userChassidus = data?.chassidus || "None";
  const userLanguage = data?.language || "English";
  const currentVerse = data?.verse || "Unknown verse";

  const systemPrompt = `You are a deeply spiritual, learned, and warm guide.
The user is meditating on the following verse: "${currentVerse}".
They follow the ${userNusach} nusach, and their spiritual lens is ${userChassidus}.
Their preferred language is ${userLanguage}.

Your goal is to provide a brief 1 to 3 paragraph breathtakingly beautiful, profound, and highly poetic explanation of this specific verse. 
Do not give a clinical or generic summary. Write with 'zen elegance'—meaning your prose should be ultra-refined, deeply emotional, engaging, and transcendent. 
CRITICAL RULE: Never instruct the reader. Never use imperative verbs like 'reflect on', 'think about', 'let us', or 'we must'. The text itself must be the meditation; the explanation should be so profound that just by reading it, the spiritual work is accomplished on its own. State deep, cosmic, and soul-stirring truths plainly and poetically.
Reach directly into the reader's soul, touching on their silent struggles, their innate majesty, and their cosmic purpose seamlessly without ever telling them what to do.
If their lens is Chabad, weave in concepts of Chabad Chassidus seamlessly, such as Bittul, the Rebbe's teachings, and the Tanya.
If their lens is Breslov, weave in concepts of Hitbodedut, simple joy, and Rebbe Nachman's teachings seamlessly.
Keep the tone warm, deeply nourishing, majestic, and sophisticated. Use stunning prose that reads like a pristine piece of high-end spiritual literature. Absolutely never use parentheses; if you need to explain a term, weave the explanation seamlessly into the prose.`;

  const prompt = messages?.[messages.length - 1]?.content || "";

  if (!generationId) {
    return Response.json({ error: "Missing generationId" }, { status: 400 });
  }

  // Initialize the generation in DynamoDB
  await ddb.send(new PutCommand({
    TableName: Resource.Generations.name,
    Item: {
      id: generationId,
      content: "",
      status: "generating",
      ttl: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour TTL
    }
  }));

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    let fullText = "";
    let lastSaveTime = Date.now();

    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
        
        // Save to DDB every ~250ms to avoid throttling but stay fast
        const now = Date.now();
        if (now - lastSaveTime > 250) {
          await ddb.send(new UpdateCommand({
            TableName: Resource.Generations.name,
            Key: { id: generationId },
            UpdateExpression: "SET content = :content, #st = :status",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { ":content": fullText, ":status": "generating" }
          }));
          lastSaveTime = now;
        }
      }
    }

    // Final save
    await ddb.send(new UpdateCommand({
      TableName: Resource.Generations.name,
      Key: { id: generationId },
      UpdateExpression: "SET content = :content, #st = :status",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: { ":content": fullText, ":status": "completed" }
    }));

    return Response.json({ success: true, generationId });
  } catch (err) {
    console.error("Transcription error:", err);
    await ddb.send(new UpdateCommand({
      TableName: Resource.Generations.name,
      Key: { id: generationId },
      UpdateExpression: "SET #st = :status",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: { ":status": "error" }
    }));
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
