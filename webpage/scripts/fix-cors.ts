import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

process.loadEnvFile();

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "gegebaski-assets";

async function main() {
    console.log(`Setting CORS for bucket: ${R2_BUCKET_NAME}`);

    const command = new PutBucketCorsCommand({
        Bucket: R2_BUCKET_NAME,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ["*"],
                    AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
                    AllowedOrigins: ["*"], // Allow all for now to ensure it works
                    ExposeHeaders: ["ETag"],
                    MaxAgeSeconds: 3600,
                },
            ],
        },
    });

    try {
        await r2.send(command);
        console.log("Successfully set CORS configuration.");
    } catch (err) {
        console.error("Error setting CORS:", err);
    }
}

main();
