import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return Response.json({ error: "Missing generation ID" }, { status: 400 });
    }

    const result = await ddb.send(new GetCommand({
      TableName: Resource.Generations.name,
      Key: { id }
    }));

    if (!result.Item) {
      return Response.json({ error: "Generation not found" }, { status: 404 });
    }

    return Response.json({
      content: result.Item.content || "",
      status: result.Item.status || "completed"
    });
  } catch (err) {
    console.error("Failed to get generation:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
