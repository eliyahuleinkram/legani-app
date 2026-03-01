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
      timeToLive: "ttl", // Add a TTL field so cache isn't permanent forever
    });

    new sst.aws.Nextjs("MyWeb", {
      domain: {
        name: "legani.co",
        dns: sst.cloudflare.dns(),
      },
      link: [googleApiKey, apartmentsTable, promptCacheTable],
      environment: {
        GOOGLE_GENERATIVE_AI_API_KEY: googleApiKey.value,
      },
    });
  },
});
