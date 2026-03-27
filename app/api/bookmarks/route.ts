import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

export async function GET() {
  try {
    const result = await ddb.send(new ScanCommand({
      TableName: Resource.SharedBookmarks.name,
    }));
    
    return Response.json(result.Items || []);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch shared bookmarks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, hebrew, english } = await req.json();
    if (!id || !hebrew || !english) return Response.json({ error: "Missing required bookmark fields" }, { status: 400 });

    await ddb.send(new PutCommand({
      TableName: Resource.SharedBookmarks.name,
      Item: {
        id,
        hebrew,
        english,
        createdAt: Date.now()
      }
    }));
    
    return Response.json({ success: true, id });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to save shared bookmark" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Missing bookmark ID" }, { status: 400 });

    await ddb.send(new DeleteCommand({
      TableName: Resource.SharedBookmarks.name,
      Key: { id }
    }));
    
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to remove shared bookmark" }, { status: 500 });
  }
}
