import { S3Client } from "@aws-sdk/client-s3";

let client: S3Client;

export function getS3Client() {
  if (!client) {
    const { S3_ENDPOINT_URL, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
      process.env;
    if (!S3_ENDPOINT_URL || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
      throw new Error("Missing S3 configuration in environment variables");
    }

    client = new S3Client({
      region: "us-east-1",
      endpoint: S3_ENDPOINT_URL,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true, // important !
    });
  }
  return client;
}
