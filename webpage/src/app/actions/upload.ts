'use server';

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { generateStorageKey } from "@/lib/storage-utils";

export async function getPresignedUrl(fileName: string, fileType: string) {
    const uniqueFileName = generateStorageKey('uploads', fileName);

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: uniqueFileName,
        ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

    return {
        uploadUrl: signedUrl,
        fileUrl: `${process.env.R2_PUBLIC_URL}/${uniqueFileName}`,
    };
}
