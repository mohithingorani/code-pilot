// services/storage.ts

import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
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

export const BUCKET = process.env.S3_BUCKET || "codepilot-bucket";

const projectPrefix = (projectId: string) => `projects/${projectId}/`;

/**
 * List every object key under a prefix, transparently following pagination
 * (ListObjectsV2 caps each page at 1000 keys).
 */
export async function listAllObjects(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }

    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

/** Stream a single object's body (used for ZIP export). */
export async function getObjectStream(key: string): Promise<Readable> {
  const data = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
  );
  return data.Body as Readable;
}

/** Write a single project file straight from memory (no disk round-trip). */
export async function putProjectFile(
  projectId: string,
  relativeName: string,
  body: string | Buffer,
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${projectPrefix(projectId)}${relativeName}`,
      Body: body,
    }),
  );
}

export async function deleteProjectFile(projectId: string, relativeName: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: `${projectPrefix(projectId)}${relativeName}`,
    }),
  );
}

/** Delete every object belonging to a project (batched, paginated). */
export async function deleteProjectFiles(projectId: string) {
  const keys = await listAllObjects(projectPrefix(projectId));

  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    if (batch.length === 0) continue;
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: batch.map((Key) => ({ Key })) },
      }),
    );
  }
}

/**
 * Copy all of a project's objects to a new project prefix.
 * Returns the number of (non-folder) files copied.
 */
export async function copyProjectFiles(
  srcId: string,
  destId: string,
): Promise<number> {
  const srcPrefix = projectPrefix(srcId);
  const keys = await listAllObjects(srcPrefix);

  await Promise.all(
    keys.map((key) => {
      const rest = key.slice(srcPrefix.length);
      return s3.send(
        new CopyObjectCommand({
          Bucket: BUCKET,
          CopySource: encodeURI(`${BUCKET}/${key}`),
          Key: `${projectPrefix(destId)}${rest}`,
        }),
      );
    }),
  );

  return keys.filter((k) => !k.endsWith("/")).length;
}

/** Download all of a project's files into a local folder (parallel). */
export async function restoreProject(projectId: string, baseFolder: string) {
  const prefix = projectPrefix(projectId);
  const keys = await listAllObjects(prefix);

  await Promise.all(
    keys.map(async (key) => {
      if (key.endsWith("/")) return; // skip folder placeholders

      const relativePath = key.slice(prefix.length);
      const localPath = path.join(baseFolder, relativePath);

      await fs.promises.mkdir(path.dirname(localPath), { recursive: true });

      const body = await getObjectStream(key);
      await pipeline(body, fs.createWriteStream(localPath));
    }),
  );
}

export async function checkProjectHasFiles(projectId: string): Promise<boolean> {
  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: projectPrefix(projectId),
      MaxKeys: 1,
    }),
  );
  return (result.Contents?.length ?? 0) > 0;
}
