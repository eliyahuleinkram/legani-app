import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/app/utils/whatsapp';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { leganiContext } from '@/data/legani-context';
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Process message using Gemini AI with Legani Context
async function processWithGemini(userText: string) {
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

    const { text } = await generateText({
        model: google('gemini-3-flash-preview'),
        system: enhancedSystemPrompt,
        prompt: userText,
    });

    return text;
}

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // The webhook payload format from Evolution API
        // Check if it's the right event
        if (payload.event !== "messages.upsert") {
            return NextResponse.json({ success: true });
        }

        const messageData = payload.data;
        if (!messageData || !messageData.key || !messageData.message) {
            return NextResponse.json({ success: true });
        }

        // Prevent infinite loops! Ignore messages sent by the bot itself
        if (messageData.key.fromMe) {
            return NextResponse.json({ success: true, message: "Ignored fromMe message" });
        }

        const remoteJid = messageData.key.remoteJid;

        // Extract the text content from the dynamic message structure
        let userText = messageData.message?.conversation || messageData.message?.extendedTextMessage?.text || "";
        userText = userText.trim();

        if (!remoteJid || !userText) {
            return NextResponse.json({ success: true });
        }

        // CRITICAL: We must await the Gemini response and the WhatsApp send function.
        // Otherwise, AWS Lambda will kill this script before Gemini finishes thinking.
        try {
            console.log(`Processing WhatsApp message from ${remoteJid}: ${userText}`);
            
            const replyText = await processWithGemini(userText);
            await sendWhatsAppMessage(remoteJid, replyText);
            
            console.log(`Successfully replied to ${remoteJid}`);
        } catch (error) {
            console.error("Error processing or replying to message:", error);
        }

        // Return 200 OK AFTER processing is entirely done
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Webhook processing error:", error);
        // Still return 200 so Evolution API doesn't retry infinitely on app crash
        return NextResponse.json({ success: true });
    }
}
