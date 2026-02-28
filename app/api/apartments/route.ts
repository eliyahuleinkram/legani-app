export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
    try {
        const command = new ScanCommand({
            TableName: Resource.Apartments.name,
        });
        const response = await docClient.send(command);
        return NextResponse.json(response.Items || []);
    } catch (error) {
        console.error("GET error", error);
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const newApartment = await req.json();
        newApartment.id = Date.now().toString();

        const command = new PutCommand({
            TableName: Resource.Apartments.name,
            Item: newApartment,
        });
        await docClient.send(command);

        return NextResponse.json(newApartment, { status: 201 });
    } catch (error) {
        console.error("POST error", error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const command = new DeleteCommand({
            TableName: Resource.Apartments.name,
            Key: { id },
        });
        await docClient.send(command);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE error", error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
