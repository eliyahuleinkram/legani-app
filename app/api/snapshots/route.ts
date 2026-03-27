import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

export async function POST(req: Request) {
  try {
    const { content, verseId } = await req.json();
    if (!content) return Response.json({ error: "Missing content" }, { status: 400 });

    const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);
    
    await ddb.send(new PutCommand({
      TableName: Resource.InsightSnapshots.name,
      Item: {
        id,
        content,
        verseId,
        createdAt: Date.now()
      }
    }));
    
    return Response.json({ id });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to securely forge snapshot" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Missing snapshot ID" }, { status: 400 });
    
    const result = await ddb.send(new GetCommand({
      TableName: Resource.InsightSnapshots.name,
      Key: { id }
    }));
    
    if (!result.Item) return Response.json({ error: "Snapshot unrecoverable or expired" }, { status: 404 });
    return Response.json(result.Item);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to summon snapshot" }, { status: 500 });
  }
}
