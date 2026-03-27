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
    const evoApiUrl = new sst.Secret("EvoApiUrl");
    const evoApiKey = new sst.Secret("EvoApiKey");
    const evoInstanceName = new sst.Secret("EvoInstanceName");

    // Auth Secrets (Requires real developer tokens to provision via AWS API)
    // const googleClientId = new sst.Secret("GoogleClientId");
    // const googleClientSecret = new sst.Secret("GoogleClientSecret");
    // const appleClientId = new sst.Secret("AppleClientId");
    // const appleTeamId = new sst.Secret("AppleTeamId");
    // const appleKeyId = new sst.Secret("AppleKeyId");
    // const applePrivateKey = new sst.Secret("ApplePrivateKey");

    const apartmentsTable = new sst.aws.Dynamo("Apartments", {
      fields: {
        id: "string",
      },
      primaryIndex: { hashKey: "id" },
    });

    const promptCacheTable = new sst.aws.Dynamo("PromptCache", {
      fields: {
        cacheKey: "string",
      },
      primaryIndex: { hashKey: "cacheKey" },
      ttl: "ttl", // Add a TTL field so cache isn't permanent forever
    });

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

    new sst.aws.Nextjs("MyWeb", {
      domain: {
        name: "legani.co",
        dns: sst.cloudflare.dns(),
      },
      link: [googleApiKey, apartmentsTable, promptCacheTable, insightSnapshotsTable, sharedBookmarksTable, evoApiUrl, evoApiKey, evoInstanceName],
      environment: {
        GOOGLE_GENERATIVE_AI_API_KEY: googleApiKey.value,
      },
    });
  },
});
