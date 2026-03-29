import { randomUUID } from "node:crypto";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const DEFAULT_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
];

const REQUIRED_ENV = [
  "S3_BUCKET",
  "S3_REGION",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
] as const;

type StorageEnv = {
  provider: string;
  endpoint?: string;
  publicBaseUrl?: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  keyPrefix: string;
  signedUrlExpiresSeconds: number;
  downloadUrlExpiresSeconds: number;
  maxUploadBytes: number;
  allowedMimeTypes: string[];
};

export type CreateUploadRequest = {
  filename: string;
  contentType: string;
  size: number;
  folder?: string;
};

export type CreateUploadResponse = {
  provider: string;
  key: string;
  bucket: string;
  region: string;
  uploadUrl: string;
  expiresIn: number;
  publicUrl?: string;
};

export type CreateDownloadResponse = {
  provider: string;
  bucket: string;
  region: string;
  key: string;
  downloadUrl: string;
  expiresIn: number;
};

let cachedClient: S3Client | null = null;
let cachedEnv: StorageEnv | null = null;

function parseRequiredEnv(name: (typeof REQUIRED_ENV)[number]): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

function parseStorageEnv(): StorageEnv {
  if (cachedEnv) return cachedEnv;

  for (const key of REQUIRED_ENV) {
    parseRequiredEnv(key);
  }

  const allowedMimeRaw = process.env.S3_ALLOWED_MIME_TYPES;
  const allowedMimeTypes = allowedMimeRaw
    ? allowedMimeRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : DEFAULT_ALLOWED_MIME;

  const parsedMaxBytes = Number.parseInt(process.env.S3_MAX_UPLOAD_BYTES || "", 10);
  const parsedExpiry = Number.parseInt(process.env.S3_SIGNED_URL_TTL_SECONDS || "", 10);
  const parsedDownloadExpiry = Number.parseInt(process.env.S3_DOWNLOAD_URL_TTL_SECONDS || "", 10);

  cachedEnv = {
    provider: process.env.S3_PROVIDER || "s3",
    endpoint: process.env.S3_ENDPOINT,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
    bucket: process.env.S3_BUCKET as string,
    region: process.env.S3_REGION as string,
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    keyPrefix: (process.env.S3_KEY_PREFIX || "uploads").replace(/^\/+|\/+$/g, ""),
    signedUrlExpiresSeconds: Number.isFinite(parsedExpiry) && parsedExpiry > 0 ? parsedExpiry : 900,
    downloadUrlExpiresSeconds:
      Number.isFinite(parsedDownloadExpiry) && parsedDownloadExpiry > 0
        ? parsedDownloadExpiry
        : 300,
    maxUploadBytes:
      Number.isFinite(parsedMaxBytes) && parsedMaxBytes > 0 ? parsedMaxBytes : MAX_UPLOAD_BYTES,
    allowedMimeTypes,
  };

  return cachedEnv;
}

function getClient(): S3Client {
  if (cachedClient) return cachedClient;

  const env = parseStorageEnv();
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

  cachedClient = new S3Client({
    region: env.region,
    endpoint: env.endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
  });

  return cachedClient;
}

function sanitizeName(filename: string): string {
  const trimmed = filename.trim();
  if (!trimmed) return "file";

  const base = trimmed.split(/[\\/]/).pop() || "file";
  return base.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function sanitizeSegment(segment: string): string {
  return segment
    .trim()
    .replace(/\.{2,}/g, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .replace(/^\/+|\/+$/g, "");
}

function buildObjectKey(prefix: string, folder: string | undefined, filename: string): string {
  const safeFolder = folder ? sanitizeSegment(folder) : "";
  const safeName = sanitizeName(filename);
  const datePath = new Date().toISOString().slice(0, 10);

  const parts = [prefix, safeFolder, datePath, `${randomUUID()}-${safeName}`].filter(Boolean);
  return parts.join("/");
}

function buildPublicUrl(publicBaseUrl: string | undefined, key: string): string | undefined {
  if (!publicBaseUrl) return undefined;
  const trimmed = publicBaseUrl.replace(/\/+$/g, "");
  return `${trimmed}/${key}`;
}

export function getStorageLimits() {
  const env = parseStorageEnv();
  return {
    provider: env.provider,
    bucket: env.bucket,
    region: env.region,
    maxUploadBytes: env.maxUploadBytes,
    allowedMimeTypes: env.allowedMimeTypes,
    keyPrefix: env.keyPrefix,
    uploadUrlExpiresIn: env.signedUrlExpiresSeconds,
    downloadUrlExpiresIn: env.downloadUrlExpiresSeconds,
  };
}

export function isOwnedObjectKey(userId: string, key: string): boolean {
  const env = parseStorageEnv();
  const ownerPrefix = `${env.keyPrefix}/${userId}/`;
  return key.startsWith(ownerPrefix);
}

export async function createPresignedUpload(
  input: CreateUploadRequest,
): Promise<CreateUploadResponse> {
  const env = parseStorageEnv();

  const filename = input.filename?.trim();
  if (!filename) {
    throw new Error("filename is required");
  }

  if (!input.contentType || typeof input.contentType !== "string") {
    throw new Error("contentType is required");
  }

  if (!Number.isFinite(input.size) || input.size <= 0) {
    throw new Error("size must be a positive number");
  }

  if (input.size > env.maxUploadBytes) {
    throw new Error(`File too large. Max allowed is ${env.maxUploadBytes} bytes`);
  }

  if (!env.allowedMimeTypes.includes(input.contentType)) {
    throw new Error(`Unsupported MIME type: ${input.contentType}`);
  }

  const key = buildObjectKey(env.keyPrefix, input.folder, filename);
  const client = getClient();

  const command = new PutObjectCommand({
    Bucket: env.bucket,
    Key: key,
    ContentType: input.contentType,
    ContentLength: input.size,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: env.signedUrlExpiresSeconds,
  });

  return {
    provider: env.provider,
    key,
    bucket: env.bucket,
    region: env.region,
    uploadUrl,
    expiresIn: env.signedUrlExpiresSeconds,
    publicUrl: buildPublicUrl(env.publicBaseUrl, key),
  };
}

export async function createPresignedDownload(key: string): Promise<CreateDownloadResponse> {
  const env = parseStorageEnv();

  if (!key || typeof key !== "string") {
    throw new Error("key is required");
  }

  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: env.bucket,
    Key: key,
  });

  const downloadUrl = await getSignedUrl(client, command, {
    expiresIn: env.downloadUrlExpiresSeconds,
  });

  return {
    provider: env.provider,
    bucket: env.bucket,
    region: env.region,
    key,
    downloadUrl,
    expiresIn: env.downloadUrlExpiresSeconds,
  };
}

export async function verifyUpload(
  key: string,
): Promise<{ exists: boolean; size: number; contentType: string }> {
  const env = parseStorageEnv();
  const client = getClient();

  const command = new HeadObjectCommand({
    Bucket: env.bucket,
    Key: key,
  });

  const response = await client.send(command);

  return {
    exists: true,
    size: response.ContentLength ?? 0,
    contentType: response.ContentType ?? "application/octet-stream",
  };
}
