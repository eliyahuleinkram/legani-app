import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { leganiContext } from '../../../data/legani-context';
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

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

    const result = streamText({
        model: google('gemini-3-flash-preview'),
        system: enhancedSystemPrompt,
        messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
}
