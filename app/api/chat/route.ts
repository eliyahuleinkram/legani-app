import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { leganiContext } from '../../../data/legani-context';
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(req: Request) {
    const { messages } = await req.json();

    let dynamicApartments = "No specific apartment data has been added yet.";
    try {
        const command = new ScanCommand({ TableName: Resource.Apartments.name });
        const response = await docClient.send(command);
        const apartments = response.Items || [];
        if (apartments.length > 0) {
            dynamicApartments = "Here are the details of our active apartments:\n\n" + apartments.map((a: any) => `
- Name: ${a.name}
- Capacity: ${a.capacity}
- Rooms & Beds Details:
${a.roomsAndBeds}
- Amenities: ${a.amenities}
- Extra Info: ${a.extraInfo}
`).join('\n');
        }
    } catch (e) {
        console.error("Failed to read dynamic apartments", e);
    }

    const enhancedSystemPrompt = `
${leganiContext}

--- DYNAMIC INVENTORY & APARTMENT DATA FROM CMS ---
${dynamicApartments}
--- END DYNAMIC DATA ---

Answer any specific guest questions using exactly this dynamic data. Do not hallucinate amenities not listed here.
`;

    const modelMessages = messages.map((m: any) => ({
        role: m.role,
        content: m.content || (m.parts ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n') : ''),
    }));

    // Cache key incorporates both the conversation history and the dynamic inventory data
    const rawCacheKey = JSON.stringify({ messages: modelMessages, dynamicApartments });
    // Hash the cache key since DynamoDB Hash Keys have a 2048 byte limit, and history can get long.
    const cacheKey = crypto.createHash('sha256').update(rawCacheKey).digest('hex');

    try {
        const getCmd = new GetCommand({
            TableName: Resource.PromptCache.name,
            Key: { cacheKey }
        });
        const cacheResponse = await docClient.send(getCmd);

        if (cacheResponse.Item && cacheResponse.Item.response) {
            const cachedText = cacheResponse.Item.response;
            // Return a response that mimics the format of useChat's stream so the frontend parses it correctly
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                start(controller) {
                    // "0:" is the Vercel AI SDK Data Stream Protocol prefix for text parts
                    controller.enqueue(encoder.encode(`0:${JSON.stringify(cachedText)}\n`));
                    controller.close();
                }
            });
            return new Response(stream, {
                headers: {
                    'X-Vercel-AI-Data-Stream': 'v1',
                    'Content-Type': 'text/plain; charset=utf-8'
                }
            });
        }
    } catch (e) {
        console.error("Cache read failed", e);
    }

    const result = streamText({
        model: google('gemini-3-flash-preview'),
        system: enhancedSystemPrompt,
        messages: modelMessages,
        onFinish: async ({ text }) => {
            // Save the complete response to the cache once stream finishes
            try {
                // TTL of 7 days (60 * 60 * 24 * 7 seconds)
                const ttl = Math.floor(Date.now() / 1000) + (604800);
                const putCmd = new PutCommand({
                    TableName: Resource.PromptCache.name,
                    Item: {
                        cacheKey,
                        response: text,
                        ttl
                    }
                });
                await docClient.send(putCmd);
            } catch (e) {
                console.error("Cache write failed", e);
            }
        }
    });

    return result.toUIMessageStreamResponse();
}
