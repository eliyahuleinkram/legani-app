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

    new sst.aws.Nextjs("MyWeb", {
      domain: {
        name: "legani.co",
        dns: sst.cloudflare.dns(),
      },
      link: [googleApiKey, apartmentsTable],
      environment: {
        GOOGLE_GENERATIVE_AI_API_KEY: googleApiKey.value,
      },
    });
  },
});
