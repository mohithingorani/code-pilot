// services/storage.ts

import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.endpoint!,
  credentials: {
    accessKeyId: process.env.accessKeyId!,
    secretAccessKey: process.env.secretAccessKey!,
  },
});

const bucket = "codepilot-bucket";

export async function uploadFile(
  projectId: string,
  filePath: string,
  baseFolder: string,
) {
  const key =
    `projects/${projectId}/` +
    path.relative(baseFolder, filePath).split(path.sep).join("/");

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fs.createReadStream(filePath),
    }),
  );
}

export async function deleteFile(projectId: string, fileName: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: `projects/${projectId}/${fileName}`,
    }),
  );
  console.log("Deleted from s3",fileName);
}

export async function restoreProject(projectId: string, baseFolder: string) {
  const prefix = `projects/${projectId}/`;

  const list = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    }),
  );

  if (!list.Contents) return;

  for (const obj of list.Contents) {
    if (!obj.Key) continue;

    const key = obj.Key;
    const relativePath = key.replace(prefix, "");
    const localPath = path.join(baseFolder, relativePath);

    const data = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    const stream = data.Body as any;

    await fs.promises.mkdir(path.dirname(localPath), { recursive: true });

    const writeStream = fs.createWriteStream(localPath);
    stream.pipe(writeStream);

    await new Promise((res) => writeStream.on("finish", res));
  }
}

export async function checkProjectHasFiles(projectId: string): Promise<boolean> {
  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: `projects/${projectId}/`,
      MaxKeys: 1,
    }),
  );
  return (result.Contents?.length ?? 0) > 0;
}
