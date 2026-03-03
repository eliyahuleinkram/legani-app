import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function POST(req: Request) {
    try {
        const { images } = await req.json();

        if (!images || !Array.isArray(images) || images.length === 0) {
            return new Response(JSON.stringify({ error: 'No images provided' }), { status: 400 });
        }

        const { object } = await generateObject({
            model: google('gemini-3-flash-preview'),
            schema: z.object({
                name: z.string().describe('An evocative, appealing name for the property based on its visual style, e.g., "The Rustic Cabin", "Modern Seaside Suite"'),
                location: z.string().describe('The estimated location or address of the property, e.g., "Safed, Artist Quarter" or "Jerusalem, Mea Shearim"'),
                capacity: z.string().describe('The estimated capacity of the property, e.g., "2 adults, 3 kids"'),
                roomsAndBeds: z.string().describe('The estimated room and bed configurations, e.g., "Master bedroom with King bed, living room pull-out"'),
                amenities: z.string().describe('Key amenities visible or likely, e.g., "Private Pool, Terrace, Kosher Kitchen"'),
                deviceInstructions: z.string().describe('Visible appliances or devices (e.g., Oven, Heater) and placeholder instructions/tips on how they are typically used if evident.'),
                extraInfo: z.string().describe('Context or rules solely for the AI awareness, e.g. "Emphasize beautiful views, accessible access"')
            }),
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'You are an expert hospitality concierge AI data extraction assistant. Analyze the following uploaded image(s) of an apartment/property. Your task is to estimate and recommend values for "name", "location", "capacity", "roomsAndBeds", "amenities", "deviceInstructions", and "extraInfo" based on what you see in the images to make data entry easier for partners. Be professional and write in the style of high-end real estate or hospitality descriptions. Detail any visible devices and placeholder operation instructions. Make reasonable inferences but do not invent highly specific amenities (like WiFi) unless typical. Output these recommendations strictly.'
                        },
                        ...images.map((img: string) => ({
                            type: 'image' as const,
                            image: img
                        }))
                    ]
                }
            ],
            // Since sometimes we get errors about not returning JSON, standard generateObject returns it anyway. Wait, generateObject already ensures structured output.
        });

        return new Response(JSON.stringify(object), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error analyzing image:', error);
        return new Response(JSON.stringify({ error: 'Failed to analyze image.' }), { status: 500 });
    }
}
