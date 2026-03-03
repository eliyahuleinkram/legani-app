import { Resource } from "sst";

export async function sendWhatsAppMessage(to: string, text: string) {
    try {
        const url = `${Resource.EvoApiUrl.value}/message/sendText/${Resource.EvoInstanceName.value}`;
        const apiKey = Resource.EvoApiKey.value;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                number: to,
                options: {
                    delay: 1200,
                    presence: "composing"
                },
                text: text
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Evolution API Error:", errorData);
            throw new Error(`Failed to send WhatsApp message: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
        throw error;
    }
}
