import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'apartments.json');

export async function GET() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            return NextResponse.json([]);
        }
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const newApartment = await req.json();
        let apartments = [];

        if (fs.existsSync(dataFilePath)) {
            const data = fs.readFileSync(dataFilePath, 'utf8');
            apartments = JSON.parse(data);
        }

        newApartment.id = Date.now().toString();
        apartments.push(newApartment);

        fs.writeFileSync(dataFilePath, JSON.stringify(apartments, null, 2));

        return NextResponse.json(newApartment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        if (fs.existsSync(dataFilePath)) {
            const data = fs.readFileSync(dataFilePath, 'utf8');
            let apartments = JSON.parse(data);
            apartments = apartments.filter((a: any) => a.id !== id);
            fs.writeFileSync(dataFilePath, JSON.stringify(apartments, null, 2));
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
