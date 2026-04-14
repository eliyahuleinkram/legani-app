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
    const fs = await import("fs");
    const path = await import("path");
    const { s3 } = await import("@pulumi/aws");

    // Map file extensions to MIME content types
    function getContentType(filePath: string): string {
      const ext = path.extname(filePath).toLowerCase();
      const types: Record<string, string> = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".webp": "image/webp",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
        ".ttf": "font/ttf",
        ".eot": "application/vnd.ms-fontobject",
        ".otf": "font/otf",
        ".wav": "audio/wav",
        ".mp3": "audio/mpeg",
        ".ogg": "audio/ogg",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".xml": "application/xml",
        ".txt": "text/plain; charset=utf-8",
        ".map": "application/json; charset=utf-8",
      };
      return types[ext] || "application/octet-stream";
    }

    // Recursively collect all files in a directory
    function getAllFiles(dir: string, base: string = dir): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getAllFiles(fullPath, base));
        } else {
          files.push(path.relative(base, fullPath));
        }
      }
      return files;
    }

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

    // 2. Automatically upload all static assets from .output/public to S3
    const publicDir = path.resolve(".output/public");
    if (fs.existsSync(publicDir)) {
      const files = getAllFiles(publicDir);
      for (const file of files) {
        const safeName = file.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-");

        const isHashed = file.startsWith("assets/");
        const cacheControl = isHashed
          ? "public, max-age=31536000, immutable"
          : "public, max-age=0, must-revalidate";

        new s3.BucketObjectv2(`Asset-${safeName}`, {
          bucket: assets.name,
          key: file,
          source: new $util.asset.FileAsset(path.join(publicDir, file)),
          contentType: getContentType(file),
          cacheControl,
        });
      }
    }

    // 3. The Vinext Server (Nitro's AWS Lambda Output)
    const server = new sst.aws.Function("MyWebServer", {
      handler: ".output/server/index.handler",
      url: true,
      link: [googleApiKey, insightSnapshotsTable, sharedBookmarksTable, generationsTable],
      environment: {
        GOOGLE_GENERATIVE_AI_API_KEY: googleApiKey.value,
      },
    });

    // 4. The CloudFront Router
    new sst.aws.Router("MyWeb", {
      domain: {
        name: "legani.co",
        dns: sst.cloudflare.dns(),
      },
      routes: {
        "/assets/*": { bucket: assets },
        "/audio/*": { bucket: assets },
        "/images/*": { bucket: assets },
        "/*.svg": { bucket: assets },
        "/icon.png": { bucket: assets },
        "/*": server.url,
      },
    });
  },
});

