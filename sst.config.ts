// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "legani-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const googleApiKey = new sst.Secret("GoogleApiKey");


    const insightSnapshotsTable = new sst.aws.Dynamo("InsightSnapshots", {
      fields: {
        id: "string",
      },
      primaryIndex: { hashKey: "id" },
    });

    const sharedBookmarksTable = new sst.aws.Dynamo("SharedBookmarks", {
      fields: {
        id: "string", // will use verseId as the hashKey
      },
      primaryIndex: { hashKey: "id" },
    });

    const generationsTable = new sst.aws.Dynamo("Generations", {
      fields: {
        id: "string",
      },
      primaryIndex: { hashKey: "id" },
      ttl: "ttl",
    });

    // 1. Storage for Static Assets (Images, CSS, Client-side JS)
    const assets = new sst.aws.Bucket("MyWebAssets", {
      access: "cloudfront",
    });

    // 2. The Vinext Server (Nitro's AWS Lambda Output)
    const server = new sst.aws.Function("MyWebServer", {
      handler: ".output/server/index.handler",
      url: true, // Enable a direct Function URL
      link: [googleApiKey, insightSnapshotsTable, sharedBookmarksTable, generationsTable],
      environment: {
        GOOGLE_GENERATIVE_AI_API_KEY: googleApiKey.value,
      },
    });

    // 3. The CloudFront Router
    new sst.aws.Router("MyWeb", {
      domain: {
        name: "legani.co",
        dns: sst.cloudflare.dns(),
      },
      routes: {
        "/_next/*": assets.domain, // Standard next asset path mapped to S3 bucket
        "/*": server.url, 
      },
    });
  },
});
